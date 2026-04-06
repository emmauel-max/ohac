import logo from "../../assets/logo.png";
import uccLogo from "../../assets/ucc-logo.png";
import "./About.css";
import { Helmet } from "react-helmet-async";

const values = [
  { icon: "🛡️", title: "Discipline", desc: "We uphold the highest standards of conduct, punctuality, and military bearing at all times." },
  { icon: "🌟", title: "Leadership", desc: "We develop leaders who inspire by example, make sound decisions, and serve with integrity." },
  { icon: "🤝", title: "Service", desc: "We are committed to community development, national service, and contributing to a better Ghana." },
  { icon: "💪", title: "Excellence", desc: "We pursue excellence in physical fitness, academic achievement, and professional development." },
  { icon: "🏅", title: "Honour", desc: "We act with honour and pride, representing OHAC and UCC with distinction." },
  { icon: "🤲", title: "Camaraderie", desc: "We build a tight-knit family that supports each other through every challenge and triumph." },
];

const structure = [
  { rank: "Major", role: "Commandant", desc: "Overall command and strategic leadership of the unit." },
  { rank: "Captain", role: "Second in Command", desc: "Assists the Commandant and oversees day-to-day operations." },
  { rank: "Captain", role: "Adjutant", desc: "Administration, discipline, and unit correspondence." },
  { rank: "Lieutenant", role: "Training Officer", desc: "Plans and supervises all training programmes and exercises." },
  { rank: "Lieutenant", role: "Quartermaster", desc: "Management of equipment, stores, and logistics." },
  { rank: "WO Class 2", role: "Regimental Sergeant Major", desc: "Senior NCO; maintains discipline and drill standards." },
];

export default function About() {
  return (
    <div className="about-page">
      <Helmet>
        <title>About OHAC — Oguaa Hall Army Cadet</title>
        <meta name="description" content="Learn about OHAC's history, mission, core values, and organisational structure at the University of Cape Coast, Ghana." />
        <link rel="canonical" href="https://oguaa-hall-army-cadet.web.app/about" />
        <meta property="og:title" content="About OHAC — Oguaa Hall Army Cadet" />
        <meta property="og:description" content="History, mission, core values, and structure of the Oguaa Hall Army Cadet unit at UCC." />
        <meta property="og:url" content="https://oguaa-hall-army-cadet.web.app/about" />
      </Helmet>
      {/* ── Page hero ──────────────────────────────── */}
      <section className="page-hero page-hero--about" aria-labelledby="about-hero-heading">
        <div className="page-hero__overlay" aria-hidden="true" />
        <div className="page-hero__content">
          <h1 id="about-hero-heading" className="page-hero__title">About OHAC</h1>
          <p className="page-hero__sub">Our history, mission, and the people who make us who we are.</p>
        </div>
      </section>

      {/* ── History ────────────────────────────────── */}
      <section className="about-section" aria-labelledby="history-heading">
        <div className="about-section__inner">
          <h2 id="history-heading" className="section-heading">Our History</h2>
          <div className="about-text-block">
            <p>
              The <strong>Oguaa Hall Army Cadet (OHAC)</strong> was established as the cadet wing of
              Oguaa Hall at the University of Cape Coast. Named after the historic Oguaa people —
              the original inhabitants of Cape Coast — the unit carries forward a tradition of pride,
              discipline, and service rooted in the hall's identity.
            </p>
            <p>
              From its founding, OHAC has trained generations of university students in military
              discipline, leadership, and civic responsibility. Affiliated with the <strong>Ghana Army</strong>,
              the unit follows the Ghana Armed Forces cadet syllabus while adapting training to the
              university environment.
            </p>
            <p>
              Over the years, OHAC has earned recognition at inter-hall competitions, national cadet
              events, and community service initiatives, cementing its reputation as one of the most
              distinguished cadet units at UCC.
            </p>
          </div>
        </div>
      </section>

      {/* ── Mission ────────────────────────────────── */}
      <section className="about-mission" aria-labelledby="mission-heading">
        <div className="about-section__inner">
          <h2 id="mission-heading" className="section-heading section-heading--light">Our Mission</h2>
          <blockquote className="about-mission__quote">
            "To develop disciplined, physically fit, and mentally resilient cadets who uphold the
            highest standards of military excellence, academic achievement, and national service —
            embodying the values of Discipline, Leadership, and Service."
          </blockquote>
        </div>
      </section>

      {/* ── Core Values ────────────────────────────── */}
      <section className="about-section" aria-labelledby="values-heading">
        <div className="about-section__inner">
          <h2 id="values-heading" className="section-heading">Core Values</h2>
          <div className="about-values-grid">
            {values.map((v) => (
              <div key={v.title} className="about-value-card">
                <span className="about-value-icon" aria-hidden="true">{v.icon}</span>
                <h3 className="about-value-title">{v.title}</h3>
                <p className="about-value-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Org Structure ──────────────────────────── */}
      <section className="about-structure" aria-labelledby="structure-heading">
        <div className="about-section__inner">
          <h2 id="structure-heading" className="section-heading section-heading--light">
            Organisational Structure
          </h2>
          <div className="about-structure-list">
            {structure.map((item) => (
              <div key={item.role} className="about-structure-item">
                <div className="about-structure-rank">{item.rank}</div>
                <div>
                  <p className="about-structure-role">{item.role}</p>
                  <p className="about-structure-desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Affiliations ───────────────────────────── */}
      <section className="about-section" aria-labelledby="affil-heading">
        <div className="about-section__inner">
          <h2 id="affil-heading" className="section-heading">Affiliations</h2>
          <div className="about-affil-grid">
            <div className="about-affil-card">
              <img src={uccLogo} alt="University of Cape Coast logo" className="about-affil-logo" />
              <div>
                <h3 className="about-affil-name">University of Cape Coast</h3>
                <p className="about-affil-desc">
                  OHAC is the cadet unit of Oguaa Hall, University of Cape Coast — a leading
                  public university in Ghana.
                </p>
              </div>
            </div>
            <div className="about-affil-card">
              <img src={logo} alt="OHAC / Ghana Army cadet crest" className="about-affil-logo" />
              <div>
                <h3 className="about-affil-name">Ghana Army</h3>
                <p className="about-affil-desc">
                  As an affiliated cadet unit, OHAC follows the Ghana Armed Forces cadet
                  training syllabus and maintains formal ties with the Ghana Army.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
