import json
import mercadopago
from datetime import timedelta

from django.conf import settings
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils.timezone import now
from django.db.models import Avg
from django.db import transaction
from decimal import Decimal

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import CustomUser, TarologoProfile, AgendaTarologo, TurnoTrabalho, Folga, TransacaoFinanceira, Assinatura
from tiragens.models import Sessao 
from .serializers import UserSerializer, TarologoProfileSerializer, CustomTokenObtainPairSerializer, TransacaoFinanceiraSerializer

class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

class TarologoListView(generics.ListAPIView):
    queryset = TarologoProfile.objects.select_related('user').all()
    serializer_class = TarologoProfileSerializer
    permission_classes = [AllowAny]

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

# ==========================================
# VIEW DO PERFIL (ME)
# ==========================================
class UserMeView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.user.role == 'TAROLOGO':
            return TarologoProfileSerializer
        return UserSerializer

    def get_object(self):
        if self.request.user.role == 'TAROLOGO':
            return TarologoProfile.objects.get(user=self.request.user)
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        
        # Agora buscamos dinamicamente as propriedades do plano criadas no models.py
        data['is_premium'] = request.user.is_premium 
        data['nome_plano_atual'] = request.user.nome_plano_atual
        
        if request.user.role == 'TAROLOGO':
            sessoes = Sessao.objects.filter(tarologo=request.user)
            media = sessoes.aggregate(Avg('nota'))['nota__avg']
            nota_calculada = round(media, 1) if media else 5.0
            
            stats = {
                "saldo_disponivel": float(instance.saldo_disponivel),
                "total_tiragens": sessoes.count(),
                "total_clientes": sessoes.values('consulente').distinct().count(),
                "nota_media": nota_calculada 
            }
            data.update(stats)
            
        return Response(data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        
        # SALVAMENTO DA FOTO DE PERFIL (Vem no request.FILES)
        foto = request.FILES.get('foto_perfil')
        if foto:
            request.user.foto_perfil = foto
            request.user.save()
            
        serializer = self.get_serializer_class()(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Devolve a URL da foto atualizada na resposta
        response_data = serializer.data
        if request.user.foto_perfil:
            response_data['foto_perfil'] = request.user.foto_perfil.url
            
        return Response(response_data)


# ==========================================
# VIEW PARA SALVAR A AGENDA E HORÁRIOS
# ==========================================
class AgendaUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic 
    def post(self, request):
        user = request.user
        if user.role != 'TAROLOGO':
            return Response({"error": "Apenas tarólogos têm agenda."}, status=status.HTTP_403_FORBIDDEN)
        
        perfil = user.tarologo_profile
        agenda, created = AgendaTarologo.objects.get_or_create(tarologo=perfil)
        
        data = request.data
        config = data.get('configuracao', {})
        semana = data.get('semana', [])
        datas_extras = data.get('datasExtras', [])

        # 1. Atualiza as Regras (Duração e Respiro)
        agenda.duracao_sessao = int(config.get('duracaoSessao', agenda.duracao_sessao))
        agenda.intervalo = int(config.get('intervalo', agenda.intervalo))
        agenda.save()

        # 2. Limpa os turnos e folgas antigos para não duplicar
        agenda.turnos.all().delete()
        agenda.folgas.all().delete()

        # 3. Cria os novos Turnos
        dia_map = {'Segunda': 0, 'Terça': 1, 'Quarta': 2, 'Quinta': 3, 'Sexta': 4, 'Sábado': 5, 'Domingo': 6}
        for dia in semana:
            if dia.get('ativo'):
                dia_idx = dia_map.get(dia.get('nome'))
                if dia_idx is not None:
                    for bloco in dia.get('blocos', []):
                        TurnoTrabalho.objects.create(
                            agenda=agenda,
                            dia_semana=dia_idx,
                            hora_inicio=bloco.get('inicio'),
                            hora_fim=bloco.get('fim')
                        )
        
        # 4. Cria as novas Folgas / Exceções
        for ex in datas_extras:
            if ex.get('tipo') == 'folga':
                Folga.objects.create(agenda=agenda, data=ex.get('data'))
        
        return Response({"message": "Agenda salva e fatiada com sucesso no banco de dados!"})


# ==========================================
# VIEW DE EXTRATO FINANCEIRO
# ==========================================
class ExtratoView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TransacaoFinanceiraSerializer

    def get_queryset(self):
        if self.request.user.role == 'TAROLOGO':
            return TransacaoFinanceira.objects.filter(tarologo__user=self.request.user)
        return TransacaoFinanceira.objects.none()


# ==========================================
# VIEW PARA SOLICITAR SAQUE PIX
# ==========================================
class SolicitarSaqueView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        user = request.user
        
        # 1. Validação de Segurança
        if user.role != 'TAROLOGO':
            return Response({"error": "Apenas guias podem solicitar saques."}, status=status.HTTP_403_FORBIDDEN)
        
        perfil = user.tarologo_profile
        
        try:
            # Converte o valor recebido para formato monetário Decimal
            valor_solicitado = Decimal(str(request.data.get('valor', '0')))
            chave_pix = request.data.get('chave_pix', '')
        except (ValueError, TypeError):
            return Response({"error": "Formato de valor inválido."}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Regras de Negócio
        if not chave_pix:
            return Response({"error": "A chave Pix é obrigatória."}, status=status.HTTP_400_BAD_REQUEST)

        if valor_solicitado <= 0:
            return Response({"error": "O valor do saque deve ser maior que zero."}, status=status.HTTP_400_BAD_REQUEST)
        
        if valor_solicitado > perfil.saldo_disponivel:
            return Response({"error": "Saldo insuficiente para este saque."}, status=status.HTTP_400_BAD_REQUEST)

        # 3. Operação Financeira (Abater o saldo)
        perfil.saldo_disponivel -= valor_solicitado
        perfil.save()

        # 4. Criar o registro no Extrato (Histórico)
        TransacaoFinanceira.objects.create(
            tarologo=perfil,
            tipo=TransacaoFinanceira.Tipo.SAQUE,
            valor=valor_solicitado,
            descricao=f"Saque para Pix ({chave_pix})",
            status=TransacaoFinanceira.Status.PROCESSANDO
        )

        return Response({
            "message": "Pedido de saque registrado com sucesso.",
            "saldo_atualizado": perfil.saldo_disponivel
        }, status=status.HTTP_200_OK)


# ==========================================
# VIEW DE PAGAMENTO TRANSPARENTE (BRICKS)
# ==========================================
class ProcessarPagamentoBrickView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        user = request.user
        plano_escolhido = request.data.get('plano')
        pagamento_dados = request.data.get('pagamento_dados', {})
        
        if not plano_escolhido or not pagamento_dados:
            return Response({"error": "Dados de pagamento incompletos."}, status=status.HTTP_400_BAD_REQUEST)
        
        # 1. Configurar e validar valores baseados nos 4 novos planos do backend
        if plano_escolhido == 'ESSENCIAL_CONSULENTE':
            titulo = "Arkanum - Jornada Essencial"
            valor_esperado = 19.90
        elif plano_escolhido == 'CIRCULO_ARCANO_CONSULENTE':
            titulo = "Arkanum - Círculo Arcano"
            valor_esperado = 39.90
        elif plano_escolhido == 'PRO_TAROLOGO':
            titulo = "Arkanum - Guia PRO"
            valor_esperado = 39.90
        elif plano_escolhido == 'MESTRE_TAROLOGO':
            titulo = "Arkanum - Mestre Arcano"
            valor_esperado = 69.90
        else:
            return Response({"error": "Plano inválido."}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Iniciar a SDK do Mercado Pago
        sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)

        # 3. Injeta a referência e ajusta valores de segurança no payload recebido do frontend
        pagamento_dados["description"] = titulo
        pagamento_dados["transaction_amount"] = float(valor_esperado) # Impede injeção de valor falso
        pagamento_dados["external_reference"] = f"assinatura_user_{user.id}_{plano_escolhido}" 
        
        # Garante que o payer tenha o e-mail exato do usuário logado (evita fraudes de terceiros)
        if "payer" not in pagamento_dados:
            pagamento_dados["payer"] = {}
        pagamento_dados["payer"]["email"] = user.email

        try:
            # 4. Enviar a cobrança real para a API do MP
            payment_response = sdk.payment().create(pagamento_dados)
            payment = payment_response["response"]
            
            status_pagamento = payment.get("status")
            
            # 5. Se o pagamento foi por cartão de crédito e já deu aprovado, já ativamos na hora!
            if status_pagamento == "approved":
                assinatura, created = Assinatura.objects.get_or_create(user=user)
                assinatura.plano = plano_escolhido
                assinatura.ativo = True
                assinatura.data_expiracao = now() + timedelta(days=30)
                assinatura.pagamento_id = str(payment.get("id"))
                assinatura.save()

            return Response({
                "status": status_pagamento,
                "status_detail": payment.get("status_detail"),
                "id": payment.get("id")
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print("Erro no Pagamento Brick:", e)
            return Response({"error": "Houve um problema ao processar seu pagamento. Tente novamente."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==========================================
# VIEW DO WEBHOOK (MERCADO PAGO)
# ==========================================
@method_decorator(csrf_exempt, name='dispatch')
class MercadoPagoWebhookView(View):
    def post(self, request, *args, **kwargs):
        try:
            # 1. Lê o corpo da requisição que o Mercado Pago enviou
            payload = json.loads(request.body)
            
            # O MP envia o tipo de evento em "type" ou "topic" dependendo da versão da API
            event_type = payload.get("type") or payload.get("topic")
            
            if event_type == "payment":
                payment_id = payload.get("data", {}).get("id")
                
                if payment_id:
                    # 2. Por segurança, não confiamos cegamente no webhook. 
                    # Usamos o ID recebido para perguntar à API oficial do MP se o pagamento é real.
                    sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)
                    payment_info = sdk.payment().get(payment_id)
                    
                    if payment_info["status"] == 200:
                        payment_data = payment_info["response"]
                        status_pagamento = payment_data.get("status")
                        external_reference = payment_data.get("external_reference", "")
                        
                        # 3. Verifica se o pagamento foi APROVADO e se a referência é do nosso sistema de assinaturas
                        if status_pagamento == "approved" and external_reference and external_reference.startswith("assinatura_user_"):
                            
                            # A referência vem no formato: assinatura_user_5_CIRCULO_ARCANO_CONSULENTE
                            partes = external_reference.replace("assinatura_user_", "").split("_", 1)
                            user_id = partes[0]
                            plano_escolhido = partes[1]
                            
                            # 4. Busca o usuário no banco de dados
                            user = CustomUser.objects.get(id=user_id)
                            
                            # 5. Cria ou atualiza a assinatura do usuário
                            assinatura, created = Assinatura.objects.get_or_create(user=user)
                            assinatura.plano = plano_escolhido
                            assinatura.ativo = True
                            assinatura.data_expiracao = now() + timedelta(days=30) # Assinatura válida por 30 dias
                            assinatura.pagamento_id = str(payment_id)
                            assinatura.save()
                            
                            print(f"[Webhook] Sucesso: Assinatura de {user.first_name} ativada no plano {plano_escolhido}.")

        except Exception as e:
            print(f"[Webhook] Erro ao processar notificação: {e}")
            # Retornamos 200 mesmo com erro interno para o MP não ficar travado em loop de reenvio
            return JsonResponse({"status": "error", "message": str(e)}, status=200)

        # 6. O Mercado Pago exige que você responda com HTTP 200 OK
        return JsonResponse({"status": "success"}, status=200)