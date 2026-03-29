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

interface EventDoc {
  title?: string;
  date?: string;
  time?: string;
  location?: string;
  reminderSentAt330On?: string;
  reminderSentAt600On?: string;
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

function getTodayAccraDate(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Accra",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function parseTimeToMinutes(time?: string): number {
  if (!time) return 360;
  const [hRaw, mRaw] = time.split(":");
  const hours = Number(hRaw);
  const minutes = Number(mRaw);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 360;
  return hours * 60 + minutes;
}

function isEarlyEvent(time?: string): boolean {
  return parseTimeToMinutes(time) < 360;
}

function formatReminderBody(event: EventDoc): string {
  const location = event.location ? ` at ${event.location}` : "";
  const time = event.time ? ` (${event.time})` : "";
  return `Reminder: ${event.title || "Upcoming event"}${time}${location} is today.`;
}

async function sendDailyEventReminders(slot: "early" | "morning"): Promise<void> {
  const today = getTodayAccraDate();
  const eventsSnap = await db.collection("events").where("date", "==", today).get();

  if (eventsSnap.empty) return;

  const sendJobs = eventsSnap.docs.map(async (eventDocSnap) => {
    const event = eventDocSnap.data() as EventDoc;
    const earlyEvent = isEarlyEvent(event.time);

    if (slot === "early" && !earlyEvent) return;
    if (slot === "morning" && earlyEvent) return;

    const alreadySent =
      slot === "early"
        ? event.reminderSentAt330On === today
        : event.reminderSentAt600On === today;

    if (alreadySent) return;

    await sendToAllUsers(
      "Event Reminder",
      formatReminderBody(event),
      "event"
    );

    await eventDocSnap.ref.update(
      slot === "early"
        ? { reminderSentAt330On: today }
        : { reminderSentAt600On: today }
    );
  });

  await Promise.allSettled(sendJobs);
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

// Daily event reminder for events before 06:00 (sent at 03:30)
export const sendEarlyEventReminders = functions.pubsub
  .schedule("30 3 * * *")
  .timeZone("Africa/Accra")
  .onRun(async () => {
    await sendDailyEventReminders("early");
    return null;
  });

// Daily event reminder for events at/after 06:00 (sent at 06:00)
export const sendMorningEventReminders = functions.pubsub
  .schedule("0 6 * * *")
  .timeZone("Africa/Accra")
  .onRun(async () => {
    await sendDailyEventReminders("morning");
    return null;
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