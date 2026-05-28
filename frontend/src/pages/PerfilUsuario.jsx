import React, { useState, useRef } from "react";
import { User, Mail, Calendar, Shield, Lock, Camera, Check } from "lucide-react";
import api from "../services/api"; // Importando a instância do Axios configurada

export default function PerfilUsuario() {
  // Puxa os dados reais de quem fez login
  const nomeUsuario = localStorage.getItem('user_name') || 'Usuário';
  const emailUsuario = localStorage.getItem('user_email') || 'email@exemplo.com'; 
  const fotoAtual = localStorage.getItem('user_foto'); 
  
  const [dataNascimento, setDataNascimento] = useState("");
  
  // Estados para a foto de perfil
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(fotoAtual || null);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const fileInputRef = useRef(null);

  // Função que lida com a escolha do arquivo
  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoFile(file);
      // Cria uma URL temporária para mostrar o preview imediatamente na tela
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSucesso(false);

    // O FormData é obrigatório quando enviamos arquivos (imagens) pro backend
    const formData = new FormData();
    if (dataNascimento) formData.append('data_nascimento', dataNascimento);
    if (fotoFile) formData.append('foto_perfil', fotoFile);

    try {
      // Ajuste a rota '/users/me/' de acordo com a sua API no Django
      const response = await api.patch('/users/me/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Se retornou a nova URL da foto, atualiza no localStorage
      if (response.data.foto_perfil) {
        localStorage.setItem('user_foto', response.data.foto_perfil);
      }
      
      setSucesso(true);
      setTimeout(() => setSucesso(false), 3000); // Esconde a mensagem de sucesso após 3s
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      alert("Houve um erro ao atualizar o perfil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Minha Conta</h2>
        <p style={styles.subtitle}>Gerencie suas informações pessoais, foto e configurações de acesso.</p>
      </div>

      <div style={styles.grid}>
        {/* COLUNA ESQUERDA: DADOS PESSOAIS */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Dados Pessoais</h3>
          
          <form onSubmit={handleSalvar} style={styles.form}>
            
            {/* COMPONENTE DE FOTO DE PERFIL */}
            <div style={styles.avatarContainer}>
              <div 
                style={styles.avatarWrapper} 
                onClick={() => fileInputRef.current.click()}
              >
                {fotoPreview ? (
                  <img src={fotoPreview} alt="Sua foto de perfil" style={styles.avatarImage} />
                ) : (
                  <div style={styles.avatarPlaceholder}>
                    <User size={40} color="#786C63" />
                  </div>
                )}
                
                {/* Overlay Escuro com Ícone de Câmera */}
                <div style={styles.avatarOverlay}>
                  <Camera size={24} color="#FDFBF7" />
                </div>
              </div>
              <div style={styles.avatarText}>
                <h4 style={styles.avatarTitle}>Sua Foto de Perfil</h4>
                <p style={styles.avatarSubtitle}>Clique na imagem para alterar. Use formatos JPG ou PNG.</p>
              </div>
              
              {/* Input oculto que o React aciona pelo useRef */}
              <input 
                type="file" 
                accept="image/png, image/jpeg" 
                ref={fileInputRef} 
                onChange={handleFotoChange}
                style={{ display: 'none' }} 
              />
            </div>
            
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

            <div style={styles.actionRow}>
              <button type="submit" style={styles.btnSalvar} disabled={loading}>
                {loading ? "Salvando..." : "Salvar Alterações"}
              </button>
              
              {sucesso && (
                <span style={styles.sucessoText}>
                  <Check size={14} /> Perfil atualizado!
                </span>
              )}
            </div>
          </form>
        </div>

        {/* COLUNA DIREITA: PLANOS E SEGURANÇA */}
        <div style={styles.columnRight}>
          
          {/* PLANO ATUAL */}
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
  
  // ESTILOS NOVOS DO AVATAR
  avatarContainer: { display: "flex", alignItems: "center", gap: "20px", paddingBottom: "20px", borderBottom: "1px solid #2A2420" },
  avatarWrapper: { position: "relative", width: "80px", height: "80px", borderRadius: "50%", cursor: "pointer", overflow: "hidden", border: "2px solid #3A322C", backgroundColor: "#110F0E" },
  avatarImage: { width: "100%", height: "100%", objectFit: "cover" },
  avatarPlaceholder: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" },
  avatarOverlay: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(21, 19, 18, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s", '&:hover': { opacity: 1 } },
  avatarText: { display: "flex", flexDirection: "column", gap: "4px" },
  avatarTitle: { color: "#FDFBF7", fontSize: "14px", fontWeight: "600" },
  avatarSubtitle: { color: "#786C63", fontSize: "12px" },

  inputGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { color: "#A89C92", fontSize: "12px", fontWeight: "500" },
  inputWrapper: { position: "relative", display: "flex", alignItems: "center" },
  inputWrapperDisabled: { position: "relative", display: "flex", alignItems: "center", backgroundColor: "#110F0E", borderRadius: "8px", border: "1px solid #2A2420" },
  inputIcon: { position: "absolute", left: "14px" },
  lockIcon: { position: "absolute", right: "14px" },
  input: { width: "100%", padding: "14px 14px 14px 44px", backgroundColor: "#110F0E", border: "1px solid #3A322C", borderRadius: "8px", color: "#EAE0C8", fontSize: "14px", outline: "none", transition: "border-color 0.2s" },
  inputDisabled: { width: "100%", padding: "14px 44px", backgroundColor: "transparent", border: "none", color: "#786C63", fontSize: "14px", cursor: "not-allowed" },
  
  actionRow: { display: "flex", alignItems: "center", gap: "16px", marginTop: "8px" },
  btnSalvar: { padding: "14px 24px", backgroundColor: "#D4AF37", color: "#151312", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer", transition: "opacity 0.2s" },
  sucessoText: { display: "flex", alignItems: "center", gap: "4px", color: "#4CAF50", fontSize: "13px", fontWeight: "600" },
  
  planInfo: { marginBottom: "24px", backgroundColor: "#1A1715", padding: "20px", borderRadius: "8px", border: "1px solid #2A2420" },
  planTagBase: { display: "inline-block", backgroundColor: "#2A2420", color: "#A89C92", padding: "4px 12px", borderRadius: "4px", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", marginBottom: "12px" },
  planName: { color: "#FDFBF7", fontSize: "20px", fontFamily: "'Playfair Display', serif", marginBottom: "8px" },
  planDesc: { color: "#A89C92", fontSize: "13px", lineHeight: "1.6" },
  btnUpgrade: { width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px", backgroundColor: "transparent", color: "#D4AF37", border: "1px solid #D4AF37", borderRadius: "8px", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", cursor: "pointer", transition: "all 0.2s" },
  btnOutline: { width: "100%", padding: "14px", backgroundColor: "transparent", border: "1px solid #3A322C", color: "#EAE0C8", borderRadius: "8px", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", cursor: "pointer" }
};