import { useState, useEffect, useRef } from "react";
import { ref, push, onValue, off } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { rtdb, storage } from "../../firebase";
import { useAuth } from "../../hooks/useAuth";
import { linkify } from "../../utils/linkify";
import type { ChatMessage, ChatRoom } from "../../types";
import "./Chat.css";

// Import Backgrounds
import generalBg from "../../assets/background/general-chat-wallpaper.jpg";
import trainingBg from "../../assets/background/training-chat-wallpaper.jpg";
// Note: You didn't have a 'courses-chat-wallpaper.jpg' in the screenshot, so I am falling back to general. 
// If you add one later, you can import it here!
import noticesBg from "../../assets/background/notices-chat-wallpaper.jpg";

// Extended ChatRoom type to include the local image path
interface ThemedChatRoom extends ChatRoom {
  wallpaper: string;
}

const CHAT_ROOMS: ThemedChatRoom[] = [
  { id: "general", name: "General", description: "General cadet discussions", icon: "💬", wallpaper: generalBg },
  { id: "training", name: "Training", description: "PT and training talk", icon: "🏋️", wallpaper: trainingBg },
  { id: "courses", name: "Courses", description: "Course help and discussion", icon: "📚", wallpaper: generalBg }, 
  { id: "announcements-chat", name: "Notices", description: "Unit notices", icon: "📢", wallpaper: noticesBg },
];

const CHAT_TOUR_KEY_PREFIX = "ohac:chat-tour:done:";

export default function Chat() {
  const { currentUser, userProfile } = useAuth();
  const [activeRoom, setActiveRoom] = useState<ThemedChatRoom>(CHAT_ROOMS[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showRoomMenu, setShowRoomMenu] = useState(false);
  const [showChatTour, setShowChatTour] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Show mobile chat tour once per user
  useEffect(() => {
    if (!currentUser) return;
    const key = `${CHAT_TOUR_KEY_PREFIX}${currentUser.uid}`;
    const isMobile = window.innerWidth < 640;
    if (isMobile && !window.localStorage.getItem(key)) {
      setShowChatTour(true);
    }
  }, [currentUser]);

  const dismissChatTour = () => {
    if (currentUser) {
      window.localStorage.setItem(`${CHAT_TOUR_KEY_PREFIX}${currentUser.uid}`, "1");
    }
    setShowChatTour(false);
  };

  useEffect(() => {
    const messagesRef = ref(rtdb, `chat/${activeRoom.id}`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const msgs = Object.entries(data).map(([id, val]) => ({
          id,
          ...(val as Omit<ChatMessage, "id">),
        }));
        msgs.sort((a, b) => a.timestamp - b.timestamp);
        setMessages(msgs.slice(-100));
      } else {
        setMessages([]);
      }
    });
    return () => off(messagesRef, "value", unsubscribe);
  }, [activeRoom.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (imageUrl?: string) => {
    const text = newMessage.trim();
    if (!text && !imageUrl) return;
    if (!currentUser || sending) return;
    setSending(true);
    try {
      await push(ref(rtdb, `chat/${activeRoom.id}`), {
        uid: currentUser.uid,
        displayName: currentUser.displayName || "Cadet",
        photoURL: currentUser.photoURL || null,
        rank: userProfile?.rank || null,
        text: text || "",
        imageUrl: imageUrl || null,
        timestamp: Date.now(),
        room: activeRoom.id,
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
    if (!file || !currentUser) return;

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
      const path = `chat/${activeRoom.id}/${currentUser.uid}_${Date.now()}_${file.name}`;
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

  return (
    <div className="chat-page">
      {/* Room List (Sidebar for Desktop) */}
      <aside className="room-list">
        <h3>Chat Rooms</h3>
        {CHAT_ROOMS.map((room) => (
          <button
            key={room.id}
            className={`room-btn ${activeRoom.id === room.id ? "active" : ""}`}
            onClick={() => { setActiveRoom(room); setMessages([]); }}
          >
            <span className="room-icon">{room.icon}</span>
            <div className="room-info">
              <span className="room-name">{room.name}</span>
              <span className="room-desc">{room.description}</span>
            </div>
          </button>
        ))}
      </aside>

      {/* Chat Window */}
      <div className="chat-window">
        {/* Header with Mobile Dropdown Toggle */}
        <div className="chat-header">
          <div
            className="chat-header-content"
            onClick={() => setShowRoomMenu(!showRoomMenu)}
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', width: '100%' }}
            title="Tap to switch rooms"
          >
            <span style={{ fontSize: '1.8rem' }}>{activeRoom.icon}</span>
            <div style={{ flex: 1 }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                {activeRoom.name}
                <span className="mobile-caret" style={{ fontSize: '0.8rem', color: 'rgba(200,255,200,0.65)', transition: 'transform 0.3s', transform: showRoomMenu ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
              </h2>
              <p style={{ margin: 0 }}>{activeRoom.description}</p>
            </div>
            <span className="mobile-switch-hint">Tap to switch</span>
          </div>

          {/* Mobile Dropdown Menu */}
          {showRoomMenu && (
            <div className="mobile-dropdown">
              {CHAT_ROOMS.map((room) => (
                <button
                  key={room.id}
                  onClick={() => {
                    setActiveRoom(room);
                    setMessages([]);
                    setShowRoomMenu(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    border: 'none',
                    backgroundColor: activeRoom.id === room.id ? 'rgba(144,238,144,0.12)' : 'transparent',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: activeRoom.id === room.id ? '#c8ffc8' : 'rgba(255,255,255,0.75)',
                    width: '100%',
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{room.icon}</span>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{room.name}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{room.description}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* First-time mobile tour banner */}
        {showChatTour && (
          <div className="chat-tour-banner">
            <span className="chat-tour-icon">💡</span>
            <span className="chat-tour-text">
              Tap the <strong>header above</strong> (showing the current room name) to switch between chat rooms — General, Training, Courses, and Notices.
            </span>
            <button className="chat-tour-dismiss" onClick={dismissChatTour}>Got it</button>
          </div>
        )}

        {/* Messages */}
        <div 
          className="messages-area" 
          style={{ 
            backgroundImage: `url(${activeRoom.wallpaper})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {messages.length === 0 && (
            <div className="empty-chat">
              <p>{activeRoom.icon}</p>
              <p style={{background: 'rgba(255,255,255,0.7)', padding: '0.5rem 1rem', borderRadius: '12px'}}>No messages yet. Be the first to say hello!</p>
            </div>
          )}
          {messages.map((msg) => {
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
                    <span className="msg-author">
                      {msg.displayName}
                      {msg.rank && <span className="msg-rank">{msg.rank}</span>}
                    </span>
                  )}
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
                  {msg.text && <p className="msg-text">{linkify(msg.text)}</p>}
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
            placeholder={`Message #${activeRoom.name.toLowerCase()}...`}
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
    </div>
  );
}