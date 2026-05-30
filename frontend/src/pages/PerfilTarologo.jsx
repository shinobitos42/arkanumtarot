import React, { useState, useEffect } from "react";
import { ChevronLeft, Star, Calendar, Clock, Award, MessageSquare, ShieldCheck, Check, User, Sparkles, Mail, CreditCard, X, Loader2 } from "lucide-react";
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

  // NOVOS ESTADOS PARA O PAGAMENTO REAL
  const [modalPagamentoAberto, setModalPagamentoAberto] = useState(false);
  const [processandoPagamento, setProcessandoPagamento] = useState(false);
  const [agendadoComSucesso, setAgendadoComSucesso] = useState(false);

  // DADOS DO GUIA 
  const nomeGuia = tarologo?.user?.first_name || tarologo?.user?.username || "Guia Espiritual";
  const emailGuia = tarologo?.user?.email || "Email não informado"; 
  const fotoGuia = tarologo?.foto_perfil || null;
  const especialidade = tarologo?.especialidade || "Tarólogo";
  const biografia = tarologo?.biografia || "A energia está fluindo e pronta para a leitura.";
  const notaMedia = tarologo?.nota_media || "5.0";
  
  // Mapeia o cardápio de tiragens, se não tiver, cria a padrão
  const cardapioTiragens = (tarologo?.tipos_tiragem && tarologo?.tipos_tiragem.length > 0) 
    ? typeof tarologo.tipos_tiragem === 'string' ? JSON.parse(tarologo.tipos_tiragem) : tarologo.tipos_tiragem
    : [{ id: 1, nome: "Tiragem Completa", valor: tarologo?.valor_consulta || "35.00" }];

  // BUSCA A AGENDA
  useEffect(() => {
    const buscarAgenda = async () => {
      try {
        const response = await api.get(`users/tarologos/${tarologo.id}/horarios/`);
        const agendaData = response.data; 
        setAgendaReal(agendaData);
        setDatasDisponiveis(Object.keys(agendaData));
      } catch (error) {
        console.error("Erro ao buscar agenda:", error);
        // FALLBACK: Cria agenda falsa caso não tenha backend configurado
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

  // ATUALIZA OS HORÁRIOS
  useEffect(() => {
    if (dataSelecionada && agendaReal[dataSelecionada]) {
      setHorariosDisponiveis(agendaReal[dataSelecionada]);
      setHoraSelecionada(""); 
    } else {
      setHorariosDisponiveis([]);
    }
  }, [dataSelecionada, agendaReal]);

  const handleAgendarClick = (e) => {
    e.preventDefault();
    if (!servicoSelecionado || !dataSelecionada || !horaSelecionada) return;
    // Abre o Modal de Pagamento
    setModalPagamentoAberto(true);
  };

  const confirmarReservaNoBanco = async () => {
    setProcessandoPagamento(true);
    try {
      // Cria a sessão real no banco de dados do Django
      await api.post('tiragens/sessoes/', {
        tarologo_id: tarologo.user?.id || tarologo.id,
        tipo: servicoSelecionado.nome,
        valor_cobrado: servicoSelecionado.valor,
        data_agendada: dataSelecionada,
        hora_agendada: horaSelecionada,
        status_sessao: 'agendada', 
        pergunta_principal: "Sessão Agendada com Guia", 
        contexto: "Agendamento realizado via Círculo do Tarólogo."
      });

      setModalPagamentoAberto(false);
      setAgendadoComSucesso(true);
    } catch (error) {
      alert("Houve um erro ao processar sua reserva. Tente novamente.");
      console.error(error);
    } finally {
      setProcessandoPagamento(false);
    }
  };

  if (agendadoComSucesso) {
    return (
      <div style={styles.successCard}>
        <div style={styles.successIconWrapper}>
          <Check size={32} color="#151312" />
        </div>
        <h2 style={styles.successTitle}>Tiragem Agendada!</h2>
        <p style={styles.successText}>
          Sua <strong>{servicoSelecionado.nome}</strong> com <strong>{nomeGuia}</strong> foi reservada com sucesso para o dia <strong>{dataSelecionada}</strong> às <strong>{horaSelecionada}</strong>.
        </p>
        <button onClick={onVoltar} style={styles.btnPrimary}>Voltar ao Espaço</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <button onClick={onVoltar} style={styles.btnVoltar}>
        <ChevronLeft size={16} /> Voltar para o Círculo
      </button>

      <div className="grid-mobile" style={styles.profileLayout}>
        
        {/* COLUNA ESQUERDA: INFORMAÇÕES DO GUIA */}
        <div style={styles.colEsquerda}>
          
          <div className="header-mobile-col" style={styles.profileHeaderCard}>
            <div style={styles.avatarRing}>
              {fotoGuia ? (
                 <img src={fotoGuia} alt={nomeGuia} style={styles.profileAvatar} />
              ) : (
                 <div style={styles.avatarPlaceholder}>
                   <User size={48} color="#786C63" />
                 </div>
              )}
            </div>
            
            <div style={styles.profileHeaderInfo}>
              <span style={styles.tagSpec}>{especialidade}</span>
              <h1 style={styles.profileName}>{nomeGuia}</h1>
              
              {emailGuia && (
                <div style={styles.emailRow}>
                  <Mail size={14} />
                  <span>{emailGuia}</span>
                </div>
              )}

              <div style={styles.ratingBadge}>
                <Star size={12} fill="#D4AF37" color="#D4AF37" /> 
                <span style={{ color: '#EAE0C8', fontWeight: '600', marginLeft: '4px' }}>{notaMedia}</span>
                <span style={{ color: '#786C63', fontWeight: '400', marginLeft: '4px' }}>(Avaliações)</span>
              </div>
            </div>
          </div>

          <div style={styles.contentFlow}>
            <div style={styles.sectionBlock}>
              <h3 style={styles.sectionTitle}>
                <Award size={20} color="#D4AF37" /> Trajetória e Conexão
              </h3>
              <p style={styles.sectionText}>{biografia}</p>
            </div>

            <hr style={styles.divider} />

            <div style={styles.sectionBlock}>
              <h3 style={styles.sectionTitle}>
                <MessageSquare size={20} color="#D4AF37" /> Relatos de Clareza
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

        </div>

        {/* COLUNA DIREITA: WIDGET DE AGENDAMENTO */}
        <div className="coluna-direita-mobile" style={styles.colDireita}>
          <div style={styles.agendamentoCard}>
            
            <h3 style={styles.agendarTitle}>Reservar Leitura</h3>
            <p style={styles.agendarSubtitle}>Escolha a profundidade da sua consulta e o melhor momento.</p>

            <div style={styles.formGroup}>
              <label style={styles.inputLabel}>
                <Sparkles size={16} color="#D4AF37" /> 1. Escolha a sua Tiragem
              </label>
              
              <div style={styles.servicosListVertical}>
                {cardapioTiragens.map((servico) => {
                  const isActive = servicoSelecionado?.id === servico.id;
                  return (
                    <div 
                      key={servico.id} 
                      onClick={() => setServicoSelecionado(servico)}
                      style={{ ...styles.servicoRowSelect, ...(isActive ? styles.servicoRowAtivo : {}) }}
                    >
                      <div style={styles.radioFake}>
                        {isActive && <div style={styles.radioFakeInner}></div>}
                      </div>
                      <span style={{ ...styles.sCardNome, color: isActive ? '#D4AF37' : '#FDFBF7' }}>{servico.nome}</span>
                      <span style={{ ...styles.sCardValor, color: isActive ? '#D4AF37' : '#A89C92' }}>R$ {servico.valor}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <hr style={styles.dividerSutil} />

            <form onSubmit={handleAgendarClick} style={styles.agendamentoForm}>
              <div style={styles.formGroup}>
                <label style={styles.inputLabel}>
                  <Calendar size={16} color="#D4AF37" /> 2. Selecione o Dia
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
                    <Clock size={16} color="#D4AF37" /> 3. Horários Disponíveis
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
                Continuar para Pagamento
              </button>
            </form>

            <div style={styles.garantiaBox}>
              <ShieldCheck size={16} color="#786C63" />
              <span>Ambiente seguro. Sigilo espiritual garantido.</span>
            </div>
          </div>
        </div>

      </div>

      {/* MODAL DE PAGAMENTO SOBREPOSTO */}
      {modalPagamentoAberto && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={{color: '#FDFBF7', fontSize: '20px', margin: 0, fontFamily: "'Playfair Display', serif"}}>Resumo da Reserva</h3>
              <button onClick={() => setModalPagamentoAberto(false)} style={styles.btnFecharModal}><X size={20} /></button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.resumoItem}>
                <span style={styles.resumoLabel}>Guia Selecionado:</span>
                <span style={styles.resumoValorText}>{nomeGuia}</span>
              </div>
              <div style={styles.resumoItem}>
                <span style={styles.resumoLabel}>Serviço:</span>
                <span style={styles.resumoValorText}>{servicoSelecionado?.nome}</span>
              </div>
              <div style={styles.resumoItem}>
                <span style={styles.resumoLabel}>Data e Hora:</span>
                <span style={styles.resumoValorText}>{dataSelecionada} às {horaSelecionada}</span>
              </div>
              
              <hr style={{borderTop: '1px dashed #3A322C', borderBottom: 'none', margin: '20px 0'}} />
              
              <div style={{...styles.resumoItem, marginBottom: '24px'}}>
                <span style={{color: '#EAE0C8', fontSize: '16px'}}>Total a pagar:</span>
                <span style={{color: '#D4AF37', fontSize: '24px', fontWeight: '700'}}>R$ {servicoSelecionado?.valor}</span>
              </div>

              {/* Aqui no futuro você pode plugar o Mercado Pago Bricks */}
              <button onClick={confirmarReservaNoBanco} disabled={processandoPagamento} style={styles.btnPagar}>
                {processandoPagamento ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : <CreditCard size={18} />}
                {processandoPagamento ? "Processando..." : "Confirmar e Pagar Agora"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const styles = {
  container: { display: "flex", flexDirection: "column", gap: "32px", animation: "fadeIn 0.4s ease" },
  btnVoltar: { display: "flex", alignItems: "center", gap: "6px", backgroundColor: "transparent", border: "none", color: "#A89C92", fontSize: "14px", cursor: "pointer", alignSelf: "flex-start", padding: "8px 0", transition: "color 0.2s" },
  
  profileLayout: { display: "grid", gridTemplateColumns: "1.4fr 1.1fr", gap: "48px", alignItems: "start" },
  
  // COLUNA ESQUERDA (Info e Bio)
  colEsquerda: { display: "flex", flexDirection: "column", gap: "40px" },
  
  profileHeaderCard: { display: "flex", gap: "32px", alignItems: "center", backgroundColor: "transparent" },
  avatarRing: { padding: "4px", borderRadius: "50%", border: "1px dashed #D4AF37", display: "flex", alignItems: "center", justifyContent: "center" },
  profileAvatar: { width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover" },
  avatarPlaceholder: { width: "120px", height: "120px", borderRadius: "50%", backgroundColor: "#151312", display: "flex", alignItems: "center", justifyContent: "center" },
  
  profileHeaderInfo: { display: "flex", flexDirection: "column", gap: "8px" },
  tagSpec: { color: "#D4AF37", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "2px" },
  profileName: { fontSize: "36px", fontWeight: "normal", color: "#FDFBF7", fontFamily: "'Playfair Display', serif", margin: "4px 0" },
  emailRow: { display: "flex", alignItems: "center", gap: "8px", color: "#786C63", fontSize: "13px", marginBottom: "4px" },
  ratingBadge: { display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", marginTop: "8px", backgroundColor: "#1A1715", padding: "6px 12px", borderRadius: "20px", width: "fit-content", border: "1px solid #2A2420" },

  contentFlow: { display: "flex", flexDirection: "column", gap: "32px" },
  sectionBlock: { display: "flex", flexDirection: "column", gap: "16px" },
  sectionTitle: { display: "flex", alignItems: "center", gap: "12px", fontSize: "22px", color: "#FDFBF7", fontFamily: "'Playfair Display', serif", fontWeight: "normal" },
  sectionText: { color: "#A89C92", fontSize: "15px", lineHeight: "1.8", fontWeight: "300", whiteSpace: "pre-wrap" },
  divider: { border: "none", borderTop: "1px solid #2A2420", margin: "0" },

  reviewsList: { display: "flex", flexDirection: "column", gap: "16px" },
  reviewItem: { backgroundColor: "#151312", border: "1px solid #2A2420", borderRadius: "12px", padding: "24px" },
  reviewMeta: { display: "flex", justifyContent: "space-between", marginBottom: "12px" },
  reviewUser: { color: "#EAE0C8", fontSize: "14px", fontWeight: "600" },
  reviewStars: { display: "flex", alignItems: "center", gap: "4px", color: "#D4AF37", fontSize: "12px" },
  reviewText: { color: "#A89C92", fontSize: "14px", lineHeight: "1.6", fontStyle: "italic", fontWeight: "300" },

  // COLUNA DIREITA (Agendamento)
  colDireita: { position: "sticky", top: "24px" },
  agendamentoCard: { backgroundColor: "#151312", border: "1px solid #2A2420", borderRadius: "16px", padding: "32px", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" },
  agendarTitle: { color: "#FDFBF7", fontFamily: "'Playfair Display', serif", fontSize: "24px", marginBottom: "8px", fontWeight: "normal" },
  agendarSubtitle: { color: "#786C63", fontSize: "13px", marginBottom: "32px", lineHeight: "1.5" },
  
  formGroup: { display: "flex", flexDirection: "column", gap: "16px" },
  inputLabel: { display: "flex", alignItems: "center", gap: "8px", color: "#EAE0C8", fontSize: "14px", fontWeight: "600" },
  
  // NOVO LIST DESIGN PARA SERVIÇOS
  servicosListVertical: { display: "flex", flexDirection: "column", gap: "12px" },
  servicoRowSelect: { display: "flex", alignItems: "center", backgroundColor: "#110F0E", border: "1px solid #2A2420", borderRadius: "8px", padding: "16px 20px", cursor: "pointer", transition: "all 0.2s" },
  servicoRowAtivo: { borderColor: "#D4AF37", backgroundColor: "rgba(212, 175, 55, 0.05)" },
  radioFake: { width: "18px", height: "18px", borderRadius: "50%", border: "2px solid #786C63", marginRight: "16px", display: "flex", alignItems: "center", justifyContent: "center" },
  radioFakeInner: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#D4AF37" },
  sCardNome: { fontSize: "14px", fontWeight: "500", transition: "color 0.2s", flex: 1 },
  sCardValor: { fontSize: "14px", fontWeight: "700", transition: "color 0.2s" },

  dividerSutil: { border: "none", borderTop: "1px dashed #2A2420", margin: "32px 0" },
  agendamentoForm: { display: "flex", flexDirection: "column", gap: "32px" },
  
  loadingText: { color: "#D4AF37", fontSize: "13px", fontStyle: "italic" },
  erroText: { color: "#ef4444", fontSize: "13px", fontStyle: "italic" },

  // PILLS (Pílulas) para datas e horas
  selectorGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "10px" },
  selectorGridHoras: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))", gap: "10px" },
  selectorBtn: { padding: "12px 0", backgroundColor: "#110F0E", border: "1px solid #2A2420", borderRadius: "30px", color: "#A89C92", fontSize: "13px", cursor: "pointer", transition: "all 0.2s", fontFamily: "'Inter', sans-serif" },
  selectorBtnAtivo: { backgroundColor: "#D4AF37", borderColor: "#D4AF37", color: "#151312", fontWeight: "700" },
  
  btnConfirmar: { width: "100%", padding: "18px", backgroundColor: "#D4AF37", color: "#151312", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", cursor: "pointer", transition: "opacity 0.2s", marginTop: "16px" },
  btnConfirmarDesativado: { backgroundColor: "#1A1715", color: "#786C63", cursor: "not-allowed", border: "1px solid #2A2420" },
  garantiaBox: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#786C63", fontSize: "12px", marginTop: "24px" },

  successCard: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 32px", backgroundColor: "#1A1715", border: "1px solid #2A2420", borderRadius: "12px", textAlign: "center", maxWidth: "500px", margin: "40px auto" },
  successIconWrapper: { width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "#D4AF37", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" },
  successTitle: { fontSize: "24px", color: "#FDFBF7", fontFamily: "'Playfair Display', serif", marginBottom: "12px", fontWeight: "normal" },
  successText: { color: "#A89C92", fontSize: "14px", lineHeight: "1.6", marginBottom: "28px" },
  btnPrimary: { padding: "14px 28px", backgroundColor: "#D4AF37", color: "#151312", border: "none", borderRadius: "4px", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", cursor: "pointer" },

  // ESTILOS DO MODAL DE PAGAMENTO
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(17, 15, 14, 0.85)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modalContent: { backgroundColor: "#151312", border: "1px solid #2A2420", borderRadius: "16px", width: "100%", maxWidth: "440px", boxShadow: "0 25px 50px rgba(0,0,0,0.5)", overflow: "hidden" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 32px", borderBottom: "1px solid #2A2420", backgroundColor: "#1A1715" },
  btnFecharModal: { background: "none", border: "none", color: "#786C63", cursor: "pointer", display: "flex" },
  modalBody: { padding: "32px" },
  resumoItem: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" },
  resumoLabel: { color: "#786C63", fontSize: "14px" },
  resumoValorText: { color: "#FDFBF7", fontSize: "14px", fontWeight: "500" },
  btnPagar: { width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "18px", backgroundColor: "#10b981", color: "#FDFBF7", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "700", cursor: "pointer", transition: "all 0.2s" }
};