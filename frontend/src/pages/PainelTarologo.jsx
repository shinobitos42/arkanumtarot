import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, Layers, Zap, Search, Bell, Moon, 
  MessageCircle, Settings, Check, ChevronDown, Lock, Star, LogOut, Clock, Sparkles, TrendingUp, Loader2, Camera, CalendarDays, Menu, Plus, Trash2
} from "lucide-react";

import api from "../services/api"; 
import Mensagens from "./Mensagens"; 
import AgendaTarologo from "./AgendaTarologo";
import FinancasTarologo from "./FinancasTarologo";
import AgendamentoTarologo from "./AgendamentoTarologo"; 

export default function PainelTarologo() {
  const navigate = useNavigate();
  
  const [abaAtiva, setAbaAtiva] = useState(localStorage.getItem('aba_ativa_tarologo') || "Fila Expressa");
  const [menuAberto, setMenuAberto] = useState(false); 

  const [nomeUsuario] = useState(localStorage.getItem('user_name') || 'Guia');
  const [emailUsuario, setEmailUsuario] = useState(localStorage.getItem('user_email') || 'oraculo@arcanum.com');
  const [iniciais] = useState(nomeUsuario.substring(0, 2).toUpperCase());

  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(localStorage.getItem('user_foto') || null);
  const [nomePlano, setNomePlano] = useState("Iniciado"); 
  const fileInputRef = useRef(null);

  const [estatisticas, setEstatisticas] = useState({ saldo: "0,00", tiragens: 0, consulentes: 0, nota: 5.0 });
  const [filaExpressa, setFilaExpressa] = useState([]);
  
  const [perfil, setPerfil] = useState({ especialidade: "", biografia: "" });
  const [tiposTiragem, setTiposTiragem] = useState([]);
  const [novoServicoNome, setNovoServicoNome] = useState("");
  const [novoServicoValor, setNovoServicoValor] = useState("");

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // Lógica para exibir o selo PRO apenas se não for o plano gratuito
  const isPro = nomePlano !== "Iniciado";

  const mudarAba = (aba) => {
    setAbaAtiva(aba);
    localStorage.setItem('aba_ativa_tarologo', aba);
    setMenuAberto(false); 
  };

  useEffect(() => {
    const buscarDadosFixos = async () => {
      try {
        const resPerfil = await api.get('users/me/');
        const dados = resPerfil.data; // Atalho para os dados recebidos
        
        if (dados.nome_plano_atual) setNomePlano(dados.nome_plano_atual);

        // O Django envia o email dentro do objeto 'user' para o TarologoProfileSerializer
        const emailReal = dados.email || dados.user?.email;
        if (emailReal) {
          setEmailUsuario(emailReal);
          localStorage.setItem('user_email', emailReal);
        }

        // CORREÇÃO AQUI: Os dados agora chegam diretamente na raiz (dados.especialidade)
        setPerfil({
          especialidade: dados.especialidade || "",
          biografia: dados.biografia || ""
        });
        
        // CORREÇÃO AQUI: Buscar tipos_tiragem direto da raiz
        if (dados.tipos_tiragem && dados.tipos_tiragem.length > 0) {
            setTiposTiragem(dados.tipos_tiragem);
        } else {
            setTiposTiragem([{ id: 1, nome: "Tiragem Objetiva", valor: "35.00" }]);
        }

        // Se o Django devolve a foto na raiz ou dentro de user
        const fotoReal = dados.foto_perfil || dados.user?.foto_perfil;
        if (fotoReal) {
          setFotoPreview(fotoReal);
          localStorage.setItem('user_foto', fotoReal);
        }

        // CORREÇÃO AQUI: Os saldos e notas estão na raiz agora
        const saldoFormatado = dados.saldo_disponivel 
          ? parseFloat(dados.saldo_disponivel).toFixed(2).replace('.', ',') 
          : "0,00";

        setEstatisticas({ 
          saldo: saldoFormatado, 
          tiragens: dados.total_tiragens || 0, 
          consulentes: dados.total_clientes || 0, 
          nota: dados.nota_media || "5.0" 
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar dados do perfil:", error);
        setLoading(false);
      }
    };
    buscarDadosFixos();
  }, []);

  useEffect(() => {
    const buscarFila = async () => {
      try {
        const resFila = await api.get('tiragens/sessoes/?status=aguardando_guia');
        setFilaExpressa(resFila.data.filter(s => s.status_sessao === 'aguardando_guia'));
      } catch (error) { console.error("Erro ao buscar a fila expressa:", error); }
    };
    buscarFila();
    const intervaloAtualizacao = setInterval(buscarFila, 5000);
    return () => clearInterval(intervaloAtualizacao);
  }, []);

  const aceitarPedido = async (sessaoId) => {
    try {
      await api.patch(`tiragens/sessoes/${sessaoId}/`, { status_sessao: 'ao_vivo' });
      setFilaExpressa(filaExpressa.filter(pedido => pedido.id !== sessaoId));
      mudarAba("Sessões Ativas"); 
    } catch (error) { alert("Houve um erro ao aceitar a sessão. Outro guia já pode ter assumido."); }
  };

  const iniciarSessaoAgendada = async (sessaoId) => {
    try {
      await api.patch(`tiragens/sessoes/${sessaoId}/`, { status_sessao: 'ao_vivo' });
      mudarAba("Sessões Ativas"); 
    } catch (error) { 
      alert("Houve um erro ao iniciar a sessão agendada."); 
      console.error(error);
    }
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) { setFotoFile(file); setFotoPreview(URL.createObjectURL(file)); }
  };

  const adicionarServico = () => {
    if (!novoServicoNome || !novoServicoValor) return;
    const novo = { id: Date.now(), nome: novoServicoNome, valor: parseFloat(novoServicoValor).toFixed(2) };
    setTiposTiragem([...tiposTiragem, novo]);
    setNovoServicoNome("");
    setNovoServicoValor("");
  };

  const removerServico = (id) => {
    setTiposTiragem(tiposTiragem.filter(t => t.id !== id));
  };

  const handleAtualizarVitrine = async (e) => {
    e.preventDefault();
    
    // VALIDAÇÃO DE SEGURANÇA NO FRONTEND
    if (!perfil.especialidade.trim()) {
      alert("A sua Especialidade Principal é obrigatória para salvar a vitrine!");
      return;
    }

    setSalvando(true);

    const formData = new FormData();
    if (fotoFile) formData.append('foto_perfil', fotoFile);
    formData.append('especialidade', perfil.especialidade);
    formData.append('biografia', perfil.biografia);
    formData.append('tipos_tiragem', JSON.stringify(tiposTiragem));

    try {
      const response = await api.patch('/users/me/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.foto_perfil) localStorage.setItem('user_foto', response.data.foto_perfil);
      alert("Vitrine e Cardápio de Tiragens atualizados com sucesso!");
    } catch (error) { 
      // O motivo exato já vai piscar vermelho no console graças ao nosso interceptor!
      alert("Erro ao atualizar o perfil. Verifique se todos os campos estão preenchidos."); 
    } finally { 
      setSalvando(false); 
    }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  const extrairEnergia = (textoContexto) => {
    const match = textoContexto?.match(/\[Energia do Consulente:\s*(.*?)\]/);
    return match ? match[1] : "Não informada";
  };
  const extrairContextoLimpo = (textoContexto) => {
    return textoContexto?.replace(/\[Energia do Consulente:.*?\][\r\n\s]*/g, '').trim() || "";
  };

  return (
    <div className={`app-container ${abaAtiva === 'Sessões Ativas' ? 'app-modo-chat' : ''}`} style={styles.appContainer}>
      
      <div className={`menu-overlay ${menuAberto ? 'aberto' : ''}`} onClick={() => setMenuAberto(false)}></div>

      <aside className={`sidebar-dashboard ${menuAberto ? 'aberto' : ''}`} style={styles.sidebar}>
        <div style={styles.logoContainer}>
          <Moon size={26} color="#D4AF37" />
          <h2 style={styles.logoText}>
            Arkanum {isPro && <span style={styles.proBadge}>PRO</span>}
          </h2>
        </div>

        <nav style={styles.navMenu}>
          <p style={styles.navLabel}>MEU TRABALHO</p>
          <NavItem icon={<Zap size={18} />} label="Fila Expressa" ativo={abaAtiva === "Fila Expressa"} onClick={() => mudarAba("Fila Expressa")} />
          <NavItem icon={<MessageCircle size={18} />} label="Sessões Ativas" ativo={abaAtiva === "Sessões Ativas"} onClick={() => mudarAba("Sessões Ativas")} />
          <NavItem icon={<CalendarDays size={18} />} label="Leituras Agendadas" ativo={abaAtiva === "Agendamentos"} onClick={() => mudarAba("Agendamentos")} />
          <NavItem icon={<Clock size={18} />} label="Minha Agenda" ativo={abaAtiva === "Minha Agenda"} onClick={() => mudarAba("Minha Agenda")} />
          
          <div style={{ marginTop: '24px' }}></div>
          <p style={styles.navLabel}>ADMINISTRAÇÃO</p>
          <NavItem icon={<TrendingUp size={18} />} label="Finanças & Metas" ativo={abaAtiva === "Finanças"} onClick={() => mudarAba("Finanças")} />
          <NavItem icon={<Settings size={18} />} label="Meu Perfil" ativo={abaAtiva === "Meu Perfil"} onClick={() => mudarAba("Meu Perfil")} />
          
          <div onClick={handleLogout} style={{ ...styles.navItem, marginTop: '20px', color: '#ef4444' }}>
            <div style={{ display: "flex", alignItems: "center" }}><LogOut size={18} /></div>
            <span style={{ fontSize: "14px", fontWeight: "500" }}>Sair da Conta</span>
          </div>
        </nav>

        <div style={{ marginTop: "auto" }}>
          <div style={styles.planCard}>
            <div style={styles.planHeader}>
              <Sparkles size={18} color="#D4AF37" />
              <span style={styles.planTitle}>{nomePlano}</span>
            </div>
            <p style={styles.planDesc}>Plano Atual</p>
            <button onClick={() => navigate("/planos")} style={styles.planBtn}>Mudar de Plano</button>
          </div>
        </div>
      </aside>

      <main className="main-content" style={{ ...styles.mainContent, padding: abaAtiva === "Sessões Ativas" ? "0" : "40px 60px" }}>
        
        {abaAtiva !== "Sessões Ativas" && (
          <header className="header-dashboard" style={styles.header}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <button className="menu-hamburger" onClick={() => setMenuAberto(true)} style={{ background: 'none', border: 'none', padding: 0 }}>
                 <Menu size={28} color="#D4AF37" />
               </button>
               <h1 className="breadcrumb-desktop page-title" style={{...styles.pageTitle, margin: 0}}>{abaAtiva}</h1>
               <h2 className="mobile-title" style={styles.mobileTitle}>
                 Arkanum {isPro && <span style={styles.proBadgeMobile}>PRO</span>}
               </h2>
            </div>
            <div className="header-actions" style={styles.headerActions}>
              <button style={styles.iconBtn}><Bell size={20} color="#EAE0C8" /></button>
              
              <button onClick={() => mudarAba("Meu Perfil")} className="userProfileBtn" style={styles.userProfileBtn}>
                <div style={styles.userAvatar}>{iniciais}</div>
                <span style={styles.userName}>{nomeUsuario}</span>
                <ChevronDown size={14} color="#786C63" />
              </button>
            </div>
          </header>
        )}

        {abaAtiva === "Fila Expressa" && (
          <div style={styles.sectionContainer}>
            <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <p style={{ color: '#A89C92', fontSize: '15px' }}>Atendimentos aguardando um oraculista disponível.</p>
              <div style={styles.onlineStatusBadge}><div style={styles.dotOnline}></div> Você está Online</div>
            </div>
            
            {loading ? (
               <div style={{display: 'flex', justifyContent: 'center', padding: '60px'}}><Loader2 size={32} color="#D4AF37" style={{ animation: "spin 1s linear infinite" }} /></div>
            ) : filaExpressa.length === 0 ? (
               <div style={styles.emptyFilaBox}>
                 <Search size={40} color="#2A2420" style={{marginBottom: '16px'}}/>
                 <h3 style={{color: '#FDFBF7', fontSize: '18px', fontFamily: "'Playfair Display', serif", marginBottom: '8px'}}>Fila Vazia</h3>
                 <p style={{color: '#786C63'}}>Nenhum pedido na fila expressa no momento.<br/>Aproveite para organizar sua agenda ou perfil.</p>
               </div>
            ) : (
              <div className="grid-mobile" style={styles.filaGrid}>
                {filaExpressa.map((pedido) => (
                  <div key={pedido.id} style={styles.pedidoCard}>
                    <div style={styles.pedidoHeader}>
                      <span style={styles.pedidoPriceBadge}>R$ 35,00</span>
                      <span style={styles.pedidoTempo}><Clock size={12} /> {pedido.hora_formatada}</span>
                    </div>
                    <div style={styles.pedidoUserSection}>
                      <h4 style={styles.pedidoConsulente}>{pedido.consulente_nome}</h4>
                      <span style={styles.tagEnergia}><Sparkles size={12} color="#D4AF37"/> Energia: {extrairEnergia(pedido.contexto)}</span>
                    </div>
                    <hr style={styles.pedidoDivider} />
                    <div style={styles.pedidoContentSection}>
                      <div style={styles.duvidaBox}>
                        <span style={styles.labelCurta}>Questão Central</span>
                        <p style={styles.pedidoPergunta}>"{pedido.pergunta_principal}"</p>
                      </div>
                      {extrairContextoLimpo(pedido.contexto) && (
                        <div style={styles.contextoBox}>
                          <span style={styles.labelCurta}>Contexto Oculto</span>
                          <p style={styles.pedidoContexto}>{extrairContextoLimpo(pedido.contexto)}</p>
                        </div>
                      )}
                    </div>
                    <button onClick={() => aceitarPedido(pedido.id)} style={styles.btnAceitar}><Check size={16} /> Iniciar Leitura Agora</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {abaAtiva === "Sessões Ativas" && (
           <Mensagens customStyle={{ margin: 0, height: '100%', borderTop: 'none' }} onVoltarParaPainel={() => mudarAba('Fila Expressa')} />
        )}

        {abaAtiva === "Agendamentos" && <AgendamentoTarologo onIniciarSessao={iniciarSessaoAgendada} />}
        {abaAtiva === "Minha Agenda" && <AgendaTarologo />}
        {abaAtiva === "Finanças" && <FinancasTarologo estatisticas={estatisticas} />}

        {abaAtiva === "Meu Perfil" && (
          <div className="grid-mobile" style={styles.profileContainer}>
            <div style={styles.cardSettings}>
              
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>Sua Vitrine Espiritual</h3>
                <p style={styles.sectionSubtitle}>Como os consulentes enxergam você no Círculo.</p>
              </div>

              <form onSubmit={handleAtualizarVitrine} style={styles.form}>
                <div className="header-mobile-col" style={styles.avatarContainer}>
                  <div style={styles.avatarWrapper} onClick={() => fileInputRef.current.click()}>
                    {fotoPreview ? <img src={fotoPreview} alt="Sua foto de perfil" style={styles.avatarImage} /> : <div style={styles.avatarPlaceholder}><Camera size={32} color="#786C63" /></div>}
                    <div style={styles.avatarOverlay}><Camera size={24} color="#FDFBF7" /></div>
                  </div>
                  <div style={styles.avatarText}>
                    <h4 style={styles.avatarTitle}>Foto do Perfil Público</h4>
                    <p style={styles.avatarSubtitle}>Use uma imagem nítida, que transmita luz e acolhimento.</p>
                  </div>
                  <input type="file" accept="image/png, image/jpeg" ref={fileInputRef} onChange={handleFotoChange} style={{ display: 'none' }} />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Nome de Guia</label>
                  <div style={styles.inputWrapperDisabled}>
                    <Lock size={16} color="#786C63" style={styles.inputIcon} />
                    <input type="text" value={nomeUsuario} disabled style={styles.inputDisabled} />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>E-mail de Cadastro</label>
                  <div style={styles.inputWrapperDisabled}>
                    <Lock size={16} color="#786C63" style={styles.inputIcon} />
                    <input type="email" value={emailUsuario} disabled style={styles.inputDisabled} />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Sua Especialidade Principal</label>
                  <input type="text" placeholder="Ex: Taróloga e Astróloga" value={perfil.especialidade} onChange={(e) => setPerfil({...perfil, especialidade: e.target.value})} style={styles.input} />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Biografia e Metodologia</label>
                  <textarea value={perfil.biografia} onChange={(e) => setPerfil({...perfil, biografia: e.target.value})} placeholder="Conte aos consulentes sobre sua jornada..." style={styles.textarea}></textarea>
                </div>

                <hr style={styles.divider} />
              
                <div style={styles.sectionHeader}>
                  <h3 style={styles.sectionTitle}>Cardápio de Serviços</h3>
                  <p style={styles.sectionSubtitle}>As tiragens exclusivas que você oferece em consultas agendadas.</p>
                </div>
                
                <div style={styles.servicosList}>
                  {tiposTiragem.map((servico) => (
                    <div key={servico.id} style={styles.servicoItem}>
                      <div style={styles.servicoInfo}>
                        <span style={styles.servicoNome}>{servico.nome}</span>
                        <span style={styles.servicoValor}>R$ {servico.valor}</span>
                      </div>
                      <button type="button" onClick={() => removerServico(servico.id)} style={styles.btnIconDelete} title="Remover serviço"><Trash2 size={16}/></button>
                    </div>
                  ))}
                </div>

                <div style={styles.addServicoForm}>
                  <input 
                    type="text" 
                    placeholder="Nome da Tiragem (Ex: Mandala Astrológica)" 
                    value={novoServicoNome} 
                    onChange={(e) => setNovoServicoNome(e.target.value)} 
                    style={{...styles.input, flex: 1.5}} 
                  />
                  <input 
                    type="number" 
                    placeholder="Valor (Ex: 80.00)" 
                    value={novoServicoValor} 
                    onChange={(e) => setNovoServicoValor(e.target.value)} 
                    style={{...styles.input, flex: 1}} 
                  />
                  <button type="button" onClick={adicionarServico} style={styles.btnAddServico}><Plus size={18}/></button>
                </div>

                <button type="submit" style={styles.btnSalvar} disabled={salvando}>
                  {salvando ? "Salvando Alterações..." : "Salvar e Atualizar Vitrine"}
                </button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

const NavItem = ({ icon, label, ativo, onClick }) => (
  <div onClick={onClick} style={{ ...styles.navItem, ...(ativo ? styles.navItemAtivo : {}) }}>
    <div style={{ color: ativo ? '#D4AF37' : '#786C63' }}>{icon}</div>
    <span style={{ ...styles.navItemText, color: ativo ? '#FDFBF7' : '#A89C92', fontWeight: ativo ? '600' : '400' }}>{label}</span>
  </div>
);

const styles = {
  appContainer: { display: "flex", height: "100vh", backgroundColor: "#110F0E", fontFamily: "'Inter', sans-serif" },
  sidebar: { display: "flex", flexDirection: "column", width: "260px", backgroundColor: "#151312", borderRight: "1px solid #2A2420", padding: "32px 20px" },
  logoContainer: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "48px", paddingLeft: "8px" },
  logoText: { display: "flex", alignItems: "center", fontSize: "22px", color: "#D4AF37", fontFamily: "'Playfair Display', serif", fontStyle: "italic", margin: 0 },
  proBadge: { backgroundColor: "#D4AF37", color: "#151312", fontSize: "10px", fontWeight: "800", padding: "2px 6px", borderRadius: "4px", fontStyle: "normal", marginLeft: "8px", letterSpacing: "1px" },
  proBadgeMobile: { backgroundColor: "#D4AF37", color: "#151312", fontSize: "9px", fontWeight: "800", padding: "2px 5px", borderRadius: "4px", fontStyle: "normal", marginLeft: "6px", letterSpacing: "1px", verticalAlign: "middle" },
  navMenu: { display: "flex", flexDirection: "column", gap: "6px" },
  navLabel: { fontSize: "11px", fontWeight: "700", color: "#786C63", letterSpacing: "1px", marginBottom: "12px", paddingLeft: "12px" },
  navItem: { display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", borderRadius: "8px", cursor: "pointer", transition: "all 0.2s" },
  navItemAtivo: { backgroundColor: "rgba(212, 175, 55, 0.08)", color: "#D4AF37" },
  navItemText: { fontSize: "14px" },
  
  mainContent: { flex: 1, overflowY: "auto", backgroundColor: "#110F0E" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "48px", borderBottom: "1px solid #1A1715", paddingBottom: "24px" },
  pageTitle: { fontSize: "28px", color: "#FDFBF7", fontFamily: "'Playfair Display', serif", letterSpacing: "0.5px" },
  mobileTitle: { display: "flex", alignItems: "center", color: '#D4AF37', fontSize: '20px', fontStyle: 'italic', fontFamily: "'Playfair Display', serif", margin: 0 },
  headerActions: { display: "flex", gap: "16px", alignItems: "center" },
  iconBtn: { padding: "10px", backgroundColor: "#1A1715", border: "1px solid #2A2420", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", '&:hover': { borderColor: "#D4AF37" } },
  userProfileBtn: { display: "flex", alignItems: "center", gap: "10px", padding: "6px 14px 6px 6px", backgroundColor: "#1A1715", border: "1px solid #2A2420", borderRadius: "30px", cursor: "pointer", transition: "all 0.2s" },
  userAvatar: { width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#D4AF37", color: "#151312", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700" },
  userName: { color: "#FDFBF7", fontSize: "13px", fontWeight: "500", marginRight: "4px" },

  sectionContainer: { marginTop: "0" },
  emptyFilaBox: { backgroundColor: '#151312', border: '1px dashed #2A2420', borderRadius: '16px', padding: '80px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  onlineStatusBadge: { display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '13px', fontWeight: '600', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '6px 14px', borderRadius: '30px', border: '1px solid rgba(16, 185, 129, 0.2)' },
  dotOnline: { width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px rgba(16,185,129,0.6)' },

  filaGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "24px" },
  pedidoCard: { backgroundColor: "#151312", border: "1px solid #2A2420", borderRadius: "16px", padding: "28px", display: "flex", flexDirection: "column", transition: "all 0.3s ease", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", cursor: "pointer" },
  pedidoHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  pedidoPriceBadge: { backgroundColor: "rgba(212, 175, 55, 0.1)", color: "#D4AF37", padding: "6px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: "700", border: "1px solid rgba(212, 175, 55, 0.2)" },
  pedidoTempo: { display: "flex", alignItems: "center", gap: "6px", color: "#786C63", fontSize: "12px", fontWeight: "500" },
  pedidoUserSection: { marginBottom: "16px" },
  pedidoConsulente: { color: "#FDFBF7", fontSize: "22px", fontFamily: "'Playfair Display', serif", marginBottom: "8px", textTransform: "capitalize", letterSpacing: "0.5px" },
  tagEnergia: { display: "inline-flex", alignItems: "center", gap: "6px", color: "#EAE0C8", fontSize: "13px", fontStyle: "italic" },
  pedidoDivider: { border: "none", borderTop: "1px solid #1A1715", margin: "0 0 20px 0" },
  pedidoContentSection: { display: "flex", flexDirection: "column", gap: "16px", flex: 1, marginBottom: "32px" },
  duvidaBox: { borderLeft: "2px solid #D4AF37", paddingLeft: "16px", backgroundColor: "#1A1715", padding: "16px", borderRadius: "0 8px 8px 0" },
  contextoBox: { borderLeft: "2px solid #3A322C", paddingLeft: "16px", padding: "12px 16px" },
  labelCurta: { color: "#786C63", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", display: "block", fontWeight: "700" },
  pedidoPergunta: { color: "#D4AF37", fontSize: "15px", fontStyle: "italic", lineHeight: "1.6", margin: 0 },
  pedidoContexto: { color: "#A89C92", fontSize: "13px", lineHeight: "1.6", margin: 0 },
  btnAceitar: { width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "16px", backgroundColor: "#D4AF37", color: "#151312", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", cursor: "pointer", transition: "opacity 0.2s" },

  profileContainer: { maxWidth: "700px", margin: "0 auto" },
  cardSettings: { backgroundColor: "#151312", border: "1px solid #2A2420", borderRadius: "16px", padding: "40px", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" },
  sectionHeader: { marginBottom: "32px" },
  sectionTitle: { color: "#FDFBF7", fontSize: "22px", fontFamily: "'Playfair Display', serif", marginBottom: "8px", fontWeight: "normal" },
  sectionSubtitle: { color: "#A89C92", fontSize: "14px", fontWeight: "300", lineHeight: "1.5" },
  
  form: { display: "flex", flexDirection: "column", gap: "24px" },
  formGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { color: "#EAE0C8", fontSize: "13px", fontWeight: "600", letterSpacing: "0.5px" },
  
  servicosList: { display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" },
  servicoItem: { display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#1A1715", padding: "16px 20px", borderRadius: "8px", border: "1px solid #2A2420" },
  servicoInfo: { display: "flex", flexDirection: "column", gap: "4px" },
  servicoNome: { color: "#FDFBF7", fontSize: "15px", fontWeight: "500" },
  servicoValor: { color: "#D4AF37", fontSize: "14px", fontWeight: "700" },
  btnIconDelete: { background: "none", border: "none", color: "#786C63", cursor: "pointer", padding: "8px", borderRadius: "6px", transition: "all 0.2s" },
  addServicoForm: { display: "flex", gap: "12px", alignItems: "stretch" },
  btnAddServico: { padding: "0 24px", backgroundColor: "#2A2420", color: "#FDFBF7", border: "none", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" },

  avatarContainer: { display: "flex", alignItems: "center", gap: "24px", paddingBottom: "24px", borderBottom: "1px solid #1A1715" },
  avatarWrapper: { position: "relative", width: "96px", height: "96px", borderRadius: "50%", cursor: "pointer", overflow: "hidden", border: "2px solid #3A322C", backgroundColor: "#110F0E", flexShrink: 0 },
  avatarImage: { width: "100%", height: "100%", objectFit: "cover" },
  avatarPlaceholder: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" },
  avatarOverlay: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(21, 19, 18, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" },
  avatarText: { display: "flex", flexDirection: "column", gap: "6px" },
  avatarTitle: { color: "#FDFBF7", fontSize: "15px", fontWeight: "600" },
  avatarSubtitle: { color: "#A89C92", fontSize: "13px", lineHeight: "1.5" },

  inputWrapperDisabled: { position: "relative", display: "flex", alignItems: "center", backgroundColor: "#1A1715", borderRadius: "8px", border: "1px solid #2A2420" },
  inputIcon: { position: "absolute", left: "16px" },
  inputDisabled: { width: "100%", padding: "16px 16px 16px 44px", backgroundColor: "transparent", border: "none", color: "#786C63", fontSize: "14px", cursor: "not-allowed" },
  input: { width: "100%", padding: "16px", backgroundColor: "#1A1715", border: "1px solid #2A2420", borderRadius: "8px", color: "#EAE0C8", fontSize: "14px", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" },
  textarea: { width: "100%", height: "140px", padding: "16px", backgroundColor: "#1A1715", border: "1px solid #2A2420", borderRadius: "8px", color: "#EAE0C8", fontSize: "14px", outline: "none", resize: "none", boxSizing: "border-box", transition: "border-color 0.2s" },
  btnSalvar: { padding: "18px", backgroundColor: "#D4AF37", color: "#151312", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", cursor: "pointer", marginTop: "16px", transition: "opacity 0.2s" },
  divider: { border: "none", borderTop: "1px dashed #2A2420", margin: "16px 0" },

  planCard: { backgroundColor: "#1A1715", border: "1px solid #2A2420", borderRadius: "12px", padding: "20px" },
  planHeader: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" },
  planTitle: { color: "#FDFBF7", fontSize: "14px", fontWeight: "700" },
  planDesc: { color: "#786C63", marginBottom: "16px", marginLeft: "26px", fontSize: "12px" },
  planBtn: { width: "100%", padding: "10px", backgroundColor: "transparent", border: "1px solid #D4AF37", color: "#D4AF37", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600", textTransform: "uppercase" }
};