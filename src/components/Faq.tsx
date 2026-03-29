import "./InfoPages.css";

const faqs = [
  {
    question: "How do I update my profile information?",
    answer: "Open Profile, edit your details under Profile Settings, and click Save Profile Settings.",
  },
  {
    question: "Why am I not receiving notifications?",
    answer: "Check notification toggles in Profile and make sure browser notifications are enabled for this site.",
  },
  {
    question: "How do I reset or replay the onboarding tour?",
    answer: "Go to Profile and use Start Tour Now or Reset Tour in the Guided Tour section.",
  },
  {
    question: "Who can view my profile?",
    answer: "Cadets and admins with access to the platform can view public profile details relevant to collaboration.",
  },
  {
    question: "Where do I report a technical issue?",
    answer: "Notify your admin team or unit leadership with a description of the issue and steps to reproduce it.",
  },
];

export default function Faq() {
  return (
    <div className="info-page">
      <div className="info-page-header">
        <h1>Frequently Asked Questions</h1>
        <p>Quick answers to common questions about using OHAC.</p>
      </div>

      <section className="info-card">
        <h2>FAQs</h2>
        <div className="faq-list">
          {faqs.map((item) => (
            <article key={item.question} className="faq-item">
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
