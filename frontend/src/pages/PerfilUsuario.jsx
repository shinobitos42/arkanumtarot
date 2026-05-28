import React, { useState } from "react";
import { User, Mail, Calendar, Shield, CreditCard, Lock, ArrowRight } from "lucide-react";

export default function PerfilUsuario() {
  // Puxa os dados reais de quem fez login
  const nomeUsuario = localStorage.getItem('user_name') || 'Usuário';
  const emailUsuario = localStorage.getItem('user_email') || 'email@exemplo.com'; // O ideal é salvar isso no login futuramente
  
  const [dataNascimento, setDataNascimento] = useState("");

  const handleSalvar = (e) => {
    e.preventDefault();
    console.log("Salvando dados:", { dataNascimento });
    // Aqui entrará a conexão com o axios futuramente
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Minha Conta</h2>
        <p style={styles.subtitle}>Gerencie suas informações pessoais e configurações de acesso.</p>
      </div>

      <div style={styles.grid}>
        {/* COLUNA ESQUERDA: DADOS PESSOAIS */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Dados Pessoais</h3>
          
          <form onSubmit={handleSalvar} style={styles.form}>
            
            {/* NOME (TRAVADO) */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Nome Completo</label>
              <div style={styles.inputWrapperDisabled}>
                <User size={16} color="#786C63" style={styles.inputIcon} />
                <input 
                  type="text" 
                  value={nomeUsuario} 
                  disabled 
                  style={styles.inputDisabled} 
                />
                <Lock size={14} color="#786C63" style={styles.lockIcon} />
              </div>
            </div>

            {/* E-MAIL (TRAVADO) */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Endereço de E-mail</label>
              <div style={styles.inputWrapperDisabled}>
                <Mail size={16} color="#786C63" style={styles.inputIcon} />
                <input 
                  type="email" 
                  value={emailUsuario} 
                  disabled 
                  style={styles.inputDisabled} 
                />
                <Lock size={14} color="#786C63" style={styles.lockIcon} />
              </div>
            </div>

            {/* DATA DE NASCIMENTO (EDITÁVEL) */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Data de Nascimento (Importante para alinhamento astrológico)</label>
              <div style={styles.inputWrapper}>
                <Calendar size={16} color="#A89C92" style={styles.inputIcon} />
                <input 
                  type="date" 
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  style={styles.input} 
                />
              </div>
            </div>

            <button type="submit" style={styles.btnSalvar}>
              Salvar Alterações
            </button>
          </form>
        </div>

        {/* COLUNA DIREITA: PLANOS E SEGURANÇA */}
        <div style={styles.columnRight}>
          
          {/* PLANO ATUAL - SEM DADOS FALSOS */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Plano Atual</h3>
            
            <div style={styles.planInfo}>
              <div style={styles.planTagBase}>Jornada Inicial</div>
              <h4 style={styles.planName}>Acesso Básico</h4>
              <p style={styles.planDesc}>
                Você está no plano gratuito. Adquira o Círculo Premium para ter acessos ilimitados aos Registros Akáshicos e prioridade nas filas.
              </p>
            </div>

            <button style={styles.btnUpgrade}>
              <Shield size={16} /> Conhecer Círculo Premium
            </button>
          </div>

          {/* SEGURANÇA */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Segurança</h3>
            <p style={{ color: "#A89C92", fontSize: "13px", marginBottom: "20px", lineHeight: "1.5" }}>
              Mantenha sua conta protegida atualizando sua senha regularmente.
            </p>
            <button style={styles.btnOutline}>
              Alterar Senha de Acesso
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { paddingBottom: "40px", animation: "fadeIn 0.3s ease" },
  header: { marginBottom: "32px" },
  title: { color: "#FDFBF7", fontSize: "28px", fontFamily: "'Playfair Display', serif", fontStyle: "italic", marginBottom: "8px" },
  subtitle: { color: "#A89C92", fontSize: "14px" },
  grid: { display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" },
  columnRight: { display: "flex", flexDirection: "column", gap: "24px" },
  card: { backgroundColor: "#151312", border: "1px solid #2A2420", borderRadius: "12px", padding: "32px" },
  cardTitle: { color: "#FDFBF7", fontSize: "18px", fontFamily: "'Playfair Display', serif", marginBottom: "24px" },
  form: { display: "flex", flexDirection: "column", gap: "24px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { color: "#A89C92", fontSize: "12px", fontWeight: "500" },
  inputWrapper: { position: "relative", display: "flex", alignItems: "center" },
  inputWrapperDisabled: { position: "relative", display: "flex", alignItems: "center", backgroundColor: "#110F0E", borderRadius: "8px", border: "1px solid #2A2420" },
  inputIcon: { position: "absolute", left: "14px" },
  lockIcon: { position: "absolute", right: "14px" },
  input: { width: "100%", padding: "14px 14px 14px 44px", backgroundColor: "#110F0E", border: "1px solid #3A322C", borderRadius: "8px", color: "#EAE0C8", fontSize: "14px", outline: "none", transition: "border-color 0.2s" },
  inputDisabled: { width: "100%", padding: "14px 44px", backgroundColor: "transparent", border: "none", color: "#786C63", fontSize: "14px", cursor: "not-allowed" },
  btnSalvar: { padding: "14px", backgroundColor: "#D4AF37", color: "#151312", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer", marginTop: "8px", width: "fit-content" },
  
  planInfo: { marginBottom: "24px", backgroundColor: "#1A1715", padding: "20px", borderRadius: "8px", border: "1px solid #2A2420" },
  planTagBase: { display: "inline-block", backgroundColor: "#2A2420", color: "#A89C92", padding: "4px 12px", borderRadius: "4px", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", marginBottom: "12px" },
  planName: { color: "#FDFBF7", fontSize: "20px", fontFamily: "'Playfair Display', serif", marginBottom: "8px" },
  planDesc: { color: "#A89C92", fontSize: "13px", lineHeight: "1.6" },
  btnUpgrade: { width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px", backgroundColor: "transparent", color: "#D4AF37", border: "1px solid #D4AF37", borderRadius: "8px", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", cursor: "pointer", transition: "all 0.2s" },
  btnOutline: { width: "100%", padding: "14px", backgroundColor: "transparent", border: "1px solid #3A322C", color: "#EAE0C8", borderRadius: "8px", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", cursor: "pointer" }
};