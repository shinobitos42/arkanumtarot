import React, { useState, useEffect } from 'react';
import { Wallet, Users, Layers, Star, ArrowUpRight, ArrowDownRight, Clock, X, Loader2 } from 'lucide-react';
import api from "../services/api";

export default function FinancasTarologo({ estatisticas }) {
  const [modalSaqueAberto, setModalSaqueAberto] = useState(false);
  const [chavePix, setChavePix] = useState('');
  const [valorSaque, setValorSaque] = useState('');
  
  // ESTADOS PARA A API
  const [transacoes, setTransacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Fallback caso a prop não venha carregada a tempo
  const stats = estatisticas || { saldo: "0.00", tiragens: 0, consulentes: 0, nota: 5.0 };

  // BUSCA OS DADOS REAIS DO BANCO DE DADOS
  useEffect(() => {
    const buscarExtrato = async () => {
      try {
        const response = await api.get('users/me/extrato/');
        setTransacoes(response.data);
      } catch (error) {
        console.error("Erro ao buscar o extrato:", error);
      } finally {
        setCarregando(false);
      }
    };

    buscarExtrato();
  }, []);

  const handleSolicitarSaque = async (e) => {
    e.preventDefault();
    if (!chavePix || !valorSaque) return;
    
    try {
      // Já deixamos o disparo da API pronto! 
      await api.post('users/me/saque/', { 
        chave_pix: chavePix, 
        valor: valorSaque 
      });
      
      alert(`Pedido de saque no valor de R$ ${valorSaque} enviado com sucesso!`);
      setModalSaqueAberto(false);
      setChavePix('');
      setValorSaque('');
      
      // Opcional: Recarregar a página ou o extrato para mostrar a nova linha de saque
      window.location.reload(); 

    } catch (error) {
      console.error("Erro ao solicitar saque:", error);
      alert("Não foi possível solicitar o saque. Verifique seu saldo disponível.");
    }
  };

  return (
    <div style={styles.container}>
      
      {/* SESSÃO 1: CARDS DE RESUMO (KPIs) - Adicionado grid-mobile */}
      <div className="grid-mobile" style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <span style={styles.statTitle}>Saldo Disponível</span>
            <div style={styles.statIconBox}><Wallet size={18} color="#D4AF37" /></div>
          </div>
          <h3 style={styles.statValue}>R$ {stats.saldo}</h3>
          <button onClick={() => setModalSaqueAberto(true)} style={styles.btnSacar}>
            Solicitar Saque (Pix)
          </button>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <span style={styles.statTitle}>Tiragens Realizadas</span>
            <div style={styles.statIconBox}><Layers size={18} color="#D4AF37" /></div>
          </div>
          <h3 style={styles.statValue}>{stats.tiragens}</h3>
          <p style={styles.statDesc}>No histórico da plataforma</p>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <span style={styles.statTitle}>Consulentes Atendidos</span>
            <div style={styles.statIconBox}><Users size={18} color="#D4AF37" /></div>
          </div>
          <h3 style={styles.statValue}>{stats.consulentes}</h3>
          <p style={styles.statDesc}>
            Nota média: {stats.nota} 
            <Star size={10} color="#D4AF37" fill="#D4AF37" style={{ display: 'inline', marginLeft: '4px' }}/>
          </p>
        </div>
      </div>

      {/* SESSÃO 2: EXTRATO / HISTÓRICO */}
      <div style={styles.historyCard}>
        <h3 style={styles.sectionTitle}>Extrato e Lançamentos</h3>
        
        {carregando ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader2 size={32} color="#D4AF37" style={{ animation: "spin 1s linear infinite" }} />
          </div>
        ) : transacoes.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', color: '#786C63', fontSize: '14px', border: '1px dashed #2A2420', borderRadius: '8px', textAlign: 'center' }}>
            Seu histórico de ganhos aparecerá aqui após a primeira sessão concluída.
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Tipo</th>
                  <th style={styles.th}>Descrição</th>
                  <th style={styles.th}>Data</th>
                  <th style={styles.th}>Status</th>
                  <th style={{...styles.th, textAlign: 'right'}}>Valor (R$)</th>
                </tr>
              </thead>
              <tbody>
                {transacoes.map((transacao) => (
                  <tr key={transacao.id} style={styles.tr}>
                    <td style={styles.td}>
                      {transacao.tipo === 'ENTRADA' ? (
                        <div style={styles.tagEntrada}><ArrowUpRight size={14} /> Recebido</div>
                      ) : (
                        <div style={styles.tagSaida}><ArrowDownRight size={14} /> Saque</div>
                      )}
                    </td>
                    <td style={{...styles.td, color: '#EAE0C8', whiteSpace: 'normal', minWidth: '200px'}}>{transacao.descricao}</td>
                    
                    {/* FORMATANDO A DATA QUE VEM DO DJANGO PARA O PADRÃO BRASILEIRO */}
                    <td style={styles.td}>
                      {new Date(transacao.data_criacao).toLocaleDateString('pt-BR')}
                    </td>
                    
                    <td style={styles.td}>
                      {transacao.status === 'CONCLUIDO' ? (
                        <span style={{ color: '#10b981', fontSize: '12px', fontWeight: '500' }}>Concluído</span>
                      ) : transacao.status === 'CANCELADO' ? (
                        <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: '500' }}>Cancelado</span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#D4AF37', fontSize: '12px', fontWeight: '500' }}>
                          <Clock size={12} /> Processando
                        </span>
                      )}
                    </td>
                    
                    <td style={{...styles.td, textAlign: 'right', color: transacao.tipo === 'ENTRADA' ? '#10b981' : '#ef4444', fontWeight: '600'}}>
                      {transacao.tipo === 'ENTRADA' ? '+' : '-'} {parseFloat(transacao.valor).toFixed(2).replace('.', ',')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DE SAQUE PIX */}
      {modalSaqueAberto && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Solicitar Saque</h3>
              <button onClick={() => setModalSaqueAberto(false)} style={styles.btnClose}>
                <X size={20} />
              </button>
            </div>
            
            <p style={styles.modalSubtitle}>
              O valor será transferido para a sua conta bancária em até 24 horas úteis.
            </p>

            <form onSubmit={handleSolicitarSaque} style={styles.formSaque}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Chave Pix (CPF, E-mail, Celular ou Aleatória)</label>
                <input 
                  type="text" 
                  value={chavePix}
                  onChange={(e) => setChavePix(e.target.value)}
                  placeholder="Digite sua chave Pix..."
                  style={styles.inputForm}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Valor do Saque (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  max={stats.saldo.replace(',', '.')} // Impede pedir saque maior que o saldo
                  value={valorSaque}
                  onChange={(e) => setValorSaque(e.target.value)}
                  placeholder="Ex: 150.00"
                  style={styles.inputForm}
                  required
                />
                <span style={styles.infoText}>Saldo disponível: R$ {stats.saldo}</span>
              </div>

              <button type="submit" style={styles.btnConfirmarSaque}>
                Confirmar Transferência
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

const styles = {
  container: { display: "flex", flexDirection: "column", gap: "24px", animation: "fadeIn 0.3s ease" },
  
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" },
  statCard: { backgroundColor: "#1A1715", border: "1px solid #2A2420", borderRadius: "12px", padding: "24px", boxSizing: "border-box" },
  statHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  statTitle: { color: "#A89C92", fontSize: "14px", fontWeight: "500" },
  statIconBox: { padding: "8px", backgroundColor: "rgba(212, 175, 55, 0.1)", borderRadius: "8px" },
  statValue: { color: "#FDFBF7", fontSize: "28px", fontFamily: "'Playfair Display', serif", marginBottom: "8px" },
  statDesc: { color: "#786C63", fontSize: "12px" },
  btnSacar: { width: "100%", padding: "10px", marginTop: "16px", backgroundColor: "transparent", border: "1px solid #D4AF37", color: "#D4AF37", borderRadius: "6px", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", cursor: "pointer", transition: "0.2s" },

  historyCard: { backgroundColor: "#151312", border: "1px solid #2A2420", borderRadius: "12px", padding: "24px", boxSizing: "border-box" },
  sectionTitle: { color: "#FDFBF7", fontSize: "20px", fontFamily: "'Playfair Display', serif", marginBottom: "24px" },
  
  // CONTAINER DA TABELA - Fundamental para mobile
  tableContainer: { overflowX: "auto", width: "100%", paddingBottom: "10px" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "600px" }, // Força a largura mínima para gerar o scroll
  
  th: { padding: "16px", color: "#A89C92", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "600", borderBottom: "1px solid #2A2420", whiteSpace: "nowrap" },
  tr: { borderBottom: "1px solid #2A2420", transition: "backgroundColor 0.2s", '&:hover': { backgroundColor: "#1A1715" } },
  td: { padding: "16px", color: "#786C63", fontSize: "14px", whiteSpace: "nowrap" },
  
  tagEntrada: { display: "inline-flex", alignItems: "center", gap: "4px", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10b981", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "600", textTransform: "uppercase" },
  tagSaida: { display: "inline-flex", alignItems: "center", gap: "4px", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "600", textTransform: "uppercase" },

  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(17, 15, 14, 0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(4px)", padding: "20px", boxSizing: "border-box" },
  modalContent: { backgroundColor: "#1A1715", border: "1px solid #3A322C", borderRadius: "12px", padding: "32px", width: "100%", maxWidth: "450px", boxShadow: "0 20px 40px rgba(0,0,0,0.5)", boxSizing: "border-box" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" },
  modalTitle: { color: "#FDFBF7", fontSize: "22px", fontFamily: "'Playfair Display', serif" },
  btnClose: { background: "none", border: "none", color: "#A89C92", cursor: "pointer" },
  modalSubtitle: { color: "#786C63", fontSize: "13px", marginBottom: "24px", lineHeight: "1.5" },
  
  formSaque: { display: "flex", flexDirection: "column", gap: "20px" },
  formGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { color: "#A89C92", fontSize: "13px", fontWeight: "500" },
  inputForm: { backgroundColor: "#110F0E", border: "1px solid #3A322C", color: "#EAE0C8", padding: "14px", borderRadius: "8px", outline: "none", fontSize: "14px", boxSizing: "border-box", width: "100%" },
  infoText: { color: "#D4AF37", fontSize: "11px", alignSelf: "flex-end" },
  
  btnConfirmarSaque: { width: "100%", padding: "16px", backgroundColor: "#D4AF37", color: "#151312", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "700", textTransform: "uppercase", cursor: "pointer", marginTop: "8px" }
};