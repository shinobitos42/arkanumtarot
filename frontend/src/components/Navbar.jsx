import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav style={styles.nav}>
      <div style={styles.logoBox}>
        <h3 style={styles.logoText}>Arcanum</h3>
      </div>
      
      <div style={styles.linkBox}>
        <Link to="/" style={styles.link}>O Espaço</Link>
        {/* Agora o link de Tarólogos força a pessoa a passar pelo Login */}
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