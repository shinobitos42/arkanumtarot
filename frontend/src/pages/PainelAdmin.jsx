import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShieldAlert, Users, CreditCard, Activity, DollarSign, 
  CheckCircle, XCircle, Search, Menu, ChevronDown, Moon, 
  LogOut, Wallet, FileText
} from "lucide-react";
import api from "../services/api";

export default function PainelAdmin() {
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState("Visão Geral");
  const [menuAberto, setMenuAberto] = useState(false);

  // Estados dos Dados do Admin
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_consulentes: 0,
    total_tarologos: 0,
    sessoes_realizadas: 0,
    assinaturas_ativas: 0,
    faturamento_bruto: "0.00"
  });
  
  const [saquesPendentes, setSaquesPendentes] = useState([]);

  useEffect(() => {
    // Busca os dados do painel Admin no backend
    const carregarDadosAdmin = async () => {
      try {
        const response = await api.get('admin/dashboard/');
        setStats(response.data.stats);
        setSaquesPendentes(response.data.saques_pendentes);
      } catch (error) {
        console.error("Erro ao carregar admin. Verifique se você é superuser:", error);
        // Fallback visual para testes no frontend
        setStats({
          total_consulentes: 142, total_tarologos: 18, sessoes_realizadas: 856, assinaturas_ativas: 45, faturamento_bruto: "12540.00"
        });
        setSaquesPendentes([
          { id: 1, tarologo: "Helena de Oliveira", valor: "150.00", chave_pix: "helena@email.com", data: "29/05/2026" }
        ]);
      } finally {
        setLoading(false);
      }
    };
    carregarDadosAdmin();
  }, []);

  const mudarAba = (aba) => {
    setAbaAtiva(aba);
    setMenuAberto(false);
  };

  const aprovarSaque = async (id) => {
    if(!window.confirm("Confirmar que o PIX foi transferido para a conta do Guia?")) return;
    try {
      await api.post(`admin/saques/${id}/aprovar/`);
      setSaquesPendentes(saquesPendentes.filter(saque => saque.id !== id));
      alert("Saque aprovado e baixado no sistema!");
    } catch (error) {
      alert("Erro ao aprovar saque.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className={`app-container`} style={styles.appContainer}>
      
      <div className={`menu-overlay ${menuAberto ? 'aberto' : ''}`} onClick={() => setMenuAberto(false)}></div>

      <aside className={`sidebar-dashboard ${menuAberto ? 'aberto' : ''}`} style={styles.sidebar}>
        <div style={styles.logoContainer}>
          <ShieldAlert size={28} color="#ef4444" />
          <h2 style={styles.logoText}>Arcanum <span style={{color: '#ef4444'}}>Admin</span></h2>
        </div>

        <nav style={styles.navMenu}>
          <p style={styles.navLabel}>CONTROLE GERAL</p>
          <NavItem icon={<Activity size={20} />} label="Visão Geral" ativo={abaAtiva === "Visão Geral"} onClick={() => mudarAba("Visão Geral")} />
          <NavItem icon={<Wallet size={20} />} label="Gestão de Saques" ativo={abaAtiva === "Saques"} onClick={() => mudarAba("Saques")} />
          <NavItem icon={<Users size={20} />} label="Base de Usuários" ativo={abaAtiva === "Usuários"} onClick={() => mudarAba("Usuários")} />
          <NavItem icon={<FileText size={20} />} label="Auditoria de Tiragens" ativo={abaAtiva === "Tiragens"} onClick={() => mudarAba("Tiragens")} />
          
          <div onClick={handleLogout} style={{ ...styles.navItem, marginTop: 'auto', color: '#ef4444' }}>
            <div style={{ display: "flex", alignItems: "center" }}><LogOut size={20} /></div>
            <span style={{ fontSize: "14px", fontWeight: "600" }}>Sair do Painel</span>
          </div>
        </nav>
      </aside>

      <main className="main-content" style={styles.mainContent}>
        <header className="header-dashboard" style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="menu-hamburger" onClick={() => setMenuAberto(true)} style={{ background: 'none', border: 'none', padding: 0 }}>
              <Menu size={28} color="#ef4444" />
            </button>
            <h1 className="breadcrumb-desktop page-title" style={{...styles.pageTitle, margin: 0}}>{abaAtiva}</h1>
            <h2 className="mobile-title" style={{ color: '#ef4444', fontSize: '20px', fontStyle: 'italic', fontFamily: "'Playfair Display', serif", margin: 0 }}>Arkanum Admin</h2>
          </div>
        </header>

        {loading ? (
          <div style={{color: '#A89C92'}}>Carregando dados da plataforma...</div>
        ) : (
          <>
            {abaAtiva === "Visão Geral" && (
              <div style={styles.dashboardContainer}>
                <div className="grid-mobile" style={styles.statsGrid}>
                  <div style={styles.statCard}>
                    <div style={{...styles.statIcon, backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6'}}><Users size={24} /></div>
                    <div>
                      <p style={styles.statLabel}>Total de Usuários</p>
                      <h3 style={styles.statValue}>{stats.total_consulentes + stats.total_tarologos}</h3>
                    </div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={{...styles.statIcon, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981'}}><CreditCard size={24} /></div>
                    <div>
                      <p style={styles.statLabel}>Assinaturas Ativas</p>
                      <h3 style={styles.statValue}>{stats.assinaturas_ativas}</h3>
                    </div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={{...styles.statIcon, backgroundColor: 'rgba(168, 85, 247, 0.1)', color: '#a855f7'}}><FileText size={24} /></div>
                    <div>
                      <p style={styles.statLabel}>Sessões Realizadas</p>
                      <h3 style={styles.statValue}>{stats.sessoes_realizadas}</h3>
                    </div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={{...styles.statIcon, backgroundColor: 'rgba(212, 175, 55, 0.1)', color: '#D4AF37'}}><DollarSign size={24} /></div>
                    <div>
                      <p style={styles.statLabel}>Faturamento Estimado</p>
                      <h3 style={styles.statValue}>R$ {stats.faturamento_bruto}</h3>
                    </div>
                  </div>
                </div>

                <div style={styles.sectionCard}>
                  <h3 style={styles.sectionTitle}>Últimas Solicitações de Saque</h3>
                  <p style={{color: '#A89C92', fontSize: '14px', marginBottom: '20px'}}>Pague os guias via PIX no seu banco e marque como aprovado aqui.</p>
                  
                  {saquesPendentes.length === 0 ? (
                    <div style={{padding: '40px', textAlign: 'center', backgroundColor: '#151312', borderRadius: '8px', border: '1px dashed #2A2420', color: '#A89C92'}}>
                      Nenhum saque pendente. Todos os guias estão pagos!
                    </div>
                  ) : (
                    <div style={styles.tableWrapper}>
                      <table style={styles.table}>
                        <thead>
                          <tr>
                            <th style={styles.th}>Guia / Oraculista</th>
                            <th style={styles.th}>Chave PIX</th>
                            <th style={styles.th}>Valor</th>
                            <th style={styles.th}>Ação</th>
                          </tr>
                        </thead>
                        <tbody>
                          {saquesPendentes.map(saque => (
                            <tr key={saque.id} style={styles.tr}>
                              <td style={styles.td}>{saque.tarologo}</td>
                              <td style={styles.td}><code style={{backgroundColor: '#110F0E', padding: '4px 8px', borderRadius: '4px', color: '#D4AF37'}}>{saque.chave_pix}</code></td>
                              <td style={{...styles.td, fontWeight: '700', color: '#10b981'}}>R$ {saque.valor}</td>
                              <td style={styles.td}>
                                <button onClick={() => aprovarSaque(saque.id)} style={styles.btnAprovar}>
                                  <CheckCircle size={16} /> Aprovar Pagamento
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {abaAtiva === "Saques" && (
              <div style={styles.sectionCard}>
                <h3 style={styles.sectionTitle}>Painel de Pagamento aos Guias</h3>
                <p style={{color: '#A89C92', marginBottom: '20px'}}>Aqui você tem o controle total do dinheiro que sai da plataforma.</p>
                {/* Você pode expandir esta aba depois com histórico de saques já pagos */}
                <div style={{padding: '40px', textAlign: 'center', backgroundColor: '#151312', borderRadius: '8px', color: '#A89C92'}}>
                  Fluxo de caixa sob controle. Visualize as pendências na Visão Geral.
                </div>
              </div>
            )}

            {abaAtiva !== "Visão Geral" && abaAtiva !== "Saques" && (
              <div style={styles.sectionCard}>
                <h3 style={styles.sectionTitle}>{abaAtiva}</h3>
                <p style={{color: '#A89C92'}}>Módulo em construção para os administradores da plataforma.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

const NavItem = ({ icon, label, ativo, onClick }) => (
  <div onClick={onClick} style={{ ...styles.navItem, ...(ativo ? styles.navItemAtivo : {}) }}>
    <div style={{ color: ativo ? '#ef4444' : '#786C63' }}>{icon}</div>
    <span style={{ ...styles.navItemText, color: ativo ? '#FDFBF7' : '#A89C92' }}>{label}</span>
  </div>
);

const styles = {
  appContainer: { display: "flex", height: "100vh", backgroundColor: "#110F0E", fontFamily: "'Inter', sans-serif" },
  sidebar: { display: "flex", flexDirection: "column", width: "260px", backgroundColor: "#151312", borderRight: "1px solid #2A2420", padding: "32px 20px" },
  logoContainer: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "40px" },
  logoText: { fontSize: "22px", color: "#FDFBF7", fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: "normal" },
  navMenu: { display: "flex", flexDirection: "column", gap: "4px", flex: 1 },
  navLabel: { fontSize: "11px", fontWeight: "700", color: "#786C63", letterSpacing: "1px", marginBottom: "12px", paddingLeft: "10px" },
  navItem: { display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "8px", cursor: "pointer", transition: "0.2s" },
  navItemAtivo: { backgroundColor: "#1A1715", borderLeft: "3px solid #ef4444" },
  navItemText: { fontSize: "14px", fontWeight: "500" },
  
  mainContent: { flex: 1, overflowY: "auto", backgroundColor: "#110F0E", padding: "40px 60px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", borderBottom: "1px solid #1A1715", paddingBottom: "24px" },
  pageTitle: { fontSize: "28px", color: "#FDFBF7", fontFamily: "'Playfair Display', serif" },
  
  dashboardContainer: { display: "flex", flexDirection: "column", gap: "32px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px" },
  statCard: { backgroundColor: "#151312", border: "1px solid #2A2420", borderRadius: "12px", padding: "24px", display: "flex", alignItems: "center", gap: "20px" },
  statIcon: { width: "56px", height: "56px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" },
  statLabel: { color: "#A89C92", fontSize: "13px", fontWeight: "500", marginBottom: "4px" },
  statValue: { color: "#FDFBF7", fontSize: "28px", fontFamily: "'Playfair Display', serif", margin: 0 },

  sectionCard: { backgroundColor: "#1A1715", border: "1px solid #2A2420", borderRadius: "12px", padding: "32px" },
  sectionTitle: { color: "#FDFBF7", fontSize: "20px", fontFamily: "'Playfair Display', serif", marginBottom: "8px", fontWeight: "normal" },
  
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  th: { padding: "16px", color: "#786C63", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid #2A2420", fontWeight: "600" },
  tr: { borderBottom: "1px solid #2A2420", transition: "background 0.2s", ":hover": { backgroundColor: "#151312" } },
  td: { padding: "16px", color: "#EAE0C8", fontSize: "14px", verticalAlign: "middle" },
  btnAprovar: { display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "6px", fontSize: "13px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }
};