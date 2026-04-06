import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../../firebase";
import "./Leaderboard.css";

interface LeaderEntry {
  uid: string;
  displayName: string;
  rank?: string;
  photoURL?: string | null;
  coursesCompleted: number;
  joinedAt?: number;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch users sorted by earliest join date as a proxy for engagement
        const usersSnap = await getDocs(
          query(collection(db, "users"), orderBy("createdAt", "asc"), limit(10))
        );
        const users = usersSnap.docs.map((d) => {
          const data = d.data();
          return {
            uid: d.id,
            displayName: data.displayName || "Cadet",
            rank: data.rank,
            photoURL: data.photoURL,
            joinedAt: data.createdAt,
            coursesCompleted: 0,
          } as LeaderEntry;
        });

        // Fetch enrollment counts per user
        const enrollSnap = await getDocs(
          query(collection(db, "enrollments"), orderBy("completedAt", "desc"))
        );
        const countMap: Record<string, number> = {};
        enrollSnap.docs.forEach((d) => {
          const data = d.data();
          if (data.isCompleted && data.userId) {
            countMap[data.userId] = (countMap[data.userId] || 0) + 1;
          }
        });

        const enriched = users
          .map((u) => ({ ...u, coursesCompleted: countMap[u.uid] || 0 }))
          .sort((a, b) => b.coursesCompleted - a.coursesCompleted || (a.joinedAt || 0) - (b.joinedAt || 0))
          .slice(0, 5);

        setEntries(enriched);
      } catch (err) {
        console.error("Leaderboard load error", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="lb-card">
      <div className="lb-header">
        <span className="lb-icon">🏆</span>
        <h2 className="lb-title">Cadet Leaderboard</h2>
      </div>
      {loading ? (
        <p className="lb-loading">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="lb-empty">No cadet data yet.</p>
      ) : (
        <ol className="lb-list">
          {entries.map((entry, idx) => (
            <li key={entry.uid} className={`lb-row ${idx < 3 ? `lb-row--top${idx + 1}` : ""}`}>
              <span className="lb-medal">{MEDALS[idx] ?? `#${idx + 1}`}</span>
              {entry.photoURL ? (
                <img src={entry.photoURL} alt="" className="lb-avatar" referrerPolicy="no-referrer" />
              ) : (
                <span className="lb-avatar lb-avatar--placeholder">
                  {(entry.displayName || "C").charAt(0).toUpperCase()}
                </span>
              )}
              <div className="lb-info">
                <span className="lb-name">{entry.displayName}</span>
                {entry.rank && <span className="lb-rank">{entry.rank}</span>}
              </div>
              <span className="lb-score">{entry.coursesCompleted} course{entry.coursesCompleted !== 1 ? "s" : ""}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
