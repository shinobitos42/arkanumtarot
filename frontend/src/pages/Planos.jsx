import React, { useState } from 'react';
import { CheckCircle, Crown, Sparkles, ShieldCheck, Lock } from 'lucide-react';

export default function Planos() {
  const [loading, setLoading] = useState(false);

  const handleAssinarPremium = () => {
    setLoading(true);
    // Aqui no futuro chamaremos o Checkout do Stripe ou Mercado Pago
    setTimeout(() => {
      alert("Redirecionando para o Gateway de Pagamento...");
      setLoading(false);
    }, 1500);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Eleve sua Jornada Espiritual</h2>
        <p style={styles.subtitle}>
          Escolha como deseja explorar os mistérios do Arcanum.
        </p>
      </div>

      <div style={styles.cardsContainer}>
        {/* PLANO GRATUITO */}
        <div style={styles.cardFree}>
          <div style={styles.cardHeader}>
            <ShieldCheck size={28} color="#A89C92" />
            <h3 style={styles.planNameFree}>Círculo Aberto</h3>
          </div>
          <div style={styles.priceContainer}>
            <span style={styles.currency}>R$</span>
            <span style={styles.price}>0</span>
            <span style={styles.period}>/mês</span>
          </div>
          <p style={styles.planDescription}>O essencial para buscar clareza em momentos pontuais.</p>
          
          <ul style={styles.featuresList}>
            <li style={styles.featureItem}><CheckCircle size={16} color="#10b981" /> Acesso à vitrine de Guias</li>
            <li style={styles.featureItem}><CheckCircle size={16} color="#10b981" /> Chat em tempo real e áudios</li>
            <li style={styles.featureItem}><CheckCircle size={16} color="#10b981" /> Histórico básico de mensagens</li>
            <li style={{...styles.featureItem, color: '#786C63'}}><Lock size={16} color="#786C63" /> Resumo Akáshico da Leitura</li>
            <li style={{...styles.featureItem, color: '#786C63'}}><Lock size={16} color="#786C63" /> Prioridade na Fila de Espera</li>
          </ul>

          <button style={styles.btnFree} disabled>Seu Plano Atual</button>
        </div>

        {/* PLANO PREMIUM */}
        <div style={styles.cardPremium}>
          <div style={styles.premiumBadge}>
            <Sparkles size={14} color="#151312" /> MAIS ESCOLHIDO
          </div>
          <div style={styles.cardHeader}>
            <Crown size={28} color="#D4AF37" />
            <h3 style={styles.planNamePremium}>Círculo Premium</h3>
          </div>
          <div style={styles.priceContainer}>
            <span style={{...styles.currency, color: '#D4AF37'}}>R$</span>
            <span style={{...styles.price, color: '#D4AF37'}}>29</span>
            <span style={{...styles.period, color: '#D4AF37'}}>,90/mês</span>
          </div>
          <p style={styles.planDescriptionPremium}>Para quem busca acompanhamento profundo e registros eternos.</p>
          
          <ul style={styles.featuresList}>
            <li style={styles.featureItemPremium}><CheckCircle size={16} color="#D4AF37" /> Tudo do Círculo Aberto</li>
            <li style={styles.featureItemPremium}>
              <CheckCircle size={16} color="#D4AF37" /> 
              <strong>Resumo Mastigado de cada Tiragem</strong>
            </li>
            <li style={styles.featureItemPremium}><CheckCircle size={16} color="#D4AF37" /> Aconselhamento Prático Salvo</li>
            <li style={styles.featureItemPremium}><CheckCircle size={16} color="#D4AF37" /> Prioridade Máxima na Fila Expressa</li>
          </ul>

          <button onClick={handleAssinarPremium} style={styles.btnPremium} disabled={loading}>
            {loading ? "Preparando Portal..." : "Desbloquear Premium"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '20px', fontFamily: "'Inter', sans-serif" },
  header: { textAlign: 'center', marginBottom: '48px' },
  title: { fontSize: '32px', color: '#FDFBF7', fontFamily: "'Playfair Display', serif", marginBottom: '12px' },
  subtitle: { fontSize: '15px', color: '#A89C92' },
  cardsContainer: { display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap' },
  
  // Card Free
  cardFree: { width: '100%', maxWidth: '340px', backgroundColor: '#151312', border: '1px solid #2A2420', borderRadius: '16px', padding: '32px', display: 'flex', flexDirection: 'column' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' },
  planNameFree: { color: '#FDFBF7', fontSize: '20px', fontWeight: '600' },
  priceContainer: { display: 'flex', alignItems: 'flex-start', marginBottom: '16px' },
  currency: { fontSize: '16px', color: '#EAE0C8', marginTop: '4px', marginRight: '2px' },
  price: { fontSize: '40px', fontWeight: '700', color: '#FDFBF7', lineHeight: '1' },
  period: { fontSize: '14px', color: '#A89C92', alignSelf: 'flex-end', marginBottom: '6px' },
  planDescription: { color: '#A89C92', fontSize: '14px', lineHeight: '1.5', marginBottom: '32px', minHeight: '42px' },
  featuresList: { listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 },
  featureItem: { display: 'flex', alignItems: 'center', gap: '12px', color: '#EAE0C8', fontSize: '14px' },
  btnFree: { width: '100%', padding: '16px', backgroundColor: 'transparent', color: '#786C63', border: '1px solid #3A322C', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'not-allowed' },

  // Card Premium
  cardPremium: { position: 'relative', width: '100%', maxWidth: '340px', backgroundColor: '#1A1715', border: '2px solid #D4AF37', borderRadius: '16px', padding: '32px', display: 'flex', flexDirection: 'column', transform: 'scale(1.05)', boxShadow: '0 20px 40px rgba(212, 175, 55, 0.1)' },
  premiumBadge: { position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#D4AF37', color: '#151312', padding: '6px 16px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '1px' },
  planNamePremium: { color: '#D4AF37', fontSize: '20px', fontWeight: '600' },
  planDescriptionPremium: { color: '#EAE0C8', fontSize: '14px', lineHeight: '1.5', marginBottom: '32px', minHeight: '42px' },
  featureItemPremium: { display: 'flex', alignItems: 'center', gap: '12px', color: '#FDFBF7', fontSize: '14px' },
  btnPremium: { width: '100%', padding: '16px', backgroundColor: '#D4AF37', color: '#151312', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(212, 175, 55, 0.2)' },
};