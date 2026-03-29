import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  collection,
  getCountFromServer,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import {
  onValue,
  ref as rtdbRef,
} from "firebase/database";
import { db, rtdb } from "../firebase";
import { useAuth } from "./useAuth";

const LS_ANN_TS = "ohac_ann_last_seen_at";
const LS_EVENT_TS = "ohac_event_last_seen_at";
const LS_CHAT_TS = "ohac_chat_last_seen_at";

interface UnreadCountsContextType {
  announcementCount: number;
  eventCount: number;
  chatCount: number;
  totalCount: number;
  markAnnouncementsRead: () => void;
  markEventsRead: () => void;
  markChatRead: () => void;
}

const UnreadCountsContext = createContext<UnreadCountsContextType | null>(null);

export function UnreadCountsProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [announcementCount, setAnnouncementCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [chatCount, setChatCount] = useState(0);

  const seenAnnId = useRef<string | null>(null);
  const seenEventId = useRef<string | null>(null);
  const chatRoomsWithNew = useRef<Set<string>>(new Set());

  const markAnnouncementsRead = useCallback(() => {
    setAnnouncementCount(0);
    localStorage.setItem(LS_ANN_TS, String(Date.now()));
  }, []);

  const markEventsRead = useCallback(() => {
    setEventCount(0);
    localStorage.setItem(LS_EVENT_TS, String(Date.now()));
  }, []);

  const markChatRead = useCallback(() => {
    setChatCount(0);
    chatRoomsWithNew.current.clear();
    localStorage.setItem(LS_CHAT_TS, String(Date.now()));
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const lastAnnTs = Number(localStorage.getItem(LS_ANN_TS) || "0");
    const lastEventTs = Number(localStorage.getItem(LS_EVENT_TS) || "0");
    const lastChatTs = Number(localStorage.getItem(LS_CHAT_TS) || "0");

    const unsubscribes: Array<() => void> = [];

    // ── Announcements ──────────────────────────────────────────
    if (lastAnnTs > 0) {
      getCountFromServer(
        query(collection(db, "announcements"), where("createdAt", ">", lastAnnTs))
      )
        .then((snap) => {
          const count = snap.data().count;
          if (count > 0) setAnnouncementCount(count);
        })
        .catch(() => {});
    }

    const annRtQ = query(
      collection(db, "announcements"),
      orderBy("createdAt", "desc"),
      limit(1)
    );
    const unSubAnn = onSnapshot(annRtQ, (snap) => {
      if (snap.empty) return;
      const docSnap = snap.docs[0];
      if (!seenAnnId.current) {
        seenAnnId.current = docSnap.id;
        return;
      }
      if (docSnap.id !== seenAnnId.current) {
        seenAnnId.current = docSnap.id;
        setAnnouncementCount((c) => c + 1);
      }
    });
    unsubscribes.push(unSubAnn);

    // ── Events ────────────────────────────────────────────────
    if (lastEventTs > 0) {
      getCountFromServer(
        query(collection(db, "events"), where("createdAt", ">", lastEventTs))
      )
        .then((snap) => {
          const count = snap.data().count;
          if (count > 0) setEventCount(count);
        })
        .catch(() => {});
    }

    const eventRtQ = query(
      collection(db, "events"),
      orderBy("createdAt", "desc"),
      limit(1)
    );
    const unSubEvent = onSnapshot(eventRtQ, (snap) => {
      if (snap.empty) return;
      const docSnap = snap.docs[0];
      if (!seenEventId.current) {
        seenEventId.current = docSnap.id;
        return;
      }
      if (docSnap.id !== seenEventId.current) {
        seenEventId.current = docSnap.id;
        setEventCount((c) => c + 1);
      }
    });
    unsubscribes.push(unSubEvent);

    // ── DM Inbox ──────────────────────────────────────────────
    // Watch dm_inbox/{currentUser.uid}/ for new DMs from others.
    const dmInboxRef = rtdbRef(rtdb, `dm_inbox/${currentUser.uid}`);
    const unSubDm = onValue(dmInboxRef, (snapshot) => {
      // Recalculate from scratch on every snapshot to avoid stale accumulation.
      chatRoomsWithNew.current.clear();
      if (!snapshot.exists()) {
        setChatCount(0);
        return;
      }
      let count = 0;
      snapshot.forEach((child) => {
        const inbox = child.val();
        const convId: string = inbox?.convId ?? child.key ?? "";
        if (
          inbox &&
          inbox.latestTs > lastChatTs &&
          inbox.latestUid !== currentUser.uid
        ) {
          chatRoomsWithNew.current.add(convId);
          count++;
        }
      });
      setChatCount(count);
    });
    unsubscribes.push(unSubDm);

    return () => {
      unsubscribes.forEach((u) => u());
    };
  }, [currentUser]);

  // ── PWA App Badge ─────────────────────────────────────────
  useEffect(() => {
    const total = announcementCount + eventCount + chatCount;
    const nav = navigator as Navigator & {
      setAppBadge?: (n: number) => Promise<void>;
      clearAppBadge?: () => Promise<void>;
    };
    if (total > 0) {
      nav.setAppBadge?.(total).catch(() => {});
    } else {
      nav.clearAppBadge?.().catch(() => {});
    }
  }, [announcementCount, eventCount, chatCount]);

  const totalCount = announcementCount + eventCount + chatCount;

  return (
    <UnreadCountsContext.Provider
      value={{
        announcementCount,
        eventCount,
        chatCount,
        totalCount,
        markAnnouncementsRead,
        markEventsRead,
        markChatRead,
      }}
    >
      {children}
    </UnreadCountsContext.Provider>
  );
}

export function useUnreadCounts() {
  const ctx = useContext(UnreadCountsContext);
  if (!ctx) throw new Error("useUnreadCounts must be used within UnreadCountsProvider");
  return ctx;
}
