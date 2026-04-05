import { useState } from "react";
import "./Join.css";

const steps = [
  { num: 1, title: "Check Eligibility", desc: "Confirm you meet the academic and physical requirements listed below." },
  { num: 2, title: "Attend Orientation", desc: "Attend the next scheduled OHAC orientation day — watch announcements for dates." },
  { num: 3, title: "Complete the Form", desc: "Fill in the enlistment form below or collect a physical copy from the unit office." },
  { num: 4, title: "Medical Check", desc: "Undergo a basic fitness and medical assessment conducted by OHAC instructors." },
  { num: 5, title: "Attestation Parade", desc: "Take your oath and be formally admitted as an OHAC cadet at the attestation parade." },
];

const faqs = [
  {
    q: "Do I need prior military experience?",
    a: "No. OHAC trains cadets from the ground up. All you need is enthusiasm, commitment, and a willingness to learn.",
  },
  {
    q: "How much time does it require?",
    a: "Training sessions typically run twice a week, with additional time for events, parades, and camps. Expect to commit 4–6 hours per week.",
  },
  {
    q: "Is OHAC membership open to all courses of study?",
    a: "Yes. Any undergraduate student at UCC enrolled in Oguaa Hall or affiliated accommodation may apply.",
  },
  {
    q: "Are there fees involved?",
    a: "Minimal dues cover administrative costs and uniform maintenance. Contact the unit office for the current schedule.",
  },
  {
    q: "What do cadets gain from OHAC?",
    a: "Leadership skills, physical fitness, discipline, teamwork, networking with Ghana Army officers, and a competitive edge for career and national service.",
  },
  {
    q: "Can female students join?",
    a: "Absolutely. OHAC welcomes female cadets and has produced outstanding women leaders who have gone on to serve in Ghana's public institutions.",
  },
];

interface FormData {
  fullName: string;
  studentId: string;
  programme: string;
  yearOfStudy: string;
  email: string;
  phone: string;
  message: string;
}

const INITIAL_FORM: FormData = {
  fullName: "",
  studentId: "",
  programme: "",
  yearOfStudy: "",
  email: "",
  phone: "",
  message: "",
};

export default function Join() {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production this would POST to a backend or Firebase function.
    // For now, show a success message.
    setSubmitted(true);
    setForm(INITIAL_FORM);
  };

  return (
    <div className="join-page">
      {/* ── Page hero ───────────────────────────────── */}
      <section className="page-hero page-hero--join" aria-labelledby="join-hero-heading">
        <div className="page-hero__overlay" aria-hidden="true" />
        <div className="page-hero__content">
          <h1 id="join-hero-heading" className="page-hero__title">Join OHAC</h1>
          <p className="page-hero__sub">Begin your journey in Discipline, Leadership, and Service.</p>
        </div>
      </section>

      {/* ── Eligibility ─────────────────────────────── */}
      <section className="join-section" aria-labelledby="eligibility-heading">
        <div className="join-section__inner">
          <h2 id="eligibility-heading" className="section-heading">Eligibility Requirements</h2>
          <ul className="join-eligibility-list">
            <li><span aria-hidden="true">✅</span> Currently enrolled as an undergraduate student at the University of Cape Coast</li>
            <li><span aria-hidden="true">✅</span> Resident in Oguaa Hall or affiliated accommodation</li>
            <li><span aria-hidden="true">✅</span> Physically fit with no medical conditions that preclude strenuous activity</li>
            <li><span aria-hidden="true">✅</span> Of good character and academic standing (no active disciplinary actions)</li>
            <li><span aria-hidden="true">✅</span> Aged 18 years or above</li>
            <li><span aria-hidden="true">✅</span> Willing to commit to scheduled training, parades, and unit activities</li>
          </ul>
        </div>
      </section>

      {/* ── Steps ────────────────────────────────────── */}
      <section className="join-steps-section" aria-labelledby="steps-heading">
        <div className="join-section__inner">
          <h2 id="steps-heading" className="section-heading section-heading--light">Enlistment Process</h2>
          <ol className="join-steps" aria-label="Enlistment steps">
            {steps.map((s) => (
              <li key={s.num} className="join-step">
                <span className="join-step__num" aria-label={`Step ${s.num}`}>{s.num}</span>
                <div>
                  <h3 className="join-step__title">{s.title}</h3>
                  <p className="join-step__desc">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────── */}
      <section className="join-section" aria-labelledby="faq-heading">
        <div className="join-section__inner">
          <h2 id="faq-heading" className="section-heading">Frequently Asked Questions</h2>
          <div className="join-faq-list" role="list">
            {faqs.map((faq, idx) => (
              <div key={idx} className="join-faq-item" role="listitem">
                <button
                  className={`join-faq-question ${openFaq === idx ? "join-faq-question--open" : ""}`}
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  aria-expanded={openFaq === idx}
                >
                  {faq.q}
                  <span className="join-faq-chevron" aria-hidden="true">{openFaq === idx ? "▲" : "▼"}</span>
                </button>
                {openFaq === idx && (
                  <div className="join-faq-answer">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Enlistment form ──────────────────────────── */}
      <section className="join-form-section" aria-labelledby="form-heading">
        <div className="join-section__inner join-section__inner--narrow">
          <h2 id="form-heading" className="section-heading">Enlistment Form</h2>

          {submitted ? (
            <div className="join-success" role="status" aria-live="polite">
              <span aria-hidden="true">✅</span>
              <p>
                <strong>Application received!</strong> Our team will review your details and contact
                you with next steps. Welcome to the OHAC family.
              </p>
            </div>
          ) : (
            <form className="join-form" onSubmit={handleSubmit} noValidate>
              <div className="join-form__row">
                <div className="join-field">
                  <label htmlFor="fullName">Full Name <span aria-hidden="true" className="required">*</span></label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Kofi Mensah"
                    autoComplete="name"
                  />
                </div>
                <div className="join-field">
                  <label htmlFor="studentId">Student ID <span aria-hidden="true" className="required">*</span></label>
                  <input
                    id="studentId"
                    name="studentId"
                    type="text"
                    value={form.studentId}
                    onChange={handleChange}
                    required
                    placeholder="e.g. UCC/SC/2024/0001"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="join-form__row">
                <div className="join-field">
                  <label htmlFor="programme">Programme of Study <span aria-hidden="true" className="required">*</span></label>
                  <input
                    id="programme"
                    name="programme"
                    type="text"
                    value={form.programme}
                    onChange={handleChange}
                    required
                    placeholder="e.g. BSc Computer Science"
                  />
                </div>
                <div className="join-field">
                  <label htmlFor="yearOfStudy">Year of Study <span aria-hidden="true" className="required">*</span></label>
                  <select
                    id="yearOfStudy"
                    name="yearOfStudy"
                    value={form.yearOfStudy}
                    onChange={handleChange}
                    required
                  >
                    <option value="">— Select year —</option>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                  </select>
                </div>
              </div>

              <div className="join-form__row">
                <div className="join-field">
                  <label htmlFor="email">Email Address <span aria-hidden="true" className="required">*</span></label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="you@st.ucc.edu.gh"
                    autoComplete="email"
                  />
                </div>
                <div className="join-field">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+233 XX XXX XXXX"
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div className="join-field">
                <label htmlFor="message">Why do you want to join OHAC?</label>
                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tell us a bit about yourself and your motivation…"
                />
              </div>

              <button type="submit" className="btn-primary join-submit-btn">
                Submit Application
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
