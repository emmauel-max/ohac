import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/logo.png";
import { useAuth } from "../../hooks/useAuth";
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
  const { currentUser, loading, signInWithGoogle, logout, isAdmin, canAccessLogistics } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    setMenuOpen(false);
    setProfileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!profileMenuRef.current) return;
      if (!profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", onClickOutside);
    return () => window.removeEventListener("mousedown", onClickOutside);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      setMenuOpen(false);
    } catch (err) {
      console.error("Google sign-in failed", err);
      alert("Google sign-in failed. Please try again.");
    }
  };

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    setProfileMenuOpen(false);
  };

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
            {!loading && !currentUser && (
              <button className="pub-btn-login" onClick={handleSignIn} type="button">
                Log In
              </button>
            )}
            {!loading && currentUser && (
              <div className="pub-user-menu" ref={profileMenuRef}>
                <button
                  className="pub-user-trigger"
                  type="button"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  aria-haspopup="menu"
                  aria-expanded={profileMenuOpen}
                >
                  <img
                    src={currentUser.photoURL || "/icons/icon-192.png"}
                    alt={currentUser.displayName || "User profile"}
                    className="pub-user-avatar"
                  />
                  <span className="pub-user-name">{currentUser.displayName?.split(" ")[0] || "Profile"}</span>
                  <span className="pub-user-caret">▾</span>
                </button>

                {profileMenuOpen && (
                  <div className="pub-user-dropdown" role="menu">
                    <Link to="/profile" role="menuitem">Profile</Link>
                    <Link to="/portal" role="menuitem">Dashboard</Link>
                    <Link to="/courses" role="menuitem">Courses</Link>
                    <Link to="/chat" role="menuitem">Messages</Link>
                    {canAccessLogistics && <Link to="/logistics" role="menuitem">Logistics</Link>}
                    {isAdmin && <Link to="/admin" role="menuitem">Admin Panel</Link>}
                    <Link to="/privacy-policy" role="menuitem">Privacy Policy</Link>
                    <Link to="/terms-of-service" role="menuitem">Terms of Service</Link>
                    <Link to="/code-of-conduct" role="menuitem">Code of Conduct</Link>
                    <Link to="/faq" role="menuitem">FAQ</Link>
                    <button type="button" onClick={handleLogout}>Sign Out</button>
                  </div>
                )}
              </div>
            )}
            <button
              className="pub-navbar__hamburger"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen.toString()}
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
            {!loading && !currentUser && (
              <button className="pub-mobile-login" onClick={handleSignIn} type="button">
                Log In with Google
              </button>
            )}
            {!loading && currentUser && (
              <>
                <Link to="/profile" className="pub-mobile-link" onClick={closeMenu}>Profile</Link>
                <Link to="/portal" className="pub-mobile-link" onClick={closeMenu}>Dashboard</Link>
                <Link to="/courses" className="pub-mobile-link" onClick={closeMenu}>Courses</Link>
                <Link to="/chat" className="pub-mobile-link" onClick={closeMenu}>Messages</Link>
                {canAccessLogistics && (
                  <Link to="/logistics" className="pub-mobile-link" onClick={closeMenu}>Logistics</Link>
                )}
                {isAdmin && (
                  <Link to="/admin" className="pub-mobile-link" onClick={closeMenu}>Admin Panel</Link>
                )}
                <Link to="/privacy-policy" className="pub-mobile-link" onClick={closeMenu}>Privacy Policy</Link>
                <Link to="/terms-of-service" className="pub-mobile-link" onClick={closeMenu}>Terms of Service</Link>
                <Link to="/code-of-conduct" className="pub-mobile-link" onClick={closeMenu}>Code of Conduct</Link>
                <Link to="/faq" className="pub-mobile-link" onClick={closeMenu}>FAQ</Link>
                <button className="pub-mobile-login" onClick={handleLogout} type="button">
                  Sign Out
                </button>
              </>
            )}

          </nav>
        )}
      </header>

      {/* Page content */}
      <main id="main-content" tabIndex={-1}>
        <div key={location.pathname} className="pub-page-transition">
          {children}
        </div>
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
