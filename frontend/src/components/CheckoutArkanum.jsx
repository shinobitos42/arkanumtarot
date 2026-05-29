import React, { useState } from 'react';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import { Loader2, ShieldCheck } from 'lucide-react';
import api from '../services/api';

// Inicializa a SDK com a sua Chave Pública
// Substitua import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY pela string direta caso não use .env ainda
initMercadoPago(import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY, { locale: 'pt-BR' });

export default function CheckoutArkanum({ valorBase, planoEscolhido, onPagamentoSucesso }) {
  const [loading, setLoading] = useState(false);

  // O Brick do Mercado Pago nos dá um token criptografado quando o usuário digita o cartão
  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      // Mandamos os dados criptografados para o nosso Django processar a cobrança real
      const response = await api.post('users/planos/pagar-brick/', {
        plano: planoEscolhido,
        pagamento_dados: formData
      });

      if (response.data.status === 'approved') {
        alert("Pagamento aprovado com sucesso! Bem-vindo ao novo nível do Círculo.");
        if (onPagamentoSucesso) onPagamentoSucesso();
      } else if (response.data.status === 'pending') {
        alert("Pagamento pendente. Aguardando a compensação do Pix ou Boleto.");
      } else {
        alert("O pagamento foi recusado pela operadora.");
      }
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      alert("Houve um erro de comunicação ao processar seu pagamento.");
    } finally {
      setLoading(false);
    }
  };

  const onError = (error) => {
    console.error("Erro no Brick do Mercado Pago:", error);
  };

  const onReady = () => {
    console.log("Formulário de pagamento carregado e pronto.");
  };

  return (
    <div style={styles.checkoutWrapper}>
      
      <div style={styles.headerGarantia}>
        <ShieldCheck size={20} color="#10b981" />
        <span style={styles.textoGarantia}>Ambiente 100% Criptografado e Seguro</span>
      </div>

      {loading && (
        <div style={styles.loadingOverlay}>
          <Loader2 size={40} color="#D4AF37" style={{ animation: "spin 1s linear infinite" }} />
          <p style={styles.loadingText}>Processando sua energia...</p>
        </div>
      )}

      {/* O COMPONENTE MÁGICO DO MERCADO PAGO */}
      <Payment
        initialization={{
          amount: parseFloat(valorBase),
          preferenceId: null, // Como estamos fazendo pagamento direto, não usamos preferenceId
        }}
        customization={{
          paymentMethods: {
            creditCard: "all",
            pix: "all",
          },
          visual: {
            style: {
              theme: "dark", // Se adapta perfeitamente ao nosso tema Arkanum!
              customVariables: {
                formBackgroundColor: "#151312",
                baseColor: "#D4AF37",
                textPrimaryColor: "#FDFBF7",
                textSecondaryColor: "#A89C92",
                errorColor: "#ef4444",
                successColor: "#10b981",
              }
            },
          },
        }}
        onSubmit={onSubmit}
        onReady={onReady}
        onError={onError}
      />
    </div>
  );
}

const styles = {
  checkoutWrapper: {
    position: 'relative',
    width: '100%',
    maxWidth: '500px',
    margin: '0 auto',
    backgroundColor: '#151312',
    border: '1px solid #2A2420',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
  },
  headerGarantia: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px dashed #2A2420'
  },
  textoGarantia: {
    color: '#10b981',
    fontSize: '13px',
    fontWeight: '600'
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(21, 19, 18, 0.9)',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    backdropFilter: 'blur(4px)'
  },
  loadingText: {
    color: '#D4AF37',
    marginTop: '16px',
    fontSize: '14px',
    fontFamily: "'Playfair Display', serif",
    fontStyle: 'italic'
  }
};