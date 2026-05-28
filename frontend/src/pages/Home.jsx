import React from "react";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={styles.pageWrapper}>
      {/* SEÇÃO HERO */}
      <section style={styles.heroSection}>
        <div style={styles.heroContainer}>
          
          <div style={styles.textContent}>
            <p style={styles.kicker}>Sabedoria Ancestral</p>
            <h1 style={styles.heroTitle}>
              Encontre a <span style={styles.italicGold}>paz</span> que o seu coração procura no <span style={styles.italicGold}>Arcanum</span>.
            </h1>
            <p style={styles.heroSubtitle}>
              Um espaço sagrado e acolhedor onde a intuição humana revela os caminhos ocultos do seu destino. Conecte-se com oraculistas experientes e encontre a clareza necessária para a sua jornada evolutiva.
            </p>
            
            <div style={styles.ctaRow}>
              <button onClick={() => navigate("/register")} style={styles.btnPrimary}>
                Conhecer os Guias
              </button>
              <button onClick={() => navigate("/login")} style={styles.btnSecondary}>
                Minha Jornada
              </button>
            </div>
          </div>

          <div style={styles.visualElement}>
            <div style={styles.cardFrame}>
              <div style={styles.cardInner}>
                <h3 style={styles.cardNumeral}>X</h3>
                <h2 style={styles.cardName}>A Roda</h2>
                <p style={styles.cardMeaning}>
                  "O destino está em constante movimento. O que hoje se apresenta como mistério, amanhã será a luz que guiará os seus passos mais firmes."
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SEÇÃO DE PILARES */}
      <section style={styles.pilaresSection}>
        <div style={styles.pilaresGrid}>
          
          <div style={styles.pilarItem}>
            <span style={styles.pilarNumber}>01</span>
            <h4 style={styles.pilarTitle}>Conexão Verdadeira</h4>
            <p style={styles.pilarDesc}>
              Acreditamos profundamente na energia do encontro. Nossos profissionais são cuidadosamente selecionados não apenas pelo profundo conhecimento dos oráculos, mas pela empatia, acolhimento e sensibilidade no trato humano.
            </p>
          </div>

          <div style={styles.pilarItem}>
            <span style={styles.pilarNumber}>02</span>
            <h4 style={styles.pilarTitle}>O Poder dos Arquétipos</h4>
            <p style={styles.pilarDesc}>
              As cartas não traçam um destino imutável, elas revelam as verdades ocultas do presente. Utilizamos o simbolismo sagrado do Tarot para clarear a sua visão e apoiar decisões alinhadas com a sua verdadeira essência.
            </p>
          </div>

          <div style={styles.pilarItem}>
            <span style={styles.pilarNumber}>03</span>
            <h4 style={styles.pilarTitle}>Sigilo e Santuário</h4>
            <p style={styles.pilarDesc}>
              O seu momento de vulnerabilidade e busca é tratado como sagrado. Garantimos que todas as leituras, aconselhamentos e trocas com os guias ocorram em um ambiente de absoluto sigilo, discrição e profundo respeito.
            </p>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div style={styles.footerContainer}>
          
          <div style={styles.footerBrand}>
            <h3 style={styles.footerLogo}>Arcanum</h3>
            <p style={styles.footerTagline}>
              Conectando sabedoria milenar e intuição humana para revelar o seu destino.
            </p>
          </div>
          
          <div style={styles.footerColumn}>
            <h5 style={styles.footerColTitle}>NAVEGAÇÃO</h5>
            <a href="/" style={styles.footerLink}>Início</a>
            <a href="/login" style={styles.footerLink}>Entrar</a>
            <a href="/register" style={styles.footerLink}>Criar Conta</a>
          </div>
          
          <div style={styles.footerColumn}>
            <h5 style={styles.footerColTitle}>JURÍDICO</h5>
            <a href="/termos" style={styles.footerLink}>Termos de Uso</a>
            <a href="/privacidade" style={styles.footerLink}>Privacidade</a>
          </div>

          <div style={styles.footerColumn}>
            <h5 style={styles.footerColTitle}>SUPORTE</h5>
            <a href="mailto:suporte@arcanum.com" style={styles.footerContact}>
              <Mail size={15} style={{ marginRight: '8px', color: '#A89C92' }} />
              suporte@arcanum.com
            </a>
          </div>

        </div>

        <div style={styles.footerBottom}>
          <p style={styles.footerText}>© 2026 Arcanum Inc. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  pageWrapper: { 
    backgroundColor: "#151312", 
    minHeight: "100vh",
    width: "100%",
    margin: 0,
    padding: 0, 
    fontFamily: "'Playfair Display', 'Georgia', serif", 
    color: "#EAE0C8", 
    boxSizing: "border-box",
    overflowX: "hidden"
  },
  
  heroSection: { padding: "120px 5% 80px", display: "flex", justifyContent: "center", borderBottom: "1px solid #2A2420" },
  heroContainer: { maxWidth: "1100px", width: "100%", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "60px", alignItems: "center" },
  
  textContent: { display: "flex", flexDirection: "column", alignItems: "flex-start" },
  kicker: { fontFamily: "'Inter', sans-serif", fontSize: "11px", letterSpacing: "4px", color: "#B89650", textTransform: "uppercase", marginBottom: "20px", fontWeight: "600" },
  heroTitle: { fontSize: "52px", fontWeight: "normal", lineHeight: "1.15", marginBottom: "30px", color: "#FDFBF7", letterSpacing: "-0.5px" },
  italicGold: { fontStyle: "italic", color: "#D4AF37" },
  heroSubtitle: { fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#A89C92", lineHeight: "1.7", marginBottom: "40px", fontWeight: "300" },
  
  ctaRow: { display: "flex", gap: "20px" },
  btnPrimary: { fontFamily: "'Inter', sans-serif", padding: "14px 32px", backgroundColor: "#D4AF37", color: "#151312", border: "none", borderRadius: "2px", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1.5px", cursor: "pointer", transition: "opacity 0.2s" },
  btnSecondary: { fontFamily: "'Inter', sans-serif", padding: "14px 32px", backgroundColor: "transparent", color: "#D4AF37", border: "1px solid #D4AF37", borderRadius: "2px", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1.5px", cursor: "pointer" },

  visualElement: { display: "flex", justifyContent: "center", alignItems: "center" },
  cardFrame: { width: "290px", height: "450px", padding: "12px", border: "1px solid #4A3E32", backgroundColor: "#1A1715", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" },
  cardInner: { border: "1px solid #D4AF37", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", textAlign: "center" },
  cardNumeral: { fontSize: "22px", color: "#D4AF37", marginBottom: "12px", fontWeight: "normal", letterSpacing: "1px" },
  cardName: { fontSize: "34px", color: "#FDFBF7", marginBottom: "30px", fontStyle: "italic", fontWeight: "normal", letterSpacing: "1px" },
  cardMeaning: { fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#A89C92", lineHeight: "1.8", fontStyle: "italic", fontWeight: "300" },

  pilaresSection: { padding: "100px 5%", maxWidth: "1100px", margin: "0 auto", width: "100%" },
  pilaresGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "60px" },
  pilarItem: { display: "flex", flexDirection: "column", alignItems: "flex-start" },
  pilarNumber: { fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#D4AF37", marginBottom: "16px", letterSpacing: "2px", fontWeight: "600" },
  pilarTitle: { fontSize: "24px", color: "#FDFBF7", marginBottom: "16px", fontWeight: "normal", letterSpacing: "0.5px" },
  pilarDesc: { fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#A89C92", lineHeight: "1.75", fontWeight: "300" },

  footer: { backgroundColor: "#110F0E", paddingTop: "60px", paddingBottom: "20px" },
  footerContainer: { maxWidth: "1100px", margin: "0 auto", padding: "0 5%", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.5fr", gap: "30px", paddingBottom: "50px" },
  
  footerBrand: { display: "flex", flexDirection: "column", paddingRight: "40px" },
  footerLogo: { margin: "0 0 15px 0", color: "#D4AF37", fontSize: "1.5rem", fontWeight: "normal", letterSpacing: "2px", fontStyle: "italic" },
  footerTagline: { fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#A89C92", lineHeight: "1.65", fontWeight: "300" },
  
  footerColumn: { display: "flex", flexDirection: "column", gap: "16px" },
  footerColTitle: { fontFamily: "'Inter', sans-serif", color: "#FDFBF7", fontSize: "13px", letterSpacing: "1px", marginBottom: "4px", fontWeight: "600", textTransform: "uppercase" },
  
  footerLink: { fontFamily: "'Inter', sans-serif", color: "#A89C92", textDecoration: "none", fontSize: "13px", transition: "color 0.2s", fontWeight: "300" },
  footerContact: { fontFamily: "'Inter', sans-serif", color: "#A89C92", textDecoration: "none", fontSize: "13px", display: "flex", alignItems: "center", fontWeight: "300", marginTop: "2px" },
  
  footerBottom: { maxWidth: "1100px", margin: "0 auto", padding: "20px 5% 0", borderTop: "1px solid #2A2420", textAlign: "center" },
  footerText: { fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#786C63", letterSpacing: "0.5px", fontWeight: "300" }
};