import { useEffect, useRef } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { onChildAdded, query as rtdbQuery, limitToLast, ref } from "firebase/database";
import { db, rtdb } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import { registerPushToken, setupForegroundPushHandler } from "../push";
import type { Announcement, Event, User } from "../types";

const CHAT_ROOMS = ["general", "training", "courses", "announcements-chat"];

function canNotify(profile: User | null) {
  return profile?.notificationEnabled !== false;
}

function showNotification(title: string, body: string) {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  new Notification(title, {
    body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
  });
}

export default function NotificationBridge() {
  const { currentUser, userProfile } = useAuth();
  const seenAnnouncementId = useRef<string | null>(null);
  const seenEventId = useRef<string | null>(null);
  const seenChatByRoom = useRef<Record<string, string | null>>({});

  useEffect(() => {
    if (!currentUser) return;

    registerPushToken(currentUser.uid).catch((err) => {
      console.error("FCM registration failed", err);
    });

    setupForegroundPushHandler().catch((err) => {
      console.error("Foreground push setup failed", err);
    });

    const unsubscribes: Array<() => void> = [];

    const announcementsQuery = query(
      collection(db, "announcements"),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const unSubAnnouncements = onSnapshot(announcementsQuery, (snap) => {
      if (snap.empty) return;
      const docSnap = snap.docs[0];
      const ann = { id: docSnap.id, ...docSnap.data() } as Announcement;

      if (!seenAnnouncementId.current) {
        seenAnnouncementId.current = ann.id;
        return;
      }

      if (ann.id !== seenAnnouncementId.current) {
        seenAnnouncementId.current = ann.id;
        if (canNotify(userProfile) && userProfile?.notifyAnnouncements !== false) {
          showNotification("New Announcement", ann.title);
        }
      }
    });
    unsubscribes.push(unSubAnnouncements);

    const eventsQuery = query(
      collection(db, "events"),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const unSubEvents = onSnapshot(eventsQuery, (snap) => {
      if (snap.empty) return;
      const docSnap = snap.docs[0];
      const event = { id: docSnap.id, ...docSnap.data() } as Event;

      if (!seenEventId.current) {
        seenEventId.current = event.id;
        return;
      }

      if (event.id !== seenEventId.current) {
        seenEventId.current = event.id;
        if (canNotify(userProfile) && userProfile?.notifyEvents !== false) {
          showNotification("New Event", event.title);
        }
      }
    });
    unsubscribes.push(unSubEvents);

    CHAT_ROOMS.forEach((roomId) => {
      const roomQuery = rtdbQuery(ref(rtdb, `chat/${roomId}`), limitToLast(1));
      const unSubRoom = onChildAdded(roomQuery, (snap) => {
        const val = snap.val();
        if (!val) return;

        const messageId = snap.key;
        if (!messageId) return;

        if (!seenChatByRoom.current[roomId]) {
          seenChatByRoom.current[roomId] = messageId;
          return;
        }

        if (messageId !== seenChatByRoom.current[roomId]) {
          seenChatByRoom.current[roomId] = messageId;
          if (
            canNotify(userProfile) &&
            userProfile?.notifyChat !== false &&
            val.uid !== currentUser.uid
          ) {
            showNotification(`New Message (${roomId})`, `${val.displayName}: ${val.text}`);
          }
        }
      });
      unsubscribes.push(unSubRoom);
    });

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [currentUser, userProfile]);

  return null;
}
