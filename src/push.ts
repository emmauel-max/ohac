import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type Messaging,
} from "firebase/messaging";
import app, { db } from "./firebase";

let messagingInstance: Messaging | null = null;
let foregroundListenerAttached = false;

async function getMessagingSafe() {
  const supported = await isSupported();
  if (!supported) return null;
  if (!messagingInstance) {
    messagingInstance = getMessaging(app);
  }
  return messagingInstance;
}

export async function registerPushToken(userId: string) {
  if (!("Notification" in window)) return;

  const messaging = await getMessagingSafe();
  if (!messaging) return;

  if (Notification.permission === "default") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;
  }

  if (Notification.permission !== "granted") return;

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    console.warn("VITE_FIREBASE_VAPID_KEY is missing. Push token registration skipped.");
    return;
  }

  const registration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js",
    { scope: "/firebase-cloud-messaging-push-scope/" }
  );

  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: registration,
  });

  if (!token) return;

  await updateDoc(doc(db, "users", userId), {
    fcmTokens: arrayUnion(token),
  });
}

export async function setupForegroundPushHandler() {
  if (foregroundListenerAttached) return;

  const messaging = await getMessagingSafe();
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    if (Notification.permission !== "granted") return;

    const title = payload.notification?.title || "OHAC Update";
    const body = payload.notification?.body || "You have a new update.";

    new Notification(title, {
      body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
    });
  });

  foregroundListenerAttached = true;
}
