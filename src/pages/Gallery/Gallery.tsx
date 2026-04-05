import { useState } from "react";
import "./Gallery.css";

// Placeholder gallery items — replace src values with real images when available
const galleryItems = [
  { id: 1, src: "/icons/icon-512.png", caption: "Annual Passing Out Parade", category: "Parades" },
  { id: 2, src: "/icons/icon-512.png", caption: "Physical Training Session", category: "Training" },
  { id: 3, src: "/icons/icon-512.png", caption: "Drill Practice", category: "Training" },
  { id: 4, src: "/icons/icon-512.png", caption: "Community Service Day", category: "Service" },
  { id: 5, src: "/icons/icon-512.png", caption: "Military Skills Competition", category: "Competitions" },
  { id: 6, src: "/icons/icon-512.png", caption: "Cadet Orientation Day", category: "Orientation" },
  { id: 7, src: "/icons/icon-512.png", caption: "End-of-Year Dinner", category: "Social" },
  { id: 8, src: "/icons/icon-512.png", caption: "Rifle Handling Training", category: "Training" },
  { id: 9, src: "/icons/icon-512.png", caption: "Inter-Hall Drill Competition", category: "Competitions" },
  { id: 10, src: "/icons/icon-512.png", caption: "Map Reading Exercise", category: "Training" },
  { id: 11, src: "/icons/icon-512.png", caption: "Remembrance Day Parade", category: "Parades" },
  { id: 12, src: "/icons/icon-512.png", caption: "First Aid Training", category: "Training" },
];

const categories = ["All", ...Array.from(new Set(galleryItems.map((i) => i.category)))];

export default function Gallery() {
  const [filter, setFilter] = useState("All");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = filter === "All" ? galleryItems : galleryItems.filter((i) => i.category === filter);

  const openLightbox = (id: number) => setLightbox(id);
  const closeLightbox = () => setLightbox(null);

  const lightboxItem = galleryItems.find((i) => i.id === lightbox);

  const prevPhoto = () => {
    if (lightbox === null) return;
    const idx = filtered.findIndex((i) => i.id === lightbox);
    const prev = filtered[(idx - 1 + filtered.length) % filtered.length];
    setLightbox(prev.id);
  };

  const nextPhoto = () => {
    if (lightbox === null) return;
    const idx = filtered.findIndex((i) => i.id === lightbox);
    const next = filtered[(idx + 1) % filtered.length];
    setLightbox(next.id);
  };

  return (
    <div className="gallery-page">
      {/* Hero */}
      <section className="page-hero page-hero--gallery" aria-labelledby="gallery-hero-heading">
        <div className="page-hero__overlay" aria-hidden="true" />
        <div className="page-hero__content">
          <h1 id="gallery-hero-heading" className="page-hero__title">Gallery</h1>
          <p className="page-hero__sub">Moments of pride, training, and service from OHAC events.</p>
        </div>
      </section>

      {/* Filter tabs */}
      <section className="gallery-section" aria-labelledby="gallery-heading">
        <div className="gallery-section__inner">
          <h2 id="gallery-heading" className="section-heading">Photo Gallery</h2>

          <div className="gallery-filters" role="group" aria-label="Filter by category">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`gallery-filter-btn ${filter === cat ? "gallery-filter-btn--active" : ""}`}
                onClick={() => setFilter(cat)}
                aria-pressed={filter === cat}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="gallery-grid">
            {filtered.map((item) => (
              <button
                key={item.id}
                className="gallery-item"
                onClick={() => openLightbox(item.id)}
                aria-label={`View photo: ${item.caption}`}
              >
                <img
                  src={item.src}
                  alt={item.caption}
                  className="gallery-img"
                  loading="lazy"
                  decoding="async"
                />
                <div className="gallery-item__overlay">
                  <p className="gallery-item__caption">{item.caption}</p>
                  <span className="gallery-item__category">{item.category}</span>
                </div>
              </button>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="gallery-empty">No photos in this category yet.</p>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && lightboxItem && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Photo: ${lightboxItem.caption}`}
          onClick={closeLightbox}
        >
          <button
            className="lightbox__close"
            onClick={closeLightbox}
            aria-label="Close lightbox"
          >
            ✕
          </button>
          <button
            className="lightbox__prev"
            onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
            aria-label="Previous photo"
          >
            ‹
          </button>
          <div className="lightbox__content" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxItem.src}
              alt={lightboxItem.caption}
              className="lightbox__img"
            />
            <p className="lightbox__caption">{lightboxItem.caption}</p>
          </div>
          <button
            className="lightbox__next"
            onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
            aria-label="Next photo"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
