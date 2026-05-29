import { Link } from 'react-router-dom';
import { Moon } from 'lucide-react';

export default function Navbar() {
  return (
    // Adicionamos a classe 'nav-mobile' para facilitar o controle pelo mobile.css
    <nav className="nav-mobile" style={styles.nav}>
      <div style={styles.logoBox}>
        <Moon size={24} color="#D4AF37" style={{ marginRight: '8px' }} />
        <h3 style={styles.logoText}>Arkanum</h3>
      </div>
      
      <div className="grid-mobile" style={styles.linkBox}>
        <Link to="/" style={styles.link}>O Espaço</Link>
        <Link to="/login" style={styles.link}>Tarólogos</Link>
      </div>

      <Link to="/login" style={styles.loginBtn}>Agendar Sessão</Link>
    </nav>
  );
}

const styles = {
  nav: {
    width: '100%',
    boxSizing: 'border-box', 
    padding: '1.5rem 5%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#151312',
    borderBottom: '1px solid #3A322C',
    zIndex: 100,
    fontFamily: "'Playfair Display', 'Georgia', serif"
  },
  logoBox: { display: 'flex', alignItems: 'center' },
  logoText: { margin: 0, color: '#D4AF37', fontSize: '1.6rem', fontWeight: 'normal', letterSpacing: '2px', fontStyle: 'italic' },
  linkBox: { display: 'flex', gap: '2.5rem' },
  link: { color: '#EAE0C8', textDecoration: 'none', fontSize: '1rem', transition: 'color 0.3s', letterSpacing: '1px' },
  loginBtn: { color: '#151312', backgroundColor: '#D4AF37', padding: '10px 24px', borderRadius: '2px', textDecoration: 'none', fontSize: '0.95rem', fontFamily: "'Inter', sans-serif", fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }
};