from django.db import models
from django.conf import settings

class PerfilFinanceiro(models.Model):
    """
    Controla como cada Tarólogo recebe seu dinheiro.
    """
    class ModeloRecebimento(models.TextChoices):
        CARTEIRA_VIRTUAL = 'carteira', 'Carteira Virtual (Saque Manual)'
        SPLIT_MP = 'split_mp', 'Split Automático (Mercado Pago)'

    usuario = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='financeiro')
    modelo = models.CharField(max_length=20, choices=ModeloRecebimento.choices, default=ModeloRecebimento.CARTEIRA_VIRTUAL)

    # Dados para quem usa a CARTEIRA VIRTUAL (Fácil entrada)
    chave_pix = models.CharField(max_length=255, blank=True, null=True, help_text="Chave PIX para receber os saques manuais")

    # Dados para quem usa o SPLIT (OAuth do Mercado Pago)
    mp_access_token = models.CharField(max_length=255, blank=True, null=True)
    mp_user_id = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"Finanças - {self.usuario.email} ({self.get_modelo_display()})"


class Transacao(models.Model):
    """
    O Coração Financeiro. Registra o pagamento e a divisão exata do dinheiro.
    """
    class StatusPagamento(models.TextChoices):
        PENDENTE = 'pending', 'Aguardando Pagamento'
        APROVADO = 'approved', 'Pagamento Aprovado'
        RECUSADO = 'rejected', 'Pagamento Recusado'
        CANCELADO = 'cancelled', 'Cancelado'

    # O que foi comprado e por quem
    sessao = models.OneToOneField('tiragens.Sessao', on_delete=models.SET_NULL, null=True, blank=True, related_name='pagamento')
    comprador = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='compras')
    vendedor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='vendas')

    # Identificador do Mercado Pago
    mp_id = models.CharField(max_length=255, blank=True, null=True)

    # O SPLIT (A Matemática do Negócio)
    valor_total = models.DecimalField(max_digits=10, decimal_places=2, help_text="O que o cliente pagou")
    valor_plataforma = models.DecimalField(max_digits=10, decimal_places=2, help_text="Lucro líquido do Arcanum")
    valor_tarologo = models.DecimalField(max_digits=10, decimal_places=2, help_text="O que vai para o Guia")

    # Controle e Rastreamento
    status = models.CharField(max_length=20, choices=StatusPagamento.choices, default=StatusPagamento.PENDENTE)
    metodo = models.CharField(max_length=20, default='pix')
    tipo_repasse = models.CharField(max_length=20, choices=PerfilFinanceiro.ModeloRecebimento.choices)

    # Dados do PIX
    qr_code = models.TextField(blank=True, null=True)
    qr_code_base64 = models.TextField(blank=True, null=True)

    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Transação #{self.id} | Total: R$ {self.valor_total} | Status: {self.get_status_display()}"


class Saque(models.Model):
    """
    Fila de saques para os Tarólogos que usam a Carteira Virtual.
    """
    class StatusSaque(models.TextChoices):
        PENDENTE = 'pendente', 'Aguardando Transferência'
        PAGO = 'pago', 'Pagamento Realizado'

    tarologo = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saques')
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    chave_pix_destino = models.CharField(max_length=255)
    
    status = models.CharField(max_length=20, choices=StatusSaque.choices, default=StatusSaque.PENDENTE)

    criado_em = models.DateTimeField(auto_now_add=True)
    pago_em = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Saque de R$ {self.valor} - {self.tarologo.first_name} ({self.get_status_display()})"