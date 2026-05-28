import React, { useState, useEffect } from "react";
import { Calendar, Clock, MessageCircle, FileText, MoreVertical, Loader2, XCircle, User } from "lucide-react";
import api from "../services/api";

// RECEBENDO O 'mudarAba' AQUI
export default function TiragensAgendadas({ mudarAba }) {
  const [filtro, setFiltro] = useState("proximas");
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buscarAgendamentos = async () => {
      try {
        const response = await api.get('tiragens/sessoes/');
        setAgendamentos(response.data);
      } catch (error) {
        console.error("Erro ao buscar agendamentos:", error);
      } finally {
        setLoading(false);
      }
    };
    buscarAgendamentos();
  }, []);

  const agendamentosFiltrados = agendamentos.filter(ag => {
    if (filtro === "proximas") {
      return ["ao_vivo", "aguardando_guia", "agendada"].includes(ag.status_sessao);
    } else {
      return ag.status_sessao === "finalizada";
    }
  });

  const renderAvatar = (imgUrl, nome) => {
    if (imgUrl) return <img src={imgUrl} alt="Avatar" style={{...styles.avatarGuia, opacity: 1}} />;
    return (
      <div style={{...styles.fallbackAvatar, opacity: 1}}>
        {nome ? nome.charAt(0).toUpperCase() : <User size={20} color="#151312" />}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerSection}>
        <h1 style={styles.pageTitle}>Suas Conexões</h1>
        <p style={styles.pageSubtitle}>Acompanhe o status das suas tiragens, entre nos chats ativos e revise sessões passadas.</p>
      </div>

      <div style={styles.tabsContainer}>
        <button 
          style={filtro === "proximas" ? styles.tabAtiva : styles.tabInativa}
          onClick={() => setFiltro("proximas")}
        >
          Sessões Ativas & Agendadas
        </button>
        <button 
          style={filtro === "concluidas" ? styles.tabAtiva : styles.tabInativa}
          onClick={() => setFiltro("concluidas")}
        >
          Histórico de Encontros
        </button>
      </div>

      <div style={styles.listContainer}>
        {loading ? (
          <div style={styles.emptyState}>
            <Loader2 size={32} color="#D4AF37" style={{ animation: "spin 1s linear infinite" }} />
            <p style={{ color: "#A89C92", marginTop: "16px" }}>Buscando conexões...</p>
          </div>
        ) : agendamentosFiltrados.length === 0 ? (
          <div style={styles.emptyState}>
            <Calendar size={40} color="#3A322C" style={{ marginBottom: "16px" }} />
            <h3 style={{ color: "#FDFBF7", fontFamily: "'Playfair Display', serif", fontSize: "20px" }}>Nenhuma tiragem por aqui</h3>
            <p style={{ color: "#A89C92", fontSize: "14px", marginTop: "8px" }}>Você não possui sessões {filtro === "proximas" ? "futuras" : "passadas"}.</p>
          </div>
        ) : (
          agendamentosFiltrados.map((agendamento) => {
            const nomeExibicao = agendamento.status_sessao === 'aguardando_guia' ? "Procurando Oraculista..." : agendamento.guia_nome;
            
            return (
              <div key={agendamento.id} style={{
                ...styles.cardAgendamento, 
                borderColor: agendamento.status_sessao === 'ao_vivo' ? '#D4AF37' : '#2A2420',
                opacity: agendamento.status_sessao === 'aguardando_guia' ? 0.7 : 1
              }}>
                
                <div style={styles.infoCol}>
                  <div style={{ position: 'relative' }}>
                    {renderAvatar(agendamento.guia_img, nomeExibicao)}
                    {agendamento.status_sessao === 'ao_vivo' && <div style={styles.liveIndicator}></div>}
                  </div>
                  
                  <div>
                    <h4 style={{...styles.nomeGuia, color: agendamento.status_sessao === 'aguardando_guia' ? '#A89C92' : '#FDFBF7'}}>
                      {nomeExibicao}
                    </h4>
                    <span style={styles.tipoLeitura}>{agendamento.tipo_leitura}</span>
                  </div>
                </div>

                <div style={styles.dataCol}>
                  <div style={styles.dataBadge}>
                    <Calendar size={14} color="#D4AF37" />
                    <span>{agendamento.data_formatada}</span>
                  </div>
                  <div style={styles.horaBadge}>
                    <Clock size={14} color="#786C63" />
                    <span style={{ 
                      color: agendamento.status_sessao === 'ao_vivo' ? '#10b981' : '#786C63',
                      fontWeight: agendamento.status_sessao === 'ao_vivo' ? '600' : 'normal'
                    }}>
                      {agendamento.hora_formatada}
                    </span>
                  </div>
                </div>

                <div style={styles.acaoCol}>
                  {agendamento.status_sessao === "ao_vivo" && (
                    <button 
                      onClick={() => mudarAba("Mensagens")} // <-- AÇÃO ADICIONADA AQUI
                      style={styles.btnAcaoPrimaria}
                    >
                      <MessageCircle size={16} fill="#151312" /> Acessar Chat
                    </button>
                  )}

                  {agendamento.status_sessao === "agendada" && (
                    <button style={styles.btnBloqueado} disabled>
                      <Clock size={16} /> Aguardando Horário
                    </button>
                  )}

                  {agendamento.status_sessao === "aguardando_guia" && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={styles.loadingText}>
                        <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Na Fila Mística...
                      </span>
                      <button style={styles.btnCancelar}><XCircle size={16} /></button>
                    </div>
                  )}

                  {agendamento.status_sessao === "finalizada" && (
                    <button style={styles.btnAcaoConcluida}>
                      <FileText size={16} /> Ver Resumo
                    </button>
                  )}

                  {agendamento.status_sessao !== "aguardando_guia" && agendamento.status_sessao !== "finalizada" && (
                    <button style={styles.btnAcaoSecundaria}><MoreVertical size={16} /></button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", flexDirection: "column", gap: "32px", paddingBottom: "40px" },
  headerSection: { display: "flex", flexDirection: "column", gap: "8px" },
  pageTitle: { fontSize: "32px", fontWeight: "normal", color: "#FDFBF7", fontFamily: "'Playfair Display', serif", fontStyle: "italic" },
  pageSubtitle: { fontSize: "15px", color: "#A89C92", fontWeight: "300" },
  tabsContainer: { display: "flex", gap: "32px", borderBottom: "1px solid #2A2420", paddingBottom: "12px" },
  tabAtiva: { background: "none", border: "none", color: "#D4AF37", fontSize: "14px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", cursor: "pointer", padding: 0 },
  tabInativa: { background: "none", border: "none", color: "#786C63", fontSize: "14px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "1px", cursor: "pointer", padding: 0, transition: "color 0.2s" },
  listContainer: { display: "flex", flexDirection: "column", gap: "16px" },
  cardAgendamento: { display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#1A1715", border: "1px solid", borderRadius: "8px", padding: "24px", transition: "border-color 0.2s" },
  infoCol: { display: "flex", alignItems: "center", gap: "16px", flex: 1 },
  avatarGuia: { width: "56px", height: "56px", borderRadius: "50%", objectFit: "cover", border: "1px solid #3A322C", transition: "opacity 0.3s" },
  fallbackAvatar: { width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "#D4AF37", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "700", color: "#151312", border: "1px solid #2A2420" },
  liveIndicator: { position: "absolute", bottom: "0px", right: "4px", width: "14px", height: "14px", backgroundColor: "#10b981", borderRadius: "50%", border: "3px solid #1A1715" },
  nomeGuia: { color: "#FDFBF7", fontSize: "18px", fontFamily: "'Playfair Display', serif", marginBottom: "4px" },
  tipoLeitura: { color: "#A89C92", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" },
  dataCol: { display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end", paddingRight: "40px", flex: 1, borderRight: "1px solid #2A2420" },
  dataBadge: { display: "flex", alignItems: "center", gap: "8px", color: "#EAE0C8", fontSize: "14px", fontWeight: "500" },
  horaBadge: { display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" },
  acaoCol: { display: "flex", alignItems: "center", gap: "12px", paddingLeft: "40px", flex: 1, justifyContent: "flex-end" },
  btnAcaoPrimaria: { display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px", backgroundColor: "#D4AF37", color: "#151312", border: "none", borderRadius: "4px", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", cursor: "pointer", boxShadow: "0 4px 15px rgba(212, 175, 55, 0.2)" },
  btnBloqueado: { display: "flex", alignItems: "center", gap: "8px", padding: "12px 20px", backgroundColor: "#151312", color: "#786C63", border: "1px solid #2A2420", borderRadius: "4px", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", cursor: "not-allowed" },
  btnCancelar: { display: "flex", alignItems: "center", justifyContent: "center", padding: "10px", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "4px", cursor: "pointer", transition: "all 0.2s" },
  loadingText: { display: "flex", alignItems: "center", gap: "6px", color: "#D4AF37", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" },
  btnAcaoSecundaria: { display: "flex", alignItems: "center", justifyContent: "center", padding: "10px", backgroundColor: "transparent", color: "#A89C92", border: "1px solid #3A322C", borderRadius: "4px", cursor: "pointer" },
  btnAcaoConcluida: { display: "flex", alignItems: "center", gap: "8px", padding: "12px 20px", backgroundColor: "transparent", color: "#A89C92", border: "1px solid #3A322C", borderRadius: "4px", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", cursor: "pointer", transition: "border-color 0.2s, color 0.2s" },
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0", backgroundColor: "#151312", border: "1px dashed #2A2420", borderRadius: "8px", marginTop: "20px" }
};