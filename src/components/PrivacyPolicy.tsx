import "./InfoPages.css";

const sections = [
  {
    title: "Information We Collect",
    body: "OHAC stores account profile details, course participation data, and essential activity records needed to run academy communication and training workflows.",
  },
  {
    title: "How We Use Information",
    body: "Your data is used to provide platform features such as messaging, announcements, events, and personalized profile settings.",
  },
  {
    title: "Data Sharing",
    body: "Personal data is not sold. Information is shared only with authorized academy staff, admins, or technical providers when required for service operation.",
  },
  {
    title: "Data Security",
    body: "Reasonable technical and organizational measures are applied to protect stored data. Users should also keep account credentials private.",
  },
  {
    title: "Your Choices",
    body: "You can update profile information and notification settings at any time. For data correction or removal requests, contact platform administrators.",
  },
  {
    title: "Policy Updates",
    body: "This Privacy Policy may be revised to reflect legal, operational, or technical changes. Continued use of OHAC indicates acceptance of updates.",
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="info-page">
      <div className="info-page-header">
        <h1>Privacy Policy</h1>
        <p>How OHAC collects, uses, and protects your information.</p>
      </div>

      <section className="info-card">
        <h2>Policy Summary</h2>
        <div className="info-list">
          {sections.map((item) => (
            <article key={item.title} className="info-list-item">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
