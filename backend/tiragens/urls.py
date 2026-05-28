from rest_framework.routers import DefaultRouter
from .views import SessaoViewSet, MensagemViewSet

# O Router cria automaticamente as rotas padrão de CRUD (GET, POST, PUT, DELETE)
router = DefaultRouter()
router.register(r'sessoes', SessaoViewSet, basename='sessao')
router.register(r'mensagens', MensagemViewSet, basename='mensagem')

# O jeito mais seguro e direto de exportar as rotas, evitando o loop do "include"
urlpatterns = router.urls