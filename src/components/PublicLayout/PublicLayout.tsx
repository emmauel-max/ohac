import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/logo.png";
import "./PublicLayout.css";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/officers", label: "Officers" },
  { to: "/events", label: "Events" },
  { to: "/announcements", label: "Announcements" },
  { to: "/join", label: "Join OHAC" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="public-layout">
      {/* Top navigation */}
      <header className={`pub-navbar ${scrolled ? "pub-navbar--scrolled" : ""}`} role="banner">
        <div className="pub-navbar__inner">
          <Link to="/" className="pub-navbar__brand" aria-label="OHAC Home">
            <img src={logo} alt="" aria-hidden="true" className="pub-navbar__logo" />
            <span className="pub-navbar__name">OHAC</span>
          </Link>

          {/* Desktop nav */}
          <nav className="pub-navbar__links" aria-label="Primary navigation">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`pub-nav-link ${location.pathname === link.to ? "pub-nav-link--active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pub-navbar__actions">
            <button
              className="pub-navbar__hamburger"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <span className={`hamburger-icon ${menuOpen ? "hamburger-icon--open" : ""}`}>
                <span /><span /><span />
              </span>
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <nav className="pub-mobile-nav" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`pub-mobile-link ${location.pathname === link.to ? "pub-mobile-link--active" : ""}`}
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            ))}

          </nav>
        )}
      </header>

      {/* Page content */}
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>

      {/* Footer */}
      <footer className="pub-footer">
        <div className="pub-footer__inner">
          <div className="pub-footer__brand">
            <img src={logo} alt="OHAC logo" className="pub-footer__logo" />
            <div>
              <p className="pub-footer__title">Oguaa Hall Army Cadet</p>
              <p className="pub-footer__sub">University of Cape Coast, Ghana</p>
            </div>
          </div>

          <nav className="pub-footer__nav" aria-label="Footer navigation">
            <div className="pub-footer__col">
              <p className="pub-footer__col-heading">Unit</p>
              <Link to="/about">About OHAC</Link>
              <Link to="/officers">Officers</Link>
              <Link to="/gallery">Gallery</Link>
            </div>
            <div className="pub-footer__col">
              <p className="pub-footer__col-heading">Get Involved</p>
              <Link to="/join">Join OHAC</Link>
              <Link to="/events">Events</Link>
              <Link to="/announcements">Announcements</Link>
            </div>
            <div className="pub-footer__col">
              <p className="pub-footer__col-heading">Contact</p>
              <Link to="/contact">Contact Us</Link>
            </div>
          </nav>
        </div>

        <div className="pub-footer__bottom">
          <p>© {new Date().getFullYear()} Oguaa Hall Army Cadet · University of Cape Coast</p>
          <p className="pub-footer__tagline">Discipline · Leadership · Service</p>
        </div>
      </footer>
    </div>
  );
}
