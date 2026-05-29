import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Moon, X, Menu } from "lucide-react";
import "../components/Navbar.css";

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

  return (
    <>
      {/* ── BARRA ── */}
      <nav className={`ark-nav${scrolled ? " ark-nav--scrolled" : ""}`}>
        <Link to="/" className="ark-logo">
          <Moon size={22} color="#D4AF37" className="ark-logo__icon" />
          <span className="ark-logo__text">Arkanum</span>
        </Link>

        {/* Links centrais — só desktop */}
        <div className="ark-links">
          <Link to="/" className="ark-link">O Espaço</Link>
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
      />

      {/* ── DRAWER ── */}
      <aside className={`ark-drawer${menuOpen ? " ark-drawer--open" : ""}`}>
        <div className="ark-drawer__accent" />

        <nav className="ark-drawer__links">
          <Link to="/" className="ark-drawer__link">
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