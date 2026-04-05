import { useState } from "react";
import "./Contact.css";

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const INITIAL: ContactForm = { name: "", email: "", subject: "", message: "" };

export default function Contact() {
  const [form, setForm] = useState<ContactForm>(INITIAL);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setForm(INITIAL);
  };

  return (
    <div className="contact-page">
      {/* Hero */}
      <section className="page-hero page-hero--contact" aria-labelledby="contact-hero-heading">
        <div className="page-hero__overlay" aria-hidden="true" />
        <div className="page-hero__content">
          <h1 id="contact-hero-heading" className="page-hero__title">Contact Us</h1>
          <p className="page-hero__sub">Reach our unit office or send us a message.</p>
        </div>
      </section>

      <div className="contact-body">
        {/* ── Info cards ────────────────────────────── */}
        <aside className="contact-info" aria-labelledby="contact-info-heading">
          <h2 id="contact-info-heading" className="section-heading">Get in Touch</h2>

          <div className="contact-info-card">
            <span className="contact-info-icon" aria-hidden="true">📍</span>
            <div>
              <p className="contact-info-label">Location</p>
              <p className="contact-info-value">
                Oguaa Hall, University of Cape Coast<br />
                Cape Coast, Central Region, Ghana
              </p>
            </div>
          </div>

          <div className="contact-info-card">
            <span className="contact-info-icon" aria-hidden="true">📧</span>
            <div>
              <p className="contact-info-label">Email</p>
              <a href="mailto:ohac@ucc.edu.gh" className="contact-info-value contact-link">
                ohac@ucc.edu.gh
              </a>
            </div>
          </div>

          <div className="contact-info-card">
            <span className="contact-info-icon" aria-hidden="true">📞</span>
            <div>
              <p className="contact-info-label">Phone</p>
              <a href="tel:+233000000000" className="contact-info-value contact-link">
                +233 (0) 000 000 000
              </a>
            </div>
          </div>

          <div className="contact-info-card">
            <span className="contact-info-icon" aria-hidden="true">🕐</span>
            <div>
              <p className="contact-info-label">Office Hours</p>
              <p className="contact-info-value">
                Mon – Fri: 9:00 AM – 4:00 PM<br />
                (During academic semester)
              </p>
            </div>
          </div>

          <div className="contact-social">
            <p className="contact-social-heading">Follow OHAC</p>
            <div className="contact-social-links">
              <a
                href="https://www.facebook.com"
                className="contact-social-btn"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                Facebook
              </a>
              <a
                href="https://www.instagram.com"
                className="contact-social-btn"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
              <a
                href="https://x.com"
                className="contact-social-btn"
                aria-label="X / Twitter"
                target="_blank"
                rel="noopener noreferrer"
              >
                X (Twitter)
              </a>
            </div>
          </div>
        </aside>

        {/* ── Contact form ──────────────────────────── */}
        <section className="contact-form-section" aria-labelledby="contact-form-heading">
          <h2 id="contact-form-heading" className="section-heading">Send a Message</h2>

          {submitted ? (
            <div className="contact-success" role="status" aria-live="polite">
              <span aria-hidden="true">✅</span>
              <p>
                <strong>Message sent!</strong> Thank you for reaching out.
                We will get back to you as soon as possible.
              </p>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <div className="contact-field">
                <label htmlFor="cname">
                  Your Name <span aria-hidden="true" className="required">*</span>
                </label>
                <input
                  id="cname"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Full name"
                  autoComplete="name"
                />
              </div>

              <div className="contact-field">
                <label htmlFor="cemail">
                  Email Address <span aria-hidden="true" className="required">*</span>
                </label>
                <input
                  id="cemail"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              <div className="contact-field">
                <label htmlFor="csubject">Subject</label>
                <input
                  id="csubject"
                  name="subject"
                  type="text"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="What is this about?"
                />
              </div>

              <div className="contact-field">
                <label htmlFor="cmessage">
                  Message <span aria-hidden="true" className="required">*</span>
                </label>
                <textarea
                  id="cmessage"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Your message here…"
                />
              </div>

              <button type="submit" className="btn-primary">
                Send Message
              </button>
            </form>
          )}
        </section>
      </div>

      {/* ── Map placeholder ───────────────────────── */}
      <section className="contact-map" aria-label="Campus map">
        <div className="contact-map__placeholder" role="img" aria-label="Map of University of Cape Coast campus">
          <div className="contact-map__text">
            <span aria-hidden="true">🗺️</span>
            <p>Oguaa Hall · University of Cape Coast · Cape Coast, Ghana</p>
            <a
              href="https://maps.google.com/?q=University+of+Cape+Coast,+Ghana"
              className="btn-outline contact-map__link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Google Maps
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
