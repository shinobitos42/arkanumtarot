from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, TarologoListView, CustomTokenObtainPairView, 
    UserMeView, AgendaUpdateView, ExtratoView, SolicitarSaqueView,
    ProcessarPagamentoBrickView, MercadoPagoWebhookView,
    AdminDashboardView, AprovarSaqueView,
    TarologoHorariosView # <--- IMPORTAÇÃO DA AGENDA ADICIONADA AQUI
)

urlpatterns = [
    # Rotas de Autenticação e Cadastro
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Rotas públicas de Tarólogos (usadas pelo Consulente na Vitrine)
    path('tarologos/', TarologoListView.as_view(), name='tarologos_list'),
    path('tarologos/<int:pk>/horarios/', TarologoHorariosView.as_view(), name='tarologo-horarios'), # <--- ROTA NOVA ADICIONADA AQUI
    
    # Rotas privadas (Perfil)
    path('me/', UserMeView.as_view(), name='user_me'),
    path('me/agenda/', AgendaUpdateView.as_view(), name='user_agenda'),
    path('me/extrato/', ExtratoView.as_view(), name='user_extrato'),
    path('me/saque/', SolicitarSaqueView.as_view(), name='user_saque'),
    
    # Rota de Pagamento Transparente (Bricks)
    path('planos/pagar-brick/', ProcessarPagamentoBrickView.as_view(), name='pagamento_brick'),
    
    # ROTA DO WEBHOOK (Totalmente Pública - O Mercado Pago vai bater aqui)
    path('webhook/mercadopago/', MercadoPagoWebhookView.as_view(), name='webhook_mercadopago'),

    # ==========================================
    # ROTAS DO PAINEL DE ADMINISTRAÇÃO
    # ==========================================
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin_dashboard'),
    path('admin/saques/<int:pk>/aprovar/', AprovarSaqueView.as_view(), name='admin_aprovar_saque'),
]