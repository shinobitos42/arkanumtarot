import React, { useState, useEffect } from "react";
// Adicionado o ícone Mail aqui na importação
import { ChevronLeft, Star, Calendar, Clock, Award, MessageSquare, ShieldCheck, Check, User, Sparkles, Mail } from "lucide-react";
import api from "../services/api";

export default function PerfilTarologo({ tarologo, onVoltar }) {
  // ESTADOS DO AGENDAMENTO
  const [servicoSelecionado, setServicoSelecionado] = useState(null);
  const [dataSelecionada, setDataSelecionada] = useState("");
  const [horaSelecionada, setHoraSelecionada] = useState("");
  
  // ESTADOS DA AGENDA REAL DO BANCO
  const [agendaReal, setAgendaReal] = useState({});
  const [datasDisponiveis, setDatasDisponiveis] = useState([]);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const [carregandoAgenda, setCarregandoAgenda] = useState(true);

  const [agendadoComSucesso, setAgendadoComSucesso] = useState(false);

  // DADOS DO GUIA (Puxando o Email do user relacionado)
  const nomeGuia = tarologo?.user?.first_name || tarologo?.user?.username || "Guia Espiritual";
  const emailGuia = tarologo?.user?.email || "Email não informado"; // <-- NOVO: Extração do Email
  const fotoGuia = tarologo?.foto_perfil || null;
  const especialidade = tarologo?.especialidade || "Tarólogo";
  const biografia = tarologo?.biografia || "A energia está fluindo e pronta para a leitura.";
  const notaMedia = tarologo?.nota_media || "5.0";
  
  // Mapeia o cardápio de tiragens, se não tiver, cria a padrão
  const cardapioTiragens = (tarologo?.tipos_tiragem && tarologo?.tipos_tiragem.length > 0) 
    ? typeof tarologo.tipos_tiragem === 'string' ? JSON.parse(tarologo.tipos_tiragem) : tarologo.tipos_tiragem
    : [{ id: 1, nome: "Tiragem Completa", valor: tarologo?.valor_consulta || "35.00" }];

  // 1. BUSCA A AGENDA REAL DO BANCO DE DADOS
  useEffect(() => {
    const buscarAgenda = async () => {
      try {
        const response = await api.get(`users/tarologos/${tarologo.id}/horarios/`);
        const agendaData = response.data; // Ex: { "2026-05-26": ["09:00", "10:00"], "2026-05-27": ["14:00"] }
        setAgendaReal(agendaData);
        setDatasDisponiveis(Object.keys(agendaData));
      } catch (error) {
        console.error("Erro ao buscar agenda:", error);
        // FALLBACK: Caso a rota do backend não exista ainda, criamos uma agenda falsa para não quebrar a tela
        const hoje = new Date();
        const amanha = new Date(); amanha.setDate(hoje.getDate() + 1);
        const data1 = hoje.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        const data2 = amanha.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        
        const mockAgenda = {
          [data1]: ["09:00", "11:00", "14:00"],
          [data2]: ["10:30", "15:00", "18:00"]
        };
        setAgendaReal(mockAgenda);
        setDatasDisponiveis(Object.keys(mockAgenda));
      } finally {
        setCarregandoAgenda(false);
      }
    };
    if (tarologo?.id) buscarAgenda();
  }, [tarologo]);

  // 2. ATUALIZA OS HORÁRIOS QUANDO O USUÁRIO CLICA NO DIA
  useEffect(() => {
    if (dataSelecionada && agendaReal[dataSelecionada]) {
      setHorariosDisponiveis(agendaReal[dataSelecionada]);
      setHoraSelecionada(""); // Reseta a hora ao mudar o dia
    } else {
      setHorariosDisponiveis([]);
    }
  }, [dataSelecionada, agendaReal]);

  const handleAgendar = (e) => {
    e.preventDefault();
    if (!servicoSelecionado || !dataSelecionada || !horaSelecionada) return;
    
    setAgendadoComSucesso(true);
    // Aqui conectaremos ao Checkout Transparente depois!
  };

  if (agendadoComSucesso) {
    return (
      <div style={styles.successCard}>
        <div style={styles.successIconWrapper}>
          <Check size={32} color="#151312" />
        </div>
        <h2 style={styles.successTitle}>Tiragem Agendada!</h2>
        <p style={styles.successText}>
          Sua <strong>{servicoSelecionado.nome}</strong> com <strong>{nomeGuia}</strong> foi reservada para o dia <strong>{dataSelecionada}</strong> às <strong>{horaSelecionada}</strong>.
        </p>
        <button onClick={onVoltar} style={styles.btnPrimary}>Voltar ao Espaço</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <button onClick={onVoltar} style={styles.btnVoltar}>
        <ChevronLeft size={16} /> Voltar para a lista
      </button>

      <div className="grid-mobile" style={styles.profileLayout}>
        
        <div style={styles.colEsquerda}>
          
          <div className="header-mobile-col" style={styles.profileHeaderCard}>
            {fotoGuia ? (
               <img src={fotoGuia} alt={nomeGuia} style={styles.profileAvatar} />
            ) : (
               <div style={styles.avatarPlaceholder}>
                 <User size={40} color="#786C63" />
               </div>
            )}
            
            <div style={styles.profileHeaderInfo}>
              <span style={styles.tagSpec}>{especialidade}</span>
              <h1 style={styles.profileName}>{nomeGuia}</h1>
              
              {/* NOVO: Exibindo o Email do Guia aqui na interface */}
              {emailGuia && (
                <div style={styles.emailRow}>
                  <Mail size={14} />
                  <span>{emailGuia}</span>
                </div>
              )}

              <div style={styles.ratingRow}>
                <div style={styles.ratingBadge}>
                  <Star size={12} fill="#151312" color="#151312" /> {notaMedia}
                </div>
              </div>
            </div>
          </div>

          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>
              <Award size={18} color="#D4AF37" /> Trajetória e Conexão
            </h3>
            <p style={styles.sectionText}>{biografia}</p>
          </div>

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
                <p style={styles.reviewText}>"A leitura foi extremamente cirúrgica. Consegui enxergar caminhos que pareciam bloqueados."</p>
              </div>
            </div>
          </div>

        </div>

        <div className="coluna-direita-mobile" style={styles.colDireita}>
          <div style={styles.agendamentoCard}>
            
            <h3 style={styles.agendarTitle}>Reservar Leitura</h3>

            {/* SELEÇÃO DO TIPO DE TIRAGEM (CARDÁPIO) */}
            <div style={styles.formGroup}>
              <label style={styles.inputLabel}>
                <Sparkles size={14} style={{ marginRight: '6px' }} /> 1. Escolha a sua Tiragem
              </label>
              <div style={styles.servicosGridSelect}>
                {cardapioTiragens.map((servico) => {
                  const isActive = servicoSelecionado?.id === servico.id;
                  return (
                    <div 
                      key={servico.id} 
                      onClick={() => setServicoSelecionado(servico)}
                      style={{ ...styles.servicoCardSelect, ...(isActive ? styles.servicoCardAtivo : {}) }}
                    >
                      <h4 style={{ ...styles.sCardNome, color: isActive ? '#D4AF37' : '#FDFBF7' }}>{servico.nome}</h4>
                      <p style={{ ...styles.sCardValor, color: isActive ? '#D4AF37' : '#A89C92' }}>R$ {servico.valor}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <hr style={{ border: 'none', borderTop: '1px solid #2A2420', margin: '24px 0' }} />

            <form onSubmit={handleAgendar} style={styles.agendamentoForm}>
              <div style={styles.formGroup}>
                <label style={styles.inputLabel}>
                  <Calendar size={14} style={{ marginRight: '6px' }} /> 2. Selecione o Dia
                </label>
                
                {carregandoAgenda ? (
                   <p style={styles.loadingText}>Conectando ao calendário astral...</p>
                ) : datasDisponiveis.length === 0 ? (
                   <p style={styles.erroText}>A agenda deste guia está completamente preenchida.</p>
                ) : (
                  <div style={styles.selectorGrid}>
                    {datasDisponiveis.map((data) => (
                      <button
                        key={data}
                        type="button"
                        style={{ ...styles.selectorBtn, ...(dataSelecionada === data ? styles.selectorBtnAtivo : {}) }}
                        onClick={() => setDataSelecionada(data)}
                      >
                        {data}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {dataSelecionada && (
                <div style={styles.formGroup}>
                  <label style={styles.inputLabel}>
                    <Clock size={14} style={{ marginRight: '6px' }} /> 3. Horários Disponíveis
                  </label>
                  <div style={styles.selectorGridHoras}>
                    {horariosDisponiveis.map((hora) => (
                      <button
                        key={hora}
                        type="button"
                        style={{ ...styles.selectorBtn, ...(horaSelecionada === hora ? styles.selectorBtnAtivo : {}) }}
                        onClick={() => setHoraSelecionada(hora)}
                      >
                        {hora}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={!servicoSelecionado || !dataSelecionada || !horaSelecionada}
                style={{
                  ...styles.btnConfirmar,
                  ...(!servicoSelecionado || !dataSelecionada || !horaSelecionada ? styles.btnConfirmarDesativado : {})
                }}
              >
                Confirmar Leitura ({servicoSelecionado ? `R$ ${servicoSelecionado.valor}` : "..."})
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
  
  colEsquerda: { display: "flex", flexDirection: "column", gap: "24px" },
  profileHeaderCard: { backgroundColor: "#1A1715", border: "1px solid #2A2420", borderRadius: "12px", padding: "32px", display: "flex", gap: "24px", alignItems: "center" },
  profileAvatar: { width: "100px", height: "100px", borderRadius: "12px", objectFit: "cover", border: "1px solid #3A322C" },
  avatarPlaceholder: { width: "100px", height: "100px", borderRadius: "12px", backgroundColor: "#110F0E", border: "1px solid #3A322C", display: "flex", alignItems: "center", justifyContent: "center" },
  
  profileHeaderInfo: { display: "flex", flexDirection: "column", gap: "6px" },
  tagSpec: { color: "#D4AF37", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" },
  profileName: { fontSize: "28px", fontWeight: "normal", color: "#FDFBF7", fontFamily: "'Playfair Display', serif" },
  
  // Estilo adicionado para a linha do e-mail
  emailRow: { display: "flex", alignItems: "center", gap: "6px", color: "#A89C92", fontSize: "13px", marginBottom: "4px" },

  ratingRow: { display: "flex", alignItems: "center", gap: "12px", marginTop: "4px" },
  ratingBadge: { display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: "700", color: "#151312", backgroundColor: "#D4AF37", padding: "2px 6px", borderRadius: "4px" },

  sectionCard: { backgroundColor: "#1A1715", border: "1px solid #2A2420", borderRadius: "12px", padding: "32px" },
  sectionTitle: { display: "flex", alignItems: "center", gap: "8px", fontSize: "18px", color: "#FDFBF7", fontFamily: "'Playfair Display', serif", marginBottom: "16px", fontWeight: "normal" },
  sectionText: { color: "#A89C92", fontSize: "14px", lineHeight: "1.7", fontWeight: "300", whiteSpace: "pre-wrap" },

  reviewsList: { display: "flex", flexDirection: "column", gap: "16px" },
  reviewItem: { borderBottom: "1px solid #2A2420", paddingBottom: "16px" },
  reviewMeta: { display: "flex", justifyContent: "space-between", marginBottom: "6px" },
  reviewUser: { color: "#EAE0C8", fontSize: "14px", fontWeight: "500" },
  reviewStars: { display: "flex", alignItems: "center", gap: "4px", color: "#D4AF37", fontSize: "11px" },
  reviewText: { color: "#786C63", fontSize: "13px", lineHeight: "1.5", fontStyle: "italic" },

  colDireita: { position: "sticky", top: "24px" },
  agendamentoCard: { backgroundColor: "#1A1715", border: "1px solid #3A322C", borderRadius: "12px", padding: "32px" },
  agendarTitle: { color: "#FDFBF7", fontFamily: "'Playfair Display', serif", fontSize: "20px", marginBottom: "24px", fontWeight: "normal" },
  
  servicosGridSelect: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  servicoCardSelect: { backgroundColor: "#110F0E", border: "1px solid #2A2420", borderRadius: "8px", padding: "16px", cursor: "pointer", transition: "all 0.2s", textAlign: "center", display: "flex", flexDirection: "column", gap: "4px" },
  servicoCardAtivo: { borderColor: "#D4AF37", backgroundColor: "rgba(212, 175, 55, 0.05)" },
  sCardNome: { fontSize: "13px", fontWeight: "600", margin: 0, transition: "color 0.2s" },
  sCardValor: { fontSize: "12px", margin: 0, transition: "color 0.2s" },

  agendamentoForm: { display: "flex", flexDirection: "column", gap: "24px" },
  formGroup: { display: "flex", flexDirection: "column", gap: "12px" },
  inputLabel: { display: "flex", alignItems: "center", color: "#A89C92", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" },
  
  loadingText: { color: "#D4AF37", fontSize: "13px", fontStyle: "italic" },
  erroText: { color: "#ef4444", fontSize: "13px", fontStyle: "italic" },

  selectorGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" },
  selectorGridHoras: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" },
  selectorBtn: { padding: "10px 0", backgroundColor: "#110F0E", border: "1px solid #2A2420", borderRadius: "6px", color: "#A89C92", fontSize: "13px", cursor: "pointer", transition: "all 0.2s", fontFamily: "'Inter', sans-serif" },
  selectorBtnAtivo: { backgroundColor: "transparent", borderColor: "#D4AF37", color: "#D4AF37", fontWeight: "700" },
  
  btnConfirmar: { width: "100%", padding: "18px", backgroundColor: "#D4AF37", color: "#151312", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", cursor: "pointer", transition: "opacity 0.2s", marginTop: "8px" },
  btnConfirmarDesativado: { backgroundColor: "#2A2420", color: "#786C63", cursor: "not-allowed" },
  garantiaBox: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#786C63", fontSize: "11px", marginTop: "20px" },

  successCard: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 32px", backgroundColor: "#1A1715", border: "1px solid #2A2420", borderRadius: "12px", textAlign: "center", maxWidth: "500px", margin: "40px auto" },
  successIconWrapper: { width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "#D4AF37", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" },
  successTitle: { fontSize: "24px", color: "#FDFBF7", fontFamily: "'Playfair Display', serif", marginBottom: "12px", fontWeight: "normal" },
  successText: { color: "#A89C92", fontSize: "14px", lineHeight: "1.6", marginBottom: "28px" },
  btnPrimary: { padding: "14px 28px", backgroundColor: "#D4AF37", color: "#151312", border: "none", borderRadius: "4px", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", cursor: "pointer" }
};