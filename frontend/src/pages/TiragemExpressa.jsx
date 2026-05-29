import React, { useState } from "react";
import { Zap, Upload, Image as ImageIcon, CheckCircle, Loader2, X, HeartPulse, Sparkles, ChevronDown } from "lucide-react";
import api from "../services/api";
import ModalPagamento from "./ModalPagamento"; 

export default function TiragemExpressa() {
  const [pergunta, setPergunta] = useState("");
  const [contexto, setContexto] = useState("");
  const [imagem, setImagem] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [energia, setEnergia] = useState("");
  const [status, setStatus] = useState("idle"); 

  // CONFIGURAÇÃO DOS NOVOS TIPOS DE LEITURA INTEGRADOS
  const [tipoTiragem, setTipoTiragem] = useState("DETALHADA");
  const [valorTiragem, setValorTiragem] = useState(35.00);

  // ESTADOS DO PAGAMENTO
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dadosPagamento, setDadosPagamento] = useState(null);

  // Mapeia a mudança de valor dinamicamente ao selecionar o tipo de leitura
  const handleTipoLeituraChange = (tipo) => {
    setTipoTiragem(tipo);
    if (tipo === "OBJETIVA") setValorTiragem(20.00);
    else if (tipo === "DETALHADA") setValorTiragem(35.00);
    else if (tipo === "AMOROSA") setValorTiragem(50.00);
    else if (tipo === "COMPLETA") setValorTiragem(70.00);
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagem(file);
      setPreviewUrl(URL.createObjectURL(file)); 
    }
  };

  const removerImagem = () => {
    setImagem(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!energia) {
      alert("Por favor, indique como você está se sentindo no momento para ajudar na leitura.");
      return;
    }

    setStatus("submitting");

    const formData = new FormData();
    formData.append("tipo", tipoTiragem); // Envia o tipo dinâmico escolhido
    formData.append("status_sessao", "aguardando_guia");
    formData.append("pergunta_principal", pergunta);
    formData.append("contexto", `[Energia do Consulente: ${energia}]\n\n${contexto}`);
    formData.append("valor_cobrado", valorTiragem); // Envia o valor correto para a validação do backend
    
    if (imagem) {
      formData.append("imagem_anexa", imagem);
    }

  	try {
      // 1. Cria a sessão no banco de dados
      const sessaoResponse = await api.post('tiragens/sessoes/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // 2. Dispara a cobrança na nossa nova rota de pagamentos transparente
      const pagamentoResponse = await api.post('users/planos/pagar-brick/', {
        sessao_id: sessaoResponse.data.id,
        plano: tipoTiragem // O backend mapeará o fluxo de recebimento
      });

      setDadosPagamento(pagamentoResponse.data);
      setIsModalOpen(true);
      setStatus("idle"); 

    } catch (error) {
      console.error("Erro ao processar tiragem ou pagamento:", error);
      alert("Houve um erro ao enviar sua solicitação. Tente novamente.");
      setStatus("idle");
    }
  };

  const handleFecharModal = () => {
    setIsModalOpen(false);
    setStatus("success");
  };

  if (status === "success") {
    return (
      <div style={styles.successContainer}>
        <CheckCircle size={64} color="#D4AF37" style={{ marginBottom: "24px" }} />
        <h2 style={styles.successTitle}>Sua solicitação foi enviada aos Guias.</h2>
        <p style={styles.successText}>
          O Círculo foi notificado. Assim que o pagamento for confirmado e um oraculista aceitar sua tiragem expressa, 
          você receberá um aviso e a leitura será iniciada.
        </p>
        <button 
          onClick={() => {
            setStatus("idle");
            setPergunta("");
            setContexto("");
            setEnergia("");
            removerImagem();
          }} 
          style={styles.btnOutline}
        >
          Voltar para a Visão Geral
        </button>
      </div>
    );
  }

  const opcoesEnergia = [
    { id: "ansioso", label: "Ansioso(a)", emoji: "🌪️" },
    { id: "confuso", label: "Confuso(a)", emoji: "🌫️" },
    { id: "esperancoso", label: "Esperançoso(a)", emoji: "✨" },
    { id: "buscando_paz", label: "Buscando Paz", emoji: "🌿" }
  ];

  return (
    <div className="grid-mobile" style={styles.expressaContainer}>
      
      <ModalPagamento 
        isOpen={isModalOpen} 
        onClose={handleFecharModal} 
        dadosPagamento={dadosPagamento} 
      />

      <div style={styles.expressaHeader}>
        <div style={styles.expressaIconWrapper}>
          <Zap size={40} color="#D4AF37" />
        </div>
        <h1 className="page-title" style={styles.pageTitle}>Tiragem Expressa</h1>
        <p style={styles.pageSubtitle}>
          Precisa de clareza imediata? Seu pedido será enviado para o Círculo de Guias e o primeiro oraculista disponível iniciará a sua leitura de forma prioritária.
        </p>
      </div>

      <div style={styles.expressaCard}>
        <form onSubmit={handleSubmit} style={styles.expressaOptions}>
          
          <h3 style={styles.sectionTitle}>Ajustar Formato da Consulta</h3>
          
          {/* SELETOR DINÂMICO DE TIPO DE LEITURA */}
          <div style={styles.formGroup}>
            <label style={styles.expressaLabel}><Sparkles size={14} style={{display: 'inline', marginRight: '6px'}}/> Profundidade da Resposta</label>
            <div style={styles.selectWrapper}>
              <select 
                value={tipoTiragem} 
                onChange={(e) => handleTipoLeituraChange(e.target.value)} 
                style={styles.customSelect}
                disabled={status === "submitting"}
              >
                <option value="OBJETIVA">Tiragem Objetiva (Sim ou Não / Direta) - R$ 20,00</option>
                <option value="DETALHADA">Tiragem Detalhada (Análise de Cenário) - R$ 35,00</option>
                <option value="AMOROSA">Tiragem Conexão Amorosa (Sinastria de Almas) - R$ 50,00</option>
                <option value="COMPLETA">Tiragem Mandala Completa (Geral/Futuro) - R$ 70,00</option>
              </select>
              <ChevronDown size={14} color="#A89C92" style={styles.selectIcon} />
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #2A2420', margin: '8px 0' }} />

          <h3 style={styles.sectionTitle}>Detalhes da sua Questão</h3>
          
          <div style={styles.formGroup}>
            <label style={styles.expressaLabel}>Qual é a sua principal dúvida ou pergunta objetiva?</label>
            <input 
              type="text"
              placeholder="Ex: Devo aceitar a nova proposta de parceria profissional?" 
              style={styles.expressaInput}
              value={pergunta}
              onChange={(e) => setPergunta(e.target.value)}
              required
              disabled={status === "submitting"}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.expressaLabel}>Contexto da situação (Forneça detalhes para guiar a interpretação)</label>
            <textarea 
              placeholder="Ex: Estou dividindo minhas atenções entre dois projetos. Sinto que um deles tem mais propósito..." 
              style={styles.expressaTextarea}
              value={contexto}
              onChange={(e) => setContexto(e.target.value)}
              required
              disabled={status === "submitting"}
            ></textarea>
          </div>

          <div style={styles.formGroup}>
            <label style={{...styles.expressaLabel, display: 'flex', alignItems: 'center', gap: '6px'}}>
              <HeartPulse size={14} color="#D4AF37" />
              Como você está se sentindo em relação a isso?
            </label>
            <div className="grid-mobile" style={styles.energiaGrid}>
              {opcoesEnergia.map((op) => (
                <div 
                  key={op.id}
                  onClick={() => status !== "submitting" && setEnergia(op.label)}
                  style={{
                    ...styles.energiaCard,
                    borderColor: energia === op.label ? "#D4AF37" : "#3A322C",
                    backgroundColor: energia === op.label ? "rgba(212, 175, 55, 0.1)" : "transparent",
                    opacity: status === "submitting" ? 0.5 : 1
                  }}
                >
                  <span style={{ fontSize: "16px" }}>{op.emoji}</span>
                  <span style={{ color: energia === op.label ? "#D4AF37" : "#A89C92", fontSize: "13px", fontWeight: "500" }}>
                    {op.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.expressaLabel}>Anexar Imagem (Opcional)</label>
            
            {previewUrl ? (
              <div style={styles.imagePreviewBox}>
                <img src={previewUrl} alt="Preview" style={styles.previewImg} />
                <div style={styles.previewInfo}>
                  <span style={styles.previewName}>{imagem.name}</span>
                  <button type="button" onClick={removerImagem} style={styles.btnRemoveImg}>
                    <X size={16} /> Remover
                  </button>
                </div>
              </div>
            ) : (
              <label style={{...styles.uploadBox, opacity: status === "submitting" ? 0.5 : 1}}>
                <input 
                  type="file" 
                  accept="image/*" 
                  style={{ display: "none" }} 
                  onChange={handleImageChange}
                  disabled={status === "submitting"}
                />
                <Upload size={18} color="#786C63" style={{ marginRight: '10px' }} />
                <span style={{ color: '#A89C92', fontSize: '14px' }}>
                  Escolha um arquivo de imagem...
                </span>
                <ImageIcon size={18} color="#D4AF37" style={{ marginLeft: 'auto' }} />
              </label>
            )}
          </div>

          <div style={styles.expressaPriceBox}>
            <div>
              <p style={styles.priceLabel}>Troca Energética Fixa</p>
              <p style={styles.priceValue}>R$ {valorTiragem.toFixed(2).replace('.', ',')}</p>
            </div>
            
            <button 
              type="submit" 
              style={{
                ...styles.btnExpressaSubmit, 
                opacity: status === "submitting" ? 0.7 : 1,
                cursor: status === "submitting" ? "not-allowed" : "pointer"
              }}
              disabled={status === "submitting"}
            >
              {status === "submitting" ? (
                <>
                  <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> 
                  Conectando Círculo...
                </>
              ) : (
                <>
                  <Zap size={16} fill="#151312" /> Solicitar Guia Agora
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  expressaContainer: { display: "flex", flexDirection: "column", alignItems: "center", padding: "0 0 40px 0" },
  expressaHeader: { display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "32px", textAlign: "center" },
  expressaIconWrapper: { width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "rgba(212, 175, 55, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" },
  pageTitle: { fontSize: "32px", fontWeight: "normal", color: "#FDFBF7", marginBottom: "12px", fontFamily: "'Playfair Display', serif", fontStyle: "italic" },
  pageSubtitle: { color: "#A89C92", fontSize: "15px", maxWidth: "600px", lineHeight: "1.6", fontWeight: "300" },
  expressaCard: { backgroundColor: "#1A1715", border: "1px solid #2A2420", borderRadius: "12px", width: "100%", maxWidth: "600px", padding: "32px", boxSizing: "border-box" },
  expressaOptions: { display: "flex", flexDirection: "column", gap: "24px" },
  sectionTitle: { color: "#FDFBF7", fontSize: "18px", fontFamily: "'Playfair Display', serif", marginBottom: "4px" },
  formGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  expressaLabel: { color: "#A89C92", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" },
  expressaInput: { width: "100%", padding: "14px", backgroundColor: "#110F0E", border: "1px solid #3A322C", borderRadius: "6px", color: "#EAE0C8", fontSize: "14px", fontFamily: "'Inter', sans-serif", outline: "none", boxSizing: "border-box" },
  expressaTextarea: { width: "100%", height: "120px", backgroundColor: "#110F0E", border: "1px solid #3A322C", borderRadius: "6px", padding: "16px", color: "#EAE0C8", fontSize: "14px", fontFamily: "'Inter', sans-serif", outline: "none", resize: "none", boxSizing: "border-box" },
  
  selectWrapper: { position: "relative", display: "flex", alignItems: "center" },
  customSelect: { width: "100%", padding: "14px 36px 14px 16px", backgroundColor: "#110F0E", border: "1px solid #3A322C", color: "#EAE0C8", borderRadius: "6px", fontSize: "14px", fontFamily: "'Inter', sans-serif", outline: "none", appearance: "none", cursor: "pointer" },
  selectIcon: { position: "absolute", right: "14px", pointerEvents: "none" },

  energiaGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
  energiaCard: { display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", border: "1px solid", borderRadius: "6px", cursor: "pointer", transition: "all 0.2s" },

  uploadBox: { display: "flex", alignItems: "center", width: "100%", padding: "14px", backgroundColor: "#110F0E", border: "1px dashed #3A322C", borderRadius: "6px", cursor: "pointer", boxSizing: "border-box", transition: "all 0.2s" },
  imagePreviewBox: { display: "flex", alignItems: "center", gap: "16px", padding: "12px", backgroundColor: "#110F0E", border: "1px solid #3A322C", borderRadius: "6px" },
  previewImg: { width: "60px", height: "60px", objectFit: "cover", borderRadius: "4px", border: "1px solid #2A2420" },
  previewInfo: { display: "flex", flexDirection: "column", gap: "8px", flex: 1 },
  previewName: { color: "#EAE0C8", fontSize: "13px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "200px" },
  btnRemoveImg: { alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", color: "#ef4444", fontSize: "12px", cursor: "pointer", padding: 0 },

  expressaPriceBox: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", backgroundColor: "#151312", borderRadius: "8px", border: "1px solid #2A2420", marginTop: "8px" },
  priceLabel: { color: "#786C63", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" },
  priceValue: { color: "#EAE0C8", fontSize: "24px", fontFamily: "'Playfair Display', serif", margin: 0 },
  btnExpressaSubmit: { display: "flex", alignItems: "center", gap: "8px", padding: "14px 24px", backgroundColor: "#D4AF37", color: "#151312", border: "none", borderRadius: "4px", fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", transition: "all 0.2s" },
  
  successContainer: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px", textAlign: "center", backgroundColor: "#1A1715", border: "1px solid #2A2420", borderRadius: "12px", maxWidth: "600px", margin: "0 auto" },
  successTitle: { fontSize: "24px", fontWeight: "normal", color: "#FDFBF7", marginBottom: "16px", fontFamily: "'Playfair Display', serif" },
  successText: { color: "#A89C92", fontSize: "15px", lineHeight: "1.6", maxWidth: "400px", marginBottom: "32px" },
  btnOutline: { padding: "12px 24px", backgroundColor: "transparent", border: "1px solid #D4AF37", color: "#D4AF37", borderRadius: "4px", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", cursor: "pointer" }
};