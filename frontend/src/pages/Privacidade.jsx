import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Privacidade() {
  const navigate = useNavigate();

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          <ArrowLeft size={16} style={{ marginRight: '8px' }} />
          Voltar
        </button>

        <h1 style={styles.title}>Política de Privacidade</h1>
        <p style={styles.date}>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

        <div style={styles.content}>
          <div>
            <h2 style={styles.sectionTitle}>1. Informações que Coletamos</h2>
            <p style={styles.text}>
              O Arkanum Tarot coleta dados necessários para o funcionamento da plataforma, como nome, e-mail e informações de perfil (incluindo fotos) tanto de consulentes quanto de tarólogos. Dados financeiros são processados por provedores de pagamento terceirizados e absolutamente seguros.
            </p>
          </div>

          <div>
            <h2 style={styles.sectionTitle}>2. Como Usamos as Informações</h2>
            <p style={styles.text}>
              Utilizamos seus dados exclusivamente para gerenciar sua conta, facilitar as sessões de tarot, processar pagamentos (quando aplicável) e elevar constantemente o padrão de segurança do nosso santuário digital.
            </p>
          </div>

          <div>
            <h2 style={styles.sectionTitle}>3. Compartilhamento de Dados</h2>
            <p style={styles.text}>
              A sua jornada é sagrada para nós. Não vendemos suas informações pessoais. Dados essenciais de perfil podem ser vistos por outros usuários dentro da plataforma apenas para viabilizar as conexões e leituras entre tarólogos e consulentes.
            </p>
          </div>

          <div>
            <h2 style={styles.sectionTitle}>4. Segurança</h2>
            <p style={styles.text}>
              Implementamos medidas de segurança de ponta para proteger suas informações. O seu momento de busca e vulnerabilidade é tratado com o mais absoluto sigilo e respeito.
            </p>
          </div>

          <div>
            <h2 style={styles.sectionTitle}>5. Contato</h2>
            <p style={styles.text}>
              Se tiver dúvidas sobre esta Política de Privacidade ou sobre como tratamos seus dados, os guias do nosso suporte estão à disposição através do e-mail suporte@arkanumtarot.com.br.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

// OBJETÃO DE ESTILOS MANTENDO A IDENTIDADE DA HOME
const styles = {
  pageWrapper: { 
    backgroundColor: "#151312", 
    minHeight: "100vh",
    width: "100%",
    padding: "60px 5% 100px", 
    fontFamily: "'Playfair Display', 'Georgia', serif", 
    color: "#EAE0C8", 
    boxSizing: "border-box",
  },
  container: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  backButton: {
    display: "flex",
    alignItems: "center",
    background: "none",
    border: "none",
    color: "#A89C92",
    fontFamily: "'Inter', sans-serif",
    fontSize: "12px",
    cursor: "pointer",
    padding: "0",
    marginBottom: "40px",
    textTransform: "uppercase",
    letterSpacing: "2px",
    transition: "color 0.2s",
  },
  title: {
    fontSize: "42px",
    fontWeight: "normal",
    color: "#FDFBF7",
    marginBottom: "10px",
    letterSpacing: "-0.5px",
  },
  date: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "11px",
    color: "#B89650",
    marginBottom: "50px",
    letterSpacing: "3px",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: "40px",
  },
  sectionTitle: {
    fontSize: "22px",
    fontWeight: "normal",
    color: "#D4AF37",
    fontStyle: "italic",
    marginBottom: "16px",
    letterSpacing: "0.5px",
  },
  text: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "15px",
    color: "#A89C92",
    lineHeight: "1.8",
    fontWeight: "300",
    margin: 0,
  }
};