import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Star, Crown, Shield, Zap, Sparkles, Loader2, ArrowLeft } from "lucide-react";
import api from "../services/api";

export default function Planos() {
  const navigate = useNavigate();
  const [role, setRole] = useState(localStorage.getItem("user_role") || "CONSULENTE");
  const [processando, setProcessando] = useState(null);

  // Define os planos baseados no tipo de usuário
  const planosConsulente = [
    {
      id: "GRATIS",
      nome: "Poeira Estelar",
      preco: "Grátis",
      icone: <Star size={24} color="#A89C92" />,
      destaque: false,
      beneficios: [
        "Sessões por R$ 35,00 + taxa",
        "Chat completo (Texto, Áudio e Imagem)",
        "Histórico expira em 30 dias",
      ],
      botao: "Plano Atual",
      disabled: true
    },
    {
      id: "ESSENCIAL_CONSULENTE",
      nome: "Jornada Essencial",
      preco: "R$ 19,90",
      mes: "/mês",
      icone: <Shield size={24} color="#D4AF37" />,
      destaque: false,
      beneficios: [
        "10% de desconto nas consultas",
        "Histórico Vitalício das sessões",
        "Radar de Guias (Notificações)",
        "Resumo IA Simples pós-consulta",
      ],
      botao: "Assinar Essencial",
      disabled: false
    },
    {
      id: "CIRCULO_ARCANO_CONSULENTE",
      nome: "Círculo Arcano",
      preco: "R$ 39,90",
      mes: "/mês",
      icone: <Crown size={24} color="#110F0E" />,
      destaque: true,
      beneficios: [
        "20% de desconto nas consultas",
        "Fura-Fila Absoluto",
        "Dossiê Akáshico Completo (IA)",
        "Modo Anônimo e Sigiloso",
        "Gestão de Vínculos (Sinastria)"
      ],
      botao: "Entrar para o Círculo",
      disabled: false
    }
  ];

  const planosTarologo = [
    {
      id: "GRATIS",
      nome: "Iniciado",
      preco: "Grátis",
      icone: <Star size={24} color="#A89C92" />,
      destaque: false,
      beneficios: [
        "Taxa de 18% (Recebe R$ 28,70)",
        "Visibilidade padrão na vitrine",
        "Chat e envio de mídias",
        "Saque padrão"
      ],
      botao: "Plano Atual",
      disabled: true
    },
    {
      id: "PRO_TAROLOGO",
      nome: "Guia PRO",
      preco: "R$ 39,90",
      mes: "/mês",
      icone: <Zap size={24} color="#D4AF37" />,
      destaque: false,
      beneficios: [
        "Taxa cai para 9% (Recebe R$ 31,85)",
        "Selo de Guia Verificado",
        "Criação de Cupons de Desconto",
        "Dashboard Financeiro Avançado"
      ],
      botao: "Ser Guia PRO",
      disabled: false
    },
    {
      id: "MESTRE_TAROLOGO",
      nome: "Mestre Arcano",
      preco: "R$ 69,90",
      mes: "/mês",
      icone: <Sparkles size={24} color="#110F0E" />,
      destaque: true,
      beneficios: [
        "TAXA ZERO (Recebe 100%)",
        "Destaque Ouro no topo das buscas",
        "Broadcast Sagrado (Mensagem em massa)",
        "Saque Instantâneo a qualquer hora",
        "Vídeo de Apresentação no Perfil"
      ],
      botao: "Tornar-se Mestre",
      disabled: false
    }
  ];

  const planosParaExibir = role === "TAROLOGO" ? planosTarologo : planosConsulente;

  const handleAssinar = async (planoId) => {
    setProcessando(planoId);
    try {
      const response = await api.post("users/planos/checkout/", { plano: planoId });
      if (response.data.checkout_url) {
        // Redireciona para o Mercado Pago
        window.location.href = response.data.checkout_url;
      }
    } catch (error) {
      console.error("Erro ao gerar checkout:", error);
      alert("Houve um erro ao processar seu pagamento. Tente novamente.");
      setProcessando(null);
    }
  };

  return (
    <div style={styles.container}>
      <button style={styles.btnVoltar} onClick={() => navigate(-1)}>
        <ArrowLeft size={20} /> Voltar
      </button>

      <div style={styles.header}>
        <h1 style={styles.title}>
          {role === "TAROLOGO" ? "Evolua sua Jornada Profissional" : "Aprofunde seu Autoconhecimento"}
        </h1>
        <p style={styles.subtitle}>
          Escolha o plano ideal para as suas necessidades e tenha acesso a ferramentas exclusivas do Arkanum.
        </p>
      </div>

      <div style={styles.gridPlanos}>
        {planosParaExibir.map((plano) => (
          <div 
            key={plano.id} 
            style={{ 
              ...styles.cardPlano, 
              ...(plano.destaque ? styles.cardDestaque : {}) 
            }}
          >
            {plano.destaque && (
              <div style={styles.tagRecomendado}>Recomendado</div>
            )}
            
            <div style={{...styles.iconWrapper, backgroundColor: plano.destaque ? "#D4AF37" : "#1A1715"}}>
              {plano.icone}
            </div>
            
            <h3 style={{...styles.planoNome, color: plano.destaque ? "#D4AF37" : "#FDFBF7"}}>
              {plano.nome}
            </h3>
            
            <div style={styles.precoContainer}>
              <span style={{...styles.planoPreco, color: plano.destaque ? "#FDFBF7" : "#EAE0C8"}}>
                {plano.preco}
              </span>
              {plano.mes && <span style={styles.planoMes}>{plano.mes}</span>}
            </div>

            <ul style={styles.listaBeneficios}>
              {plano.beneficios.map((beneficio, index) => (
                <li key={index} style={styles.beneficioItem}>
                  <Check size={18} color={plano.destaque ? "#D4AF37" : "#786C63"} style={{ flexShrink: 0 }} />
                  <span style={styles.beneficioTexto}>{beneficio}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={() => handleAssinar(plano.id)}
              disabled={plano.disabled || processando !== null}
              style={{
                ...styles.btnAssinar,
                backgroundColor: plano.disabled ? "#1A1715" : (plano.destaque ? "#D4AF37" : "#2A2420"),
                color: plano.disabled ? "#786C63" : (plano.destaque ? "#110F0E" : "#FDFBF7"),
                cursor: (plano.disabled || processando !== null) ? "not-allowed" : "pointer"
              }}
            >
              {processando === plano.id ? (
                <span style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                  <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Processando...
                </span>
              ) : (
                plano.botao
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ESTILOS
const styles = {
  container: { minHeight: "100vh", backgroundColor: "#110F0E", padding: "60px 20px", fontFamily: "'Inter', sans-serif", position: "relative" },
  btnVoltar: { position: "absolute", top: "40px", left: "40px", display: "flex", alignItems: "center", gap: "8px", backgroundColor: "transparent", border: "none", color: "#A89C92", fontSize: "14px", cursor: "pointer", transition: "color 0.2s" },
  header: { textAlign: "center", maxWidth: "600px", margin: "0 auto 60px" },
  title: { fontSize: "36px", color: "#FDFBF7", fontFamily: "'Playfair Display', serif", marginBottom: "16px", fontStyle: "italic" },
  subtitle: { fontSize: "16px", color: "#A89C92", lineHeight: "1.6" },
  gridPlanos: { display: "flex", gap: "30px", justifyContent: "center", flexWrap: "wrap", maxWidth: "1200px", margin: "0 auto" },
  
  cardPlano: { width: "100%", maxWidth: "340px", backgroundColor: "#151312", border: "1px solid #2A2420", borderRadius: "20px", padding: "40px 30px", display: "flex", flexDirection: "column", position: "relative", transition: "transform 0.3s" },
  cardDestaque: { border: "2px solid #D4AF37", transform: "scale(1.05)", boxShadow: "0 20px 40px rgba(212, 175, 55, 0.1)", zIndex: 10, backgroundColor: "#151312" },
  tagRecomendado: { position: "absolute", top: "-14px", left: "50%", transform: "translateX(-50%)", backgroundColor: "#D4AF37", color: "#110F0E", padding: "6px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" },
  
  iconWrapper: { width: "56px", height: "56px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" },
  planoNome: { fontSize: "20px", fontWeight: "600", marginBottom: "16px", fontFamily: "'Playfair Display', serif" },
  precoContainer: { display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "32px", paddingBottom: "32px", borderBottom: "1px solid #2A2420" },
  planoPreco: { fontSize: "36px", fontWeight: "700", letterSpacing: "-1px" },
  planoMes: { color: "#786C63", fontSize: "16px", fontWeight: "500" },
  
  listaBeneficios: { listStyle: "none", padding: 0, margin: "0 0 40px 0", flex: 1, display: "flex", flexDirection: "column", gap: "16px" },
  beneficioItem: { display: "flex", alignItems: "flex-start", gap: "12px" },
  beneficioTexto: { color: "#EAE0C8", fontSize: "14px", lineHeight: "1.5" },
  
  btnAssinar: { width: "100%", padding: "16px", borderRadius: "12px", border: "none", fontSize: "15px", fontWeight: "600", letterSpacing: "0.5px", transition: "all 0.2s" }
};