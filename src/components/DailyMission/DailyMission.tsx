import { useState } from "react";
import "./DailyMission.css";

interface Mission {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  category: "fitness" | "academic" | "discipline" | "service";
  completed: boolean;
}

const MISSION_POOL: Omit<Mission, "completed">[] = [
  { id: "m1", title: "Morning PT Run", description: "Complete a 3km run before 0700 hrs", icon: "🏃", points: 20, category: "fitness" },
  { id: "m2", title: "Weapon Drill Practice", description: "30 minutes of weapon-handling drill", icon: "🪖", points: 15, category: "discipline" },
  { id: "m3", title: "Read Cadet Handbook", description: "Study one chapter from the cadet handbook", icon: "📖", points: 10, category: "academic" },
  { id: "m4", title: "Uniform Inspection", description: "Ensure uniform is clean and pressed to standard", icon: "👔", points: 10, category: "discipline" },
  { id: "m5", title: "Push-Up Challenge", description: "Complete 3 sets of 20 push-ups", icon: "💪", points: 15, category: "fitness" },
  { id: "m6", title: "Map Reading Exercise", description: "Navigate a map grid reference exercise", icon: "🗺️", points: 20, category: "academic" },
  { id: "m7", title: "Community Service", description: "Volunteer 1 hour of hall community service", icon: "🤝", points: 25, category: "service" },
  { id: "m8", title: "First Aid Revision", description: "Review basic first-aid procedures", icon: "🩺", points: 15, category: "academic" },
  { id: "m9", title: "Squad Drills", description: "Practice squad formation drills with peers", icon: "🪖", points: 20, category: "discipline" },
  { id: "m10", title: "Hydration Goal", description: "Drink at least 2 litres of water today", icon: "💧", points: 5, category: "fitness" },
  { id: "m11", title: "Leadership Reading", description: "Read an article on military leadership", icon: "📚", points: 10, category: "academic" },
  { id: "m12", title: "Obstacle Course Drill", description: "Complete one obstacle course circuit", icon: "🏋️", points: 25, category: "fitness" },
];

const CATEGORY_COLORS: Record<Mission["category"], string> = {
  fitness: "#1a5a1a",
  academic: "#1a3a6a",
  discipline: "#5a1a1a",
  service: "#1a4a4a",
};

const CATEGORY_LABELS: Record<Mission["category"], string> = {
  fitness: "Fitness",
  academic: "Academic",
  discipline: "Discipline",
  service: "Service",
};

function getDailyMissions(): Mission[] {
  const today = new Date().toISOString().slice(0, 10);
  const storageKey = `ohac_daily_missions_${today}`;
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    try {
      return JSON.parse(saved) as Mission[];
    } catch {
      // fall through
    }
  }
  // Seed 4 missions deterministically from the day
  const seed = today.replace(/-/g, "").slice(-4);
  const indices: number[] = [];
  let cursor = parseInt(seed, 10);
  while (indices.length < 4) {
    const idx = cursor % MISSION_POOL.length;
    if (!indices.includes(idx)) indices.push(idx);
    cursor = (cursor * 1103515245 + 12345) & 0x7fffffff;
  }
  return indices.map((i) => ({ ...MISSION_POOL[i], completed: false }));
}

interface Props {
  onClose: () => void;
}

export default function DailyMission({ onClose }: Props) {
  const [missions, setMissions] = useState<Mission[]>(() => getDailyMissions());

  const saveMissions = (updated: Mission[]) => {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(`ohac_daily_missions_${today}`, JSON.stringify(updated));
    setMissions(updated);
  };

  const toggleMission = (id: string) => {
    const updated = missions.map((m) =>
      m.id === id ? { ...m, completed: !m.completed } : m
    );
    saveMissions(updated);
  };

  const completedCount = missions.filter((m) => m.completed).length;
  const totalPoints = missions.filter((m) => m.completed).reduce((s, m) => s + m.points, 0);
  const allDone = completedCount === missions.length && missions.length > 0;

  return (
    <div className="dm-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Daily Missions">
      <div className="dm-panel" onClick={(e) => e.stopPropagation()}>
        <div className="dm-header">
          <div className="dm-header-left">
            <span className="dm-header-icon">🎯</span>
            <div>
              <h2 className="dm-title">Daily Missions</h2>
              <p className="dm-subtitle">
                {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            </div>
          </div>
          <button className="dm-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="dm-progress-bar-wrap">
          <div className="dm-progress-bar">
            <div
              className="dm-progress-fill"
              style={{ width: `${missions.length ? (completedCount / missions.length) * 100 : 0}%` }}
            />
          </div>
          <span className="dm-progress-text">{completedCount}/{missions.length} completed · {totalPoints} pts</span>
        </div>

        {allDone && (
          <div className="dm-all-done">
            🏆 Mission Complete! Outstanding performance, Cadet!
          </div>
        )}

        <div className="dm-cards">
          {missions.map((mission) => (
            <button
              key={mission.id}
              className={`dm-card ${mission.completed ? "dm-card--done" : ""}`}
              style={{ "--cat-color": CATEGORY_COLORS[mission.category] } as React.CSSProperties}
              onClick={() => toggleMission(mission.id)}
              aria-pressed={mission.completed}
            >
              <div className="dm-card-left">
                <span className="dm-card-icon">{mission.icon}</span>
              </div>
              <div className="dm-card-body">
                <div className="dm-card-top">
                  <span className="dm-card-title">{mission.title}</span>
                  <span
                    className="dm-card-badge"
                    style={{ background: CATEGORY_COLORS[mission.category] }}
                  >
                    {CATEGORY_LABELS[mission.category]}
                  </span>
                </div>
                <p className="dm-card-desc">{mission.description}</p>
                <span className="dm-card-points">+{mission.points} pts</span>
              </div>
              <div className="dm-card-check">{mission.completed ? "✅" : "⬜"}</div>
            </button>
          ))}
        </div>

        <p className="dm-footer-note">Missions reset daily at midnight. Tap a card to mark it done.</p>
      </div>
    </div>
  );
}
