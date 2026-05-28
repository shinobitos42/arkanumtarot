import React, { useState } from 'react';
import { CalendarDays, Clock, Plus, Trash2, CalendarX2, ChevronDown, Settings2 } from 'lucide-react';

export default function AgendaTarologo() {
  // 1. CONFIGURAÇÕES GERAIS DA AGENDA
  const [duracaoSessao, setDuracaoSessao] = useState('30'); // Em minutos
  const [intervalo, setIntervalo] = useState('10'); // Pausa para água/respiro entre sessões

  // 2. ESTADO DA ROTINA SEMANAL
  const [semana, setSemana] = useState([
    { nome: 'Segunda', ativo: true, blocos: [{ id: 1, inicio: '09:00', fim: '12:00' }, { id: 2, inicio: '14:00', fim: '18:00' }] },
    { nome: 'Terça', ativo: true, blocos: [{ id: 3, inicio: '09:00', fim: '18:00' }] },
    { nome: 'Quarta', ativo: true, blocos: [{ id: 4, inicio: '09:00', fim: '18:00' }] },
    { nome: 'Quinta', ativo: true, blocos: [{ id: 5, inicio: '09:00', fim: '18:00' }] },
    { nome: 'Sexta', ativo: true, blocos: [{ id: 6, inicio: '09:00', fim: '18:00' }] },
    { nome: 'Sábado', ativo: false, blocos: [{ id: 7, inicio: '09:00', fim: '13:00' }] },
    { nome: 'Domingo', ativo: false, blocos: [{ id: 8, inicio: '09:00', fim: '12:00' }] },
  ]);

  // 3. ESTADO DAS DATAS ESPECÍFICAS
  const [datasExtras, setDatasExtras] = useState([]);
  const [novaData, setNovaData] = useState('');
  const [tipoNovaData, setTipoNovaData] = useState('folga');

  // GERA A LISTA DE HORÁRIOS DE 30 EM 30 MIN PARA O DROPDOWN BONITO
  const gerarHorariosDisponiveis = () => {
    const horarios = [];
    for (let h = 0; h < 24; h++) {
      const horaStr = h.toString().padStart(2, '0');
      horarios.push(`${horaStr}:00`);
      horarios.push(`${horaStr}:30`);
    }
    return horarios;
  };
  const opcoesDeHorario = gerarHorariosDisponiveis();

  // MANIPULAÇÃO DA SEMANA
  const toggleDiaSemana = (index) => {
    const novaSemana = [...semana];
    novaSemana[index].ativo = !novaSemana[index].ativo;
    setSemana(novaSemana);
  };

  const adicionarBloco = (indexDia) => {
    const novaSemana = [...semana];
    novaSemana[indexDia].blocos.push({ id: Date.now(), inicio: '09:00', fim: '18:00' });
    setSemana(novaSemana);
  };

  const removerBloco = (indexDia, idBloco) => {
    const novaSemana = [...semana];
    novaSemana[indexDia].blocos = novaSemana[indexDia].blocos.filter(b => b.id !== idBloco);
    setSemana(novaSemana);
  };

  const atualizarHorario = (indexDia, idBloco, campo, valor) => {
    const novaSemana = [...semana];
    const blocoIndex = novaSemana[indexDia].blocos.findIndex(b => b.id === idBloco);
    novaSemana[indexDia].blocos[blocoIndex][campo] = valor;
    setSemana(novaSemana);
  };

  // MANIPULAÇÃO DE DATAS EXTRAS
  const adicionarDataExtra = () => {
    if (!novaData) return;
    const novaExcecao = {
      id: Date.now(),
      data: novaData,
      tipo: tipoNovaData
    };
    setDatasExtras([...datasExtras, novaExcecao]);
    setNovaData('');
  };

  const handleSalvarAgenda = () => {
    const payload = { configuracao: { duracaoSessao, intervalo }, semana, datasExtras };
    console.log("Enviando para o backend fatiar os horários:", payload);
    alert("Agenda configurada! O sistema agora dividirá seus turnos automaticamente.");
  };

  // COMPONENTE CUSTOMIZADO DE SELECT PARA SUBSTITUIR O INPUT NATIVO FEIO
  const CustomTimeSelect = ({ valor, onChange }) => (
    <div style={styles.selectWrapper}>
      <select value={valor} onChange={onChange} style={styles.customSelect}>
        {opcoesDeHorario.map(hora => (
          <option key={hora} value={hora}>{hora}</option>
        ))}
      </select>
      <ChevronDown size={14} color="#A89C92" style={styles.selectIcon} />
    </div>
  );

  return (
    <div style={styles.container}>
      
      {/* SESSÃO 1: CONFIGURAÇÃO DE FATIAMENTO (NOVO) */}
      <div style={styles.cardSettings}>
        <div style={styles.headerComIcone}>
          <Settings2 size={24} color="#D4AF37" />
          <div>
            <h3 style={styles.sectionTitle}>Regras de Agendamento</h3>
            <p style={styles.subtitle}>Como o sistema deve dividir seus horários para os consulentes.</p>
          </div>
        </div>

        <div style={styles.configGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Duração de cada Sessão</label>
            <div style={styles.selectWrapper}>
              <select value={duracaoSessao} onChange={(e) => setDuracaoSessao(e.target.value)} style={styles.customSelect}>
                <option value="15">15 Minutos (Tiragem Rápida)</option>
                <option value="30">30 Minutos (Padrão)</option>
                <option value="45">45 Minutos</option>
                <option value="60">1 Hora (Completa)</option>
              </select>
              <ChevronDown size={14} color="#A89C92" style={styles.selectIcon} />
            </div>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Respiro entre Sessões</label>
            <div style={styles.selectWrapper}>
              <select value={intervalo} onChange={(e) => setIntervalo(e.target.value)} style={styles.customSelect}>
                <option value="0">Sem pausa (Emendado)</option>
                <option value="10">10 Minutos</option>
                <option value="15">15 Minutos</option>
                <option value="30">30 Minutos</option>
              </select>
              <ChevronDown size={14} color="#A89C92" style={styles.selectIcon} />
            </div>
          </div>
        </div>
      </div>

      {/* SESSÃO 2: ROTINA SEMANAL PADRÃO */}
      <div style={styles.cardSettings}>
        <h3 style={styles.sectionTitle}>Turnos de Trabalho</h3>
        <p style={styles.subtitle}>
          Defina os grandes blocos (turnos) em que você estará online. O sistema irá fatiar esses turnos baseados nas suas regras acima.
        </p>

        <div style={styles.semanaList}>
          {semana.map((dia, indexDia) => (
            <div key={dia.nome} style={{...styles.diaRow, opacity: dia.ativo ? 1 : 0.6}}>
              
              <div style={styles.diaToggle} onClick={() => toggleDiaSemana(indexDia)}>
                <div style={{ ...styles.checkbox, ...(dia.ativo ? styles.checkboxAtivo : {}) }}>
                  {dia.ativo && <Check size={12} color="#151312" />}
                </div>
                <span style={{ ...styles.diaNome, color: dia.ativo ? '#FDFBF7' : '#786C63' }}>
                  {dia.nome}
                </span>
              </div>

              {dia.ativo ? (
                <div style={styles.blocosContainer}>
                  {dia.blocos.map((bloco) => (
                    <div key={bloco.id} style={styles.blocoRow}>
                      
                      <CustomTimeSelect 
                        valor={bloco.inicio} 
                        onChange={(e) => atualizarHorario(indexDia, bloco.id, 'inicio', e.target.value)} 
                      />
                      
                      <span style={{ color: '#786C63', fontSize: '13px', margin: '0 8px' }}>até</span>
                      
                      <CustomTimeSelect 
                        valor={bloco.fim} 
                        onChange={(e) => atualizarHorario(indexDia, bloco.id, 'fim', e.target.value)} 
                      />

                      <button onClick={() => removerBloco(indexDia, bloco.id)} style={styles.btnIconDelete} title="Remover turno">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => adicionarBloco(indexDia)} style={styles.btnAddHorario}>
                    <Plus size={14} /> Adicionar Turno
                  </button>
                </div>
              ) : (
                <div style={styles.indisponivelText}>Dia de Descanso</div>
              )}

            </div>
          ))}
        </div>
      </div>

      {/* SESSÃO 3: DATAS ESPECÍFICAS / EXCEÇÕES */}
      <div style={styles.cardSettings}>
        <h3 style={styles.sectionTitle}>Folgas Específicas</h3>
        <p style={styles.subtitle}>
          Vai tirar férias ou feriado? Adicione a data aqui e bloquearemos a sua agenda inteira neste dia.
        </p>

        <div style={styles.addExcecaoBox}>
          <input 
            type="date" 
            value={novaData} 
            onChange={(e) => setNovaData(e.target.value)} 
            style={styles.inputDate}
          />
          <button onClick={adicionarDataExtra} style={styles.btnSecundario}>
            Bloquear Dia
          </button>
        </div>

        {datasExtras.length > 0 && (
          <div style={styles.listaExcecoes}>
            {datasExtras.map(ex => (
              <div key={ex.id} style={styles.excecaoItem}>
                <div style={styles.excecaoInfo}>
                  <CalendarX2 size={18} color="#ef4444" />
                  <span style={styles.excecaoData}>{new Date(ex.data).toLocaleDateString('pt-BR')} (Bloqueado)</span>
                </div>
                <button onClick={() => removerDataExtra(ex.id)} style={styles.btnIconDelete}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={handleSalvarAgenda} style={styles.btnSalvarPrincipal}>
        Salvar Configurações de Agenda
      </button>

    </div>
  );
}

// Check falso como SVG (usado no toggle)
const Check = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const styles = {
  container: { maxWidth: "800px", display: "flex", flexDirection: "column", gap: "24px", animation: "fadeIn 0.3s ease" },
  cardSettings: { backgroundColor: "#151312", border: "1px solid #2A2420", borderRadius: "12px", padding: "32px" },
  headerComIcone: { display: "flex", gap: "16px", marginBottom: "24px", alignItems: "flex-start" },
  sectionTitle: { color: "#FDFBF7", fontSize: "20px", fontFamily: "'Playfair Display', serif", marginBottom: "8px" },
  subtitle: { color: "#A89C92", fontSize: "13px", lineHeight: "1.5" },
  
  // CONFIGURAÇÕES GERAIS
  configGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", padding: "24px", backgroundColor: "#110F0E", borderRadius: "8px", border: "1px solid #1A1715" },
  formGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { color: "#A89C92", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" },

  // SELECT CUSTOMIZADO BONITO
  selectWrapper: { position: "relative", display: "flex", alignItems: "center" },
  customSelect: { width: "100%", padding: "12px 36px 12px 16px", backgroundColor: "#1A1715", border: "1px solid #3A322C", color: "#EAE0C8", borderRadius: "8px", fontSize: "14px", fontFamily: "'Inter', sans-serif", outline: "none", appearance: "none", cursor: "pointer", transition: "border-color 0.2s", '&:focus': { borderColor: "#D4AF37" } },
  selectIcon: { position: "absolute", right: "12px", pointerEvents: "none" },

  // ROTINA SEMANAL
  semanaList: { display: "flex", flexDirection: "column", gap: "0" },
  diaRow: { display: "flex", alignItems: "flex-start", gap: "24px", padding: "24px 0", borderBottom: "1px solid #2A2420", transition: "opacity 0.2s" },
  diaToggle: { display: "flex", alignItems: "center", gap: "12px", width: "140px", cursor: "pointer", paddingTop: "12px" },
  checkbox: { width: "20px", height: "20px", borderRadius: "6px", border: "2px solid #786C63", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.2s" },
  checkboxAtivo: { backgroundColor: "#D4AF37", borderColor: "#D4AF37" },
  diaNome: { fontSize: "15px", fontWeight: "500", transition: "color 0.2s" },
  
  blocosContainer: { display: "flex", flexDirection: "column", gap: "12px", flex: 1 },
  blocoRow: { display: "flex", alignItems: "center", backgroundColor: "#110F0E", padding: "12px", borderRadius: "8px", border: "1px solid #1A1715", width: "fit-content" },
  btnIconDelete: { background: "none", border: "none", color: "#786C63", cursor: "pointer", padding: "8px", marginLeft: "8px", borderRadius: "4px", transition: "all 0.2s", '&:hover': { color: "#ef4444", backgroundColor: "rgba(239, 68, 68, 0.1)" } },
  btnAddHorario: { display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "#D4AF37", fontSize: "13px", fontWeight: "600", cursor: "pointer", padding: "8px 0", width: "fit-content", transition: "opacity 0.2s" },
  indisponivelText: { color: "#786C63", fontSize: "14px", fontStyle: "italic", paddingTop: "12px" },

  // DATAS ESPECÍFICAS
  addExcecaoBox: { display: "flex", gap: "16px", marginBottom: "24px", alignItems: "center" },
  inputDate: { backgroundColor: "#1A1715", border: "1px solid #3A322C", color: "#EAE0C8", padding: "12px 16px", borderRadius: "8px", outline: "none", fontSize: "14px", width: "200px" },
  btnSecundario: { padding: "12px 24px", backgroundColor: "transparent", border: "1px solid #ef4444", color: "#ef4444", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" },
  
  listaExcecoes: { display: "flex", flexDirection: "column", gap: "12px" },
  excecaoItem: { display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(239, 68, 68, 0.05)", padding: "16px", borderRadius: "8px", border: "1px solid rgba(239, 68, 68, 0.2)" },
  excecaoInfo: { display: "flex", alignItems: "center", gap: "12px" },
  excecaoData: { color: "#FDFBF7", fontSize: "15px", fontWeight: "500" },

  btnSalvarPrincipal: { padding: "18px", backgroundColor: "#D4AF37", color: "#151312", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "700", cursor: "pointer", width: "100%", textTransform: "uppercase", letterSpacing: "1px", transition: "opacity 0.2s", boxShadow: "0 4px 12px rgba(212, 175, 55, 0.2)" }
};