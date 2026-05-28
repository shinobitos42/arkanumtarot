import React, { useState } from "react";
import { ChevronLeft, Star, Calendar, Clock, Award, MessageSquare, ShieldCheck, Check } from "lucide-react";

export default function PerfilTarologo({ tarologo, onVoltar }) {
  const [dataSelecionada, setDataSelecionada] = useState("");
  const [horaSelecionada, setHoraSelecionada] = useState("");
  const [agendadoComSucesso, setAgendadoComSucesso] = useState(false);

  // Mock de datas e horários disponíveis
  const datasDisponiveis = ["26/05", "27/05", "28/05", "29/05"];
  const horariosDisponiveis = ["09:00", "11:00", "14:00", "16:00", "19:00", "21:00"];

  const handleAgendar = (e) => {
    e.preventDefault();
    if (!dataSelecionada || !horaSelecionada) return;
    
    setAgendadoComSucesso(true);
    console.log("Agendamento realizado:", { dataSelecionada, horaSelecionada, tarologo: tarologo.nome });
  };

  if (agendadoComSucesso) {
    return (
      <div style={styles.successCard}>
        <div style={styles.successIconWrapper}>
          <Check size={32} color="#151312" />
        </div>
        <h2 style={styles.successTitle}>Tiragem Agendada!</h2>
        <p style={styles.successText}>
          Sua sessão com <strong>{tarologo.nome}</strong> foi reservada para o dia <strong>{dataSelecionada}</strong> às <strong>{horaSelecionada}</strong>.
        </p>
        <button onClick={onVoltar} style={styles.btnPrimary}>Voltar ao Espaço</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Botão Voltar */}
      <button onClick={onVoltar} style={styles.btnVoltar}>
        <ChevronLeft size={16} /> Voltar para a lista
      </button>

      <div style={styles.profileLayout}>
        {/* COLUNA DA ESQUERDA: INFORMAÇÕES DO GUIA */}
        <div style={styles.colEsquerda}>
          
          {/* Header do Perfil */}
          <div style={styles.profileHeaderCard}>
            <img src={tarologo.img} alt={tarologo.nome} style={styles.profileAvatar} />
            <div style={styles.profileHeaderInfo}>
              <span style={styles.tagSpec}>{tarologo.especialidade}</span>
              <h1 style={styles.profileName}>{tarologo.nome}</h1>
              <div style={styles.ratingRow}>
                <div style={styles.ratingBadge}>
                  <Star size={12} fill="#151312" color="#151312" /> {tarologo.nota}
                </div>
                <span style={styles.sessoesCount}>{tarologo.sessoes} tiragens realizadas</span>
              </div>
            </div>
          </div>

          {/* Biografia / Sobre */}
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>
              <Award size={18} color="#D4AF37" /> Trajetória e Conexão
            </h3>
            <p style={styles.sectionText}>
              Dedico minha vida ao estudo dos oráculos ancestrais, enxergando o Tarot não como uma ferramenta de adivinhação imutável, mas como um espelho da alma e um guia para o livre-arbítrio. Com mais de 5 anos de experiência, busco trazer leituras acolhedoras, objetivas e profundas para iluminar suas tomadas de decisão.
            </p>
          </div>

          {/* Avaliações Mockadas */}
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>
              <MessageSquare size={18} color="#D4AF37" /> Relatos de Clareza
            </h3>
            <div style={styles.reviewsList}>
              <div style={styles.reviewItem}>
                <div style={styles.reviewMeta}>
                  <strong style={styles.reviewUser}>Mariana R.</strong>
                  <div style={styles.reviewStars}><Star size={10} fill="#D4AF37" color="#D4AF37" /> 5.0</div>
                </div>
                <p style={styles.reviewText}>"A leitura foi extremamente cirúrgica. Consegui enxergar caminhos profissionais que antes pareciam bloqueados. Recomendo muito a Sofia!"</p>
              </div>
              <div style={styles.reviewItem}>
                <div style={styles.reviewMeta}>
                  <strong style={styles.reviewUser}>Carlos H.</strong>
                  <div style={styles.reviewStars}><Star size={10} fill="#D4AF37" color="#D4AF37" /> 5.0</div>
                </div>
                <p style={styles.reviewText}>"Ambiente de absoluto respeito e acolhimento. Me senti muito seguro e as respostas me trouxeram muita paz interior."</p>
              </div>
            </div>
          </div>

        </div>

        {/* COLUNA DA DIREITA: AGENDAMENTO (STICKY CARD) */}
        <div style={styles.colDireita}>
          <div style={styles.agendamentoCard}>
            <h3 style={styles.agendarTitle}>Reservar Tiragem</h3>
            
            <div style={styles.priceRow}>
              <span style={styles.priceLabel}>Troca Energética</span>
              <span style={styles.priceValue}>{tarologo.valor}</span>
            </div>

            <form onSubmit={handleAgendar} style={styles.agendamentoForm}>
              {/* Seleção de Data */}
              <div style={styles.formGroup}>
                <label style={styles.inputLabel}>
                  <Calendar size={14} style={{ marginRight: '6px' }} /> Selecione o Dia
                </label>
                <div style={styles.selectorGrid}>
                  {datasDisponiveis.map((data) => (
                    <button
                      key={data}
                      type="button"
                      style={{
                        ...styles.selectorBtn,
                        ...(dataSelecionada === data ? styles.selectorBtnAtivo : {})
                      }}
                      onClick={() => setDataSelecionada(data)}
                    >
                      {data}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seleção de Horário */}
              <div style={styles.formGroup}>
                <label style={styles.inputLabel}>
                  <Clock size={14} style={{ marginRight: '6px' }} /> Horários Disponíveis (Horário de Brasília)
                </label>
                <div style={styles.selectorGridHoras}>
                  {horariosDisponiveis.map((hora) => (
                    <button
                      key={hora}
                      type="button"
                      style={{
                        ...styles.selectorBtn,
                        ...(horaSelecionada === hora ? styles.selectorBtnAtivo : {})
                      }}
                      onClick={() => setHoraSelecionada(hora)}
                    >
                      {hora}
                    </button>
                  ))}
                </div>
              </div>

              {/* Botão de Confirmação */}
              <button
                type="submit"
                disabled={!dataSelecionada || !horaSelecionada}
                style={{
                  ...styles.btnConfirmar,
                  ...(!dataSelecionada || !horaSelecionada ? styles.btnConfirmarDesativado : {})
                }}
              >
                Confirmar e Agendar
              </button>
            </form>

            <div style={styles.garantiaBox}>
              <ShieldCheck size={14} color="#786C63" />
              <span>Ambiente seguro e atendimento 100% sigiloso.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", flexDirection: "column", gap: "24px" },
  btnVoltar: { display: "flex", alignItems: "center", gap: "6px", backgroundColor: "transparent", border: "none", color: "#A89C92", fontSize: "13px", cursor: "pointer", alignSelf: "flex-start", padding: 0, transition: "color 0.2s" },
  profileLayout: { display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "32px", alignItems: "start" },
  
  // COLUNA ESQUERDA
  colEsquerda: { display: "flex", flexDirection: "column", gap: "24px" },
  profileHeaderCard: { backgroundColor: "#1A1715", border: "1px solid #2A2420", borderRadius: "12px", padding: "32px", display: "flex", gap: "24px", alignItems: "center" },
  profileAvatar: { width: "100px", height: "100px", borderRadius: "12px", objectFit: "cover", border: "1px solid #3A322C" },
  profileHeaderInfo: { display: "flex", flexDirection: "column", gap: "6px" },
  tagSpec: { color: "#D4AF37", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" },
  profileName: { fontSize: "28px", fontWeight: "normal", color: "#FDFBF7", fontFamily: "'Playfair Display', serif" },
  ratingRow: { display: "flex", alignItems: "center", gap: "12px", marginTop: "4px" },
  ratingBadge: { display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: "700", color: "#151312", backgroundColor: "#D4AF37", padding: "2px 6px", borderRadius: "4px" },
  sessoesCount: { color: "#786C63", fontSize: "13px" },

  sectionCard: { backgroundColor: "#1A1715", border: "1px solid #2A2420", borderRadius: "12px", padding: "32px" },
  sectionTitle: { display: "flex", alignItems: "center", gap: "8px", fontSize: "18px", color: "#FDFBF7", fontFamily: "'Playfair Display', serif", marginBottom: "16px", fontWeight: "normal" },
  sectionText: { color: "#A89C92", fontSize: "14px", lineHeight: "1.7", fontWeight: "300" },

  reviewsList: { display: "flex", flexDirection: "column", gap: "16px" },
  reviewItem: { borderBottom: "1px solid #2A2420", paddingBottom: "16px" },
  reviewMeta: { display: "flex", justifyContent: "space-between", marginBottom: "6px" },
  reviewUser: { color: "#EAE0C8", fontSize: "14px", fontWeight: "500" },
  reviewStars: { display: "flex", alignItems: "center", gap: "4px", color: "#D4AF37", fontSize: "11px" },
  reviewText: { color: "#786C63", fontSize: "13px", lineHeight: "1.5", fontStyle: "italic" },

  // COLUNA DIREITA (STICKY)
  colDireita: { position: "sticky", top: "24px" },
  agendamentoCard: { backgroundColor: "#1A1715", border: "1px solid #3A322C", borderRadius: "12px", padding: "32px" },
  agendarTitle: { color: "#FDFBF7", fontFamily: "'Playfair Display', serif", fontSize: "20px", marginBottom: "20px", fontWeight: "normal" },
  priceRow: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "20px", borderBottom: "1px solid #2A2420", marginBottom: "24px" },
  priceLabel: { color: "#A89C92", fontSize: "14px" },
  priceValue: { color: "#D4AF37", fontSize: "22px", fontFamily: "'Playfair Display', serif" },
  agendamentoForm: { display: "flex", flexDirection: "column", gap: "24px" },
  formGroup: { display: "flex", flexDirection: "column", gap: "12px" },
  inputLabel: { display: "flex", alignItems: "center", color: "#A89C92", fontSize: "13px" },
  
  selectorGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" },
  selectorGridHoras: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" },
  selectorBtn: { padding: "10px 0", backgroundColor: "#151312", border: "1px solid #2A2420", borderRadius: "6px", color: "#A89C92", fontSize: "13px", cursor: "pointer", transition: "all 0.2s", fontFamily: "'Inter', sans-serif" },
  selectorBtnAtivo: { backgroundColor: "transparent", borderColor: "#D4AF37", color: "#D4AF37", fontWeight: "600" },
  
  btnConfirmar: { width: "100%", padding: "16px", backgroundColor: "#D4AF37", color: "#151312", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", cursor: "pointer", transition: "opacity 0.2s", marginTop: "8px" },
  btnConfirmarDesativado: { backgroundColor: "#2A2420", color: "#786C63", cursor: "not-allowed" },
  garantiaBox: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#786C63", fontSize: "11px", marginTop: "20px" },

  // SUCESSO
  successCard: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 32px", backgroundColor: "#1A1715", border: "1px solid #2A2420", borderRadius: "12px", textAlign: "center", maxWidth: "500px", margin: "40px auto" },
  successIconWrapper: { width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "#D4AF37", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" },
  successTitle: { fontSize: "24px", color: "#FDFBF7", fontFamily: "'Playfair Display', serif", marginBottom: "12px", fontWeight: "normal" },
  successText: { color: "#A89C92", fontSize: "14px", lineHeight: "1.6", marginBottom: "28px" },
  btnPrimary: { padding: "14px 28px", backgroundColor: "#D4AF37", color: "#151312", border: "none", borderRadius: "4px", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", cursor: "pointer" }
};