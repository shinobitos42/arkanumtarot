import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Loader2, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import api from '../services/api'; 

export default function Register() {
  const navigate = useNavigate();
  
  const [tipoConta, setTipoConta] = useState('consulente'); 
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  
  const [erro, setErro] = useState('');
  const [status, setStatus] = useState('idle');

  // Limpa tokens antigos para evitar conflitos de autenticação no cadastro
  useEffect(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_id');
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setErro('');

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem. Verifique e tente novamente.');
      return;
    }

    if (senha.length < 6) {
      setErro('Por segurança, sua senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setStatus('loading');

    try {
      await api.post('users/register/', {
        first_name: nome,
        email: email,
        username: email, 
        password: senha,
        role: tipoConta.toUpperCase() 
      });
      
      setStatus('success');

      setTimeout(() => {
        navigate('/login');
      }, 3500);

    } catch (error) {
      setStatus('idle');
      
      if (error.response && error.response.data) {
        if (error.response.data.email) {
          setErro('Este e-mail já está em uso por outro usuário.');
        } else {
          setErro('Verifique os dados informados e tente novamente.');
        }
      } else {
        setErro('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
        console.error("Erro no cadastro:", error);
      }
    }
  };

  if (status === 'success') {
    return (
      <div style={styles.container}>
        <div style={styles.successCard}>
          <CheckCircle size={64} color="#D4AF37" style={{ marginBottom: "24px" }} />
          <h2 style={styles.title}>Jornada Iniciada!</h2>
          <p style={styles.subtitle}>
            Sua conta como {tipoConta === 'tarologo' ? 'Guia Espiritual' : 'Consulente'} foi criada com sucesso. Estamos te direcionando para o portal de acesso...
          </p>
          <Loader2 size={24} color="#D4AF37" style={{ marginTop: "24px", animation: "spin 1s linear infinite" }} />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        <div style={styles.header}>
          <h2 style={styles.title}>Inicie sua Jornada</h2>
          <p style={styles.subtitle}>
            Selecione seu caminho e crie sua conta no Arcanum.
          </p>
        </div>

        {/* SELETOR DE TIPO DE CONTA */}
        <div style={styles.roleSelector}>
          <button 
            type="button" 
            onClick={() => setTipoConta('consulente')}
            style={{
              ...styles.roleBtn,
              ...(tipoConta === 'consulente' ? styles.roleBtnActive : {})
            }}
          >
            <User size={18} />
            Sou Consulente
          </button>
          <button 
            type="button" 
            onClick={() => setTipoConta('tarologo')}
            style={{
              ...styles.roleBtn,
              ...(tipoConta === 'tarologo' ? styles.roleBtnActive : {})
            }}
          >
            <Sparkles size={18} />
            Sou Tarólogo(a)
          </button>
        </div>

        {erro && (
          <div style={styles.errorBox}>
            <AlertCircle size={16} color="#ef4444" />
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={handleRegister} style={styles.form} autoComplete="off">
          
          <div style={styles.inputGroup}>
            <User size={18} style={styles.icon} />
            <input 
              type="text" 
              name="nome_registro"
              placeholder="Seu nome completo" 
              required 
              style={styles.input} 
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={status === 'loading'}
              autoComplete="off"
            />
          </div>

          <div style={styles.inputGroup}>
            <Mail size={18} style={styles.icon} />
            <input 
              type="email" 
              name="email_registro"
              placeholder="Seu e-mail" 
              required 
              style={styles.input} 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading'}
              autoComplete="off"
            />
          </div>

          <div style={styles.inputGroup}>
            <Lock size={18} style={styles.icon} />
            <input 
              type="password" 
              name="senha_registro"
              placeholder="Crie uma senha" 
              required 
              style={styles.input} 
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              disabled={status === 'loading'}
              autoComplete="new-password"
            />
          </div>

          <div style={styles.inputGroup}>
            <Lock size={18} style={styles.icon} />
            <input 
              type="password" 
              name="confirmar_senha_registro"
              placeholder="Confirme sua senha" 
              required 
              style={styles.input} 
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              disabled={status === 'loading'}
              autoComplete="new-password"
            />
          </div>

          <button 
            type="submit" 
            style={{
              ...styles.submitBtn, 
              opacity: status === 'loading' ? 0.7 : 1,
              cursor: status === 'loading' ? 'not-allowed' : 'pointer'
            }}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> 
                Manifestando...
              </span>
            ) : (
              'Criar Minha Conta'
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Já faz parte do círculo?{' '}
            <Link to="/login" style={styles.linkBtn}>
              Faça login
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem', fontFamily: "'Inter', sans-serif", backgroundColor: '#110F0E', boxSizing: 'border-box' },
  card: { width: '100%', maxWidth: '440px', backgroundColor: '#1A1715', border: '1px solid #2A2420', borderRadius: '12px', padding: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', boxSizing: 'border-box' },
  successCard: { width: '100%', maxWidth: '440px', backgroundColor: '#1A1715', border: '1px solid #2A2420', borderRadius: '12px', padding: '60px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' },
  header: { textAlign: 'center', marginBottom: '24px' },
  title: { fontFamily: "'Playfair Display', 'Georgia', serif", color: '#D4AF37', fontSize: '28px', fontWeight: 'normal', marginBottom: '8px', fontStyle: 'italic', letterSpacing: '1px' },
  subtitle: { color: '#A89C92', fontSize: '14px', lineHeight: '1.5', fontWeight: '300' },
  roleSelector: { display: 'flex', gap: '12px', marginBottom: '24px' },
  roleBtn: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px 12px', backgroundColor: '#110F0E', border: '1px solid #3A322C', borderRadius: '8px', color: '#786C63', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' },
  roleBtnActive: { backgroundColor: 'rgba(212, 175, 55, 0.1)', borderColor: '#D4AF37', color: '#D4AF37' },
  errorBox: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '12px', borderRadius: '6px', fontSize: '13px', marginBottom: '20px', fontWeight: '500' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { position: 'relative', display: 'flex', alignItems: 'center' },
  icon: { position: 'absolute', left: '14px', color: '#786C63' },
  input: { width: '100%', padding: '14px 14px 14px 44px', backgroundColor: '#110F0E', border: '1px solid #3A322C', borderRadius: '6px', color: '#EAE0C8', fontSize: '14px', fontFamily: "'Inter', sans-serif", outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' },
  submitBtn: { padding: '16px', backgroundColor: '#D4AF37', color: '#151312', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', marginTop: '8px', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(212, 175, 55, 0.2)' },
  footer: { marginTop: '32px', textAlign: 'center', borderTop: '1px solid #2A2420', paddingTop: '20px' },
  footerText: { color: '#A89C92', fontSize: '14px', fontWeight: '300' },
  linkBtn: { color: '#D4AF37', fontWeight: '600', textDecoration: 'none', fontFamily: "'Inter', sans-serif" }
};