import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./Layout.css";

interface NavItem {
  path: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { path: "/", label: "Dashboard", icon: "🏠" },
  { path: "/courses", label: "Courses", icon: "📚" },
  { path: "/chat", label: "Chat", icon: "💬" },
  { path: "/events", label: "Events", icon: "📅" },
  { path: "/announcements", label: "Announcements", icon: "📢" },
  { path: "/admin", label: "Admin Panel", icon: "⚙️", adminOnly: true },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { currentUser, userProfile, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const visibleNavItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <div className="layout">
      {/* Top Navbar */}
      <header className="navbar">
        <div className="navbar-left">
          <button
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <Link to="/" className="brand">
            <span className="brand-icon">⚔️</span>
            <span className="brand-name">OHAC</span>
          </Link>
        </div>
        <div className="navbar-right">
          {currentUser && (
            <div className="user-menu">
              <img
                src={currentUser.photoURL || "/icons/icon-192.png"}
                alt={currentUser.displayName || "User"}
                className="user-avatar"
              />
              <span className="user-name">{currentUser.displayName?.split(" ")[0]}</span>
              {userProfile?.role && (
                <span className="user-badge">{userProfile.role}</span>
              )}
              <button className="logout-btn" onClick={logout}>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Sidebar */}
      <nav className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">⚔️ OHAC Portal</div>
        </div>
        <ul className="nav-list">
          {visibleNavItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="sidebar-footer">
          <p>Oguaa Hall Army Cadet</p>
          <p>University of Cape Coast</p>
        </div>
      </nav>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <main className="main-content">{children}</main>
    </div>
  );
}
