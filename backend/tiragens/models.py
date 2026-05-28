from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

class Sessao(models.Model):
    class TipoSessao(models.TextChoices):
        EXPRESSA = 'EXPRESSA', 'Tiragem Expressa'
        AGENDADA = 'AGENDADA', 'Sessão Agendada'

    class StatusSessao(models.TextChoices):
        AGUARDANDO_PAGAMENTO = 'aguardando_pagamento', 'Aguardando Pagamento' # <--- O NOVO STATUS DE BLOQUEIO
        AGUARDANDO_GUIA = 'aguardando_guia', 'Na Fila de Espera'
        AGENDADA = 'agendada', 'Agendada para o Futuro'
        AO_VIVO = 'ao_vivo', 'Em Andamento / Chat Aberto'
        FINALIZADA = 'finalizada', 'Finalizada'

    consulente = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='sessoes_como_cliente'
    )
    
    # O tarólogo fica nulo na Tiragem Expressa até algum profissional aceitar a leitura
    tarologo = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='sessoes_como_guia'
    )
    
    tipo = models.CharField(max_length=20, choices=TipoSessao.choices)
    
    # AJUSTADO: status_sessao agora nasce bloqueada até o pagamento ser aprovado
    status_sessao = models.CharField(
        max_length=20, 
        choices=StatusSessao.choices, 
        default=StatusSessao.AGUARDANDO_PAGAMENTO # <--- NOVO PADRÃO
    )
    
    # Dados preenchidos no modal do frontend pelo consulente
    pergunta_principal = models.CharField(max_length=255)
    contexto = models.TextField()
    imagem_anexa = models.ImageField(upload_to='tiragens/anexos/', blank=True, null=True)
    
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_agendada = models.DateTimeField(blank=True, null=True) # Apenas para o tipo AGENDADA

    # AS DUAS COLUNAS QUE FALTAVAM ESTÃO AQUI:
    ultimo_acesso_consulente = models.DateTimeField(null=True, blank=True)
    ultimo_acesso_tarologo = models.DateTimeField(null=True, blank=True)

    # NOVO: Sistema de Avaliação (1 a 5 estrelas)
    nota = models.IntegerField(
        null=True, 
        blank=True, 
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )

    def __str__(self):
        nome_cliente = self.consulente.first_name if self.consulente.first_name else self.consulente.email
        return f"{self.tipo} - {nome_cliente} ({self.get_status_sessao_display()})"


class Mensagem(models.Model):
    class TipoMensagem(models.TextChoices):
        # AJUSTADO: Valores em minúsculo eliminam erros de mapeamento com o React Mobile/Web
        TEXTO = 'texto', 'Texto'
        AUDIO = 'audio', 'Áudio'

    sessao = models.ForeignKey(Sessao, on_delete=models.CASCADE, related_name='mensagens')
    remetente = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    tipo = models.CharField(max_length=10, choices=TipoMensagem.choices, default=TipoMensagem.TEXTO)
    texto = models.TextField(blank=True, null=True)
    arquivo_audio = models.FileField(upload_to='chat/audios/', blank=True, null=True)
    duracao_audio = models.CharField(max_length=10, blank=True, null=True) # Ex: "1:24"
    
    # AJUSTADO: criado_em unifica a leitura de timestamp para objetos de data do JavaScript
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['criado_em'] # Mantém o fluxo síncrono cronológico perfeito na janela de chat

    def __str__(self):
        nome_remetente = self.remetente.first_name if self.remetente.first_name else self.remetente.email
        return f"Mensagem de {nome_remetente} na sessão #{self.sessao.id}"


class RegistroAkashico(models.Model):
    # Relacionamento 1 para 1: Toda sessão finalizada vira um único registro histórico arquivado
    sessao = models.OneToOneField(Sessao, on_delete=models.CASCADE, related_name='registro_akashico')
    
    # AJUSTADO: O resumo pode ficar em branco no início, enquanto a IA não termina
    resumo_leitura = models.TextField(help_text="Resumo escrito pelo tarólogo ou gerado por IA", blank=True, null=True)
    cartas_tiradas = models.JSONField(help_text="Lista de strings com as cartas. Ex: ['O Louco', 'A Morte']", default=list)
    
    # NOVAS COLUNAS: Lógica da Inteligência Artificial
    processando_ia = models.BooleanField(default=False)
    data_liberacao_resumo = models.DateTimeField(null=True, blank=True)
    
    data_arquivamento = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Registro da Sessão #{self.sessao.id}"