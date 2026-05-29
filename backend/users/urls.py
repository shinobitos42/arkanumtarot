from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, TarologoListView, CustomTokenObtainPairView, 
    UserMeView, AgendaUpdateView, ExtratoView, SolicitarSaqueView,
    CriarCheckoutAssinaturaView, MercadoPagoWebhookView # <--- WEBHOOK IMPORTADO AQUI
)

urlpatterns = [
    # Rotas de Autenticação e Cadastro
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Rota pública para listar os tarólogos (usada pelo Consulente)
    path('tarologos/', TarologoListView.as_view(), name='tarologos_list'),
    
    # Rotas privadas
    path('me/', UserMeView.as_view(), name='user_me'),
    path('me/agenda/', AgendaUpdateView.as_view(), name='user_agenda'),
    path('me/extrato/', ExtratoView.as_view(), name='user_extrato'),
    path('me/saque/', SolicitarSaqueView.as_view(), name='user_saque'),
    
    # Rota de Pagamento (Criar link do checkout)
    path('planos/checkout/', CriarCheckoutAssinaturaView.as_view(), name='plano_checkout'),
    
    # ROTA DO WEBHOOK (Totalmente Pública - O Mercado Pago vai bater aqui)
    path('webhook/mercadopago/', MercadoPagoWebhookView.as_view(), name='webhook_mercadopago'),
]