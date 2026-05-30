import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Moon, X, Menu } from "lucide-react";

// CORREÇÃO 1: Se ambos estão na pasta components, a importação é com "./"
import "./Navbar.css"; 

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fecha o drawer ao mudar de rota
  useEffect(() => { setMenuOpen(false); }, [location]);

  // Bloqueia scroll do body com menu aberto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // CORREÇÃO 2 (Opcional): Se "O Espaço" for para rolar a página inicial,
  // uma âncora simples com scroll para o topo ajuda caso a pessoa já esteja na Home.
  const handleScrollToTop = () => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* ── BARRA ── */}
      {/* Adicionei um zIndex inline de segurança, caso seu CSS falhe */}
      <nav className={`ark-nav${scrolled ? " ark-nav--scrolled" : ""}`} style={{ position: 'fixed', top: 0, width: '100%', zIndex: 9999 }}>
        <Link to="/" className="ark-logo" onClick={handleScrollToTop}>
          <Moon size={22} color="#D4AF37" className="ark-logo__icon" />
          <span className="ark-logo__text">Arkanum</span>
        </Link>

        {/* Links centrais — só desktop */}
        <div className="ark-links">
          <Link to="/" className="ark-link" onClick={handleScrollToTop}>O Espaço</Link>
          <Link to="/tarologos" className="ark-link">Tarólogos</Link>
        </div>

        {/* CTA — só desktop */}
        <Link to="/login" className="ark-cta ark-cta--desktop">
          Agendar Sessão
        </Link>

        {/* Hamburguer — só mobile */}
        <button
          className="ark-hamburger"
          onClick={() => setMenuOpen(v => !v)}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          style={{ zIndex: 10001 }} // Garante que o botão fique clicável acima do overlay
        >
          {menuOpen
            ? <X size={22} color="#D4AF37" />
            : <Menu size={22} color="#D4AF37" />}
        </button>
      </nav>

      {/* ── OVERLAY ── */}
      <div
        className={`ark-overlay${menuOpen ? " ark-overlay--open" : ""}`}
        onClick={() => setMenuOpen(false)}
        style={{ zIndex: 9998 }}
      />

      {/* ── DRAWER ── */}
      <aside className={`ark-drawer${menuOpen ? " ark-drawer--open" : ""}`} style={{ zIndex: 10000 }}>
        <div className="ark-drawer__accent" />

        <nav className="ark-drawer__links">
          <Link to="/" className="ark-drawer__link" onClick={handleScrollToTop}>
            <span className="ark-drawer__dash" />
            O Espaço
          </Link>
          <Link to="/tarologos" className="ark-drawer__link">
            <span className="ark-drawer__dash" />
            Tarólogos
          </Link>
        </nav>

        <Link to="/login" className="ark-cta ark-cta--mobile">
          ✦ Agendar Sessão
        </Link>

        <p className="ark-drawer__tagline">
          Sabedoria ancestral para a sua jornada.
        </p>
      </aside>
    </>
  );
}