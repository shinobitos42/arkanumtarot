import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Termos() {
  const navigate = useNavigate();

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          <ArrowLeft size={16} style={{ marginRight: '8px' }} />
          Voltar
        </button>

        <h1 style={styles.title}>Termos de Uso</h1>
        <p style={styles.date}>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

        <div style={styles.content}>
          <div>
            <h2 style={styles.sectionTitle}>1. Aceitação dos Termos</h2>
            <p style={styles.text}>
              Ao acessar e usar o portal Arkanum Tarot, você concorda plenamente em cumprir estes Termos de Uso. Se não concordar com alguma parte desta jornada, pedimos que não utilize nossos serviços.
            </p>
          </div>

          <div>
            <h2 style={styles.sectionTitle}>2. Natureza do Serviço</h2>
            <p style={styles.text}>
              O Arkanum Tarot é uma plataforma de intermediação e conexão espiritual. O Tarot e outros oráculos não substituem aconselhamento médico, financeiro, legal ou psicológico profissional. O serviço possui finalidade de orientação pessoal, autoconhecimento e entretenimento.
            </p>
          </div>

          <div>
            <h2 style={styles.sectionTitle}>3. Responsabilidades do Usuário</h2>
            <p style={styles.text}>
              Seja você um tarólogo guiando o caminho ou um consulente em busca de clareza, compromete-se a manter o respeito mútuo. É terminantemente proibido compartilhar conteúdos ilícitos, ofensivos ou violar a confiança e o sigilo das sessões.
            </p>
          </div>

          <div>
            <h2 style={styles.sectionTitle}>4. Assinaturas e Pagamentos</h2>
            <p style={styles.text}>
              Nossos serviços premium e planos mensais estão sujeitos às taxas informadas de forma transparente no momento da contratação. O cancelamento flui de forma livre e pode ser feito a qualquer momento, valendo sempre para o ciclo de faturamento seguinte.
            </p>
          </div>

          <div>
            <h2 style={styles.sectionTitle}>5. Manutenção do Santuário (Suspensão)</h2>
            <p style={styles.text}>
              O Arkanum Tarot reserva-se o direito soberano de suspender, banir ou encerrar contas que violem estes termos. Nossa prioridade absoluta é manter a egrégora, a segurança e a integridade da nossa comunidade intactas.
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