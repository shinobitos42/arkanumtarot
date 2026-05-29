import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, Calendar, Star, MessageCircle, ShieldCheck, 
  Moon, ChevronRight, Bot, Sparkles, 
  LayoutDashboard, History, Bell, 
  Zap, CalendarPlus, ChevronDown, LogOut, HelpCircle, Heart, Briefcase, Compass
} from "lucide-react";

import api from "../services/api";

import TiragemExpressa from "./TiragemExpressa";
import PerfilTarologo from "./PerfilTarologo";
import PerfilUsuario from "./PerfilUsuario";
import TiragensAgendadas from "./TiragensAgendadas";
import Mensagens from "./Mensagens";
import RegistrosAkashicos from "./RegistrosAkashicos";
import Suporte from "./Suporte";

const DashboardTarot = () => {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  
  // SALVA A ABA NO NAVEGADOR PARA SOBREVIVER AO F5
  const [abaAtiva, setAbaAtiva] = useState(localStorage.getItem('aba_ativa_consulente') || "Visão Geral");
  
  const [tarologoSelecionado, setTarologoSelecionado] = useState(null);
  const [nomeUsuario] = useState(localStorage.getItem('user_name') || 'Viajante');
  const [tarologos, setTarologos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [nomePlano, setNomePlano] = useState("Poeira Estelar"); // Padrão

  useEffect(() => {
    // Busca dados dos tarólogos e o plano atual do usuário em paralelo
    const carregarDados = async () => {
      try {
        const [resTarologos, resPerfil] = await Promise.all([
            api.get('users/tarologos/'),
            api.get('users/me/')
        ]);
        
        setTarologos(resTarologos.data);
        
        // Pega o plano do backend
        if (resPerfil.data.nome_plano_atual) {
            setNomePlano(resPerfil.data.nome_plano_atual);
        }
      } catch (error) {
        console.error("Erro ao carregar o dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    
    carregarDados();
  }, []);

  const mudarAba = (aba) => {
    setAbaAtiva(aba);
    localStorage.setItem('aba_ativa_consulente', aba); 
    setTarologoSelecionado(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const renderAvatarVitrine = (guia) => {
    if (guia.foto_perfil) {
      return <img src={guia.foto_perfil} alt={guia.user?.first_name} style={styles.guiaImage} />;
    }
    const inicial = guia.user?.first_name ? guia.user.first_name.charAt(0).toUpperCase() : "G";
    return (
      <div style={styles.fallbackGuiaAvatar}>
        {inicial}
      </div>
    );
  };

  return (
    <div className="app-container" style={styles.appContainer}>
      
      <aside style={styles.sidebar}>
        <div style={styles.logoContainer}>
          <Moon size={28} color="#D4AF37" />
          <h2 style={styles.logoText}>Arcanum</h2>
        </div>

        <button onClick={() => mudarAba("Tiragem Expressa")} style={styles.btnAgendarSidebar}>
          <CalendarPlus size={18} />
          AGENDAR TIRAGEM
        </button>

        <nav style={styles.navMenu}>
          <p style={styles.navLabel}>SUA JORNADA</p>
          <NavItem icon={<LayoutDashboard size={20} />} label="Visão Geral" ativo={abaAtiva === "Visão Geral" && !tarologoSelecionado} onClick={() => mudarAba("Visão Geral")} />
          <NavItem icon={<Zap size={20} />} label="Tiragem Expressa" ativo={abaAtiva === "Tiragem Expressa"} onClick={() => mudarAba("Tiragem Expressa")} />
          <NavItem icon={<Calendar size={20} />} label="Tiragens Agendadas" ativo={abaAtiva === "Tiragens Agendadas"} onClick={() => mudarAba("Tiragens Agendadas")} />
          <NavItem icon={<MessageCircle size={20} />} label="Mensagens" ativo={abaAtiva === "Mensagens"} onClick={() => mudarAba("Mensagens")} />
          <NavItem icon={<History size={20} />} label="Registros Akáshicos" ativo={abaAtiva === "Registros Akáshicos"} onClick={() => mudarAba("Registros Akáshicos")} />
          
          <div style={{ marginTop: '16px' }}></div>
          <p style={styles.navLabel}>SANTUÁRIO</p>
          <NavItem icon={<HelpCircle size={20} />} label="Ajuda e Suporte" ativo={abaAtiva === "Ajuda e Suporte"} onClick={() => mudarAba("Ajuda e Suporte")} />

          <div onClick={handleLogout} style={{ ...styles.navItem, marginTop: '8px', color: '#ef4444' }}>
            <div style={{ display: "flex", alignItems: "center" }}><LogOut size={20} /></div>
            <span style={{ fontSize: "14px", fontWeight: "600" }}>Sair da Conta</span>
          </div>
        </nav>

        {/* CARD DE ASSINATURA NA SIDEBAR DO CONSULENTE */}
        <div style={{ marginTop: "auto" }}>
          <div style={styles.planCard}>
            <div style={styles.planHeader}>
              <ShieldCheck size={20} color="#D4AF37" />
              <span style={styles.planTitle}>{nomePlano}</span>
            </div>
            <p style={styles.planDesc}>Plano Atual</p>
            <button onClick={() => navigate("/planos")} style={styles.planBtn}>
              Gerenciar Planos
            </button>
          </div>
        </div>
      </aside>

      <main style={styles.mainContent}>
        <header style={styles.header}>
          <div style={styles.breadcrumb}>
            <span style={styles.breadcrumbLink}>Arcanum</span>
            <span style={styles.breadcrumbSeparator}>/</span>
            <span style={styles.breadcrumbActive}>
              {tarologoSelecionado ? "Perfil do Guia" : abaAtiva}
            </span>
          </div>

          <div style={styles.headerActions}>
            <div style={styles.searchContainer}>
              <Search size={16} color="#786C63" style={styles.searchIcon} />
              <input type="text" placeholder="Buscar guias, especialidades..." style={styles.searchInput} value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>
            <button style={styles.iconBtn}><Bell size={20} color="#EAE0C8" /></button>
            <button onClick={() => mudarAba("Minha Conta")} style={styles.userProfileBtn}>
              <div style={styles.userAvatar}>{nomeUsuario.charAt(0).toUpperCase()}</div>
              <span style={styles.userName}>{nomeUsuario}</span>
              <ChevronDown size={14} color="#786C63" />
            </button>
          </div>
        </header>

        {tarologoSelecionado ? (
          <PerfilTarologo tarologo={tarologoSelecionado} onVoltar={() => setTarologoSelecionado(null)} />
        ) : (
          <>
            {abaAtiva === "Visão Geral" && (
              <>
                <div style={{ marginBottom: "40px" }}>
                  <h1 style={styles.pageTitle}>A clareza te espera, {nomeUsuario}.</h1>
                  <p style={styles.pageSubtitle}>Onde você precisa de iluminação hoje?</p>
                </div>

                <div style={styles.intentionsGrid}>
                  <div style={styles.areaCardsContainer}>
                    <div onClick={() => mudarAba("Tiragem Expressa")} style={styles.areaCard}>
                      <div style={{...styles.areaIconBox, backgroundColor: "rgba(239, 68, 68, 0.1)"}}>
                        <Heart size={24} color="#ef4444" />
                      </div>
                      <h4 style={styles.areaTitle}>Amor & Relações</h4>
                      <p style={styles.areaDesc}>Desvende os laços do coração.</p>
                    </div>

                    <div onClick={() => mudarAba("Tiragem Expressa")} style={styles.areaCard}>
                      <div style={{...styles.areaIconBox, backgroundColor: "rgba(59, 130, 246, 0.1)"}}>
                        <Briefcase size={24} color="#3b82f6" />
                      </div>
                      <h4 style={styles.areaTitle}>Carreira & Finanças</h4>
                      <p style={styles.areaDesc}>Direcionamento profissional.</p>
                    </div>

                    <div onClick={() => mudarAba("Tiragem Expressa")} style={styles.areaCard}>
                      <div style={{...styles.areaIconBox, backgroundColor: "rgba(168, 85, 247, 0.1)"}}>
                        <Compass size={24} color="#a855f7" />
                      </div>
                      <h4 style={styles.areaTitle}>Destino & Karma</h4>
                      <p style={styles.areaDesc}>Seu propósito espiritual.</p>
                    </div>
                  </div>

                  <div style={styles.iaBanner}>
                    <div style={styles.iaBannerContent}>
                      <div style={styles.iaIconWrapper}>
                        <Bot size={28} color="#151312" />
                      </div>
                      <div>
                        <h3 style={styles.iaTitle}>Concierge Arcanum</h3>
                        <p style={styles.iaDesc}>Nossa IA analisa seu momento e ajuda a encontrar o oraculista ideal para sua energia atual.</p>
                      </div>
                      <button style={styles.btnPrimary}><Sparkles size={16} /> Encontrar Meu Guia</button>
                    </div>
                  </div>
                </div>

                <div style={styles.listSection}>
                  <div style={styles.listHeader}>
                    <h3 style={styles.sectionTitle}>Guias Espirituais em Destaque</h3>
                    <button style={styles.linkBtn}>Ver o Círculo Completo <ChevronRight size={16} /></button>
                  </div>

                  {loading ? (
                    <p style={{ color: '#A89C92' }}>Invocando dados dos guias...</p>
                  ) : tarologos.length === 0 ? (
                    <p style={{ color: '#A89C92' }}>Nenhum guia cadastrado no momento. O círculo está se formando.</p>
                  ) : (
                    <div style={styles.tarologosGrid}>
                      {tarologos.map((guia) => (
                        <div key={guia.id} onClick={() => setTarologoSelecionado(guia)} style={styles.guiaCard}>
                          
                          <div style={styles.guiaImageWrapper}>
                            {renderAvatarVitrine(guia)}
                            <div style={styles.guiaImageGradient}></div>
                            <div style={styles.ratingBadgeTop}>
                              <Star size={12} fill="#D4AF37" color="#D4AF37" /> {guia.nota_media}
                            </div>
                          </div>
                          
                          <div style={styles.guiaInfo}>
                            <p style={styles.guiaSpec}>{guia.especialidade}</p>
                            <h4 style={styles.guiaNameGrid}>{guia.user?.first_name}</h4>
                            <div style={styles.guiaFooter}>
                              <p style={styles.guiaPrice}>R$ {guia.valor_consulta}</p>
                              <button style={styles.btnOutlineSmall}>Perfil</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {abaAtiva === "Tiragem Expressa" && <TiragemExpressa />}
            {abaAtiva === "Minha Conta" && <PerfilUsuario />}
            {abaAtiva === "Tiragens Agendadas" && <TiragensAgendadas mudarAba={mudarAba} />}
            {abaAtiva === "Mensagens" && <Mensagens />}
            {abaAtiva === "Registros Akáshicos" && <RegistrosAkashicos />}
            {abaAtiva === "Ajuda e Suporte" && <Suporte />} 
          </>
        )}
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, ativo, onClick }) => (
  <div onClick={onClick} style={{ ...styles.navItem, ...(ativo ? styles.navItemAtivo : {}) }}>
    <div style={{ color: ativo ? "#D4AF37" : "#786C63", display: "flex", alignItems: "center" }}>
      {icon}
    </div>
    <span style={{ ...styles.navItemText, color: ativo ? "#FDFBF7" : "#A89C92" }}>{label}</span>
  </div>
);

const styles = {
  appContainer: { display: "flex", height: "100vh", backgroundColor: "#110F0E", fontFamily: "'Inter', sans-serif", overflow: "hidden" },
  sidebar: { width: "280px", backgroundColor: "#151312", borderRight: "1px solid #2A2420", padding: "32px 24px", display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box", overflowY: "auto" },
  logoContainer: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px", padding: "0 8px" },
  logoText: { fontSize: "24px", color: "#D4AF37", fontStyle: "italic", fontFamily: "'Playfair Display', serif" },
  btnAgendarSidebar: { width: "100%", padding: "14px", backgroundColor: "#D4AF37", color: "#151312", border: "none", borderRadius: "4px", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "40px" },
  navMenu: { display: "flex", flexDirection: "column", gap: "4px" },
  navLabel: { fontSize: "11px", color: "#786C63", marginBottom: "12px", paddingLeft: "10px", textTransform: "uppercase" },
  navItem: { display: "flex", alignItems: "center", gap: "14px", padding: "12px 16px", borderRadius: "6px", cursor: "pointer", borderLeft: "3px solid transparent", transition: "all 0.2s" },
  navItemAtivo: { backgroundColor: "#1A1715", borderLeft: "3px solid #D4AF37" },
  navItemText: { fontSize: "14px" },
  mainContent: { flex: 1, padding: "32px 60px", overflowY: "auto", backgroundColor: "#110F0E" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", paddingBottom: "24px", borderBottom: "1px solid #1A1715" },
  breadcrumb: { display: "flex", alignItems: "center", gap: "8px" },
  breadcrumbLink: { color: "#786C63" },
  breadcrumbSeparator: { color: "#3A322C" },
  breadcrumbActive: { color: "#D4AF37" },
  headerActions: { display: "flex", gap: "16px", alignItems: "center" },
  searchContainer: { position: "relative", width: "280px" },
  searchIcon: { position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" },
  searchInput: { width: "100%", padding: "10px 14px 10px 40px", backgroundColor: "#151312", border: "1px solid #2A2420", borderRadius: "6px", color: "#EAE0C8", outline: "none" },
  iconBtn: { padding: "10px", backgroundColor: "#151312", border: "1px solid #2A2420", borderRadius: "6px", cursor: "pointer" },
  userProfileBtn: { display: "flex", alignItems: "center", gap: "10px", padding: "6px 12px", backgroundColor: "#1A1715", border: "1px solid #2A2420", borderRadius: "30px", cursor: "pointer" },
  userAvatar: { width: "26px", height: "26px", borderRadius: "50%", backgroundColor: "#D4AF37", color: "#151312", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700" },
  userName: { color: "#FDFBF7", fontSize: "13px" },
  pageTitle: { fontSize: "32px", color: "#FDFBF7", fontFamily: "'Playfair Display', serif" },
  pageSubtitle: { fontSize: "15px", color: "#A89C92" },
  
  intentionsGrid: { display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px", marginBottom: "48px" },
  areaCardsContainer: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px" },
  areaCard: { backgroundColor: "#1A1715", border: "1px solid #2A2420", borderRadius: "12px", padding: "24px", cursor: "pointer", transition: "border-color 0.2s, transform 0.2s", ":hover": { borderColor: "#D4AF37", transform: "translateY(-2px)" } },
  areaIconBox: { width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" },
  areaTitle: { color: "#FDFBF7", fontSize: "15px", fontWeight: "500", marginBottom: "8px" },
  areaDesc: { color: "#786C63", fontSize: "12px", lineHeight: "1.5" },

  iaBanner: { background: "linear-gradient(135deg, #151312 0%, #1A1715 100%)", border: "1px solid #2A2420", borderRadius: "12px", padding: "32px", display: "flex", alignItems: "center" },
  iaBannerContent: { display: "flex", flexDirection: "column", gap: "20px" },
  iaIconWrapper: { backgroundColor: "#D4AF37", padding: "12px", borderRadius: "8px", width: "fit-content" },
  iaTitle: { color: "#D4AF37", fontFamily: "'Playfair Display', serif", fontSize: "20px" },
  iaDesc: { color: "#A89C92", lineHeight: "1.6", fontSize: "14px" },
  btnPrimary: { display: "flex", alignItems: "center", gap: "8px", padding: "12px 20px", backgroundColor: "#D4AF37", color: "#151312", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" },
  
  listSection: { marginTop: "10px" },
  listHeader: { display: "flex", justifyContent: "space-between", marginBottom: "24px" },
  sectionTitle: { color: "#FDFBF7", fontFamily: "'Playfair Display', serif", fontSize: "22px" },
  linkBtn: { display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", color: "#D4AF37", cursor: "pointer", fontSize: "13px" },
  tarologosGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "24px" },
  guiaCard: { backgroundColor: "#151312", borderRadius: "12px", border: "1px solid #2A2420", overflow: "hidden", cursor: "pointer" },
  guiaImageWrapper: { position: "relative", height: "220px", backgroundColor: "#1A1715" },
  guiaImage: { width: "100%", height: "100%", objectFit: "cover" },
  fallbackGuiaAvatar: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "64px", fontWeight: "normal", color: "#D4AF37", fontFamily: "'Playfair Display', serif" },
  guiaImageGradient: { position: "absolute", bottom: 0, left: 0, right: 0, height: "100%", background: "linear-gradient(to top, #151312 0%, transparent 70%)" },
  ratingBadgeTop: { position: "absolute", top: "12px", right: "12px", display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#EAE0C8", backgroundColor: "rgba(21,19,18,0.8)", padding: "4px 8px", borderRadius: "4px" },
  guiaInfo: { padding: "0 20px 20px 20px", marginTop: "-30px", position: "relative", zIndex: 2 },
  guiaSpec: { fontSize: "10px", color: "#D4AF37", textTransform: "uppercase", marginBottom: "4px" },
  guiaNameGrid: { fontSize: "20px", color: "#FDFBF7", marginBottom: "16px", fontFamily: "'Playfair Display', serif" },
  guiaFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #2A2420", paddingTop: "16px" },
  guiaPrice: { color: "#EAE0C8" },
  btnOutlineSmall: { padding: "6px 12px", backgroundColor: "transparent", border: "1px solid #3A322C", color: "#A89C92", borderRadius: "4px", cursor: "pointer" },
  planCard: { backgroundColor: "#1A1715", border: "1px solid #3A322C", borderRadius: "8px", padding: "16px" },
  planHeader: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" },
  planTitle: { color: "#FDFBF7", fontSize: "14px", fontWeight: "600" },
  planDesc: { color: "#A89C92", marginBottom: "12px", marginLeft: "28px", fontSize: "12px" },
  planBtn: { width: "100%", padding: "8px", backgroundColor: "#D4AF37", border: "none", color: "#110F0E", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }
};

export default DashboardTarot;