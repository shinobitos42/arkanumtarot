import mercadopago
import traceback
from decimal import Decimal
from .models import Transacao, PerfilFinanceiro

def criar_pagamento_tiragem(sessao, comprador, vendedor, valor_total_consulta):
    try:
        # A sua chave de teste oficial:
        TOKEN_MP = "APP_USR-7305598187954016-052721-ef19e66b0c473cc32a563c751d106718-442634376" 
        
        sdk = mercadopago.SDK(TOKEN_MP)
        
        valor_total = Decimal(str(valor_total_consulta))
        valor_plataforma = Decimal("5.00")
        valor_tarologo = valor_total - valor_plataforma
        
        perfil_financeiro, _ = PerfilFinanceiro.objects.get_or_create(usuario=vendedor)
        
        # Garante que sempre teremos um email válido para o Mercado Pago não chiar
        email_comprador = comprador.email if comprador.email and "@" in comprador.email else "cliente_anonimo@arcanum.com"
        
        payment_data = {
            "transaction_amount": float(valor_total),
            "description": f"Tiragem Expressa - Sessao #{sessao.id}",
            "payment_method_id": "pix",
            "payer": {
                "email": email_comprador,
                "first_name": comprador.first_name if comprador.first_name else "Consulente",
            }
        }
        
        # Faz a chamada para a API
        if perfil_financeiro.modelo == PerfilFinanceiro.ModeloRecebimento.SPLIT_MP and perfil_financeiro.mp_access_token:
            payment_data["application_fee"] = float(valor_plataforma)
            req_opts = {"headers": {"Authorization": f"Bearer {perfil_financeiro.mp_access_token}"}}
            payment_response = sdk.payment().create(payment_data, request_options=req_opts)
        else:
            payment_response = sdk.payment().create(payment_data)
        
        payment = payment_response.get("response", {})
        
        # Se o MP retornar Erro 400 ou 401 (Token Invalido)
        if payment_response.get("status") not in [200, 201]:
            print(f"\n[ERRO NA API DO MERCADO PAGO]: {payment}\n")
            return None

        # Extração DEFENSIVA do QR Code
        poi = payment.get("point_of_interaction", {})
        t_data = poi.get("transaction_data", {})
        qr_code = t_data.get("qr_code", "")
        qr_code_base64 = t_data.get("qr_code_base64", "")

        # Grava no Banco
        transacao = Transacao.objects.create(
            sessao=sessao,
            comprador=comprador,
            vendedor=vendedor,
            mp_id=str(payment.get("id", "")),
            valor_total=valor_total,
            valor_plataforma=valor_plataforma,
            valor_tarologo=valor_tarologo,
            tipo_repasse=perfil_financeiro.modelo,
            qr_code=qr_code,
            qr_code_base64=qr_code_base64,
            status=Transacao.StatusPagamento.PENDENTE
        )
        
        return transacao

    except Exception as e:
        print("\n" + "="*40)
        print("🚨 EXPLOSÃO DENTRO DO SERVICES.PY 🚨")
        traceback.print_exc()
        print("="*40 + "\n")
        raise e