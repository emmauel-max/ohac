import { useState } from "react";
import "./PTTracker.css";

interface Exercise {
  id: string;
  name: string;
  target: number;
  unit: string;
  icon: string;
  done: boolean;
}

const DEFAULT_EXERCISES: Omit<Exercise, "done">[] = [
  { id: "push", name: "Push-Ups", target: 50, unit: "reps", icon: "💪" },
  { id: "run", name: "Morning Run", target: 3, unit: "km", icon: "🏃" },
  { id: "situp", name: "Sit-Ups", target: 40, unit: "reps", icon: "🧘" },
  { id: "squat", name: "Squats", target: 30, unit: "reps", icon: "🏋️" },
  { id: "water", name: "Hydration", target: 2, unit: "litres", icon: "💧" },
];

function todayKey() {
  return `ohac_pt_${new Date().toISOString().slice(0, 10)}`;
}

function loadExercises(): Exercise[] {
  try {
    const saved = localStorage.getItem(todayKey());
    if (saved) return JSON.parse(saved) as Exercise[];
  } catch {
    // ignore
  }
  return DEFAULT_EXERCISES.map((e) => ({ ...e, done: false }));
}

export default function PTTracker() {
  const [exercises, setExercises] = useState<Exercise[]>(() => loadExercises());
  const [expanded, setExpanded] = useState(false);

  const save = (updated: Exercise[]) => {
    localStorage.setItem(todayKey(), JSON.stringify(updated));
    setExercises(updated);
  };

  const toggle = (id: string) => {
    save(exercises.map((e) => (e.id === id ? { ...e, done: !e.done } : e)));
  };

  const doneCount = exercises.filter((e) => e.done).length;
  const pct = exercises.length ? Math.round((doneCount / exercises.length) * 100) : 0;
  const radius = 22;
  const circ = 2 * Math.PI * radius;
  const strokeOffset = circ - (pct / 100) * circ;

  return (
    <div className="pt-card">
      <button className="pt-header" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
        <span className="pt-header-icon">🏋️</span>
        <span className="pt-header-label">Daily PT Tracker</span>
        <div className="pt-ring-wrap" title={`${pct}% complete`}>
          <svg width="54" height="54" viewBox="0 0 54 54">
            <circle cx="27" cy="27" r={radius} className="pt-ring-bg" />
            <circle
              cx="27"
              cy="27"
              r={radius}
              className="pt-ring-fill"
              strokeDasharray={circ}
              strokeDashoffset={strokeOffset}
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
            <text x="27" y="32" className="pt-ring-text">{pct}%</text>
          </svg>
        </div>
        <span className="pt-chevron">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <ul className="pt-list">
          {exercises.map((ex) => (
            <li key={ex.id} className={`pt-item ${ex.done ? "pt-item--done" : ""}`}>
              <button className="pt-item-btn" onClick={() => toggle(ex.id)} aria-pressed={ex.done}>
                <span className="pt-item-check">{ex.done ? "✅" : "⬜"}</span>
                <span className="pt-item-icon">{ex.icon}</span>
                <span className="pt-item-name">{ex.name}</span>
                <span className="pt-item-target">{ex.target} {ex.unit}</span>
              </button>
            </li>
          ))}
          <li className="pt-summary">
            {doneCount === exercises.length && exercises.length > 0
              ? "🏆 All PT goals crushed today!"
              : `${doneCount} of ${exercises.length} tasks completed`}
          </li>
        </ul>
      )}
    </div>
  );
}
