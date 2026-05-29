import React, { useState, useRef, useEffect } from "react";
import { Search, Mic, Send, Paperclip, MoreVertical, Play, Pause, CheckCheck, Menu, Square, Loader2, User, Star, ChevronLeft } from "lucide-react";
import api from "../services/api";

const CustomAudioPlayer = ({ audioUrl }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");

  const formatAudioUrl = (url) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `http://localhost:8000${url}`;
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const togglePlay = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    const current = audioRef.current.currentTime;
    const dur = audioRef.current.duration;
    setCurrentTime(formatTime(current));
    if (dur) {
      setProgress((current / dur) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(formatTime(audioRef.current.duration));
    }
  };

  return (
    <div style={styles.customAudioWrapper}>
      <button onClick={togglePlay} style={styles.customAudioBtn}>
        {isPlaying ? (
          <Pause size={14} color="#151312" fill="#151312" />
        ) : (
          <Play size={14} color="#151312" fill="#151312" style={{ marginLeft: "2px" }} />
        )}
      </button>
      
      <div style={styles.audioControlsTimeline}>
        <div style={styles.customAudioTrack}>
          <div style={{ ...styles.customAudioProgress, width: `${progress}%` }}></div>
        </div>
        <div style={styles.audioTimeLabelContainer}>
          <span>{currentTime}</span>
          <span>{duration}</span>
        </div>
      </div>

      <audio 
        ref={audioRef} 
        src={formatAudioUrl(audioUrl)} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => { setIsPlaying(false); setProgress(0); setCurrentTime("0:00"); }}
        style={{ display: 'none' }}
        preload="metadata"
      />
    </div>
  );
};

export default function Mensagens({ customStyle, onVoltarParaPainel }) {
  const [mostrarSidebar, setMostrarSidebar] = useState(true); // Toggle para Desktop
  const [viewMobile, setViewMobile] = useState("lista"); // "lista" ou "chat" (Animação Mobile)
  
  const [novaMensagem, setNovaMensagem] = useState("");
  const [chats, setChats] = useState([]);
  const [chatAtivoId, setChatAtivoId] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMensagens, setLoadingMensagens] = useState(false);

  const [notaDada, setNotaDada] = useState(0);
  const [hoverNota, setHoverNota] = useState(0);
  const [avaliacaoEnviada, setAvaliacaoEnviada] = useState(false);

  const [usuarioId] = useState(localStorage.getItem('user_id')); 
  const [role] = useState(localStorage.getItem('user_role') || 'CONSULENTE');

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  useEffect(() => {
    const buscarChats = async () => {
      try {
        const response = await api.get('tiragens/sessoes/');
        const chatsFiltrados = response.data.filter(chat => {
            if (role === 'TAROLOGO') return chat.status_sessao !== 'aguardando_guia';
            return true;
        });

        setChats(chatsFiltrados);
        if (chatsFiltrados.length > 0 && window.innerWidth > 768) {
          setChatAtivoId(chatsFiltrados[0].id);
        }
      } catch (error) {
        console.error("Erro ao buscar chats:", error);
      } finally {
        setLoadingChats(false);
      }
    };
    buscarChats();
  }, [role]);

  useEffect(() => {
    if (!chatAtivoId) return;
    setNotaDada(0);
    setAvaliacaoEnviada(false);

    const buscarMensagens = async () => {
      try {
        const response = await api.get(`tiragens/mensagens/?sessao=${chatAtivoId}`);
        setMensagens(response.data);
        const chatAtualizado = await api.get(`tiragens/sessoes/${chatAtivoId}/`);
        setChats(prevChats => prevChats.map(c => c.id === chatAtivoId ? chatAtualizado.data : c));
      } catch (error) {
        console.error("Erro ao atualizar mensagens:", error);
      }
    };

    setLoadingMensagens(true);
    buscarMensagens().finally(() => setLoadingMensagens(false));

    const interval = setInterval(buscarMensagens, 3000);
    return () => clearInterval(interval);
  }, [chatAtivoId]);

  const chatAtivo = chats.find(c => c.id === chatAtivoId);

  const encerrarSessao = async () => {
    if (!window.confirm("Tem certeza que deseja encerrar esta leitura?")) return;
    try {
      await api.patch(`tiragens/sessoes/${chatAtivoId}/`, { status_sessao: 'finalizada' });
      setChats(prevChats => prevChats.map(chat => chat.id === chatAtivoId ? { ...chat, status_sessao: 'finalizada' } : chat));
    } catch (error) { alert("Houve um erro ao tentar encerrar a sessão."); }
  };

  const enviarAvaliacao = async () => {
    if (notaDada === 0) return;
    try {
      await api.patch(`tiragens/sessoes/${chatAtivoId}/`, { nota: notaDada });
      setChats(prevChats => prevChats.map(chat => chat.id === chatAtivoId ? { ...chat, nota: notaDada } : chat));
      setAvaliacaoEnviada(true);
    } catch (error) { alert("Não foi possível enviar a avaliação."); }
  };

  const handleEnviarTexto = async (e) => {
    e.preventDefault();
    if (!novaMensagem.trim() || !chatAtivoId) return;

    const textoEnvio = novaMensagem;
    setNovaMensagem("");

    const msgTemporaria = {
      id: Date.now(),
      texto: textoEnvio,
      remetente: usuarioId,
      tipo: 'texto',
      criado_em: new Date().toISOString()
    };
    setMensagens((prev) => [...prev, msgTemporaria]);

    try {
      await api.post('tiragens/mensagens/', { sessao: chatAtivoId, texto: textoEnvio, tipo: 'texto' });
    } catch (error) { setNovaMensagem(textoEnvio); }
  };

  const iniciarGravacao = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('arquivo_audio', audioBlob, 'mensagem_audio.webm');
        formData.append('sessao', chatAtivoId);
        formData.append('tipo', 'audio');

        try {
          const response = await api.post('tiragens/mensagens/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
          setMensagens((prev) => [...prev, response.data]);
        } catch (error) { console.error("Erro ao enviar áudio:", error); }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) { alert("Permita o acesso ao microfone no seu navegador."); }
  };

  const pararGravacao = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const toggleGravacao = (e) => {
    e.preventDefault();
    if (isRecording) pararGravacao(); else iniciarGravacao();
  };

  const renderAvatar = (imgUrl, nome) => {
    if (imgUrl) return <img src={imgUrl} alt="Avatar" style={styles.contactAvatar} />;
    return (
      <div style={styles.fallbackAvatar}>
        {nome ? nome.charAt(0).toUpperCase() : <User size={20} color="#151312" />}
      </div>
    );
  };

  return (
    <div className="mensagens-container" style={{ ...styles.container, ...(customStyle || {}) }}>
      
      {/* --------------------- SIDEBAR DE CONTATOS --------------------- */}
      <div className={`chat-sidebar ${viewMobile === 'chat' ? 'oculto-mobile' : ''}`} style={{ ...styles.sidebar, display: mostrarSidebar ? "flex" : "none" }}>
        <div style={styles.sidebarHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
             {/* Voltar para o Dashboard (Só Mobile) */}
             {onVoltarParaPainel && (
                <button className="btn-voltar-mobile" onClick={onVoltarParaPainel}>
                  <ChevronLeft size={24} color="#D4AF37" />
                </button>
             )}
             <h2 style={styles.sidebarTitle}>Suas Conexões</h2>
          </div>
          <div style={styles.searchBox}>
            <Search size={14} color="#786C63" style={styles.searchIcon} />
            <input type="text" placeholder="Buscar conversa..." style={styles.searchInput} />
          </div>
        </div>

        <div style={styles.contactList}>
          {loadingChats ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <Loader2 size={24} color="#D4AF37" style={{ animation: "spin 1s linear infinite" }} />
            </div>
          ) : chats.length === 0 ? (
            <p style={{ color: '#786C63', textAlign: 'center', padding: '40px', fontSize: '14px' }}>Nenhuma sessão ativa.</p>
          ) : (
            chats.map((chat) => {
              const nomeContato = role === "CONSULENTE" ? (chat.guia_nome || "Aguardando Guia...") : chat.consulente_nome;
              const imgContato = role === "CONSULENTE" ? chat.guia_img : null;

              return (
                <div 
                  key={chat.id} 
                  onClick={() => {
                    setChatAtivoId(chat.id);
                    setViewMobile("chat"); // Aciona a animação no mobile
                  }}
                  style={{ ...styles.contactItem, ...(chatAtivoId === chat.id ? styles.contactItemAtivo : {}) }}
                >
                  <div style={styles.avatarWrapper}>
                    {renderAvatar(imgContato, nomeContato)}
                    {chat.status_sessao === "ao_vivo" && <div style={styles.onlineIndicator}></div>}
                  </div>
                  <div style={styles.contactInfo}>
                    <div style={styles.contactTopRow}>
                      <h4 style={styles.contactName}>{nomeContato}</h4>
                    </div>
                    <div style={styles.contactBottomRow}>
                      <p style={styles.lastMessage}>{chat.tipo_leitura}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* --------------------- ÁREA DO CHAT ATIVO --------------------- */}
      <div className={`chat-area ${viewMobile === 'lista' ? 'oculto-mobile' : ''}`} style={styles.chatArea}>
        {chatAtivo ? (
          <>
            <div className="chat-header" style={styles.chatHeader}>
              <div style={styles.chatHeaderLeft}>
                
                {/* Botão de voltar para a Lista de Contatos (Só Mobile) */}
                <button className="btn-voltar-mobile" onClick={() => setViewMobile("lista")}>
                  <ChevronLeft size={24} color="#D4AF37" />
                </button>
                
                {/* Toggle da Sidebar (Só Desktop) */}
                <button className="menu-toggle-desktop" onClick={() => setMostrarSidebar(!mostrarSidebar)} style={styles.menuToggleBtn}>
                  <Menu size={20} color="#D4AF37" />
                </button>
                
                {renderAvatar(
                  role === "CONSULENTE" ? chatAtivo.guia_img : null, 
                  role === "CONSULENTE" ? (chatAtivo.guia_nome || "Aguardando Guia...") : chatAtivo.consulente_nome
                )}
                
                <div>
                  <h3 style={styles.chatHeaderName}>
                    {role === "CONSULENTE" ? (chatAtivo.guia_nome || "Aguardando Guia...") : chatAtivo.consulente_nome}
                  </h3>
                  <p style={styles.chatHeaderStatus}>
                    {chatAtivo.status_sessao === 'ao_vivo' ? 'Oráculo Online' : 
                     chatAtivo.status_sessao === 'aguardando_guia' ? 'Procurando conexão...' : 'Sessão Finalizada'}
                  </p>
                </div>
              </div>

              <div style={styles.chatHeaderRight}>
                {role === "TAROLOGO" && chatAtivo.status_sessao === 'ao_vivo' && (
                  <button onClick={encerrarSessao} style={styles.btnEncerrar}>Encerrar Leitura</button>
                )}
                <button style={styles.iconBtn}><MoreVertical size={18} color="#A89C92" /></button>
              </div>
            </div>

            <div className="chat-messages" style={styles.chatMessages}>
              {loadingMensagens ? (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}><Loader2 size={32} color="#D4AF37" style={{ animation: "spin 1s linear infinite" }} /></div>
              ) : mensagens.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '60px' }}>
                   <p style={{ color: '#A89C92', fontStyle: 'italic' }}>
                     {chatAtivo.status_sessao === 'aguardando_guia' ? "Aguarde um guia aceitar seu pedido." : "A sessão foi aberta. A energia está pronta para fluir."}
                   </p>
                </div>
              ) : (
                mensagens.map((msg) => {
                  const isMyMessage = String(msg.remetente) === String(usuarioId);
                  return (
                    <div key={msg.id} style={{ ...styles.messageRow, justifyContent: isMyMessage ? "flex-end" : "flex-start" }}>
                      <div className="message-bubble" style={{ ...styles.messageBubble, ...(isMyMessage ? styles.messageUser : styles.messageGuia) }}>
                        {msg.tipo === "audio" ? <CustomAudioPlayer audioUrl={msg.arquivo_audio} /> : <p style={styles.messageText}>{msg.texto}</p>}
                        <div style={styles.messageMeta}>
                          <span>{new Date(msg.criado_em).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isMyMessage && <CheckCheck size={14} color="#D4AF37" style={{ marginLeft: "4px" }} />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {chatAtivo.status_sessao === 'finalizada' && role === "CONSULENTE" && !chatAtivo.nota && (
                <div style={styles.avaliacaoCard}>
                  {avaliacaoEnviada ? (
                    <>
                      <div style={styles.iconCircleSucesso}><CheckCheck size={24} color="#10b981" /></div>
                      <h4 style={styles.avaliacaoTitle}>Gratidão!</h4>
                      <p style={styles.avaliacaoText}>Sua energia ajuda a guiar o nosso Círculo.</p>
                    </>
                  ) : (
                    <>
                      <h4 style={styles.avaliacaoTitle}>A leitura foi encerrada.</h4>
                      <p style={styles.avaliacaoText}>Como foi sua experiência com {chatAtivo.guia_nome}?</p>
                      <div style={styles.starsContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} size={32} 
                            onMouseEnter={() => setHoverNota(star)} onMouseLeave={() => setHoverNota(0)} onClick={() => setNotaDada(star)}
                            color={star <= (hoverNota || notaDada) ? "#D4AF37" : "#3A322C"} fill={star <= (hoverNota || notaDada) ? "#D4AF37" : "transparent"} 
                            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                          />
                        ))}
                      </div>
                      <button onClick={enviarAvaliacao} disabled={notaDada === 0} style={{...styles.btnAvaliar, opacity: notaDada === 0 ? 0.5 : 1}}>Enviar Avaliação</button>
                    </>
                  )}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-container" style={styles.chatInputContainer}>
              <div className="chat-input-wrapper" style={styles.chatInputWrapper}>
                <button style={styles.attachBtn} disabled={isRecording || chatAtivo.status_sessao === 'aguardando_guia' || chatAtivo.status_sessao === 'finalizada'}>
                  <Paperclip size={20} color="#786C63" />
                </button>
                <form onSubmit={handleEnviarTexto} style={styles.inputForm} autoComplete="off">
                  <input 
                    type="text" 
                    placeholder={chatAtivo.status_sessao === 'finalizada' ? "Sessão encerrada." : isRecording ? "Gravando voz..." : "Digite sua mensagem..."} 
                    style={{ ...styles.textInput, color: isRecording ? '#ef4444' : '#EAE0C8' }}
                    value={novaMensagem}
                    onChange={(e) => setNovaMensagem(e.target.value)}
                    disabled={isRecording || chatAtivo.status_sessao === 'finalizada' || chatAtivo.status_sessao === 'aguardando_guia'}
                  />
                  {novaMensagem.trim() ? (
                    <button type="submit" style={styles.sendBtn} disabled={chatAtivo.status_sessao === 'finalizada'}><Send size={16} color="#151312" /></button>
                  ) : (
                    <button type="button" onClick={toggleGravacao} disabled={chatAtivo.status_sessao === 'aguardando_guia' || chatAtivo.status_sessao === 'finalizada'} style={{...styles.micBtn, backgroundColor: isRecording ? "rgba(239, 68, 68, 0.15)" : "transparent", borderColor: isRecording ? "#ef4444" : "#3A322C", opacity: (chatAtivo.status_sessao === 'aguardando_guia' || chatAtivo.status_sessao === 'finalizada') ? 0.5 : 1}}>
                      {isRecording ? <Square size={14} color="#ef4444" fill="#ef4444"/> : <Mic size={20} color="#D4AF37" />}
                    </button>
                  )}
                </form>
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#786C63' }}>
            Selecione uma sessão para iniciar a comunicação.
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", height: "calc(100vh - 98px)", margin: "-40px -60px -32px -60px", backgroundColor: "#110F0E", overflow: "hidden", borderTop: "1px solid #1A1715" },
  sidebar: { width: "360px", borderRight: "1px solid #2A2420", display: "flex", flexDirection: "column", backgroundColor: "#151312", transition: "width 0.3s" },
  sidebarHeader: { padding: "24px", borderBottom: "1px solid #2A2420" },
  sidebarTitle: { color: "#FDFBF7", fontFamily: "'Playfair Display', serif", fontSize: "20px", margin: 0, fontWeight: "normal" },
  searchBox: { position: "relative", display: "flex", alignItems: "center" },
  searchIcon: { position: "absolute", left: "14px" },
  searchInput: { width: "100%", padding: "14px 14px 14px 44px", backgroundColor: "#110F0E", border: "1px solid #3A322C", borderRadius: "8px", color: "#EAE0C8", fontSize: "14px", outline: "none", fontFamily: "'Inter', sans-serif" },
  contactList: { flex: 1, overflowY: "auto" },
  contactItem: { display: "flex", gap: "16px", padding: "20px 24px", cursor: "pointer", borderBottom: "1px solid #2A2420", transition: "background 0.2s" },
  contactItemAtivo: { backgroundColor: "#1A1715", borderLeft: "3px solid #D4AF37" },
  avatarWrapper: { position: "relative" },
  contactAvatar: { width: "54px", height: "54px", borderRadius: "50%", objectFit: "cover", border: "1px solid #3A322C" },
  fallbackAvatar: { width: "54px", height: "54px", borderRadius: "50%", backgroundColor: "#D4AF37", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "700", color: "#151312", border: "1px solid #2A2420" },
  onlineIndicator: { position: "absolute", bottom: "2px", right: "2px", width: "12px", height: "12px", backgroundColor: "#10b981", borderRadius: "50%", border: "2px solid #151312" },
  contactInfo: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "6px", overflow: "hidden" },
  contactTopRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  contactName: { color: "#FDFBF7", fontSize: "16px", fontWeight: "normal", fontFamily: "'Playfair Display', serif" },
  contactBottomRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  lastMessage: { color: "#A89C92", fontSize: "13px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "200px", fontWeight: "300" },
  
  chatArea: { flex: 1, display: "flex", flexDirection: "column", backgroundColor: "#110F0E", position: "relative" },
  chatHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 40px", borderBottom: "1px solid #2A2420", backgroundColor: "#1A1715" },
  chatHeaderLeft: { display: "flex", alignItems: "center", gap: "16px" },
  menuToggleBtn: { background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "8px", backgroundColor: "#151312", borderRadius: "6px", border: "1px solid #3A322C" },
  chatHeaderName: { color: "#FDFBF7", fontSize: "20px", fontFamily: "'Playfair Display', serif", marginBottom: "4px", fontWeight: "normal" },
  chatHeaderStatus: { color: "#A89C92", fontSize: "13px", fontWeight: "300" },
  chatHeaderRight: { display: "flex", gap: "20px", alignItems: "center" },
  iconBtn: { background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  
  btnEncerrar: { padding: "8px 16px", backgroundColor: "transparent", border: "1px solid #ef4444", color: "#ef4444", borderRadius: "6px", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s" },

  chatMessages: { flex: 1, padding: "32px 60px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "24px", backgroundImage: "radial-gradient(#2A2420 1px, transparent 1px)", backgroundSize: "24px 24px" }, 
  messageRow: { display: "flex", width: "100%" },
  messageBubble: { maxWidth: "65%", minWidth: "260px", padding: "16px 20px", position: "relative", display: "flex", flexDirection: "column", gap: "4px", boxShadow: "0 4px 15px rgba(0,0,0,0.15)" },
  messageUser: { backgroundColor: "#1A1715", border: "1px solid #3A322C", borderRadius: "16px 16px 4px 16px" },
  messageGuia: { backgroundColor: "#151312", border: "1px solid #2A2420", borderRadius: "16px 16px 16px 4px" },
  messageText: { color: "#EAE0C8", fontSize: "15px", lineHeight: "1.6", fontWeight: "300", wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap', margin: 0 },
  messageMeta: { display: "flex", alignItems: "center", justifyContent: "flex-end", fontSize: "11px", color: "#786C63", marginTop: "2px" },

  customAudioWrapper: { display: 'flex', alignItems: 'center', gap: '16px', width: '100%', padding: '4px 0' },
  customAudioBtn: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', flexShrink: 0 },
  audioControlsTimeline: { display: 'flex', flexDirection: 'column', flex: 1, gap: '6px', justifyContent: 'center' },
  customAudioTrack: { width: '100%', height: '4px', backgroundColor: '#3A322C', borderRadius: '2px', position: 'relative', overflow: 'hidden' },
  customAudioProgress: { position: 'absolute', left: 0, top: 0, height: '100%', backgroundColor: '#D4AF37', borderRadius: '2px' },
  audioTimeLabelContainer: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#A89C92', fontWeight: '500', fontFamily: "'Inter', sans-serif" },

  avaliacaoCard: { alignSelf: 'center', backgroundColor: '#1A1715', border: '1px solid #D4AF37', borderRadius: '12px', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '340px', marginTop: '20px' },
  avaliacaoTitle: { color: '#FDFBF7', fontFamily: "'Playfair Display', serif", fontSize: '20px', marginBottom: '8px' },
  avaliacaoText: { color: '#A89C92', fontSize: '14px', marginBottom: '24px', textAlign: 'center' },
  starsContainer: { display: 'flex', gap: '8px', marginBottom: '32px' },
  btnAvaliar: { width: '100%', padding: '14px', backgroundColor: '#D4AF37', color: '#151312', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer' },
  iconCircleSucesso: { width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' },

  chatInputContainer: { padding: "24px 60px", backgroundColor: "transparent", position: "relative" },
  chatInputWrapper: { display: "flex", alignItems: "center", gap: "16px", padding: "14px 20px", backgroundColor: "#1A1715", border: "1px solid #3A322C", borderRadius: "16px" },
  attachBtn: { background: "none", border: "none", cursor: "pointer", padding: "8px", display: "flex", alignItems: "center", justifyContent: "center" },
  inputForm: { flex: 1, display: "flex", alignItems: "center", gap: "16px" },
  textInput: { flex: 1, background: "none", border: "none", color: "#EAE0C8", fontSize: "15px", outline: "none", fontFamily: "'Inter', sans-serif" },
  sendBtn: { width: "44px", height: "44px", borderRadius: "10px", backgroundColor: "#D4AF37", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  micBtn: { width: "44px", height: "44px", borderRadius: "10px", border: "1px solid", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }
};