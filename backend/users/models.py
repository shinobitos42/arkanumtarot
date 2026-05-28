from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.timezone import now

class CustomUser(AbstractUser):
    class Role(models.TextChoices):
        CONSULENTE = 'CONSULENTE', 'Consulente'
        TAROLOGO = 'TAROLOGO', 'Tarólogo'

    # Sobrescrevemos para usar o email como login, que é o padrão moderno
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CONSULENTE)
    
    # Necessário para o Perfil do Consulente salvar a data de nascimento sem dar erro 500
    data_nascimento = models.DateField(null=True, blank=True)
    
    # Foto de perfil centralizada para todos os usuários (Consulentes e Tarólogos)
    foto_perfil = models.ImageField(upload_to='fotos_perfil/', null=True, blank=True, verbose_name='Foto de Perfil')
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name']

    @property
    def is_premium(self):
        """
        Retorna True se o usuário tiver uma assinatura ativa e dentro da validade.
        Facilita verificações rápidas no código inteiro.
        """
        if hasattr(self, 'assinatura') and self.assinatura.ativo:
            if self.assinatura.data_expiracao and self.assinatura.data_expiracao >= now():
                return True
        return False

    @property
    def nome_plano_atual(self):
        """
        Retorna o nome do plano atual para facilitar a exibição no frontend.
        """
        if self.is_premium:
            return self.assinatura.get_plano_display()
        
        # Se não for premium, retorna o plano gratuito base correspondente
        return "Iniciado" if self.role == self.Role.TAROLOGO else "Poeira Estelar"

    def __str__(self):
        return self.first_name or self.email


class TarologoProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='tarologo_profile')
    especialidade = models.CharField(max_length=200, help_text="Ex: Tarot de Marselha & Astrologia")
    biografia = models.TextField(blank=True, null=True)
    valor_consulta = models.DecimalField(max_digits=10, decimal_places=2, default=35.00)
    saldo_disponivel = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    nota_media = models.DecimalField(max_digits=3, decimal_places=1, default=5.0)

    def __str__(self):
        return f"Perfil Pro: {self.user.first_name}"


# ==========================================
# MODELOS DE ASSINATURA E PLANOS (NOVO)
# ==========================================

class Assinatura(models.Model):
    class Planos(models.TextChoices):
        # Planos Consulente
        ESSENCIAL_CONSULENTE = 'ESSENCIAL_CONSULENTE', 'Jornada Essencial'
        CIRCULO_ARCANO_CONSULENTE = 'CIRCULO_ARCANO_CONSULENTE', 'Círculo Arcano'
        
        # Planos Tarólogo
        PRO_TAROLOGO = 'PRO_TAROLOGO', 'Guia PRO'
        MESTRE_TAROLOGO = 'MESTRE_TAROLOGO', 'Mestre Arcano'

    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='assinatura')
    plano = models.CharField(max_length=50, choices=Planos.choices)
    ativo = models.BooleanField(default=False)
    data_expiracao = models.DateTimeField(null=True, blank=True)
    
    # Armazena o ID da assinatura do Mercado Pago ou Stripe para futuras renovações/cancelamentos
    pagamento_id = models.CharField(max_length=100, null=True, blank=True, help_text="ID externo da plataforma de pagamento")

    def __str__(self):
        status = "Ativo" if self.ativo else "Inativo"
        return f"{self.user.first_name} - {self.get_plano_display()} ({status})"


# ==========================================
# MODELOS DE AGENDA DO TARÓLOGO
# ==========================================

class AgendaTarologo(models.Model):
    tarologo = models.OneToOneField(TarologoProfile, on_delete=models.CASCADE, related_name='agenda')
    duracao_sessao = models.IntegerField(default=30, help_text="Duração em minutos (ex: 15, 30, 45, 60)")
    intervalo = models.IntegerField(default=10, help_text="Intervalo de respiro entre sessões em minutos")

    def __str__(self):
        return f"Agenda de: {self.tarologo.user.first_name}"

class TurnoTrabalho(models.Model):
    DIA_CHOICES = [
        (0, 'Segunda'), (1, 'Terça'), (2, 'Quarta'), 
        (3, 'Quinta'), (4, 'Sexta'), (5, 'Sábado'), (6, 'Domingo')
    ]
    agenda = models.ForeignKey(AgendaTarologo, on_delete=models.CASCADE, related_name='turnos')
    dia_semana = models.IntegerField(choices=DIA_CHOICES)
    hora_inicio = models.TimeField()
    hora_fim = models.TimeField()

    def __str__(self):
        return f"{self.get_dia_semana_display()} ({self.hora_inicio} às {self.hora_fim})"

class Folga(models.Model):
    agenda = models.ForeignKey(AgendaTarologo, on_delete=models.CASCADE, related_name='folgas')
    data = models.DateField()

    def __str__(self):
        return f"Folga em {self.data}"


# ==========================================
# MODELOS DE FINANÇAS E EXTRATO
# ==========================================

class TransacaoFinanceira(models.Model):
    class Tipo(models.TextChoices):
        ENTRADA = 'ENTRADA', 'Entrada (Pagamento de Sessão)'
        SAQUE = 'SAQUE', 'Saque para Conta Bancária'

    class Status(models.TextChoices):
        PROCESSANDO = 'PROCESSANDO', 'Processando'
        CONCLUIDO = 'CONCLUIDO', 'Concluído'
        CANCELADO = 'CANCELADO', 'Cancelado'

    tarologo = models.ForeignKey(TarologoProfile, on_delete=models.CASCADE, related_name='transacoes')
    tipo = models.CharField(max_length=10, choices=Tipo.choices)
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    descricao = models.CharField(max_length=255, help_text="Ex: Sessão Expressa - Mariana R.")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.CONCLUIDO)
    data_criacao = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-data_criacao']

    def __str__(self):
        return f"{self.tipo} - R$ {self.valor} ({self.status})"


# ==========================================
# SINAIS (GATILHOS AUTOMÁTICOS)
# ==========================================

@receiver(post_save, sender=CustomUser)
def criar_perfil_tarologo_automaticamente(sender, instance, created, **kwargs):
    # Se o usuário acabou de ser criado e o papel (role) dele for TAROLOGO
    if created and instance.role == CustomUser.Role.TAROLOGO:
        perfil = TarologoProfile.objects.create(
            user=instance,
            especialidade="Novo Oraculista",
            biografia="Perfil em construção.",
            valor_consulta=35.00
        )
        # Já cria uma Agenda vazia automaticamente assim que o tarólogo se cadastra!
        AgendaTarologo.objects.create(tarologo=perfil)