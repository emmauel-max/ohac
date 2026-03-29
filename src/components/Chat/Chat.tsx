import { useState, useEffect, useRef } from "react";
import { ref, push, onValue, off, set } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, getDocs } from "firebase/firestore";
import { rtdb, storage, db } from "../../firebase";
import { useAuth } from "../../hooks/useAuth";
import { linkify } from "../../utils/linkify";
import type { User, DirectMessage, ChatMessage, DMInboxEntry } from "../../types";
import chatWallpaper from "../../assets/background/chat-wallpaper.jpg";
import generalWallpaper from "../../assets/background/general-chat-wallpaper.jpg";
import coursesWallpaper from "../../assets/background/courses-chat-wallpaper.jpg";
import noticesWallpaper from "../../assets/background/notices-chat-wallpaper.jpg";
import trainingWallpaper from "../../assets/background/training-chat-wallpaper.jpg";
import "./Chat.css";

const LS_CHAT_TS = "ohac_chat_last_seen_at";

interface GroupRoom {
  id: string;
  name: string;
  description: string;
  icon: string;
  wallpaper: string;
}

const GROUP_ROOMS: GroupRoom[] = [
  { id: "general", name: "General", description: "General cadet discussions", icon: "🏛️", wallpaper: generalWallpaper },
  { id: "training", name: "Training", description: "Training schedules and drills", icon: "🎯", wallpaper: trainingWallpaper },
  { id: "courses", name: "Courses", description: "Academic courses and study groups", icon: "📚", wallpaper: coursesWallpaper },
  { id: "notices", name: "Notices", description: "Official notices and announcements", icon: "📋", wallpaper: noticesWallpaper },
];

const MAX_PREVIEW_LENGTH = 42;

function getConversationId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join("_");
}

export default function Chat() {
  const { currentUser, userProfile } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<GroupRoom | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [roomMessages, setRoomMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newRoomMessage, setNewRoomMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendingRoom, setSendingRoom] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [inboxMap, setInboxMap] = useState<Record<string, DMInboxEntry>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const roomMessagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Load all users from Firestore (for search)
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

  // Subscribe to DM inbox to track existing conversations
  useEffect(() => {
    if (!currentUser) return;
    const inboxRef = ref(rtdb, `dm_inbox/${currentUser.uid}`);
    const unsubscribe = onValue(inboxRef, (snapshot) => {
      const data = snapshot.val();
      setInboxMap(data ? (data as Record<string, DMInboxEntry>) : {});
    });
    return () => off(inboxRef, "value", unsubscribe);
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

  // Subscribe to group room messages
  useEffect(() => {
    if (!selectedRoom || !currentUser) return;
    const msgsRef = ref(rtdb, `chat/${selectedRoom.id}/messages`);
    const unsubscribe = onValue(msgsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const msgs = Object.entries(data).map(([id, val]) => ({
          id,
          ...(val as Omit<ChatMessage, "id">),
        }));
        msgs.sort((a, b) => a.timestamp - b.timestamp);
        setRoomMessages(msgs.slice(-100));
      } else {
        setRoomMessages([]);
      }
    });
    return () => off(msgsRef, "value", unsubscribe);
  }, [selectedRoom, currentUser]);

  // Auto-scroll to latest message in DM
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-scroll to latest message in group chat
  useEffect(() => {
    roomMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [roomMessages]);

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
      // Update recipient's DM inbox (for unread badge)
      await set(ref(rtdb, `dm_inbox/${selectedUser.uid}/${currentUser.uid}`), {
        latestTs: timestamp,
        latestText: text || "📷 Image",
        latestUid: currentUser.uid,
        senderName: currentUser.displayName || "Cadet",
        senderPhoto: currentUser.photoURL || null,
        convId,
      });
      // Track this conversation in current user's own inbox (for the conversations list)
      await set(ref(rtdb, `dm_inbox/${currentUser.uid}/${selectedUser.uid}`), {
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

  const sendRoomMessage = async () => {
    const text = newRoomMessage.trim();
    if (!text || !currentUser || !selectedRoom || sendingRoom) return;
    setSendingRoom(true);
    try {
      await push(ref(rtdb, `chat/${selectedRoom.id}/messages`), {
        uid: currentUser.uid,
        displayName: currentUser.displayName || "Cadet",
        photoURL: currentUser.photoURL || null,
        rank: userProfile?.rank || null,
        text,
        imageUrl: null,
        timestamp: Date.now(),
        room: selectedRoom.id,
      });
      setNewRoomMessage("");
    } catch (err) {
      console.error("Failed to send room message", err);
    } finally {
      setSendingRoom(false);
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

  const handleRoomKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendRoomMessage();
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatPreviewTime = (ts: number) => {
    const now = Date.now();
    const diff = now - ts;
    if (diff < 60000) return "now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return new Date(ts).toLocaleDateString([], { month: "short", day: "numeric" });
  };

  // Users with existing conversations, sorted newest first
  const lastChatTs = Number(localStorage.getItem(LS_CHAT_TS) || "0");
  const inboxUsers = users
    .filter((u) => u.uid in inboxMap)
    .sort((a, b) => (inboxMap[b.uid]?.latestTs || 0) - (inboxMap[a.uid]?.latestTs || 0));

  // Search results across all users
  const searchResults = searchQuery
    ? users.filter((u) => {
        const q = searchQuery.toLowerCase();
        return (
          u.displayName?.toLowerCase().includes(q) ||
          u.rank?.toLowerCase().includes(q) ||
          u.unit?.toLowerCase().includes(q)
        );
      })
    : [];

  // ── Group Chat View ────────────────────────────────────────
  if (selectedRoom) {
    return (
      <div
        className="dm-fullscreen"
        style={{
          background: `linear-gradient(rgba(0,0,0,0.22), rgba(0,0,0,0.22)), url(${selectedRoom.wallpaper}) center/cover no-repeat`,
        }}
      >
        {/* Header */}
        <div className="chat-header">
          <button
            className="dm-back-btn"
            onClick={() => {
              setSelectedRoom(null);
              setRoomMessages([]);
            }}
            aria-label="Back to messages"
          >
            ‹
          </button>
          <div className="dm-header-room-icon">{selectedRoom.icon}</div>
          <div className="dm-header-info">
            <h2>{selectedRoom.name}</h2>
            <p>{selectedRoom.description}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="messages-area">
          {roomMessages.length === 0 && (
            <div className="empty-chat">
              <p>{selectedRoom.icon}</p>
              <p
                style={{
                  background: "rgba(255,255,255,0.7)",
                  padding: "0.5rem 1rem",
                  borderRadius: "12px",
                }}
              >
                No messages yet. Start the conversation!
              </p>
            </div>
          )}
          {roomMessages.map((msg) => {
            const isOwn = msg.uid === currentUser?.uid;
            return (
              <div key={msg.id} className={`message ${isOwn ? "own" : "other"}`}>
                {!isOwn && (
                  <img
                    src={msg.photoURL || "/icons/icon-192.png"}
                    alt={msg.displayName}
                    className="msg-avatar"
                  />
                )}
                <div className="msg-bubble">
                  {!isOwn && (
                    <span className="msg-sender-name">
                      {msg.displayName}
                      {msg.rank ? ` · ${msg.rank}` : ""}
                    </span>
                  )}
                  {msg.imageUrl && (
                    <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer">
                      <img src={msg.imageUrl} alt="shared image" className="msg-image" />
                    </a>
                  )}
                  {msg.text && <p className="msg-text">{linkify(msg.text)}</p>}
                  <span className="msg-time">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            );
          })}
          <div ref={roomMessagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input-area">
          <textarea
            className="chat-input"
            placeholder={`Message ${selectedRoom.name}…`}
            value={newRoomMessage}
            onChange={(e) => setNewRoomMessage(e.target.value)}
            onKeyDown={handleRoomKeyDown}
            rows={1}
          />
          <button
            className="send-btn"
            onClick={sendRoomMessage}
            disabled={!newRoomMessage.trim() || sendingRoom}
          >
            ➤
          </button>
        </div>
      </div>
    );
  }

  // ── DM Conversation View (fullscreen, covers bottom nav) ──
  if (selectedUser) {
    return (
      <div
        className="dm-fullscreen"
        style={{
          background: `linear-gradient(rgba(0,0,0,0.22), rgba(0,0,0,0.22)), url(${chatWallpaper}) center/cover no-repeat`,
        }}
      >
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

  // ── Main Chat List View ────────────────────────────────────
  return (
    <div className="dm-page">
      <div className="dm-list-header">
        <h2>💬 Messages</h2>
        <p>Group chats and private messages</p>
        <input
          type="search"
          className="dm-search"
          placeholder="Search cadets to message…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Group Chat Rooms */}
      <div className="dm-section">
        <h3 className="dm-section-title">Group Chats</h3>
        <div className="dm-user-list">
          {GROUP_ROOMS.map((room) => (
            <button
              key={room.id}
              className="dm-user-item dm-room-item"
              onClick={() => {
                setSelectedRoom(room);
                setRoomMessages([]);
              }}
              style={{
                backgroundImage: `linear-gradient(rgba(15,46,15,0.72), rgba(15,46,15,0.72)), url(${room.wallpaper})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="dm-room-icon">{room.icon}</div>
              <div className="dm-user-info">
                <span className="dm-user-name">{room.name}</span>
                <span className="dm-user-rank">{room.description}</span>
              </div>
              <span className="dm-user-arrow">›</span>
            </button>
          ))}
        </div>
      </div>

      {/* Direct Messages */}
      <div className="dm-section">
        <h3 className="dm-section-title">
          {searchQuery ? `Results for "${searchQuery}"` : "Direct Messages"}
        </h3>
        <div className="dm-user-list">
          {loadingUsers ? (
            <div className="dm-status">Loading…</div>
          ) : searchQuery ? (
            searchResults.length === 0 ? (
              <div className="dm-status">No cadets found for "{searchQuery}"</div>
            ) : (
              searchResults.map((user) => (
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
                    <span className="dm-user-name">{user.displayName || "Unknown"}</span>
                    {user.rank && <span className="dm-user-rank">{user.rank}</span>}
                    {user.unit && <span className="dm-user-unit">{user.unit}</span>}
                  </div>
                  <span className="dm-user-arrow">›</span>
                </button>
              ))
            )
          ) : inboxUsers.length === 0 ? (
            <div className="dm-status">
              No recent conversations.{" "}
              <span style={{ color: "#c8ffc8" }}>Search above to start a new chat.</span>
            </div>
          ) : (
            inboxUsers.map((user) => {
              const inbox = inboxMap[user.uid];
              const isUnread =
                inbox &&
                inbox.latestUid !== currentUser?.uid &&
                inbox.latestTs > lastChatTs;
              return (
                <button
                  key={user.uid}
                  className={`dm-user-item${isUnread ? " dm-user-item--unread" : ""}`}
                  onClick={() => {
                    setSelectedUser(user);
                    setMessages([]);
                  }}
                >
                  <div className="dm-avatar-wrap">
                    <img
                      src={user.photoURL || "/icons/icon-192.png"}
                      alt={user.displayName || "User"}
                      className="dm-user-avatar"
                    />
                    {isUnread && <span className="dm-unread-dot" />}
                  </div>
                  <div className="dm-user-info">
                    <span className="dm-user-name">{user.displayName || "Unknown"}</span>
                    {inbox?.latestText && (
                      <span className="dm-last-message">
                        {inbox.latestUid === currentUser?.uid ? "You: " : ""}
                        {inbox.latestText.length > MAX_PREVIEW_LENGTH
                          ? inbox.latestText.slice(0, MAX_PREVIEW_LENGTH) + "…"
                          : inbox.latestText}
                      </span>
                    )}
                  </div>
                  <div className="dm-meta">
                    {inbox?.latestTs && (
                      <span className="dm-time">{formatPreviewTime(inbox.latestTs)}</span>
                    )}
                    <span className="dm-user-arrow">›</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
