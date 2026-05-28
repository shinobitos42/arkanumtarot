import React, { useState, useEffect } from "react";
import { BookOpen, Calendar, Search, ChevronRight, Loader2, Lock, Sparkles, Clock, Star, Download, X } from "lucide-react";
import api from "../services/api";
import html2pdf from "html2pdf.js";


export default function RegistrosAkashicos() {
  const [isPremium, setIsPremium] = useState(true);
  
  const [busca, setBusca] = useState("");
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado para controlar qual modal está aberto
  const [registroAberto, setRegistroAberto] = useState(null);

  const [ticker, setTicker] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTicker(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const buscarRegistros = async () => {
      try {
        const response = await api.get('tiragens/sessoes/');
        const sessoesFinalizadas = response.data.filter(s => s.status_sessao === 'finalizada');
        setRegistros(sessoesFinalizadas);
      } catch (error) {
        console.error("Erro ao buscar registros:", error);
      } finally {
        setLoading(false);
      }
    };
    buscarRegistros();
  }, [registroAberto]); // Recarrega se o modal fechar, para atualizar a IA

  const registrosFiltrados = registros.filter(r => 
    r.guia_nome?.toLowerCase().includes(busca.toLowerCase()) || 
    r.tipo_leitura?.toLowerCase().includes(busca.toLowerCase())
  );

  const calcularTempoRestante = (dataLiberacao) => {
    if (!dataLiberacao) return "00:00";
    const liberacao = new Date(dataLiberacao);
    const diferenca = liberacao - new Date();
    if (diferenca <= 0) return "00:00";
    
    const minutos = Math.floor((diferenca / 1000 / 60) % 60);
    const segundos = Math.floor((diferenca / 1000) % 60);
    return `${minutos}:${segundos < 10 ? '0' : ''}${segundos}`;
  };

  // FUNÇÃO MÁGICA DO PDF
  const baixarPDF = () => {
    const elemento = document.getElementById('documento-pdf');
    const opt = {
      margin:       10,
      filename:     `Arcanum_Leitura_${registroAberto.guia_nome}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, backgroundColor: '#110F0E' },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(elemento).save();
  };

  return (
    <div style={styles.container}>
      
      <button onClick={() => setIsPremium(!isPremium)} style={styles.devBtn}>
        Modo Dev: {isPremium ? "Premium" : "Gratuito"}
      </button>

      <div style={styles.header}>
        <div style={styles.headerTitleBox}>
          <div style={styles.iconWrapper}>
            <BookOpen size={28} color="#D4AF37" />
          </div>
          <div>
            <h1 style={styles.pageTitle}>Registros Akáshicos</h1>
            <p style={styles.pageSubtitle}>
              O arquivo eterno da sua jornada. Revise as orientações passadas.
            </p>
          </div>
        </div>
        
        <div style={styles.searchBox}>
          <Search size={16} color="#786C63" style={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Buscar por oraculista ou tema..." 
            style={styles.searchInput}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      <div style={styles.listContainer}>
        {loading ? (
          <div style={styles.emptyState}>
            <Loader2 size={32} color="#D4AF37" style={{ animation: "spin 1s linear infinite" }} />
          </div>
        ) : registrosFiltrados.map((registro) => {
          const akashico = registro.registro_akashico || {};
          const aindaProcessando = akashico.processando_ia && new Date(akashico.data_liberacao_resumo) > new Date();

          return (
            <div key={registro.id} style={styles.recordCard}>
              <div style={styles.recordHeader}>
                <div style={styles.guiaInfo}>
                  <img src={registro.guia_img || "https://via.placeholder.com/150"} alt="Guia" style={styles.avatar} />
                  <div>
                    <h4 style={styles.guiaNome}>{registro.guia_nome || "Guia Desconhecido"}</h4>
                    <span style={styles.temaLeitura}>{registro.tipo_leitura}</span>
                  </div>
                </div>
                <div style={styles.dateBadge}>
                  <Calendar size={14} color="#D4AF37" />
                  <span>{new Date(registro.data_criacao).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              <div style={styles.recordBody}>
                <div style={styles.perguntaBox}>
                  <span style={styles.labelCurta}>Sua Pergunta:</span>
                  <p style={styles.perguntaTexto}>"{registro.pergunta_principal}"</p>
                </div>
              </div>

              <div style={styles.resumoContainer}>
                {!isPremium ? (
                  <div style={styles.paywallContent}>
                    <Lock size={32} color="#786C63" style={{ marginBottom: '12px' }} />
                    <h4 style={styles.paywallTitle}>Análise Oculta</h4>
                    <button style={styles.btnPremium}><Sparkles size={16} /> Desbloquear Premium</button>
                  </div>
                ) : aindaProcessando ? (
                  <div style={styles.processingContent}>
                    <Clock size={32} color="#D4AF37" style={{ marginBottom: '16px', animation: 'pulse 2s infinite' }} />
                    <h4 style={styles.processingTitle}>As Moiras estão tecendo...</h4>
                    <div style={styles.timerBox}>
                      Pronto em: <span style={styles.timer}>{calcularTempoRestante(akashico.data_liberacao_resumo)}</span>
                    </div>
                  </div>
                ) : (
                  <div style={styles.resumoPronto}>
                    <Star size={20} color="#D4AF37" fill="#D4AF37" style={{marginBottom: '12px'}} />
                    <p style={styles.resumoText}>{akashico.resumo_leitura}</p>
                  </div>
                )}
              </div>

              <div style={styles.recordFooter}>
                <button onClick={() => setRegistroAberto(registro)} style={styles.btnAbrirRegistro}>
                  Ver Detalhes da Leitura <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* MODAL / TELINHA DO REGISTRO COMPLETO PARA PDF */}
      {registroAberto && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            
            <div style={styles.modalHeaderFixed}>
              <button onClick={baixarPDF} style={styles.btnDownloadPDF}>
                <Download size={18} /> Baixar PDF da Leitura
              </button>
              <button onClick={() => setRegistroAberto(null)} style={styles.btnClose}>
                <X size={24} color="#786C63" />
              </button>
            </div>

            {/* A ÁREA QUE VAI VIRAR O PDF FICA AQUI DENTRO */}
            <div id="documento-pdf" style={styles.pdfArea}>
              
              <div style={{textAlign: 'center', marginBottom: '40px'}}>
                <h1 style={{color: '#D4AF37', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '36px', margin: 0}}>Arcanum</h1>
                <p style={{color: '#786C63', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '12px'}}>Registro Akáshico Oficial</p>
              </div>

              <div style={styles.pdfCabecalho}>
                <div>
                  <p style={{color: '#A89C92', fontSize: '12px'}}>CONSULENTE</p>
                  <h3 style={{color: '#FDFBF7', margin: '4px 0'}}>{registroAberto.consulente_nome}</h3>
                </div>
                <div>
                  <p style={{color: '#A89C92', fontSize: '12px'}}>ORACULISTA GUIA</p>
                  <h3 style={{color: '#FDFBF7', margin: '4px 0'}}>{registroAberto.guia_nome}</h3>
                </div>
                <div>
                  <p style={{color: '#A89C92', fontSize: '12px'}}>DATA DA CONEXÃO</p>
                  <h3 style={{color: '#FDFBF7', margin: '4px 0'}}>{new Date(registroAberto.data_criacao).toLocaleDateString('pt-BR')}</h3>
                </div>
              </div>

              <div style={{marginBottom: '32px', backgroundColor: '#1A1715', padding: '24px', borderRadius: '8px', borderLeft: '4px solid #D4AF37'}}>
                <h4 style={{color: '#D4AF37', margin: '0 0 8px 0'}}>Intenção da Sessão</h4>
                <p style={{color: '#EAE0C8', fontStyle: 'italic', fontSize: '16px', margin: 0}}>"{registroAberto.pergunta_principal}"</p>
              </div>

              {isPremium && registroAberto.registro_akashico && !registroAberto.registro_akashico.processando_ia && (
                <div style={{marginBottom: '40px'}}>
                  <h3 style={{color: '#FDFBF7', borderBottom: '1px solid #3A322C', paddingBottom: '12px', marginBottom: '20px'}}>
                    <Sparkles size={18} color="#D4AF37" style={{marginRight: '8px'}}/> 
                    Análise Espiritual (Gemini AI)
                  </h3>
                  <p style={{color: '#EAE0C8', lineHeight: '1.8', fontSize: '15px'}}>
                    {registroAberto.registro_akashico.resumo_leitura}
                  </p>
                </div>
              )}

              <div style={{marginTop: '40px'}}>
                <h3 style={{color: '#FDFBF7', borderBottom: '1px solid #3A322C', paddingBottom: '12px', marginBottom: '20px'}}>
                  Histórico do Chat
                </h3>
                <p style={{color: '#786C63', fontStyle: 'italic'}}>Para ver as mensagens originais, acesse a aba de Mensagens no painel.</p>
              </div>
              
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const styles = {
  container: { display: "flex", flexDirection: "column", paddingBottom: "40px", position: "relative" },
  devBtn: { position: 'absolute', top: '-10px', right: '0px', padding: '8px 16px', backgroundColor: '#3A322C', color: '#EAE0C8', border: 'none', borderRadius: '4px', cursor: 'pointer', zIndex: 100 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px", flexWrap: "wrap", gap: "20px", marginTop: "20px" },
  headerTitleBox: { display: "flex", alignItems: "center", gap: "20px", maxWidth: "600px" },
  iconWrapper: { width: "64px", height: "64px", borderRadius: "16px", backgroundColor: "rgba(212, 175, 55, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  pageTitle: { fontSize: "32px", fontWeight: "normal", color: "#FDFBF7", fontFamily: "'Playfair Display', serif", fontStyle: "italic", marginBottom: "8px" },
  pageSubtitle: { color: "#A89C92", fontSize: "14px", lineHeight: "1.6" },
  searchBox: { position: "relative", width: "300px" },
  searchIcon: { position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" },
  searchInput: { width: "100%", padding: "12px 14px 12px 40px", backgroundColor: "#151312", border: "1px solid #2A2420", borderRadius: "8px", color: "#EAE0C8", fontSize: "13px", outline: "none", boxSizing: "border-box" },
  listContainer: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: "24px" },
  recordCard: { backgroundColor: "#151312", border: "1px solid #2A2420", borderRadius: "12px", padding: "24px", display: "flex", flexDirection: "column", transition: "border-color 0.2s" },
  recordHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px solid #1A1715" },
  guiaInfo: { display: "flex", alignItems: "center", gap: "12px" },
  avatar: { width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover", border: "1px solid #3A322C" },
  guiaNome: { color: "#FDFBF7", fontSize: "16px", fontFamily: "'Playfair Display', serif", marginBottom: "4px" },
  temaLeitura: { color: "#A89C92", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px" },
  dateBadge: { display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#1A1715", padding: "6px 12px", borderRadius: "20px", color: "#EAE0C8", fontSize: "12px", border: "1px solid #2A2420" },
  recordBody: { flex: 1, marginBottom: "20px" },
  perguntaBox: { backgroundColor: "#1A1715", padding: "16px", borderRadius: "8px", border: "1px solid #2A2420" },
  labelCurta: { color: "#786C63", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "8px" },
  perguntaTexto: { color: "#EAE0C8", fontSize: "14px", fontStyle: "italic", lineHeight: "1.5" },
  resumoContainer: { flex: 1, backgroundColor: '#110F0E', borderRadius: '8px', border: '1px solid #2A2420', overflow: 'hidden', marginBottom: '24px', minHeight: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  paywallContent: { padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  paywallTitle: { color: '#EAE0C8', fontSize: '16px', marginBottom: '8px' },
  btnPremium: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#D4AF37', color: '#151312', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' },
  processingContent: { padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  processingTitle: { color: '#D4AF37', fontSize: '16px', marginBottom: '8px' },
  timerBox: { backgroundColor: '#1A1715', border: '1px solid #3A322C', padding: '8px 16px', borderRadius: '6px', color: '#A89C92', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' },
  timer: { color: '#FDFBF7', fontWeight: '600', fontFamily: 'monospace', fontSize: '15px' },
  resumoPronto: { padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', width: '100%' },
  resumoText: { color: '#EAE0C8', fontSize: '14px', lineHeight: '1.6', fontStyle: 'italic', fontWeight: '300' },
  recordFooter: { display: "flex", justifyContent: "flex-end", marginTop: "auto" },
  btnAbrirRegistro: { display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "#D4AF37", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", cursor: "pointer" },
  
  // ESTILOS DO MODAL
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(17, 15, 14, 0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' },
  modalContent: { backgroundColor: '#151312', width: '100%', maxWidth: '800px', maxHeight: '90vh', borderRadius: '16px', border: '1px solid #2A2420', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' },
  modalHeaderFixed: { padding: '24px', borderBottom: '1px solid #2A2420', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1A1715' },
  btnDownloadPDF: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#D4AF37', color: '#151312', border: 'none', borderRadius: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', transition: 'all 0.2s' },
  btnClose: { background: 'none', border: 'none', cursor: 'pointer', padding: '8px' },
  
  // ESTILOS DA ÁREA DE IMPRESSÃO (O PERGAMINHO EM SI)
  pdfArea: { padding: '40px 60px', overflowY: 'auto', backgroundColor: '#110F0E' },
  pdfCabecalho: { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #3A322C', paddingBottom: '24px', marginBottom: '32px' }
};