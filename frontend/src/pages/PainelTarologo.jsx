import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, Layers, Zap, Search, Bell, Moon, 
  MessageCircle, Settings, Check, ChevronDown, Lock, Star, LogOut, Clock, Sparkles, TrendingUp, Loader2, Camera, CalendarDays, Menu
} from "lucide-react";

import api from "../services/api"; 
import Mensagens from "./Mensagens"; 
import AgendaTarologo from "./AgendaTarologo";
import FinancasTarologo from "./FinancasTarologo";

export default function PainelTarologo() {
  const navigate = useNavigate();
  
  const [abaAtiva, setAbaAtiva] = useState(localStorage.getItem('aba_ativa_tarologo') || "Fila Expressa");
  const [menuAberto, setMenuAberto] = useState(false); // NOVO: Controle do Menu Mobile

  const [nomeUsuario] = useState(localStorage.getItem('user_name') || 'Guia');
  const [emailUsuario] = useState(localStorage.getItem('user_email') || 'oraculo@arcanum.com');
  const [iniciais] = useState(nomeUsuario.substring(0, 2).toUpperCase());

  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(localStorage.getItem('user_foto') || null);
  const [nomePlano, setNomePlano] = useState("Iniciado"); 
  const fileInputRef = useRef(null);

  const [estatisticas, setEstatisticas] = useState({ saldo: "0,00", tiragens: 0, consulentes: 0, nota: 5.0 });
  const [filaExpressa, setFilaExpressa] = useState([]);
  const [perfil, setPerfil] = useState({ especialidade: "", biografia: "" });
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const mudarAba = (aba) => {
    setAbaAtiva(aba);
    localStorage.setItem('aba_ativa_tarologo', aba);
    setMenuAberto(false); // NOVO: Fecha o menu automaticamente
  };

  useEffect(() => {
    const buscarDadosFixos = async () => {
      try {
        const resPerfil = await api.get('users/me/');
        if (resPerfil.data.nome_plano_atual) setNomePlano(resPerfil.data.nome_plano_atual);

        setPerfil({
          especialidade: resPerfil.data.tarologo_profile?.especialidade || "",
          biografia: resPerfil.data.tarologo_profile?.biografia || ""
        });
        
        if (resPerfil.data.foto_perfil) {
          setFotoPreview(resPerfil.data.foto_perfil);
          localStorage.setItem('user_foto', resPerfil.data.foto_perfil);
        }

        const saldoFormatado = resPerfil.data.tarologo_profile?.saldo_disponivel 
          ? parseFloat(resPerfil.data.tarologo_profile.saldo_disponivel).toFixed(2).replace('.', ',') 
          : "0,00";

        setEstatisticas({
          saldo: saldoFormatado,
          tiragens: resPerfil.data.total_tiragens || 0,
          consulentes: resPerfil.data.total_clientes || 0,
          nota: resPerfil.data.tarologo_profile?.nota_media || "5.0"
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
        const pedidosAguardando = resFila.data.filter(s => s.status_sessao === 'aguardando_guia');
        setFilaExpressa(pedidosAguardando);
      } catch (error) {
        console.error("Erro ao buscar a fila expressa:", error);
      }
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
    } catch (error) {
      alert("Houve um erro ao aceitar a sessão. Outro guia já pode ter assumido.");
    }
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoFile(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleAtualizarVitrine = async (e) => {
    e.preventDefault();
    setSalvando(true);

    const formData = new FormData();
    if (fotoFile) formData.append('foto_perfil', fotoFile);
    formData.append('especialidade', perfil.especialidade);
    formData.append('biografia', perfil.biografia);

    try {
      const response = await api.patch('/users/me/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.foto_perfil) {
        localStorage.setItem('user_foto', response.data.foto_perfil);
      }
      alert("Vitrine atualizada com sucesso!");
    } catch (error) {
      alert("Erro ao atualizar o perfil.");
    } finally {
      setSalvando(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const extrairEnergia = (textoContexto) => {
    if (!textoContexto) return "Não informada";
    const match = textoContexto.match(/\[Energia do Consulente:\s*(.*?)\]/);
    return match ? match[1] : "Não informada";
  };

  const extrairContextoLimpo = (textoContexto) => {
    if (!textoContexto) return "";
    return textoContexto.replace(/\[Energia do Consulente:.*?\][\r\n\s]*/g, '').trim();
  };

  return (
    <div className={`app-container ${abaAtiva === 'Sessões Ativas' ? 'app-modo-chat' : ''}`} style={styles.appContainer}>
      
      {/* NOVO: OVERLAY ESCURO PARA O MENU MOBILE */}
      <div className={`menu-overlay ${menuAberto ? 'aberto' : ''}`} onClick={() => setMenuAberto(false)}></div>

      <aside className={`sidebar-dashboard ${menuAberto ? 'aberto' : ''}`} style={styles.sidebar}>
        <div style={styles.logoContainer}>
          <Moon size={28} color="#D4AF37" />
          <h2 style={styles.logoText}>Arkanum Pro</h2>
        </div>

        <nav style={styles.navMenu}>
          <p style={styles.navLabel}>MEU TRABALHO</p>
          <NavItem icon={<Zap size={20} />} label="Fila Expressa" ativo={abaAtiva === "Fila Expressa"} onClick={() => mudarAba("Fila Expressa")} />
          <NavItem icon={<MessageCircle size={20} />} label="Sessões Ativas" ativo={abaAtiva === "Sessões Ativas"} onClick={() => mudarAba("Sessões Ativas")} />
          <NavItem icon={<CalendarDays size={20} />} label="Minha Agenda" ativo={abaAtiva === "Minha Agenda"} onClick={() => mudarAba("Minha Agenda")} />
          
          <div style={{ marginTop: '16px' }}></div>
          <p style={styles.navLabel}>ADMINISTRAÇÃO</p>
          <NavItem icon={<TrendingUp size={20} />} label="Finanças & Metas" ativo={abaAtiva === "Finanças"} onClick={() => mudarAba("Finanças")} />
          <NavItem icon={<Settings size={20} />} label="Meu Perfil" ativo={abaAtiva === "Meu Perfil"} onClick={() => mudarAba("Meu Perfil")} />
          
          <div onClick={handleLogout} style={{ ...styles.navItem, marginTop: '20px', color: '#ef4444' }}>
            <div style={{ display: "flex", alignItems: "center" }}><LogOut size={20} /></div>
            <span style={{ fontSize: "14px", fontWeight: "600" }}>Sair da Conta</span>
          </div>
        </nav>

        <div style={{ marginTop: "auto" }}>
          <div style={styles.planCard}>
            <div style={styles.planHeader}>
              <Sparkles size={20} color="#D4AF37" />
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
            
            {/* NOVO: AGRUPAMENTO DO HAMBURGUER */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <button className="menu-hamburger" onClick={() => setMenuAberto(true)} style={{ background: 'none', border: 'none', padding: 0 }}>
                 <Menu size={28} color="#D4AF37" />
               </button>
               <h1 className="breadcrumb-desktop page-title" style={{...styles.pageTitle, margin: 0}}>{abaAtiva}</h1>
               <h2 className="mobile-title" style={{ color: '#D4AF37', fontSize: '20px', fontStyle: 'italic', fontFamily: "'Playfair Display', serif", margin: 0 }}>
                  Arkanum Pro
               </h2>
            </div>

            <div className="header-actions" style={styles.headerActions}>
              <button style={styles.iconBtn}><Bell size={20} color="#EAE0C8" /></button>
              <button onClick={() => mudarAba("Meu Perfil")} style={styles.userProfileBtn}>
                <div style={styles.userAvatar}>{iniciais}</div>
                <span style={styles.userName}>{nomeUsuario}</span>
                <ChevronDown size={14} color="#786C63" />
              </button>
            </div>
          </header>
        )}

        {abaAtiva === "Fila Expressa" && (
          <div style={styles.sectionContainer}>
            <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <p style={{ color: '#A89C92', fontSize: '15px' }}>Atendimentos aguardando um oraculista disponível.</p>
              <div style={styles.onlineStatusBadge}><div style={styles.dotOnline}></div> Você está Online</div>
            </div>
            
            {loading ? (
               <div style={{display: 'flex', justifyContent: 'center', padding: '60px'}}><Loader2 size={32} color="#D4AF37" style={{ animation: "spin 1s linear infinite" }} /></div>
            ) : filaExpressa.length === 0 ? (
               <div style={styles.emptyFilaBox}>
                 <Search size={32} color="#3A322C" style={{marginBottom: '12px'}}/>
                 <p style={{color: '#A89C92'}}>Nenhum pedido na fila expressa no momento.<br/>O universo está tranquilo.</p>
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
                        <span style={styles.labelCurta}>A Questão do Consulente:</span>
                        <p style={styles.pedidoPergunta}>"{pedido.pergunta_principal}"</p>
                      </div>
                      {extrairContextoLimpo(pedido.contexto) && (
                        <div style={styles.contextoBox}>
                          <span style={styles.labelCurta}>Contexto Adicional:</span>
                          <p style={styles.pedidoContexto}>{extrairContextoLimpo(pedido.contexto)}</p>
                        </div>
                      )}
                    </div>
                    <button onClick={() => aceitarPedido(pedido.id)} style={styles.btnAceitar}><Check size={16} /> Iniciar Leitura</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {abaAtiva === "Sessões Ativas" && (
           <Mensagens customStyle={{ margin: 0, height: '100%', borderTop: 'none' }} onVoltarParaPainel={() => mudarAba('Fila Expressa')} />
        )}

        {abaAtiva === "Minha Agenda" && <AgendaTarologo />}
        {abaAtiva === "Finanças" && <FinancasTarologo estatisticas={estatisticas} />}

        {abaAtiva === "Meu Perfil" && (
          <div className="grid-mobile" style={styles.profileContainer}>
            <div style={styles.cardSettings}>
              <h3 style={styles.sectionTitle}>Dados de Acesso</h3>
              <p style={{ color: "#A89C92", fontSize: "13px", marginBottom: "24px" }}>Estes dados são protegidos e usados para faturamento e login.</p>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nome Completo</label>
                <div style={styles.inputWrapperDisabled}>
                  <Lock size={16} color="#786C63" style={styles.inputIcon} />
                  <input type="text" value={nomeUsuario} disabled style={styles.inputDisabled} />
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>E-mail Cadastrado</label>
                <div style={styles.inputWrapperDisabled}>
                  <Lock size={16} color="#786C63" style={styles.inputIcon} />
                  <input type="email" value={emailUsuario} disabled style={styles.inputDisabled} />
                </div>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid #2A2420', margin: '24px 0' }} />
              <h3 style={styles.sectionTitle}>Vitrine do Guia (Público)</h3>
              <form onSubmit={handleAtualizarVitrine} style={styles.form}>
                <div className="header" style={styles.avatarContainer}>
                  <div style={styles.avatarWrapper} onClick={() => fileInputRef.current.click()}>
                    {fotoPreview ? <img src={fotoPreview} alt="Sua foto de perfil" style={styles.avatarImage} /> : <div style={styles.avatarPlaceholder}><Camera size={32} color="#786C63" /></div>}
                    <div style={styles.avatarOverlay}><Camera size={24} color="#FDFBF7" /></div>
                  </div>
                  <div style={styles.avatarText}>
                    <h4 style={styles.avatarTitle}>Foto do Perfil Público</h4>
                    <p style={styles.avatarSubtitle}>Use uma foto que transmita acolhimento.</p>
                  </div>
                  <input type="file" accept="image/png, image/jpeg" ref={fileInputRef} onChange={handleFotoChange} style={{ display: 'none' }} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Especialidade Principal</label>
                  <input type="text" value={perfil.especialidade} onChange={(e) => setPerfil({...perfil, especialidade: e.target.value})} style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Biografia e Metodologia</label>
                  <textarea value={perfil.biografia} onChange={(e) => setPerfil({...perfil, biografia: e.target.value})} placeholder="Conte aos consulentes..." style={styles.textarea}></textarea>
                </div>
                <button type="submit" style={styles.btnSalvar} disabled={salvando}>{salvando ? "Atualizando..." : "Atualizar Vitrine"}</button>
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
    <span style={{ ...styles.navItemText, color: ativo ? '#FDFBF7' : '#A89C92' }}>{label}</span>
  </div>
);

const styles = {
  appContainer: { display: "flex", height: "100vh", backgroundColor: "#110F0E", fontFamily: "'Inter', sans-serif" },
  sidebar: { display: "flex", flexDirection: "column", width: "260px", backgroundColor: "#151312", borderRight: "1px solid #2A2420", padding: "32px 20px" },
  logoContainer: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "40px" },
  logoText: { fontSize: "22px", color: "#D4AF37", fontFamily: "'Playfair Display', serif", fontStyle: "italic" },
  navMenu: { display: "flex", flexDirection: "column", gap: "4px" },
  navLabel: { fontSize: "11px", fontWeight: "700", color: "#786C63", letterSpacing: "1px", marginBottom: "12px", paddingLeft: "10px" },
  navItem: { display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "8px", cursor: "pointer", transition: "0.2s" },
  navItemAtivo: { backgroundColor: "#1A1715", borderLeft: "3px solid #D4AF37" },
  navItemText: { fontSize: "14px", fontWeight: "500" },
  
  mainContent: { flex: 1, overflowY: "auto", backgroundColor: "#110F0E" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", borderBottom: "1px solid #1A1715", paddingBottom: "24px" },
  pageTitle: { fontSize: "28px", color: "#FDFBF7", fontFamily: "'Playfair Display', serif" },
  headerActions: { display: "flex", gap: "16px", alignItems: "center" },
  iconBtn: { padding: "10px", backgroundColor: "#151312", border: "1px solid #2A2420", borderRadius: "8px", cursor: "pointer" },
  userProfileBtn: { display: "flex", alignItems: "center", gap: "10px", padding: "6px 12px", backgroundColor: "#1A1715", border: "1px solid #2A2420", borderRadius: "30px", cursor: "pointer" },
  userAvatar: { width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "#D4AF37", color: "#151312", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700" },
  userName: { color: "#FDFBF7", fontSize: "14px", fontWeight: "500", marginRight: "4px" },

  sectionContainer: { marginTop: "0" },
  sectionTitle: { color: "#FDFBF7", fontSize: "20px", fontFamily: "'Playfair Display', serif", marginBottom: "20px" },
  emptyFilaBox: { backgroundColor: '#151312', border: '1px dashed #2A2420', borderRadius: '12px', padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  onlineStatusBadge: { display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '13px', fontWeight: '500', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: '20px' },
  dotOnline: { width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px rgba(16,185,129,0.5)' },

  filaGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "24px" },
  pedidoCard: { backgroundColor: "#151312", border: "1px solid #2A2420", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", transition: "transform 0.2s, box-shadow 0.2s", ":hover": { transform: "translateY(-2px)", boxShadow: "0 10px 25px rgba(0,0,0,0.3)" } },
  pedidoHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  pedidoPriceBadge: { backgroundColor: "rgba(212, 175, 55, 0.1)", color: "#D4AF37", padding: "6px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: "700", border: "1px solid rgba(212, 175, 55, 0.2)" },
  pedidoTempo: { display: "flex", alignItems: "center", gap: "6px", color: "#786C63", fontSize: "12px", fontWeight: "500" },
  pedidoUserSection: { marginBottom: "16px" },
  pedidoConsulente: { color: "#FDFBF7", fontSize: "22px", fontFamily: "'Playfair Display', serif", marginBottom: "8px", textTransform: "capitalize" },
  tagEnergia: { display: "inline-flex", alignItems: "center", gap: "6px", color: "#EAE0C8", fontSize: "13px", fontStyle: "italic" },
  pedidoDivider: { border: "none", borderTop: "1px dashed #2A2420", margin: "0 0 20px 0" },
  pedidoContentSection: { display: "flex", flexDirection: "column", gap: "16px", flex: 1, marginBottom: "24px" },
  duvidaBox: { borderLeft: "3px solid #D4AF37", paddingLeft: "16px" },
  contextoBox: { borderLeft: "3px solid #3A322C", paddingLeft: "16px" },
  labelCurta: { color: "#786C63", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px", display: "block", fontWeight: "600" },
  pedidoPergunta: { color: "#D4AF37", fontSize: "16px", fontStyle: "italic", lineHeight: "1.5", wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap', margin: 0 },
  pedidoContexto: { color: "#A89C92", fontSize: "13px", lineHeight: "1.6", wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap', margin: 0 },
  btnAceitar: { width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px", backgroundColor: "#D4AF37", color: "#151312", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", cursor: "pointer", transition: "opacity 0.2s" },

  profileContainer: { maxWidth: "600px", margin: "0 auto" },
  cardSettings: { backgroundColor: "#1A1715", border: "1px solid #2A2420", borderRadius: "12px", padding: "32px" },
  form: { display: "flex", flexDirection: "column", gap: "24px" },
  formGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { color: "#A89C92", fontSize: "13px", fontWeight: "500" },
  avatarContainer: { display: "flex", alignItems: "center", gap: "20px", paddingBottom: "20px" },
  avatarWrapper: { position: "relative", width: "80px", height: "80px", borderRadius: "50%", cursor: "pointer", overflow: "hidden", border: "2px solid #3A322C", backgroundColor: "#110F0E" },
  avatarImage: { width: "100%", height: "100%", objectFit: "cover" },
  avatarPlaceholder: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" },
  avatarOverlay: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(21, 19, 18, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s", '&:hover': { opacity: 1 } },
  avatarText: { display: "flex", flexDirection: "column", gap: "4px" },
  avatarTitle: { color: "#FDFBF7", fontSize: "14px", fontWeight: "600" },
  avatarSubtitle: { color: "#786C63", fontSize: "12px" },

  inputWrapperDisabled: { position: "relative", display: "flex", alignItems: "center", backgroundColor: "#110F0E", borderRadius: "8px" },
  inputIcon: { position: "absolute", left: "14px" },
  inputDisabled: { width: "100%", padding: "14px 14px 14px 40px", backgroundColor: "transparent", border: "1px solid #2A2420", borderRadius: "8px", color: "#786C63", fontSize: "14px", cursor: "not-allowed" },
  input: { width: "100%", padding: "14px", backgroundColor: "#110F0E", border: "1px solid #3A322C", borderRadius: "8px", color: "#EAE0C8", fontSize: "14px", outline: "none", boxSizing: "border-box" },
  textarea: { width: "100%", height: "120px", padding: "14px", backgroundColor: "#110F0E", border: "1px solid #3A322C", borderRadius: "8px", color: "#EAE0C8", fontSize: "14px", outline: "none", resize: "none", boxSizing: "border-box" },
  btnSalvar: { padding: "14px", backgroundColor: "#D4AF37", color: "#151312", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "700", cursor: "pointer", marginTop: "8px" },

  planCard: { backgroundColor: "#1A1715", border: "1px solid #3A322C", borderRadius: "8px", padding: "16px" },
  planHeader: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" },
  planTitle: { color: "#FDFBF7", fontSize: "14px", fontWeight: "600" },
  planDesc: { color: "#A89C92", marginBottom: "12px", marginLeft: "28px", fontSize: "12px" },
  planBtn: { width: "100%", padding: "8px", backgroundColor: "#D4AF37", border: "none", color: "#110F0E", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }
};