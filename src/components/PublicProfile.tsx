import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import type { User } from "../types";
import "./Profile.css";

interface PublicUserData {
  displayName: string | null;
  photoURL: string | null;
  rank?: string;
  unit?: string;
  bio?: string;
  indexNumber?: string;
}

type LoadState = "loading" | "found" | "notfound";

export default function PublicProfile() {
  const { uid } = useParams<{ uid: string }>();
  const [profile, setProfile] = useState<PublicUserData | null>(null);
  const [loadState, setLoadState] = useState<LoadState>(uid ? "loading" : "notfound");

  useEffect(() => {
    if (!uid) return;

    getDoc(doc(db, "users", uid))
      .then((snap) => {
        if (!snap.exists()) {
          setLoadState("notfound");
          return;
        }
        const data = snap.data() as User;
        setProfile({
          displayName: data.displayName,
          photoURL: data.photoURL,
          rank: data.rank,
          unit: data.unit,
          bio: data.bio,
          indexNumber: data.indexNumber,
        });
        setLoadState("found");
      })
      .catch(() => setLoadState("notfound"));
  }, [uid]);

  if (loadState === "loading") {
    return (
      <div className="public-profile-page">
        <div className="profile-card">
          <p style={{ color: "rgba(255,255,255,0.6)", textAlign: "center", padding: "2rem" }}>
            Loading profile…
          </p>
        </div>
      </div>
    );
  }

  if (loadState === "notfound" || !profile) {
    return (
      <div className="public-profile-page">
        <Link to="/" className="profile-back-link">← Back to Dashboard</Link>
        <div className="profile-card">
          <p className="profile-not-found">Cadet profile not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="public-profile-page">
      <Link to="/" className="profile-back-link">← Back to Dashboard</Link>

      <section className="profile-card">
        <img
          src={profile.photoURL || "/icons/icon-192.png"}
          alt={profile.displayName || "Cadet"}
          className="public-profile-avatar"
        />
        <h1 className="public-profile-name">{profile.displayName || "Cadet"}</h1>
        {profile.rank && (
          <p className="public-profile-rank">🎖️ {profile.rank}</p>
        )}
        {profile.bio && (
          <p className="public-profile-bio">{profile.bio}</p>
        )}

        <div className="public-profile-grid">
          {profile.unit && (
            <div className="profile-item">
              <span className="label">Unit / Company</span>
              <span className="value">{profile.unit}</span>
            </div>
          )}
          {profile.indexNumber && (
            <div className="profile-item">
              <span className="label">Index Number</span>
              <span className="value">{profile.indexNumber}</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
