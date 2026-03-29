import "./InfoPages.css";

const principles = [
  {
    title: "Respect and Professionalism",
    body: "Treat every cadet, officer, and staff member with respect. Harassment, insults, and discrimination are not allowed.",
  },
  {
    title: "Integrity",
    body: "Be truthful in communication, coursework, and reporting. Do not spread misinformation or impersonate others.",
  },
  {
    title: "Constructive Communication",
    body: "Use clear and helpful language in chats and posts. Critique ideas, not people.",
  },
  {
    title: "Safety and Privacy",
    body: "Do not share confidential or personal information without consent. Report suspicious or harmful behavior promptly.",
  },
  {
    title: "Accountability",
    body: "Follow moderator and admin guidance. Repeated violations may lead to restricted access or disciplinary action.",
  },
];

export default function CodeOfConduct() {
  return (
    <div className="info-page">
      <div className="info-page-header">
        <h1>Code of Conduct</h1>
        <p>These guidelines help us keep OHAC safe, focused, and professional for everyone.</p>
      </div>

      <section className="info-card">
        <h2>Core Principles</h2>
        <div className="info-list">
          {principles.map((item) => (
            <article key={item.title} className="info-list-item">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="info-card">
        <h2>Reporting Concerns</h2>
        <p>
          If you encounter behavior that violates this code, contact your unit leadership or platform administrators.
          Include screenshots or details when possible to support quick action.
        </p>
      </section>
    </div>
  );
}
