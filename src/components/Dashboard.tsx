import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import logo from "../assets/logo.png";
import uccLogo from "../assets/ucc-logo.png";
import type { Announcement } from "../types";
import "./Dashboard.css";

export default function Dashboard() {
  const { currentUser, userProfile } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const q = query(
          collection(db, "announcements"),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Announcement));
        setAnnouncements(data);
      } catch (err) {
        console.error("Failed to fetch announcements", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  const stats = [
    { label: "Active Cadets", value: "120+", icon: "👥" },
    { label: "Courses Available", value: "8", icon: "📚" },
    { label: "Training Hours", value: "500+", icon: "⏱️" },
    { label: "Years Active", value: "15+", icon: "🏆" },
  ];

  const quickLinks = [
    { to: "/courses", label: "Browse Courses", icon: "📚", color: "#2d6a2d" },
    { to: "/chat", label: "Cadet Chat", icon: "💬", color: "#1a4a7a" },
    { to: "/events", label: "Upcoming Events", icon: "📅", color: "#7a4a1a" },
    { to: "/announcements", label: "Announcements", icon: "📢", color: "#7a1a1a" },
  ];

  const priorityColors: Record<string, string> = {
    urgent: "#dc2626",
    high: "#ea580c",
    normal: "#1a4a1a",
    low: "#666",
  };

  return (
    <div className="dashboard">
      {/* Hero */}
      <div className="hero" data-tour-id="dashboard-hero">
        <div className="hero-content">
          <h1>Welcome back, {currentUser?.displayName?.split(" ")[0] || "Cadet"}</h1>
          <p>
            {userProfile?.rank
              ? `Rank: ${userProfile.rank}`
              : "Oguaa Hall Army Cadet · University of Cape Coast"}
          </p>
        </div>
        <div className="hero-badge">
          <img src={logo} alt="OHAC logo" className="hero-logo" />
          <img src={uccLogo} alt="UCC logo" className="hero-logo" />
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <section className="section" data-tour-id="quick-links-section">
        <h2 className="section-title">Quick Access</h2>
        <div className="quick-links">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="quick-link"
              style={{ "--link-color": link.color } as React.CSSProperties}
            >
              <span className="quick-link-icon">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Announcements */}
      <section className="section" data-tour-id="announcements-section">
        <div className="section-header">
          <h2 className="section-title">Latest Announcements</h2>
          <Link to="/announcements" className="view-all">View All →</Link>
        </div>
        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : announcements.length === 0 ? (
          <div className="empty-state">
            <p>📢 No announcements yet.</p>
          </div>
        ) : (
          <div className="announcements-list">
            {announcements.map((ann) => (
              <div key={ann.id} className="announcement-card">
                <div
                  className="priority-badge"
                  style={{ background: priorityColors[ann.priority] }}
                >
                  {ann.priority}
                </div>
                <h3>{ann.title}</h3>
                <p>{ann.content}</p>
                <div className="announcement-meta">
                  <span>By {ann.author}</span>
                  <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Mission Statement */}
      <section className="section mission-section">
        <h2 className="section-title">Our Mission</h2>
        <p className="mission-text">
          The Oguaa Hall Army Cadet (OHAC) at the University of Cape Coast is dedicated to
          developing disciplined, physically fit, and mentally sharp cadets who uphold the
          highest standards of military excellence, academic achievement, and national service.
        </p>
      </section>
    </div>
  );
}
