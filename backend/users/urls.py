from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, TarologoListView, CustomTokenObtainPairView, UserMeView

urlpatterns = [
    # Rotas de Autenticação e Cadastro
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Rota pública para listar os tarólogos (usada pelo Consulente)
    path('tarologos/', TarologoListView.as_view(), name='tarologos_list'),
    
    # Rota privada unificada: Traz dados do Tarólogo OU do Consulente logado
    path('me/', UserMeView.as_view(), name='user_me'),
]