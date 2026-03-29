import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useUnreadCounts } from "../../hooks/useUnreadCounts";
import logo from "../../assets/logo.png";
import "./Layout.css";

interface NavItem {
  path: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { path: "/", label: "Dashboard", icon: "🏠" },
  { path: "/profile", label: "Profile", icon: "👤" },
  { path: "/courses", label: "Courses", icon: "📚" },
  { path: "/chat", label: "Messages", icon: "💬" },
  { path: "/events", label: "Events", icon: "📅" },
  { path: "/officers", label: "Officers", icon: "🎖️" },
  { path: "/announcements", label: "Announcements", icon: "📢" },
  { path: "/admin", label: "Admin Panel", icon: "⚙️", adminOnly: true },
];

// Items shown in the mobile bottom navigation bar (left to right)
const bottomNavItems: NavItem[] = [
  { path: "/", label: "Dashboard", icon: "🏠" },
  { path: "/courses", label: "Courses", icon: "📚" },
  { path: "/chat", label: "Messages", icon: "💬" },
  { path: "/profile", label: "Profile", icon: "👤" },
];

// Paths that appear in the bottom nav – these are hidden from the sidebar on mobile
const BOTTOM_NAV_PATHS = new Set(bottomNavItems.map((i) => i.path));

export default function Layout({ children }: { children: React.ReactNode }) {
  const { currentUser, userProfile, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    announcementCount,
    eventCount,
    chatCount,
    totalCount,
    markAnnouncementsRead,
    markEventsRead,
    markChatRead,
  } = useUnreadCounts();

  useEffect(() => {
    const handleOpenSidebar = () => setSidebarOpen(true);
    window.addEventListener("ohac:open-sidebar", handleOpenSidebar);
    return () => window.removeEventListener("ohac:open-sidebar", handleOpenSidebar);
  }, []);

  // Mark section as read when user navigates to it
  useEffect(() => {
    if (location.pathname === "/announcements") markAnnouncementsRead();
    else if (location.pathname === "/events") markEventsRead();
    else if (location.pathname === "/chat") markChatRead();
  }, [location.pathname, markAnnouncementsRead, markEventsRead, markChatRead]);

  const visibleNavItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  /** Returns the unread badge count for a given nav path */
  function badgeCount(path: string): number {
    if (path === "/chat") return chatCount;
    if (path === "/announcements") return announcementCount;
    if (path === "/events") return eventCount;
    return 0;
  }

  return (
    <div className="layout">
      {/* Top Navbar */}
      <header className="navbar">
        <div className="navbar-left">
          <button
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
            data-tour-id="menu-toggle"
          >
            ☰
            {totalCount > 0 && <span className="menu-badge-dot" aria-hidden="true" />}
          </button>
          <Link to="/" className="brand" data-tour-id="brand-link">
            <img src={logo} alt="OHAC logo" className="brand-logo" />
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
      <nav className={`sidebar ${sidebarOpen ? "open" : ""}`} data-tour-id="sidebar-nav">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src={logo} alt="OHAC logo" className="sidebar-logo-img" />
            <span>OHAC Portal</span>
          </div>
        </div>
        <ul className="nav-list">
          {visibleNavItems.map((item) => {
            const count = badgeCount(item.path);
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`nav-item ${location.pathname === item.path ? "active" : ""} ${BOTTOM_NAV_PATHS.has(item.path) ? "nav-item--bottom-nav" : ""}`}
                  onClick={() => setSidebarOpen(false)}
                  data-tour-id={item.path === "/" ? "nav-dashboard" : undefined}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  {count > 0 && (
                    <span className="nav-badge" aria-label={`${count} unread`}>
                      {count > 99 ? "99+" : count}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
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
      <main
        className={[
          "main-content",
          sidebarOpen && "main-content--blurred",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </main>

      {/* Bottom Navigation (mobile only) */}
      <nav className="bottom-nav" aria-label="Bottom navigation">
        {bottomNavItems.map((item) => {
          const count = badgeCount(item.path);
          const isActive =
            item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`bottom-nav-item ${isActive ? "active" : ""}`}
              onClick={() => {
                setSidebarOpen(false);
                if (item.path === "/chat") markChatRead();
              }}
            >
              <span className="bottom-nav-icon">{item.icon}</span>
              <span className="bottom-nav-label">{item.label}</span>
              {count > 0 && (
                <span className="bottom-nav-badge" aria-label={`${count} unread`}>
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
