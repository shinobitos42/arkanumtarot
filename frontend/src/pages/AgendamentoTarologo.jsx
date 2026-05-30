import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User, Play, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function AgendamentosTarologo({ onIniciarSessao }) {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buscarAgendamentos = async () => {
      try {
        // Busca todas as sessões e filtra as que estão agendadas para o futuro
        const response = await api.get('tiragens/sessoes/');
        const sessoesFuturas = response.data.filter(s => s.status_sessao === 'agendada');
        setAgendamentos(sessoesFuturas);
      } catch (error) {
        console.error("Erro ao buscar agendamentos:", error);
      } finally {
        setLoading(false);
      }
    };

    buscarAgendamentos();
  }, []);

  return (
    <div style={styles.container}>
      <div className="header-mobile-col" style={styles.header}>
        <div>
          <h3 style={styles.title}>Próximas Leituras</h3>
          <p style={styles.subtitle}>Sessões agendadas e já confirmadas pelos consulentes.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Loader2 size={32} color="#D4AF37" style={{ animation: "spin 1s linear infinite" }} />
        </div>
      ) : agendamentos.length === 0 ? (
        <div style={styles.emptyBox}>
          <CalendarIcon size={32} color="#3A322C" style={{ marginBottom: '12px' }} />
          <p style={{ color: '#A89C92' }}>Você não tem nenhum agendamento futuro no momento.</p>
        </div>
      ) : (
        <div className="grid-mobile" style={styles.grid}>
          {agendamentos.map((sessao) => (
            <div key={sessao.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.dateTag}>
                  <CalendarIcon size={14} color="#D4AF37" />
                  <span>{sessao.data_agendada_formatada || sessao.data_agendada}</span>
                </div>
                <div style={styles.timeTag}>
                  <Clock size={14} color="#D4AF37" />
                  <span>{sessao.hora_agendada_formatada || sessao.hora_agendada}</span>
                </div>
              </div>

              <div style={styles.consulenteInfo}>
                <div style={styles.avatarPlaceholder}>
                  {sessao.consulente_img ? (
                    <img src={sessao.consulente_img} alt="Avatar" style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} />
                  ) : (
                    <User size={20} color="#786C63" />
                  )}
                </div>
                <div>
                  <h4 style={styles.consulenteName}>{sessao.consulente_nome || "Consulente Oculto"}</h4>
                  <p style={styles.consulenteEnergia}>Tipo: {sessao.tipo_leitura || sessao.tipo}</p>
                </div>
              </div>

              <div style={styles.duvidaBox}>
                <span style={styles.labelCurta}>Questão central:</span>
                <p style={styles.pergunta}>"{sessao.pergunta_principal}"</p>
              </div>

              <button 
                onClick={() => onIniciarSessao(sessao.id)}
                style={styles.btnIniciar}
              >
                <Play size={16} fill="#D4AF37" /> Entrar na Sala de Leitura
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { display: "flex", flexDirection: "column", gap: "24px", animation: "fadeIn 0.3s ease" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "8px" },
  title: { color: "#FDFBF7", fontSize: "20px", fontFamily: "'Playfair Display', serif", marginBottom: "8px" },
  subtitle: { color: "#A89C92", fontSize: "13px" },
  
  emptyBox: { backgroundColor: '#1A1715', border: '1px dashed #2A2420', borderRadius: '12px', padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" },
  card: { backgroundColor: "#151312", border: "1px solid #2A2420", borderRadius: "12px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px", transition: "transform 0.2s", ":hover": { transform: "translateY(-2px)" } },
  
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "16px", borderBottom: "1px dashed #2A2420" },
  dateTag: { display: "flex", alignItems: "center", gap: "6px", color: "#FDFBF7", fontSize: "14px", fontWeight: "600" },
  timeTag: { display: "flex", alignItems: "center", gap: "6px", color: "#EAE0C8", fontSize: "14px", backgroundColor: "#1A1715", padding: "4px 10px", borderRadius: "6px", border: "1px solid #3A322C" },
  
  consulenteInfo: { display: "flex", alignItems: "center", gap: "12px" },
  avatarPlaceholder: { width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#110F0E", border: "1px solid #3A322C", display: "flex", alignItems: "center", justifyContent: "center" },
  consulenteName: { color: "#FDFBF7", fontSize: "16px", fontFamily: "'Playfair Display', serif", textTransform: 'capitalize' },
  consulenteEnergia: { color: "#786C63", fontSize: "12px", marginTop: "2px" },
  
  duvidaBox: { backgroundColor: "#1A1715", padding: "16px", borderRadius: "8px", borderLeft: "2px solid #D4AF37" },
  labelCurta: { color: "#786C63", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "4px" },
  pergunta: { color: "#D4AF37", fontSize: "13px", fontStyle: "italic", margin: 0, lineHeight: "1.5" },
  
  btnIniciar: { width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px", backgroundColor: "transparent", color: "#D4AF37", border: "1px solid #D4AF37", borderRadius: "8px", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", cursor: "pointer", transition: "all 0.2s" }
};