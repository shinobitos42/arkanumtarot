"""
URL configuration for setup project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Acoplamos as rotas dos nossos aplicativos criados
    path('api/users/', include('users.urls')),
    path('api/tiragens/', include('tiragens.urls')),
    path('api/assinaturas/', include('assinaturas.urls')),
]

# Configuração obrigatória para servir os arquivos de mídia (áudios e imagens) no modo DEBUG
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)