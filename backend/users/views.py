from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db.models import Avg
from django.db import transaction
from decimal import Decimal

from .models import CustomUser, TarologoProfile, AgendaTarologo, TurnoTrabalho, Folga, TransacaoFinanceira
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
        
        data['is_premium'] = False 
        
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

    @transaction.atomic # Garante que ou salva tudo, ou cancela tudo em caso de erro
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