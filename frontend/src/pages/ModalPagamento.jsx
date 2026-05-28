import React, { useState } from 'react';
import { X, QrCode, CreditCard, Copy, CheckCheck, Lock } from 'lucide-react';

export default function ModalPagamento({ isOpen, onClose, dadosPagamento }) {
  const [metodo, setMetodo] = useState('pix');
  const [copiado, setCopiado] = useState(false);

  if (!isOpen) return null;

  const copiarPix = () => {
    navigator.clipboard.writeText(dadosPagamento?.qr_code || '');
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Liberar Consulta</h2>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={20} color="#786C63" />
          </button>
        </div>

        <div style={styles.tabs}>
          <button 
            onClick={() => setMetodo('pix')} 
            style={{...styles.tab, ...(metodo === 'pix' ? styles.tabAtiva : {})}}
          >
            <QrCode size={18} /> PIX (Aprovação Imediata)
          </button>
          <button 
            onClick={() => setMetodo('cartao')} 
            style={{...styles.tab, ...(metodo === 'cartao' ? styles.tabAtiva : {})}}
          >
            <CreditCard size={18} /> Cartão de Crédito
          </button>
        </div>

        <div style={styles.content}>
          {metodo === 'pix' && (
            <div style={styles.pixContainer}>
              <div style={styles.qrWrapper}>
                {dadosPagamento?.qr_code_base64 ? (
                  <img 
                    src={`data:image/png;base64,${dadosPagamento.qr_code_base64}`} 
                    alt="QR Code PIX" 
                    style={styles.qrImage}
                  />
                ) : (
                  <div style={styles.qrPlaceholder}>Carregando Código...</div>
                )}
              </div>
              
              <p style={styles.instrucao}>Escaneie o QR Code ou copie o código abaixo:</p>
              
              <div style={styles.copyBox}>
                <input 
                  type="text" 
                  readOnly 
                  value={dadosPagamento?.qr_code || 'Aguardando código...'} 
                  style={styles.inputCopy} 
                />
                <button onClick={copiarPix} style={styles.btnCopy}>
                  {copiado ? <CheckCheck size={18} color="#10b981" /> : <Copy size={18} color="#151312" />}
                </button>
              </div>
              <p style={styles.avisoSeguranca}>
                <Lock size={12} style={{marginRight: '4px'}}/> 
                Pagamento processado com segurança pelo Mercado Pago. O chat será liberado automaticamente após a confirmação.
              </p>
            </div>
          )}

          {metodo === 'cartao' && (
            <div style={styles.cartaoContainer}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Número do Cartão</label>
                <input type="text" placeholder="0000 0000 0000 0000" style={styles.input} />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Nome do Titular</label>
                <input type="text" placeholder="Como impresso no cartão" style={styles.input} />
              </div>
              
              <div style={styles.row}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Validade</label>
                  <input type="text" placeholder="MM/AA" style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>CVV</label>
                  <input type="text" placeholder="123" style={styles.input} />
                </div>
              </div>

              <button style={styles.btnPagarCartao}>
                Pagar R$ 35,00
              </button>
              <p style={styles.avisoSeguranca}>
                <Lock size={12} style={{marginRight: '4px'}}/> 
                Dados criptografados. Nós não salvamos o número do seu cartão.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(17, 15, 14, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' },
  modal: { width: '100%', maxWidth: '440px', backgroundColor: '#151312', border: '1px solid #2A2420', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #1A1715' },
  title: { color: '#FDFBF7', fontFamily: "'Playfair Display', serif", fontSize: '20px', margin: 0 },
  closeBtn: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' },
  tabs: { display: 'flex', borderBottom: '1px solid #2A2420' },
  
  // CORREÇÃO: Trocamos 'background: none' por 'backgroundColor: transparent'
  tab: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px', backgroundColor: 'transparent', border: 'none', color: '#786C63', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: '0.2s', borderBottom: '2px solid transparent' },
  tabAtiva: { color: '#D4AF37', borderBottom: '2px solid #D4AF37', backgroundColor: '#1A1715' },
  
  content: { padding: '24px' },
  
  pixContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  qrWrapper: { width: '200px', height: '200px', backgroundColor: '#FDFBF7', padding: '10px', borderRadius: '12px', marginBottom: '16px' },
  qrImage: { width: '100%', height: '100%' },
  qrPlaceholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#786C63', fontSize: '12px' },
  instrucao: { color: '#EAE0C8', fontSize: '14px', marginBottom: '12px' },
  copyBox: { display: 'flex', width: '100%', backgroundColor: '#110F0E', border: '1px solid #3A322C', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' },
  
  // CORREÇÃO: Padronizando para 'backgroundColor: transparent'
  inputCopy: { flex: 1, padding: '12px', backgroundColor: 'transparent', border: 'none', color: '#786C63', fontSize: '12px', outline: 'none' },
  btnCopy: { padding: '0 16px', backgroundColor: '#D4AF37', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  
  cartaoContainer: { display: 'flex', flexDirection: 'column', gap: '16px' },
  row: { display: 'flex', gap: '16px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 },
  label: { color: '#A89C92', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' },
  input: { padding: '12px 14px', backgroundColor: '#110F0E', border: '1px solid #3A322C', borderRadius: '8px', color: '#EAE0C8', fontSize: '14px', outline: 'none' },
  btnPagarCartao: { width: '100%', padding: '14px', backgroundColor: '#D4AF37', color: '#151312', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', marginTop: '8px' },
  
  avisoSeguranca: { display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#786C63', fontSize: '11px', marginTop: '8px', textAlign: 'center' }
};