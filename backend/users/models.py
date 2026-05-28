from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save
from django.dispatch import receiver

class CustomUser(AbstractUser):
    class Role(models.TextChoices):
        CONSULENTE = 'CONSULENTE', 'Consulente'
        TAROLOGO = 'TAROLOGO', 'Tarólogo'

    # Sobrescrevemos para usar o email como login, que é o padrão moderno
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CONSULENTE)
    
    # NOVO: Necessário para o Perfil do Consulente salvar a data de nascimento sem dar erro 500
    data_nascimento = models.DateField(null=True, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name']

    def __str__(self):
        return self.first_name or self.email


class TarologoProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='tarologo_profile')
    especialidade = models.CharField(max_length=200, help_text="Ex: Tarot de Marselha & Astrologia")
    biografia = models.TextField(blank=True, null=True)
    valor_consulta = models.DecimalField(max_digits=10, decimal_places=2, default=35.00)
    saldo_disponivel = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    foto_perfil = models.ImageField(upload_to='tarologos/perfil/', blank=True, null=True)
    nota_media = models.DecimalField(max_digits=3, decimal_places=1, default=5.0)

    def __str__(self):
        return f"Perfil Pro: {self.user.first_name}"


# Sinal (Gatilho) para criar o Perfil de Tarólogo automaticamente
@receiver(post_save, sender=CustomUser)
def criar_perfil_tarologo_automaticamente(sender, instance, created, **kwargs):
    # Se o usuário acabou de ser criado e o papel (role) dele for TAROLOGO
    if created and instance.role == CustomUser.Role.TAROLOGO:
        TarologoProfile.objects.create(
            user=instance,
            especialidade="Novo Oraculista",
            biografia="Perfil em construção.",
            valor_consulta=35.00
        )