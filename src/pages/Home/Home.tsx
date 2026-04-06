import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../../firebase";
import type { Announcement } from "../../types";
import logo from "../../assets/logo.png";
import uccLogo from "../../assets/ucc-logo.png";
import heroBg from "../../assets/background/splash-screen-background.jpg";
import "./Home.css";

const quickCards = [
  {
    to: "/about",
    icon: "🎖️",
    title: "About OHAC",
    desc: "History, mission, values, and our proud legacy at UCC.",
  },
  {
    to: "/events",
    icon: "📅",
    title: "Events",
    desc: "Upcoming parades, training exercises, and activities.",
  },
  {
    to: "/join",
    icon: "✅",
    title: "Join OHAC",
    desc: "Enlist as a cadet — requirements and application steps.",
  },
  {
    to: "/contact",
    icon: "📬",
    title: "Contact",
    desc: "Reach the unit office, find our location on campus.",
  },
];

const achievements = [
  { icon: "🏆", text: "Best Cadet Unit — UCC Inter-Hall Competition 2023" },
  { icon: "🎗️", text: "Commandant's Commendation for Community Service 2022" },
  { icon: "🥇", text: "Regional Drill Champions — Ghana Army Cadet Games 2022" },
  { icon: "📚", text: "100+ cadets trained in leadership & first-aid annually" },
];

const priorityColors: Record<string, string> = {
  urgent: "#dc2626",
  high: "#c05a00",
  normal: "#1a4a1a",
  low: "#666",
};

export default function Home() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingAnn, setLoadingAnn] = useState(true);

  useEffect(() => {
    const fetchAnn = async () => {
      try {
        const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"), limit(3));
        const snap = await getDocs(q);
        setAnnouncements(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Announcement)));
      } catch {
        // Silently ignore — data is optional on the landing page
      } finally {
        setLoadingAnn(false);
      }
    };
    fetchAnn();
  }, []);

  return (
    <div className="home">
      <Helmet>
        <title>OHAC — Oguaa Hall Army Cadet</title>
        <meta name="description" content="Oguaa Hall Army Cadet (OHAC) — Discipline. Leadership. Service. Based at the University of Cape Coast, Ghana." />
        <link rel="canonical" href="https://oguaa-hall-army-cadet.web.app/" />
        <meta property="og:title" content="OHAC — Oguaa Hall Army Cadet" />
        <meta property="og:description" content="Discipline. Leadership. Service. The official website of the Oguaa Hall Army Cadet unit at the University of Cape Coast, Ghana." />
        <meta property="og:url" content="https://oguaa-hall-army-cadet.web.app/" />
      </Helmet>
      {/* ── Hero ─────────────────────────────────────── */}
      <section
        className="home-hero"
        aria-label="Hero banner"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="home-hero__overlay" aria-hidden="true" />
        <div className="home-hero__content">
          <div className="home-hero__logos">
            <img src={logo} alt="OHAC crest" className="home-hero__logo" />
            <img src={uccLogo} alt="University of Cape Coast logo" className="home-hero__logo home-hero__logo--ucc" />
          </div>
          <h1 className="home-hero__heading">
            Oguaa Hall<br />Army Cadet
          </h1>
          <p className="home-hero__tagline">Discipline · Leadership · Service</p>
          <p className="home-hero__sub">
            University of Cape Coast, Ghana
          </p>
          <div className="home-hero__cta">
            <Link to="/join" className="btn-primary">Enlist Now</Link>
            <Link to="/about" className="btn-outline">Learn More</Link>
          </div>
        </div>
      </section>

      {/* ── Intro strip ──────────────────────────────── */}
      <section className="home-intro" aria-labelledby="intro-heading">
        <div className="home-intro__inner">
          <p id="intro-heading" className="home-intro__text">
            The <strong>Oguaa Hall Army Cadet (OHAC)</strong> is the cadet corps of Oguaa Hall at the
            University of Cape Coast. Affiliated with the Ghana Army, OHAC trains university students
            to become disciplined leaders committed to national service, physical excellence, and
            academic achievement.
          </p>
        </div>
      </section>

      {/* ── Quick-access cards ───────────────────────── */}
      <section className="home-cards" aria-labelledby="cards-heading">
        <div className="home-cards__inner">
          <h2 id="cards-heading" className="section-heading">Explore OHAC</h2>
          <div className="home-cards__grid">
            {quickCards.map((card) => (
              <Link key={card.to} to={card.to} className="home-card">
                <span className="home-card__icon" aria-hidden="true">{card.icon}</span>
                <h3 className="home-card__title">{card.title}</h3>
                <p className="home-card__desc">{card.desc}</p>
                <span className="home-card__arrow" aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Achievements highlight strip ─────────────── */}
      <section className="home-achievements" aria-labelledby="ach-heading">
        <div className="home-achievements__inner">
          <h2 id="ach-heading" className="section-heading section-heading--light">Recent Achievements</h2>
          <div className="home-ach-grid">
            {achievements.map((a) => (
              <div key={a.text} className="home-ach-item">
                <span className="home-ach-icon" aria-hidden="true">{a.icon}</span>
                <p>{a.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Latest Announcements ─────────────────────── */}
      <section className="home-announcements" aria-labelledby="ann-heading">
        <div className="home-announcements__inner">
          <div className="home-ann-header">
            <h2 id="ann-heading" className="section-heading">Latest Announcements</h2>
            <Link to="/announcements" className="view-all-link">View all →</Link>
          </div>

          {loadingAnn ? (
            <p className="home-loading">Loading announcements…</p>
          ) : announcements.length === 0 ? (
            <p className="home-empty">No announcements at this time. Check back soon.</p>
          ) : (
            <div className="home-ann-list">
              {announcements.map((ann) => (
                <article key={ann.id} className="home-ann-card" style={{ borderLeftColor: priorityColors[ann.priority] }}>
                  <span className="home-ann-priority" style={{ background: priorityColors[ann.priority] }}>
                    {ann.priority}
                  </span>
                  <h3 className="home-ann-title">{ann.title}</h3>
                  <p className="home-ann-excerpt">
                    {ann.content.length > 140 ? ann.content.slice(0, 140) + "…" : ann.content}
                  </p>
                  <p className="home-ann-meta">
                    {ann.author} ·{" "}
                    {new Date(ann.createdAt).toLocaleDateString("en-GH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Join CTA ─────────────────────────────────── */}
      <section className="home-join" aria-labelledby="join-heading">
        <div className="home-join__inner">
          <h2 id="join-heading" className="home-join__heading">Ready to Serve?</h2>
          <p className="home-join__text">
            Join the ranks of OHAC — open to all undergraduate students at the University of Cape Coast.
            No prior military experience required.
          </p>
          <Link to="/join" className="btn-primary btn-primary--large">Start Your Application</Link>
        </div>
      </section>
    </div>
  );
}
