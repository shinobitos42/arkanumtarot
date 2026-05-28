from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from django.utils.timezone import now
from datetime import timedelta
from .models import Sessao, Mensagem, RegistroAkashico
from .serializers import SessaoSerializer, MensagemSerializer

# IMPORT DA NOSSA IA DO GEMINI
from .ai_service import iniciar_processamento_akashico

class SessaoViewSet(viewsets.ModelViewSet):
    serializer_class = SessaoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'CONSULENTE':
            return Sessao.objects.filter(consulente=user).order_by('-data_criacao')
        else:
            return Sessao.objects.filter(
                Q(tarologo=user) | Q(status_sessao='aguardando_guia')
            ).order_by('-data_criacao')

    def retrieve(self, request, *args, **kwargs):
        # Pega a sessão que o React está pedindo (ocorre a cada 3s no polling)
        instance = self.get_object()
        
        # Anota o "sinal de vida" de quem fez a requisição
        if request.user.role == 'TAROLOGO':
            instance.ultimo_acesso_tarologo = now()
            instance.save(update_fields=['ultimo_acesso_tarologo'])
        else:
            instance.ultimo_acesso_consulente = now()
            instance.save(update_fields=['ultimo_acesso_consulente'])
            
        # Devolve os dados da sessão atualizados
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def perform_create(self, serializer):
        # Injeta o usuário logado como consulente
        serializer.save(consulente=self.request.user)

    def perform_update(self, serializer):
        instance = self.get_object()
        
        # Captura o status novo direto do React (dribla bloqueios do DRF)
        status_novo = self.request.data.get('status_sessao', instance.status_sessao)
        
        # Intercepta a atualização para assinar a sessão com o Tarólogo
        if self.request.user.role == 'TAROLOGO' and instance.status_sessao == 'aguardando_guia':
            
            # Se ele está mudando para ao_vivo, nós vinculamos ele à sessão!
            if status_novo == 'ao_vivo':
                # FORÇA a gravação do status E do dono da sessão no banco de dados
                serializer.save(tarologo=self.request.user, status_sessao='ao_vivo')
                return

        # O GATILHO DA IA: Se o status mudou para finalizada agora
        if status_novo == 'finalizada' and instance.status_sessao != 'finalizada':
            sessao_salva = serializer.save()
            
            # Cria o Registro Akáshico automaticamente com o cronômetro de 5 minutos
            RegistroAkashico.objects.create(
                sessao=sessao_salva,
                processando_ia=True,
                data_liberacao_resumo=now() + timedelta(minutes=5)
            )
            
            # ACIONA A INTELIGÊNCIA ARTIFICIAL EM SEGUNDO PLANO
            iniciar_processamento_akashico(sessao_salva.id)
            
            return
                
        # Se for qualquer outra atualização (como salvar a Nota da Avaliação), salva normalmente
        serializer.save()

class MensagemViewSet(viewsets.ModelViewSet):
    serializer_class = MensagemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        sessao_id = self.request.query_params.get('sessao')
        if sessao_id:
            return Mensagem.objects.filter(sessao_id=sessao_id)
        return Mensagem.objects.none()

    def perform_create(self, serializer):
        # Injeta o remetente da mensagem
        serializer.save(remetente=self.request.user)