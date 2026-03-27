import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { linkify } from "../utils/linkify";
import type { Announcement } from "../types";
import "./Announcements.css";

const priorityColors: Record<string, string> = {
  urgent: "#dc2626",
  high: "#ea580c",
  normal: "#1a4a1a",
  low: "#666",
};

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setAnnouncements(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Announcement)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  const filtered =
    filter === "all" ? announcements : announcements.filter((a) => a.priority === filter);

  return (
    <div className="announcements-page">
      <div className="page-header">
        <h1>📢 Announcements</h1>
        <p>Official notices and updates from OHAC leadership</p>
      </div>

      <div className="filter-tabs">
        {["all", "urgent", "high", "normal", "low"].map((p) => (
          <button
            key={p}
            className={`filter-tab ${filter === p ? "active" : ""}`}
            onClick={() => setFilter(p)}
            style={filter === p && p !== "all" ? { background: priorityColors[p] } : undefined}
          >
            {p === "all" ? "All" : p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">Loading announcements...</div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <p>📢</p>
          <p>No announcements found.</p>
        </div>
      ) : (
        <div className="ann-grid">
          {filtered.map((ann) => (
            <div
              key={ann.id}
              className="ann-card"
              style={{ borderLeftColor: priorityColors[ann.priority] }}
            >
              <div className="ann-card-header">
                <span
                  className="priority-pill"
                  style={{ background: priorityColors[ann.priority] }}
                >
                  {ann.priority}
                </span>
                <span className="ann-date">
                  {new Date(ann.createdAt).toLocaleDateString("en-GH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <h3>{ann.title}</h3>
              <p>{linkify(ann.content)}</p>
              <div className="ann-author">
                <span>— {ann.author}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
