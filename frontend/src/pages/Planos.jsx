import React, { useState } from 'react';
import { Shield, Star, Zap, Check, ArrowRight } from 'lucide-react';

export default function Planos() {
  // Lê a role do usuário (pode vir do contexto, props ou localStorage)
  const userRole = localStorage.getItem('user_role') || 'CONSULENTE'; 
  const [planoAnual, setPlanoAnual] = useState(false);

  // ==========================================
  // CONTEÚDO PARA CONSULENTES
  // ==========================================
  if (userRole === 'CONSULENTE') {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Eleve sua Conexão Espiritual</h2>
          <p style={styles.subtitle}>Escolha o Círculo Premium e tenha acesso a benefícios exclusivos na sua jornada de autoconhecimento.</p>
        </div>

        <div style={styles.toggleContainer}>
          <span style={{ color: !planoAnual ? '#D4AF37' : '#786C63', fontWeight: '600' }}>Mensal</span>
          <div style={styles.switch} onClick={() => setPlanoAnual(!planoAnual)}>
            <div style={{ ...styles.switchKnob, transform: planoAnual ? 'translateX(24px)' : 'translateX(0)' }} />
          </div>
          <span style={{ color: planoAnual ? '#D4AF37' : '#786C63', fontWeight: '600' }}>Anual (20% OFF)</span>
        </div>

        <div style={styles.cardsWrapper}>
          <div style={styles.cardNormal}>
            <h3 style={styles.planName}>Jornada Inicial</h3>
            <div style={styles.priceBox}>
              <span style={styles.currency}>R$</span>
              <span style={styles.price}>0</span>
              <span style={styles.period}>/mês</span>
            </div>
            <ul style={styles.featureList}>
              <li style={styles.featureItem}><Check size={16} color="#786C63" /> Acesso a todos os guias</li>
              <li style={styles.featureItem}><Check size={16} color="#786C63" /> Fila de espera normal</li>
              <li style={styles.featureItem}><Check size={16} color="#786C63" /> Histórico de 30 dias</li>
            </ul>
            <button style={styles.btnOutline}>Plano Atual</button>
          </div>

          <div style={styles.cardDestaque}>
            <div style={styles.badgeTop}><Star size={12} /> MAIS ESCOLHIDO</div>
            <h3 style={styles.planNameDestaque}>Círculo Premium</h3>
            <div style={styles.priceBox}>
              <span style={styles.currencyDestaque}>R$</span>
              <span style={styles.priceDestaque}>{planoAnual ? '23,90' : '29,90'}</span>
              <span style={styles.periodDestaque}>/mês</span>
            </div>
            <ul style={styles.featureList}>
              <li style={styles.featureItemDestaque}><Check size={16} color="#D4AF37" /> 1 Tiragem Expressa grátis/mês</li>
              <li style={styles.featureItemDestaque}><Check size={16} color="#D4AF37" /> Prioridade máxima na fila</li>
              <li style={styles.featureItemDestaque}><Check size={16} color="#D4AF37" /> Acesso vitalício aos Registros Akáshicos</li>
              <li style={styles.featureItemDestaque}><Check size={16} color="#D4AF37" /> Horóscopo e trânsitos astrológicos VIP</li>
            </ul>
            <button style={styles.btnPrimary}>Assinar Premium <ArrowRight size={16} /></button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // CONTEÚDO PARA TARÓLOGOS
  // ==========================================
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Maximize seus Ganhos no Arkanum</h2>
        <p style={styles.subtitle}>Ferramentas profissionais para expandir sua clientela e reduzir as taxas da plataforma.</p>
      </div>

      <div style={styles.cardsWrapper}>
        <div style={styles.cardNormal}>
          <h3 style={styles.planName}>Arkanum Básico</h3>
          <div style={styles.priceBox}>
            <span style={styles.currency}>R$</span>
            <span style={styles.price}>0</span>
            <span style={styles.period}>/mês</span>
          </div>
          <ul style={styles.featureList}>
            <li style={styles.featureItem}><Check size={16} color="#786C63" /> Agenda e Perfil Público</li>
            <li style={styles.featureItem}><Check size={16} color="#786C63" /> Taxa de 20% por sessão</li>
            <li style={styles.featureItem}><Check size={16} color="#786C63" /> Saque mensal padrão</li>
          </ul>
          <button style={styles.btnOutline}>Plano Atual</button>
        </div>

        <div style={styles.cardDestaque}>
          <div style={styles.badgeTop}><Zap size={12} /> PARA PROFISSIONAIS</div>
          <h3 style={styles.planNameDestaque}>Arkanum Pro</h3>
          <div style={styles.priceBox}>
            <span style={styles.currencyDestaque}>R$</span>
            <span style={styles.priceDestaque}>49,90</span>
            <span style={styles.periodDestaque}>/mês</span>
          </div>
          <ul style={styles.featureList}>
            <li style={styles.featureItemDestaque}><Check size={16} color="#D4AF37" /> Taxa reduzida (apenas 10% por sessão)</li>
            <li style={styles.featureItemDestaque}><Check size={16} color="#D4AF37" /> Selo "Guia Verificado" no perfil</li>
            <li style={styles.featureItemDestaque}><Check size={16} color="#D4AF37" /> Destaque no topo das buscas</li>
            <li style={styles.featureItemDestaque}><Check size={16} color="#D4AF37" /> Saques liberados a qualquer momento</li>
          </ul>
          <button style={styles.btnPrimary}>Assinar PRO <ArrowRight size={16} /></button>
        </div>
      </div>
    </div>
  );
}

// ESTILOS (Mesma identidade do seu painel)
const styles = {
  container: { padding: '40px 20px', maxWidth: '900px', margin: '0 auto', fontFamily: "'Inter', sans-serif" },
  header: { textAlign: 'center', marginBottom: '40px' },
  title: { color: '#FDFBF7', fontSize: '32px', fontFamily: "'Playfair Display', serif", marginBottom: '12px' },
  subtitle: { color: '#A89C92', fontSize: '15px', lineHeight: '1.6' },
  
  toggleContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '40px', fontSize: '14px' },
  switch: { width: '48px', height: '24px', backgroundColor: '#1A1715', borderRadius: '12px', border: '1px solid #3A322C', position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' },
  switchKnob: { width: '18px', height: '18px', backgroundColor: '#D4AF37', borderRadius: '50%', transition: 'transform 0.3s ease' },
  
  cardsWrapper: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', alignItems: 'center' },
  
  cardNormal: { backgroundColor: '#151312', border: '1px solid #2A2420', borderRadius: '16px', padding: '40px 32px', display: 'flex', flexDirection: 'column', height: '100%' },
  cardDestaque: { backgroundColor: '#1A1715', border: '2px solid #D4AF37', borderRadius: '16px', padding: '40px 32px', position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', transform: 'scale(1.02)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' },
  
  badgeTop: { position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#D4AF37', color: '#151312', padding: '6px 16px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' },
  
  planName: { color: '#A89C92', fontSize: '18px', fontWeight: '600', marginBottom: '16px' },
  planNameDestaque: { color: '#FDFBF7', fontSize: '20px', fontWeight: '700', marginBottom: '16px' },
  
  priceBox: { display: 'flex', alignItems: 'baseline', marginBottom: '32px' },
  currency: { color: '#786C63', fontSize: '18px', fontWeight: '600', marginRight: '4px' },
  price: { color: '#FDFBF7', fontSize: '42px', fontWeight: '800', letterSpacing: '-1px' },
  period: { color: '#786C63', fontSize: '14px', marginLeft: '4px' },
  
  currencyDestaque: { color: '#D4AF37', fontSize: '18px', fontWeight: '600', marginRight: '4px' },
  priceDestaque: { color: '#D4AF37', fontSize: '48px', fontWeight: '800', letterSpacing: '-1px' },
  periodDestaque: { color: '#A89C92', fontSize: '14px', marginLeft: '4px' },
  
  featureList: { listStyle: 'none', padding: 0, margin: '0 0 40px 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' },
  featureItem: { display: 'flex', alignItems: 'center', gap: '12px', color: '#A89C92', fontSize: '14px' },
  featureItemDestaque: { display: 'flex', alignItems: 'center', gap: '12px', color: '#EAE0C8', fontSize: '14px' },
  
  btnOutline: { width: '100%', padding: '16px', backgroundColor: 'transparent', border: '1px solid #3A322C', color: '#A89C92', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  btnPrimary: { width: '100%', padding: '16px', backgroundColor: '#D4AF37', border: 'none', color: '#151312', borderRadius: '8px', fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'opacity 0.2s', '&:hover': { opacity: 0.9 } }
};