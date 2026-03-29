import { useState, useEffect, useRef } from "react";
import { ref, push, onValue, off, set } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, getDocs } from "firebase/firestore";
import { rtdb, storage, db } from "../../firebase";
import { useAuth } from "../../hooks/useAuth";
import { linkify } from "../../utils/linkify";
import type { User, DirectMessage } from "../../types";
import "./Chat.css";

function getConversationId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join("_");
}

export default function Chat() {
  const { currentUser, userProfile } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Load all users from Firestore
  useEffect(() => {
    if (!currentUser) return;
    getDocs(collection(db, "users"))
      .then((snap) => {
        const allUsers: User[] = [];
        snap.forEach((doc) => {
          const data = doc.data() as User;
          if (data.uid !== currentUser.uid && !data.banned) {
            allUsers.push(data);
          }
        });
        allUsers.sort((a, b) =>
          (a.displayName || "").localeCompare(b.displayName || "")
        );
        setUsers(allUsers);
        setLoadingUsers(false);
      })
      .catch(() => setLoadingUsers(false));
  }, [currentUser]);

  // Subscribe to DM messages when a conversation is open
  useEffect(() => {
    if (!selectedUser || !currentUser) return;
    const convId = getConversationId(currentUser.uid, selectedUser.uid);
    const msgsRef = ref(rtdb, `dm/${convId}/messages`);
    const unsubscribe = onValue(msgsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const msgs = Object.entries(data).map(([id, val]) => ({
          id,
          ...(val as Omit<DirectMessage, "id">),
        }));
        msgs.sort((a, b) => a.timestamp - b.timestamp);
        setMessages(msgs.slice(-100));
      } else {
        setMessages([]);
      }
    });
    return () => off(msgsRef, "value", unsubscribe);
  }, [selectedUser, currentUser]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (imageUrl?: string) => {
    const text = newMessage.trim();
    if (!text && !imageUrl) return;
    if (!currentUser || !selectedUser || sending) return;
    setSending(true);
    try {
      const convId = getConversationId(currentUser.uid, selectedUser.uid);
      const timestamp = Date.now();
      await push(ref(rtdb, `dm/${convId}/messages`), {
        uid: currentUser.uid,
        displayName: currentUser.displayName || "Cadet",
        photoURL: currentUser.photoURL || null,
        rank: userProfile?.rank || null,
        text: text || "",
        imageUrl: imageUrl || null,
        timestamp,
      });
      // Update recipient's DM inbox so they get an unread badge
      await set(ref(rtdb, `dm_inbox/${selectedUser.uid}/${currentUser.uid}`), {
        latestTs: timestamp,
        latestText: text || "📷 Image",
        latestUid: currentUser.uid,
        senderName: currentUser.displayName || "Cadet",
        senderPhoto: currentUser.photoURL || null,
        convId,
      });
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser || !selectedUser) return;
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Please select a valid image (JPEG, PNG, GIF, or WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5 MB.");
      return;
    }
    setUploadingImage(true);
    try {
      const convId = getConversationId(currentUser.uid, selectedUser.uid);
      const path = `dm/${convId}/${currentUser.uid}_${Date.now()}_${file.name}`;
      const sRef = storageRef(storage, path);
      await uploadBytes(sRef, file);
      const url = await getDownloadURL(sRef);
      await sendMessage(url);
    } catch (err) {
      console.error("Failed to upload image", err);
      alert("Could not upload image. Please try again.");
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const filteredUsers = users.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.displayName?.toLowerCase().includes(q) ||
      u.rank?.toLowerCase().includes(q) ||
      u.unit?.toLowerCase().includes(q)
    );
  });

  // ── DM Conversation View (fullscreen, covers bottom nav) ──
  if (selectedUser) {
    return (
      <div className="dm-fullscreen">
        {/* Header */}
        <div className="chat-header">
          <button
            className="dm-back-btn"
            onClick={() => {
              setSelectedUser(null);
              setMessages([]);
            }}
            aria-label="Back to messages"
          >
            ‹
          </button>
          <img
            src={selectedUser.photoURL || "/icons/icon-192.png"}
            alt={selectedUser.displayName || "User"}
            className="dm-header-avatar"
          />
          <div className="dm-header-info">
            <h2>{selectedUser.displayName || "Cadet"}</h2>
            {selectedUser.rank && <p>{selectedUser.rank}</p>}
          </div>
        </div>

        {/* Messages */}
        <div className="messages-area">
          {messages.length === 0 && (
            <div className="empty-chat">
              <p>💬</p>
              <p
                style={{
                  background: "rgba(255,255,255,0.7)",
                  padding: "0.5rem 1rem",
                  borderRadius: "12px",
                }}
              >
                No messages yet. Say hello to {selectedUser.displayName}!
              </p>
            </div>
          )}
          {messages.map((msg) => {
            const isOwn = msg.uid === currentUser?.uid;
            return (
              <div
                key={msg.id}
                className={`message ${isOwn ? "own" : "other"}`}
              >
                {!isOwn && (
                  <img
                    src={msg.photoURL || "/icons/icon-192.png"}
                    alt={msg.displayName}
                    className="msg-avatar"
                  />
                )}
                <div className="msg-bubble">
                  {msg.imageUrl && (
                    <a
                      href={msg.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={msg.imageUrl}
                        alt="shared image"
                        className="msg-image"
                      />
                    </a>
                  )}
                  {msg.text && (
                    <p className="msg-text">{linkify(msg.text)}</p>
                  )}
                  <span className="msg-time">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input-area">
          <input
            type="file"
            accept="image/*"
            ref={imageInputRef}
            style={{ display: "none" }}
            onChange={handleImageUpload}
          />
          <button
            className="img-upload-btn"
            onClick={() => imageInputRef.current?.click()}
            disabled={uploadingImage || sending}
            title="Share an image"
            aria-label="Upload image"
          >
            {uploadingImage ? "⏳" : "🖼️"}
          </button>
          <textarea
            className="chat-input"
            placeholder={`Message ${selectedUser.displayName || "Cadet"}…`}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            className="send-btn"
            onClick={() => sendMessage()}
            disabled={!newMessage.trim() || sending}
          >
            ➤
          </button>
        </div>
      </div>
    );
  }

  // ── User List View ────────────────────────────────────────
  return (
    <div className="dm-page">
      <div className="dm-list-header">
        <h2>💬 Direct Messages</h2>
        <p>Send private messages to other cadets</p>
        <input
          type="search"
          className="dm-search"
          placeholder="Search cadets…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="dm-user-list">
        {loadingUsers ? (
          <div className="dm-status">Loading cadets…</div>
        ) : filteredUsers.length === 0 ? (
          <div className="dm-status">
            {searchQuery
              ? `No cadets found for "${searchQuery}"`
              : "No other cadets found"}
          </div>
        ) : (
          filteredUsers.map((user) => (
            <button
              key={user.uid}
              className="dm-user-item"
              onClick={() => {
                setSelectedUser(user);
                setMessages([]);
              }}
            >
              <img
                src={user.photoURL || "/icons/icon-192.png"}
                alt={user.displayName || "User"}
                className="dm-user-avatar"
              />
              <div className="dm-user-info">
                <span className="dm-user-name">
                  {user.displayName || "Unknown"}
                </span>
                {user.rank && (
                  <span className="dm-user-rank">{user.rank}</span>
                )}
                {user.unit && (
                  <span className="dm-user-unit">{user.unit}</span>
                )}
              </div>
              <span className="dm-user-arrow">›</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
