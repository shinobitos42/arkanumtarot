import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, MessageCircle, CalendarDays, Sparkles, ArrowRight, Lock } from "lucide-react";
import Navbar from "../components/Navbar";

export default function OEspaco() {
  const navigate = useNavigate();

  return (
    <div className="app-container" style={styles.pageWrapper}>
      <Navbar />

      {/* HERO SECTION */}
      <section style={styles.heroSection}>
        <div style={styles.heroContent}>
          <span style={styles.badge}><Sparkles size={14} /> Um Santuário Digital</span>
          <h1 style={styles.title}>Mais que um site de leituras. <br/>Uma <span style={styles.italicGold}>experiência imersiva.</span></h1>
          <p style={styles.subtitle}>
            Construímos o Arkanum para ser um refúgio seguro. Esqueça chats confusos e sites ultrapassados. 
            Aqui, você tem um painel exclusivo para gerenciar sua evolução espiritual.
          </p>
        </div>
      </section>

      {/* COMO FUNCIONA - COM PRINTS */}
      <section style={styles.featuresSection}>
        
        {/* Feature 1: Fila Expressa */}
        <div className="grid-mobile" style={styles.featureRow}>
          <div style={styles.featureText}>
            <div style={styles.iconBox}><MessageCircle size={24} color="#D4AF37" /></div>
            <h3 style={styles.featureTitle}>Tiragem Expressa</h3>
            <p style={styles.featureDesc}>
              Precisa de uma resposta rápida? Envie sua dúvida para o Círculo de Guias. 
              O primeiro oraculista disponível se conectará com a sua energia e enviará a leitura diretamente no seu painel, em texto ou áudio.
            </p>
          </div>
          <div style={styles.featureImageWrapper}>
            {/* SUBSTITUA O SRC ABAIXO PELO SEU PRINT DA TELA DE TIRAGEM EXPRESSA/MENSAGENS */}
            <div style={styles.mockupPlaceholder}>
              <p style={{ color: '#786C63' }}>[ Insira o print da Tela de Chat / Fila Expressa aqui ]</p>
              <span style={{ fontSize: '10px', color: '#3A322C' }}>Recomendado: Imagem horizontal com bordas arredondadas</span>
            </div>
          </div>
        </div>

        {/* Feature 2: Agendamentos */}
        <div className="grid-mobile" style={{ ...styles.featureRow, direction: 'rtl' }}>
          <div style={{ ...styles.featureText, direction: 'ltr' }}>
            <div style={styles.iconBox}><CalendarDays size={24} color="#D4AF37" /></div>
            <h3 style={styles.featureTitle}>Agende Leituras Profundas</h3>
            <p style={styles.featureDesc}>
              Acesse a vitrine de cada tarólogo, conheça suas especialidades e escolha o serviço que mais ressoa com você. 
              Nosso calendário inteligente sincroniza os fusos horários para que você e o guia se encontrem na hora exata.
            </p>
          </div>
          <div style={{ ...styles.featureImageWrapper, direction: 'ltr' }}>
             {/* SUBSTITUA O SRC ABAIXO PELO SEU PRINT DO PERFIL DO TARÓLOGO / AGENDAMENTO */}
             <div style={styles.mockupPlaceholder}>
              <p style={{ color: '#786C63' }}>[ Insira o print da Vitrine / Calendário aqui ]</p>
            </div>
          </div>
        </div>

        {/* Feature 3: Registros Akáshicos */}
        <div className="grid-mobile" style={styles.featureRow}>
          <div style={styles.featureText}>
            <div style={styles.iconBox}><Lock size={24} color="#D4AF37" /></div>
            <h3 style={styles.featureTitle}>Registros Akáshicos (IA)</h3>
            <p style={styles.featureDesc}>
              Nunca mais perca as orientações que recebeu. Todas as suas sessões ficam salvas em um arquivo criptografado. 
              No plano Premium, nossa Inteligência Artificial analisa o histórico e cria um resumo espiritual detalhado em formato de pergaminho PDF.
            </p>
          </div>
          <div style={styles.featureImageWrapper}>
            {/* SUBSTITUA O SRC ABAIXO PELO SEU PRINT DOS REGISTROS AKÁSHICOS / PDF */}
            <div style={styles.mockupPlaceholder}>
              <p style={{ color: '#786C63' }}>[ Insira o print dos Registros / Modal do PDF aqui ]</p>
            </div>
          </div>
        </div>

      </section>

      {/* CALL TO ACTION */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaBox}>
          <ShieldCheck size={40} color="#D4AF37" style={{ marginBottom: "16px" }} />
          <h2 style={styles.ctaTitle}>Pronto para iniciar sua jornada?</h2>
          <p style={styles.ctaSubtitle}>O cadastro é 100% gratuito e seus dados estão protegidos.</p>
          <button onClick={() => navigate("/register")} style={styles.btnPrimary}>
            Criar Conta Gratuita <ArrowRight size={16} />
          </button>
        </div>
      </section>

    </div>
  );
}

const styles = {
  pageWrapper: { 
    backgroundColor: "#110F0E", 
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
    color: "#EAE0C8",
    overflowX: "hidden"
  },
  heroSection: {
    padding: "160px 5% 100px",
    display: "flex",
    justifyContent: "center",
    textAlign: "center",
    background: "linear-gradient(180deg, #151312 0%, #110F0E 100%)",
    borderBottom: "1px solid #2A2420"
  },
  heroContent: { maxWidth: "800px", display: "flex", flexDirection: "column", alignItems: "center" },
  badge: { display: "flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(212, 175, 55, 0.1)", color: "#D4AF37", padding: "6px 16px", borderRadius: "30px", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "24px", border: "1px solid rgba(212, 175, 55, 0.2)" },
  title: { fontSize: "48px", fontFamily: "'Playfair Display', serif", color: "#FDFBF7", lineHeight: "1.2", marginBottom: "24px", fontWeight: "normal" },
  italicGold: { fontStyle: "italic", color: "#D4AF37" },
  subtitle: { fontSize: "16px", color: "#A89C92", lineHeight: "1.6", fontWeight: "300", maxWidth: "600px" },
  
  featuresSection: { padding: "100px 5%", maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "100px" },
  featureRow: { display: "flex", alignItems: "center", gap: "60px" },
  featureText: { flex: 1, display: "flex", flexDirection: "column", gap: "16px" },
  iconBox: { width: "56px", height: "56px", borderRadius: "16px", backgroundColor: "#1A1715", border: "1px solid #2A2420", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" },
  featureTitle: { fontSize: "32px", fontFamily: "'Playfair Display', serif", color: "#FDFBF7", fontWeight: "normal" },
  featureDesc: { fontSize: "15px", color: "#A89C92", lineHeight: "1.7", fontWeight: "300" },
  
  featureImageWrapper: { flex: 1.2, width: "100%" },
  mockupPlaceholder: { width: "100%", height: "350px", backgroundColor: "#151312", border: "1px dashed #3A322C", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "20px" },
  
  ctaSection: { padding: "0 5% 100px", display: "flex", justifyContent: "center" },
  ctaBox: { backgroundColor: "#151312", border: "1px solid #2A2420", borderRadius: "24px", padding: "60px 20px", maxWidth: "800px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" },
  ctaTitle: { fontSize: "36px", fontFamily: "'Playfair Display', serif", color: "#FDFBF7", marginBottom: "16px", fontWeight: "normal" },
  ctaSubtitle: { fontSize: "15px", color: "#A89C92", marginBottom: "32px", fontWeight: "300" },
  btnPrimary: { display: "flex", alignItems: "center", gap: "10px", padding: "16px 32px", backgroundColor: "#D4AF37", color: "#151312", border: "none", borderRadius: "4px", fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", cursor: "pointer", transition: "opacity 0.2s" },
};