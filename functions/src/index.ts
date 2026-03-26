import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v1"; // <-- FIXED: Explicitly use v1

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

interface UserDoc {
  fcmTokens?: string[];
  notificationEnabled?: boolean;
  notifyAnnouncements?: boolean;
  notifyChat?: boolean;
  notifyEvents?: boolean;
}

async function removeInvalidTokens(
  uid: string,
  invalidTokens: string[]
): Promise<void> {
  if (invalidTokens.length === 0) return;

  await db.collection("users").doc(uid).update({
    fcmTokens: admin.firestore.FieldValue.arrayRemove(...invalidTokens),
  });
}

async function sendToUser(
  userId: string,
  title: string,
  body: string,
  type: string
): Promise<void> {
  const userDoc = await db.collection("users").doc(userId).get();
  if (!userDoc.exists) return;

  const userData = userDoc.data() as UserDoc;
  const tokens = userData.fcmTokens || [];
  if (tokens.length === 0) return;

  // Check preference based on type
  if (
    !userData.notificationEnabled ||
    (type === "announcement" && !userData.notifyAnnouncements) ||
    (type === "chat" && !userData.notifyChat) ||
    (type === "event" && !userData.notifyEvents)
  ) {
    return;
  }

  const message = {
    notification: { title, body },
    webpush: {
      notification: {
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
      },
    },
    data: { type },
  };

  const resp = await messaging.sendEachForMulticast({
    ...message,
    tokens,
  });

  const invalidTokens = tokens.filter(
    (_token, idx) =>
      resp.responses[idx]?.error?.code === "messaging/mismatched-credential" ||
      resp.responses[idx]?.error?.code === "messaging/invalid-registration-token"
  );

  if (invalidTokens.length > 0) {
    await removeInvalidTokens(userId, invalidTokens);
  }
}

async function sendToAllUsers(
  title: string,
  body: string,
  type: string,
  excludeUserId?: string
): Promise<void> {
  const usersSnap = await db.collection("users").get();

  const sendPromises = usersSnap.docs.map((doc) => {
    if (excludeUserId && doc.id === excludeUserId) {
      return Promise.resolve();
    }
    return sendToUser(doc.id, title, body, type).catch((err) => {
      console.error(`Failed to send to user ${doc.id}:`, err);
    });
  });

  await Promise.allSettled(sendPromises);
}

// Trigger on new announcement
export const onAnnouncementCreate = functions.firestore
  .document("announcements/{announcementId}")
  .onCreate(async (snap: functions.firestore.QueryDocumentSnapshot) => { // <-- FIXED: Added explicit type
    const announcement = snap.data();
    await sendToAllUsers(
      "New Announcement",
      announcement.title,
      "announcement"
    ).catch(console.error);
  });

// Trigger on new event
export const onEventCreate = functions.firestore
  .document("events/{eventId}")
  .onCreate(async (snap: functions.firestore.QueryDocumentSnapshot) => { // <-- FIXED: Added explicit type
    const event = snap.data();
    await sendToAllUsers("New Event", event.title, "event").catch(
      console.error
    );
  });

// Trigger on new chat message
export const onChatMessageCreate = functions.database
  .ref("chat/{roomId}/{messageId}")
  .onCreate(async (snap: functions.database.DataSnapshot) => { // <-- FIXED: Added explicit type
    const message = snap.val();

    await sendToAllUsers(
      `New Message in #${snap.ref.parent?.key}`,
      `${message.displayName}: ${message.text}`,
      "chat",
      message.uid
    ).catch(console.error);
  });

// Health check
export const helloWorld = functions.https.onRequest((_request, response) => {
  response.send("OHAC Cloud Functions are running!");
});