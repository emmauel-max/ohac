import { useEffect, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import "./Profile.css";

export default function Profile() {
  const { currentUser, userProfile } = useAuth();
  const [rank, setRank] = useState("");
  const [unit, setUnit] = useState("");
  const [bio, setBio] = useState("");
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [notifyAnnouncements, setNotifyAnnouncements] = useState(true);
  const [notifyChat, setNotifyChat] = useState(true);
  const [notifyEvents, setNotifyEvents] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setRank(userProfile?.rank || "Cadet");
    setUnit(userProfile?.unit || "Oguaa Hall");
    setBio(userProfile?.bio || "");
    setNotificationEnabled(userProfile?.notificationEnabled !== false);
    setNotifyAnnouncements(userProfile?.notifyAnnouncements !== false);
    setNotifyChat(userProfile?.notifyChat !== false);
    setNotifyEvents(userProfile?.notifyEvents !== false);
  }, [userProfile]);

  const handleResetTour = () => {
    window.dispatchEvent(new Event("ohac:reset-tour"));
  };

  const handleStartTour = () => {
    window.dispatchEvent(new Event("ohac:start-tour"));
  };

  const handleEnableBrowserNotifications = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support notifications.");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      alert("Notifications were not enabled.");
      return;
    }
    alert("Notifications enabled successfully.");
  };

  const handleSave = async () => {
    if (!currentUser) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        rank: rank.trim() || "Cadet",
        unit: unit.trim() || "Oguaa Hall",
        bio: bio.trim(),
        notificationEnabled,
        notifyAnnouncements,
        notifyChat,
        notifyEvents,
      });
      alert("Profile settings saved.");
    } catch (err) {
      console.error("Failed to save profile settings", err);
      alert("Could not save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <section className="profile-card">
        <div className="profile-header">
          <img
            src={currentUser?.photoURL || "/icons/icon-192.png"}
            alt={currentUser?.displayName || "User"}
            className="profile-avatar"
          />
          <div>
            <h1>{currentUser?.displayName || "Cadet"}</h1>
            <p>{currentUser?.email || "No email available"}</p>
          </div>
        </div>

        <div className="profile-grid">
          <div className="profile-item">
            <span className="label">Role</span>
            <span className="value">{userProfile?.role || "cadet"}</span>
          </div>
          <div className="profile-item">
            <span className="label">Courses Enrolled</span>
            <span className="value">{userProfile?.enrolledCourses?.length || 0}</span>
          </div>
        </div>
      </section>

      <section className="profile-card">
        <h2>Profile Settings</h2>
        <div className="profile-form-grid">
          <label className="profile-field">
            <span>Rank</span>
            <input
              type="text"
              value={rank}
              onChange={(e) => setRank(e.target.value)}
              placeholder="Cadet"
            />
          </label>

          <label className="profile-field">
            <span>Unit / Company</span>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="Oguaa Hall"
            />
          </label>

          <label className="profile-field profile-field-full">
            <span>Bio</span>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other cadets a little about you"
            />
          </label>
        </div>
      </section>

      <section className="profile-card">
        <h2>Notifications</h2>
        <p>Choose which updates should trigger browser notifications.</p>
        <div className="pref-list">
          <label className="pref-item">
            <input
              type="checkbox"
              checked={notificationEnabled}
              onChange={(e) => setNotificationEnabled(e.target.checked)}
            />
            <span>Enable all notifications</span>
          </label>

          <label className="pref-item">
            <input
              type="checkbox"
              checked={notifyAnnouncements}
              disabled={!notificationEnabled}
              onChange={(e) => setNotifyAnnouncements(e.target.checked)}
            />
            <span>Announcements</span>
          </label>

          <label className="pref-item">
            <input
              type="checkbox"
              checked={notifyChat}
              disabled={!notificationEnabled}
              onChange={(e) => setNotifyChat(e.target.checked)}
            />
            <span>Chat messages</span>
          </label>

          <label className="pref-item">
            <input
              type="checkbox"
              checked={notifyEvents}
              disabled={!notificationEnabled}
              onChange={(e) => setNotifyEvents(e.target.checked)}
            />
            <span>Events</span>
          </label>
        </div>
        <button className="secondary-btn" onClick={handleEnableBrowserNotifications}>
          Enable Browser Notifications
        </button>
      </section>

      <section className="profile-card">
        <h2>Guided Tour</h2>
        <p>
          If you want to see the onboarding tour again, reset it below. The tour will
          show automatically next time you open your dashboard.
        </p>
        <div className="tour-actions-inline">
          <button className="secondary-btn" onClick={handleStartTour}>
            Start Tour Now
          </button>
          <button className="reset-tour-btn" onClick={handleResetTour}>
            Reset Tour
          </button>
        </div>
      </section>

      <section className="profile-card">
        <h2>Save Changes</h2>
        <button className="save-btn" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Profile Settings"}
        </button>
      </section>
    </div>
  );
}
