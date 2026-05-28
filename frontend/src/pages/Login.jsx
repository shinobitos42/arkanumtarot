import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api'; 

export default function Login() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [status, setStatus] = useState('idle');

  // Limpa qualquer token antigo ou inválido ao entrar na tela de login
  useEffect(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_id');
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');

    if (!email || !senha) {
      setErro('Por favor, preencha todos os campos.');
      return;
    }

    setStatus('loading');

    try {
      const response = await api.post('users/login/', {
        email: email,
        password: senha
      });

      const data = response.data;
      
      // Salva as credenciais atualizadas fornecidas pelo backend
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user_role', data.role);
      localStorage.setItem('user_name', data.first_name);
      localStorage.setItem('user_id', data.id); 
      
      setStatus('success');

      setTimeout(() => {
        if (data.role === 'TAROLOGO') {
          navigate('/painel-tarologo'); 
        } else {
          navigate('/dashboard'); 
        }
      }, 2500);

    } catch (error) {
      setStatus('idle');
      
      if (error.response && error.response.status === 401) {
        setErro('E-mail ou senha incorretos. Verifique suas credenciais.');
      } else {
        setErro('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
        console.error("Erro na requisição:", error);
      }
    }
  };

  if (status === 'success') {
    return (
      <div style={styles.container}>
        <div style={styles.successCard}>
          <CheckCircle size={64} color="#D4AF37" style={{ marginBottom: "24px" }} />
          <h2 style={styles.title}>Conexão Estabelecida</h2>
          <p style={styles.subtitle}>
            Bem-vindo de volta ao Círculo. Preparando o seu espaço...
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
          <h2 style={styles.title}>Acesso ao Círculo</h2>
          <p style={styles.subtitle}>
            Entre para continuar a sua jornada espiritual.
          </p>
        </div>

        {erro && (
          <div style={styles.errorBox}>
            <AlertCircle size={16} color="#ef4444" />
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={styles.form} autoComplete="off">
          
          <div style={styles.inputGroup}>
            <Mail size={18} style={styles.icon} />
            <input 
              type="email" 
              name="email"
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
              name="password"
              placeholder="Sua senha" 
              required 
              style={styles.input} 
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              disabled={status === 'loading'}
              autoComplete="new-password" 
            />
          </div>

          <div style={styles.forgotPassword}>
            <Link to="#" style={styles.forgotLink}>Esqueceu a senha?</Link>
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
                Conectando...
              </span>
            ) : (
              'Entrar no Arcanum'
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Ainda não faz parte?{' '}
            <Link to="/register" style={styles.linkBtn}>
              Crie sua conta
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
  header: { textAlign: 'center', marginBottom: '32px' },
  title: { fontFamily: "'Playfair Display', 'Georgia', serif", color: '#D4AF37', fontSize: '28px', fontWeight: 'normal', marginBottom: '8px', fontStyle: 'italic', letterSpacing: '1px' },
  subtitle: { color: '#A89C92', fontSize: '14px', lineHeight: '1.5', fontWeight: '300' },
  errorBox: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '12px', borderRadius: '6px', fontSize: '13px', marginBottom: '20px', fontWeight: '500' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { position: 'relative', display: 'flex', alignItems: 'center' },
  icon: { position: 'absolute', left: '14px', color: '#786C63' },
  input: { width: '100%', padding: '14px 14px 14px 44px', backgroundColor: '#110F0E', border: '1px solid #3A322C', borderRadius: '6px', color: '#EAE0C8', fontSize: '14px', fontFamily: "'Inter', sans-serif", outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' },
  forgotPassword: { display: 'flex', justifyContent: 'flex-end', marginTop: '-10px' },
  forgotLink: { color: '#786C63', fontSize: '12px', textDecoration: 'none', transition: 'color 0.2s' },
  submitBtn: { padding: '16px', backgroundColor: '#D4AF37', color: '#151312', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', marginTop: '8px', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(212, 175, 55, 0.2)' },
  footer: { marginTop: '32px', textAlign: 'center', borderTop: '1px solid #2A2420', paddingTop: '20px' },
  footerText: { color: '#A89C92', fontSize: '14px', fontWeight: '300' },
  linkBtn: { color: '#D4AF37', fontWeight: '600', textDecoration: 'none', fontFamily: "'Inter', sans-serif" }
};