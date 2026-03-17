import { useState, useEffect, useRef } from "react";
import { ref, push, onValue, off } from "firebase/database";
import { rtdb } from "../../firebase";
import { useAuth } from "../../hooks/useAuth";
import type { ChatMessage, ChatRoom } from "../../types";
import "./Chat.css";

const CHAT_ROOMS: ChatRoom[] = [
  { id: "general", name: "General", description: "General cadet discussions", icon: "💬" },
  { id: "training", name: "Training", description: "PT and training talk", icon: "🏋️" },
  { id: "courses", name: "Courses", description: "Course help and discussion", icon: "📚" },
  { id: "announcements-chat", name: "Notices", description: "Unit notices", icon: "📢" },
];

export default function Chat() {
  const { currentUser } = useAuth();
  const [activeRoom, setActiveRoom] = useState<ChatRoom>(CHAT_ROOMS[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const sendMessage = async () => {
    const text = newMessage.trim();
    if (!text || !currentUser || sending) return;
    setSending(true);
    try {
      await push(ref(rtdb, `chat/${activeRoom.id}`), {
        uid: currentUser.uid,
        displayName: currentUser.displayName || "Cadet",
        photoURL: currentUser.photoURL || null,
        text,
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
      {/* Room List */}
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
        {/* Header */}
        <div className="chat-header">
          <span>{activeRoom.icon}</span>
          <div>
            <h2>{activeRoom.name}</h2>
            <p>{activeRoom.description}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="messages-area">
          {messages.length === 0 && (
            <div className="empty-chat">
              <p>{activeRoom.icon}</p>
              <p>No messages yet. Be the first to say hello!</p>
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
                  {!isOwn && <span className="msg-author">{msg.displayName}</span>}
                  <p className="msg-text">{msg.text}</p>
                  <span className="msg-time">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input-area">
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
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
