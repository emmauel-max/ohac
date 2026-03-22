import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../hooks/useAuth";
import type { Announcement, User, Course, CourseModule } from "../../types";
import "./Admin.css";

type AdminTab = "overview" | "users" | "announcements" | "courses" | "events";

export default function Admin() {
  const { isAdmin, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [users, setUsers] = useState<User[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  // Announcement form
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annPriority, setAnnPriority] = useState<Announcement["priority"]>("normal");

  const [showCourseForm, setShowCourseForm] = useState(false);
  const [newCourse, setNewCourse] = useState<{
    title: string; description: string; category: string; duration: string; level: Course["level"]; modules: Omit<CourseModule, "id" | "order">[];
  }>({
    title: "", description: "", category: "", duration: "", level: "Beginner", modules: []
  });

  if (!isAdmin) {
    return (
      <div className="admin-denied">
        <div className="denied-content">
          <span>🔒</span>
          <h2>Access Restricted</h2>
          <p>This area is reserved for OHAC administrators only.</p>
          <p>Current role: <strong>{userProfile?.role || "cadet"}</strong></p>
        </div>
      </div>
    );
  }

  const tabs: { id: AdminTab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "users", label: "Members", icon: "👥" },
    { id: "announcements", label: "Announcements", icon: "📢" },
    { id: "courses", label: "Courses", icon: "📚" },
    { id: "events", label: "Events", icon: "📅" },
  ];

  const fetchUsers = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "users"));
    setUsers(snap.docs.map((d) => ({ ...d.data() } as User)));
    setLoading(false);
  };

  const fetchAnnouncements = async () => {
    setLoading(true);
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setAnnouncements(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Announcement)));
    setLoading(false);
  };

  const fetchCourses = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "courses"));
    setCourses(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Course)));
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    if (activeTab === "announcements") fetchAnnouncements();
    if (activeTab === "courses") fetchCourses();
  }, [activeTab]);

  const postAnnouncement = async () => {
    if (!annTitle.trim() || !annContent.trim()) return;
    await addDoc(collection(db, "announcements"), {
      title: annTitle,
      content: annContent,
      priority: annPriority,
      author: userProfile?.displayName || "Admin",
      authorId: userProfile?.uid || "",
      createdAt: Date.now(),
    });
    setAnnTitle("");
    setAnnContent("");
    setAnnPriority("normal");
    await fetchAnnouncements();
  };

  const deleteAnnouncement = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    await deleteDoc(doc(db, "announcements", id));
    await fetchAnnouncements();
  };

  const updateUserRole = async (uid: string, role: User["role"]) => {
    await updateDoc(doc(db, "users", uid), { role });
    await fetchUsers();
  };

  const handleAddModule = () => {
    setNewCourse(prev => ({
      ...prev,
      modules: [...prev.modules, { title: "", content: "" }]
    }));
  };

  const handleModuleChange = (index: number, field: keyof CourseModule, value: string) => {
    setNewCourse(prev => {
      const updated = [...prev.modules];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, modules: updated };
    });
  };

  const submitCourse = async () => {
    if (!newCourse.title || !newCourse.description || newCourse.modules.length === 0) {
      alert("Please fill all course details and add at least one module.");
      return;
    }

    setLoading(true);
    // Format modules with unique IDs and order numbers
    const formattedModules: CourseModule[] = newCourse.modules.map((m, i) => ({
      ...m,
      id: `m_${Date.now()}_${i}`,
      order: i + 1
    }));

    await addDoc(collection(db, "courses"), {
      title: newCourse.title,
      description: newCourse.description,
      category: newCourse.category,
      duration: newCourse.duration,
      level: newCourse.level,
      modules: formattedModules,
      enrolledCount: 0,
      completedCount: 0,
      createdAt: Date.now()
    });

    setShowCourseForm(false);
    setNewCourse({ title: "", description: "", category: "", duration: "", level: "Beginner", modules: [] });
    await fetchCourses();
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>⚙️ Admin Panel</h1>
        <p>OHAC Management Console</p>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`admin-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="admin-content">
        {/* Overview */}
        {activeTab === "overview" && (
          <div className="overview-grid">
            <div className="overview-card">
              <div className="overview-icon">👥</div>
              <div className="overview-label">Total Members</div>
              <div className="overview-value">{users.length || "—"}</div>
            </div>
            <div className="overview-card">
              <div className="overview-icon">📢</div>
              <div className="overview-label">Announcements</div>
              <div className="overview-value">{announcements.length || "—"}</div>
            </div>
            <div className="overview-card">
              <div className="overview-icon">📚</div>
              <div className="overview-label">Courses</div>
              <div className="overview-value">{courses.length || "—"}</div>
            </div>
            <div className="overview-card">
              <div className="overview-icon">🏆</div>
              <div className="overview-label">Admin Level</div>
              <div className="overview-value">Full</div>
            </div>
            <div className="admin-welcome">
              <h3>Welcome, Administrator</h3>
              <p>
                You have full access to the OHAC management console. Use the tabs above to manage
                members, post announcements, oversee courses, and schedule events.
              </p>
              <ul>
                <li>📌 Manage cadet roles and permissions</li>
                <li>📢 Post and delete announcements</li>
                <li>📚 Add and manage training courses</li>
                <li>📅 Schedule cadet events and parades</li>
              </ul>
            </div>
          </div>
        )}

        {/* Users */}
        {activeTab === "users" && (
          <div className="users-section">
            <h2>Cadet Members</h2>
            {loading ? (
              <p className="loading">Loading members...</p>
            ) : users.length === 0 ? (
              <p className="empty">No members found.</p>
            ) : (
              <div className="users-table-wrapper">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.uid}>
                        <td>
                          <div className="user-cell">
                            <img
                              src={user.photoURL || "/icons/icon-192.png"}
                              alt={user.displayName || "User"}
                              className="table-avatar"
                            />
                            <span>{user.displayName || "Unknown"}</span>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge role-${user.role}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <select
                            value={user.role}
                            onChange={(e) => updateUserRole(user.uid, e.target.value as User["role"])}
                            className="role-select"
                          >
                            <option value="cadet">Cadet</option>
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Announcements */}
        {activeTab === "announcements" && (
          <div className="announcements-section">
            <h2>Manage Announcements</h2>

            {/* Post Form */}
            <div className="post-form">
              <h3>Post New Announcement</h3>
              <input
                type="text"
                placeholder="Title"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                className="form-input"
              />
              <textarea
                placeholder="Announcement content..."
                value={annContent}
                onChange={(e) => setAnnContent(e.target.value)}
                className="form-textarea"
                rows={4}
              />
              <div className="form-row">
                <select
                  value={annPriority}
                  onChange={(e) => setAnnPriority(e.target.value as Announcement["priority"])}
                  className="form-select"
                >
                  <option value="low">Low Priority</option>
                  <option value="normal">Normal</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
                <button className="post-btn" onClick={postAnnouncement}>
                  Post Announcement
                </button>
              </div>
            </div>

            {/* Existing Announcements */}
            {loading ? (
              <p className="loading">Loading...</p>
            ) : (
              <div className="ann-list">
                {announcements.map((ann) => (
                  <div key={ann.id} className="ann-item">
                    <div className="ann-item-header">
                      <h4>{ann.title}</h4>
                      <span className={`priority-tag priority-${ann.priority}`}>{ann.priority}</span>
                    </div>
                    <p>{ann.content}</p>
                    <div className="ann-item-footer">
                      <span>By {ann.author} · {new Date(ann.createdAt).toLocaleString()}</span>
                      <button className="delete-btn" onClick={() => deleteAnnouncement(ann.id)}>
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
                {announcements.length === 0 && <p className="empty">No announcements yet.</p>}
              </div>
            )}
          </div>
        )}

        {/* Courses */}
        {activeTab === "courses" && (
          <div className="courses-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>Course Management</h2>
              <button
                className="post-btn"
                onClick={() => setShowCourseForm(!showCourseForm)}
              >
                {showCourseForm ? "Cancel" : "➕ Add New Course"}
              </button>
            </div>
            <p className="hint">
              Courses are managed via the OHAC admin database. Below are the currently registered
              courses.
            </p>
            {/* NEW COURSE FORM */}
            {showCourseForm && (
              <div className="post-form" style={{ marginBottom: '2rem' }}>
                <h3>Create New Course</h3>
                <input
                  type="text"
                  placeholder="Course Title"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  className="form-input"
                />
                <textarea
                  placeholder="Course Description"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  className="form-textarea"
                  rows={3}
                />
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Category (e.g., Medical, Leadership)"
                    value={newCourse.category}
                    onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                    className="form-input"
                  />
                  <input
                    type="text"
                    placeholder="Duration (e.g., 4 weeks)"
                    value={newCourse.duration}
                    onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                    className="form-input"
                  />
                  <select
                    value={newCourse.level}
                    onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value as Course["level"] })}
                    className="form-select"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div className="modules-section" style={{ marginTop: '1.5rem', borderTop: '1px solid #ddd', paddingTop: '1rem' }}>
                  <h4>Modules</h4>
                  {newCourse.modules.map((mod, idx) => (
                    <div key={idx} className="module-input-group" style={{ background: '#f9f9f9', padding: '1rem', marginBottom: '1rem', borderRadius: '8px' }}>
                      <h5>Module {idx + 1}</h5>
                      <input
                        type="text"
                        placeholder="Module Title"
                        value={mod.title}
                        onChange={(e) => handleModuleChange(idx, "title", e.target.value)}
                        className="form-input"
                        style={{ marginBottom: '0.5rem' }}
                      />
                      <textarea
                        placeholder="Module Content (Text or HTML)"
                        value={mod.content}
                        onChange={(e) => handleModuleChange(idx, "content", e.target.value)}
                        className="form-textarea"
                        rows={3}
                      />
                      <input
                        type="text"
                        placeholder="Video URL (Optional)"
                        value={mod.videoUrl || ""}
                        onChange={(e) => handleModuleChange(idx, "videoUrl", e.target.value)}
                        className="form-input"
                        style={{ marginTop: '0.5rem' }}
                      />
                    </div>
                  ))}
                  <button className="secondary-btn" onClick={handleAddModule} style={{ padding: '0.5rem 1rem', background: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    + Add Module
                  </button>
                </div>

                <button className="post-btn" onClick={submitCourse} style={{ marginTop: '1rem', width: '100%' }}>
                  Save Course to Database
                </button>
              </div>
            )}

            {loading ? (
              <p className="loading">Loading...</p>
            ) : courses.length === 0 ? (
              <p className="empty">
                No custom courses in database yet. Click "Add New Course" to create one.
              </p>
            ) : (
              <div className="courses-list">
                {courses.map((c) => (
                  <div key={c.id} className="course-item" style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4>{c.title}</h4>
                      <span className={`priority-tag priority-${c.level.toLowerCase()}`}>{c.level}</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#666', margin: '0.5rem 0' }}>{c.description}</p>
                    <div className="course-item-meta" style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#555', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                      <span>📂 {c.category}</span>
                      <span>⏱️ {c.duration}</span>
                      <span>📑 {c.modules?.length || 0} modules</span>
                      <strong style={{ color: '#2e7d32' }}>👥 Enrolled: {c.enrolledCount || 0}</strong>
                      <strong style={{ color: '#1565c0' }}>🎓 Completed: {c.completedCount || 0}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Events */}
        {activeTab === "events" && (
          <div className="events-section">
            <h2>Events</h2>
            <p>Event scheduling coming soon. Admins will be able to post parade dates, training schedules, and special events.</p>
          </div>
        )}
      </div>
    </div>
  );
}
