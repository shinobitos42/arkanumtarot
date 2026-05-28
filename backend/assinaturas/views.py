import traceback
import mercadopago
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from tiragens.models import Sessao
from .models import Transacao
from .services import criar_pagamento_tiragem

class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        sessao_id = request.data.get('sessao_id')
        
        try:
            # 1. Pega a sessão e valida se é do usuário
            sessao = get_object_or_404(Sessao, id=sessao_id)
            if sessao.consulente != request.user:
                return Response({"erro": "Você não tem permissão para pagar esta sessão."}, status=403)
            
            vendedor = sessao.tarologo if sessao.tarologo else request.user 
            
            # 2. Chama o motor financeiro
            transacao = criar_pagamento_tiragem(
                sessao=sessao,
                comprador=request.user,
                vendedor=vendedor,
                valor_total_consulta=35.00
            )
            
            if not transacao:
                return Response({"erro": "Verifique o console do Django. Falha no Mercado Pago."}, status=400)
                
            return Response({
                "transacao_id": transacao.id,
                "qr_code": transacao.qr_code,
                "qr_code_base64": transacao.qr_code_base64,
                "valor": transacao.valor_total
            })
            
        except Exception as e:
            # SE ALGO DER ERRADO, VAI PISCAR EM VERMELHO NO SEU TERMINAL:
            print("\n" + "="*40)
            print("🚨 ERRO GRAVE NO CHECKOUT 🚨")
            traceback.print_exc()
            print("="*40 + "\n")
            return Response({"erro": f"Erro interno: {str(e)}"}, status=500)


class WebhookMercadoPagoView(APIView):
    # Permite que o Mercado Pago bata nessa porta sem precisar de login
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            # O Mercado Pago nos envia um JSON com os dados do evento
            data = request.data
            print(f"\n[WEBHOOK RECEBIDO] Evento: {data.get('type', data.get('topic'))}\n")
            
            # Queremos ouvir apenas notificações de pagamento
            if data.get("type") == "payment" or data.get("topic") == "payment":
                
                # Ele nos diz o ID do pagamento que foi atualizado
                pagamento_id = data.get("data", {}).get("id") or request.GET.get("id")
                
                if pagamento_id:
                    # REGRA DE OURO: Nunca confie cegamente no webhook. 
                    # Vamos perguntar pro Mercado Pago se esse ID foi pago mesmo.
                    TOKEN_MP = "APP_USR-7305598187954016-052721-ef19e66b0c473cc32a563c751d106718-442634376"
                    sdk = mercadopago.SDK(TOKEN_MP)
                    payment_info = sdk.payment().get(pagamento_id)
                    
                    if payment_info["status"] == 200:
                        status_mp = payment_info["response"].get("status")
                        print(f"[WEBHOOK] Status real no MP: {status_mp}")
                        
                        # Procuramos essa transação no nosso cofre
                        try:
                            transacao = Transacao.objects.get(mp_id=str(pagamento_id))
                            
                            # Se o pagamento foi aprovado, atualizamos o banco!
                            if status_mp == "approved":
                                transacao.status = Transacao.StatusPagamento.APROVADO
                                transacao.save()
                                print(f"[SUCESSO] Pagamento {pagamento_id} APROVADO! Chat liberado.")
                                
                                # Aqui, como é Tiragem Expressa, a sessão já nasce "aguardando_guia".
                                # No futuro, você pode enviar um e-mail pro usuário aqui ou notificar os tarólogos.
                                
                            elif status_mp == "rejected":
                                transacao.status = Transacao.StatusPagamento.RECUSADO
                                transacao.save()
                                print(f"[AVISO] Pagamento {pagamento_id} RECUSADO.")
                                
                        except Transacao.DoesNotExist:
                            print(f"[ERRO] Webhook recebeu ID {pagamento_id}, mas não existe no nosso banco.")
                            
            # Sempre devolva 200 OK rapidamente para o Mercado Pago
            return Response({"status": "recebido"}, status=200)

        except Exception as e:
            print("\n" + "="*40)
            print("🚨 ERRO NO WEBHOOK 🚨")
            traceback.print_exc()
            print("="*40 + "\n")
            return Response({"erro": "Erro interno no processamento do webhook"}, status=500)