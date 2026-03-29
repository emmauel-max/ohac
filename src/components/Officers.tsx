import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import type { Officer } from "../types";
import "./Officers.css";

const EXPECTED_STRENGTH: Record<Officer["rank"], number> = {
  Major: 1,
  Captain: 2,
  Lieutenant: 8,
  "Warrant Officer Class 1": 1,
};

const RANK_ORDER: Officer["rank"][] = [
  "Major",
  "Captain",
  "Lieutenant",
  "Warrant Officer Class 1",
];

export default function Officers() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOfficers = async () => {
      try {
        const q = query(collection(db, "officers"), orderBy("createdAt", "asc"));
        const snap = await getDocs(q);
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Officer));
        setOfficers(data);
      } catch (err) {
        console.error("Failed to fetch officers", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOfficers();
  }, []);

  const grouped = useMemo(() => {
    const groups: Record<Officer["rank"], Officer[]> = {
      Major: [],
      Captain: [],
      Lieutenant: [],
      "Warrant Officer Class 1": [],
    };

    officers.forEach((officer) => {
      groups[officer.rank].push(officer);
    });

    return groups;
  }, [officers]);

  return (
    <div className="officers-page">
      <div className="officers-header">
        <h1>Unit Officers</h1>
        <p>Meet the leadership team of the Oguaa Hall Army Cadet unit.</p>
      </div>

      <section className="officer-strength-card">
        <h2>Officer Structure</h2>
        <div className="strength-grid">
          {RANK_ORDER.map((rank) => {
            const current = grouped[rank].length;
            const expected = EXPECTED_STRENGTH[rank];
            return (
              <div key={rank} className="strength-item">
                <span className="strength-rank">{rank}</span>
                <span className="strength-count">
                  {current} / {expected}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {loading ? (
        <div className="officers-loading">Loading officers...</div>
      ) : officers.length === 0 ? (
        <div className="officers-empty">No officer profiles have been added yet.</div>
      ) : (
        <div className="officers-sections">
          {RANK_ORDER.map((rank) =>
            grouped[rank].length > 0 ? (
              <section key={rank} className="officers-rank-section">
                <h2>{rank}</h2>
                <div className="officers-grid">
                  {grouped[rank].map((officer) => {
                    const displayName = officer.name || officer.fullName || "Officer";
                    const role = officer.roleTitle || officer.appointment || rank;
                    const photo = officer.photoURL || officer.imageUrl || "/icons/icon-192.png";

                    return (
                      <article key={officer.id} className="officer-card">
                        <img
                          src={photo}
                          alt={displayName}
                          className="officer-avatar"
                        />
                        <h3>{displayName}</h3>
                        <p className="officer-role">{role}</p>
                        <p className="officer-bio">{officer.bio || "Profile details coming soon."}</p>
                      </article>
                    );
                  })}
                </div>
              </section>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
