from django.urls import path
from .views import CheckoutView, WebhookMercadoPagoView

urlpatterns = [
    # Rota chamada pelo React para gerar o PIX/Cartão
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    
    # Rota chamada pelos servidores do Mercado Pago para avisar que o PIX foi pago
    path('webhook/', WebhookMercadoPagoView.as_view(), name='webhook_mp'),
]