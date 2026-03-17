import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase";
import type { Course } from "../../types";
import "./Courses.css";

const SAMPLE_COURSES: Course[] = [
  {
    id: "mil101",
    title: "Introduction to Military Studies in Ghana",
    description:
      "A comprehensive overview of the Ghana Armed Forces, its history, structure, and role in national security and peacekeeping.",
    category: "Military History",
    level: "Beginner",
    duration: "4 weeks",
    enrolledCount: 45,
    modules: [
      {
        id: "m1",
        title: "History of the Ghana Armed Forces",
        content:
          "The Ghana Armed Forces traces its origins to the Gold Coast Regiment, established in 1901. Since independence in 1957, it has grown into a professional force comprising the Army, Navy, and Air Force. Ghana has been a key contributor to UN peacekeeping missions across Africa and beyond.",
        order: 1,
      },
      {
        id: "m2",
        title: "Structure of the Ghana Army",
        content:
          "The Ghana Army is organized into several brigades and battalions. It operates under the Chief of Army Staff and is responsible for land-based military operations. Key formations include the 4th Infantry Battalion (Kumasi) and the Recce Regiment.",
        order: 2,
      },
      {
        id: "m3",
        title: "Ghana's Role in UN Peacekeeping",
        content:
          "Ghana has been one of the top contributors to UN peacekeeping missions since the 1960s. Ghanaian troops have served in Lebanon (UNIFIL), South Sudan (UNMISS), Mali (MINUSMA), and many other missions, earning global respect for their professionalism.",
        order: 3,
      },
    ],
  },
  {
    id: "mil102",
    title: "Drill and Ceremonial Procedures",
    description:
      "Master military drill commands, formations, and ceremonial parade procedures used by the Ghana Armed Forces and cadet units.",
    category: "Military Skills",
    level: "Beginner",
    duration: "3 weeks",
    enrolledCount: 62,
    modules: [
      {
        id: "m1",
        title: "Basic Drill Commands",
        content:
          "Drill commands include attention, at ease, stand at ease, quick march, halt, left turn, right turn, about turn, and dismiss. Each command has a specific body movement that must be performed with precision and uniformity.",
        order: 1,
      },
      {
        id: "m2",
        title: "Parade Formations",
        content:
          "Military parades use various formations: line, column, echelon, and wedge. Cadets learn to dress right, cover off, and maintain alignment during parade movements.",
        order: 2,
      },
    ],
  },
  {
    id: "mil103",
    title: "First Aid and Field Medicine",
    description:
      "Essential first aid techniques for military field conditions, including wound management, casualty evacuation, and triage.",
    category: "Medical",
    level: "Intermediate",
    duration: "5 weeks",
    enrolledCount: 38,
    modules: [
      {
        id: "m1",
        title: "TCCC (Tactical Combat Casualty Care)",
        content:
          "Tactical Combat Casualty Care is the standard of care for military trauma. It includes controlling life-threatening hemorrhage, managing airway, and treating shock. Key interventions: tourniquet application, wound packing, and MARCH protocol.",
        order: 1,
      },
      {
        id: "m2",
        title: "Casualty Evacuation (CASEVAC)",
        content:
          "CASEVAC involves moving injured personnel from a point of injury to a medical treatment facility. Cadets learn various carry techniques including the fireman's carry, two-man carry, and improvised stretchers.",
        order: 2,
      },
    ],
  },
  {
    id: "mil104",
    title: "Map Reading and Navigation",
    description:
      "Learn to read military topographic maps, use compass, calculate grid references, and navigate in both urban and field environments.",
    category: "Navigation",
    level: "Intermediate",
    duration: "4 weeks",
    enrolledCount: 55,
    modules: [
      {
        id: "m1",
        title: "Understanding Topographic Maps",
        content:
          "Topographic maps show terrain features using contour lines. Key elements include: marginal information, grid system, scale, magnetic declination, and legend symbols. Cadets learn to identify hills, valleys, ridges, and water features.",
        order: 1,
      },
      {
        id: "m2",
        title: "Military Grid Reference System (MGRS)",
        content:
          "The MGRS divides the world into grid zones. A 6-figure grid reference gives a position accurate to 100 meters; an 8-figure reference to 10 meters. Cadets practice determining and plotting grid references on 1:25,000 scale maps.",
        order: 2,
      },
      {
        id: "m3",
        title: "Compass Navigation",
        content:
          "The military prismatic compass allows bearing measurement to within 1 degree. Cadets learn to take a bearing, follow a bearing, back-bearing, and resection to determine their position using two or more landmarks.",
        order: 3,
      },
    ],
  },
  {
    id: "mil105",
    title: "Leadership and Command",
    description:
      "Develop leadership skills in military contexts, covering command decision-making, mission briefings, and leading under pressure.",
    category: "Leadership",
    level: "Advanced",
    duration: "6 weeks",
    enrolledCount: 29,
    modules: [
      {
        id: "m1",
        title: "Principles of Military Leadership",
        content:
          "Military leadership is founded on mission command, trust, and moral courage. The eight Army leadership attributes (LDRSHIP): Loyalty, Duty, Respect, Selfless Service, Honor, Integrity, and Personal Courage are the bedrock of effective command.",
        order: 1,
      },
      {
        id: "m2",
        title: "Operations Orders (OPORD)",
        content:
          "A five-paragraph operations order (SMEAC): Situation, Mission, Execution, Admin & Logistics, Command & Signal. Cadets practice delivering and receiving OPORDs in simulated field scenarios.",
        order: 2,
      },
    ],
  },
  {
    id: "mil106",
    title: "Physical Fitness and Combat Conditioning",
    description:
      "Military fitness standards, PT programs, obstacle course training, and mental toughness development for the Ghana cadet corps.",
    category: "Physical Training",
    level: "Beginner",
    duration: "Ongoing",
    enrolledCount: 89,
    modules: [
      {
        id: "m1",
        title: "Ghana Armed Forces Physical Fitness Test",
        content:
          "The Ghana Armed Forces Physical Fitness Test includes: 2.4km run (target: under 11 minutes for males), push-ups (minimum 40 in 2 minutes), sit-ups (minimum 40 in 2 minutes), and pull-ups. Cadets train to exceed minimum standards.",
        order: 1,
      },
    ],
  },
];

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeModule, setActiveModule] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("All");
  const [filterCategory, setFilterCategory] = useState<string>("All");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const q = query(collection(db, "courses"), orderBy("title"));
        const snap = await getDocs(q);
        if (snap.docs.length > 0) {
          setCourses(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Course)));
        } else {
          setCourses(SAMPLE_COURSES);
        }
      } catch {
        setCourses(SAMPLE_COURSES);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const categories = ["All", ...Array.from(new Set(courses.map((c) => c.category)))];
  const levels = ["All", "Beginner", "Intermediate", "Advanced"];

  const filtered = courses.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchLevel = filterLevel === "All" || c.level === filterLevel;
    const matchCategory = filterCategory === "All" || c.category === filterCategory;
    return matchSearch && matchLevel && matchCategory;
  });

  const levelColors: Record<string, string> = {
    Beginner: "#2d6a2d",
    Intermediate: "#7a5a1a",
    Advanced: "#7a1a1a",
  };

  if (selectedCourse) {
    const mod = selectedCourse.modules[activeModule];
    return (
      <div className="course-reader">
        <button className="back-btn" onClick={() => { setSelectedCourse(null); setActiveModule(0); }}>
          ← Back to Courses
        </button>
        <div className="reader-layout">
          {/* Module List */}
          <aside className="module-list">
            <h3>{selectedCourse.title}</h3>
            {selectedCourse.modules.map((m, i) => (
              <button
                key={m.id}
                className={`module-btn ${activeModule === i ? "active" : ""}`}
                onClick={() => setActiveModule(i)}
              >
                <span className="module-num">{i + 1}</span>
                <span>{m.title}</span>
              </button>
            ))}
          </aside>

          {/* Module Content */}
          <div className="module-content">
            <div className="module-header">
              <span className="module-label">Module {activeModule + 1} of {selectedCourse.modules.length}</span>
              <h2>{mod.title}</h2>
            </div>
            <div className="module-body">
              <p>{mod.content}</p>
              {mod.videoUrl && (
                <div className="video-placeholder">
                  <span>📹 Video: {mod.videoUrl}</span>
                </div>
              )}
            </div>
            <div className="module-nav">
              {activeModule > 0 && (
                <button className="nav-btn prev" onClick={() => setActiveModule(activeModule - 1)}>
                  ← Previous
                </button>
              )}
              {activeModule < selectedCourse.modules.length - 1 && (
                <button className="nav-btn next" onClick={() => setActiveModule(activeModule + 1)}>
                  Next →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="courses-page">
      <div className="courses-header">
        <h1>Military Courses</h1>
        <p>Training programs for Ghana Army Cadet Corps members</p>
      </div>

      {/* Filters */}
      <div className="courses-filters">
        <input
          type="text"
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="filter-select"
        >
          {levels.map((l) => <option key={l}>{l}</option>)}
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="filter-select"
        >
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading courses...</div>
      ) : (
        <div className="courses-grid">
          {filtered.map((course) => (
            <div key={course.id} className="course-card" onClick={() => setSelectedCourse(course)}>
              <div className="course-card-header">
                <span
                  className="level-badge"
                  style={{ background: levelColors[course.level] }}
                >
                  {course.level}
                </span>
                <span className="category-badge">{course.category}</span>
              </div>
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <div className="course-meta">
                <span>📖 {course.modules.length} modules</span>
                <span>⏱️ {course.duration}</span>
                <span>👥 {course.enrolledCount || 0} enrolled</span>
              </div>
              <button className="enroll-btn">Start Learning →</button>
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <p>No courses found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
