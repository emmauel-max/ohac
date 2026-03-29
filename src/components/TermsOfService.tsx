import "./InfoPages.css";

const sections = [
  {
    title: "Acceptable Use",
    body: "Use this platform for authorized OHAC learning, communication, and official coordination. Misuse, abuse, or unauthorized access attempts are prohibited.",
  },
  {
    title: "Account Responsibility",
    body: "You are responsible for activity under your account. Keep your login secure and report any compromise immediately.",
  },
  {
    title: "Content and Conduct",
    body: "You may not post unlawful, harmful, or offensive content. Administrators can remove content that violates policy.",
  },
  {
    title: "Service Availability",
    body: "The platform may be updated or temporarily unavailable for maintenance. We aim to restore access as quickly as possible.",
  },
  {
    title: "Enforcement",
    body: "Violation of terms may result in warnings, account limits, suspension, or removal based on severity and repeated behavior.",
  },
];

export default function TermsOfService() {
  return (
    <div className="info-page">
      <div className="info-page-header">
        <h1>Terms of Service</h1>
        <p>By using OHAC, you agree to these terms and all applicable academy regulations.</p>
      </div>

      <section className="info-card">
        <h2>Terms Summary</h2>
        <div className="info-list">
          {sections.map((item) => (
            <article key={item.title} className="info-list-item">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="info-card">
        <h2>Updates to Terms</h2>
        <p>
          Terms may be revised to reflect policy or operational changes. Continued use of OHAC after updates means
          you accept the revised terms.
        </p>
      </section>
    </div>
  );
}
