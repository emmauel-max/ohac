"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.helloWorld = exports.onChatMessageCreate = exports.sendMorningEventReminders = exports.sendEarlyEventReminders = exports.onEventCreate = exports.onAnnouncementCreate = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions/v1")); // <-- FIXED: Explicitly use v1
admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();
async function removeInvalidTokens(uid, invalidTokens) {
    if (invalidTokens.length === 0)
        return;
    await db.collection("users").doc(uid).update({
        fcmTokens: admin.firestore.FieldValue.arrayRemove(...invalidTokens),
    });
}
async function sendToUser(userId, title, body, type) {
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists)
        return;
    const userData = userDoc.data();
    const tokens = userData.fcmTokens || [];
    if (tokens.length === 0)
        return;
    // Check preference based on type
    if (!userData.notificationEnabled ||
        (type === "announcement" && !userData.notifyAnnouncements) ||
        (type === "chat" && !userData.notifyChat) ||
        (type === "event" && !userData.notifyEvents)) {
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
    const invalidTokens = tokens.filter((_token, idx) => resp.responses[idx]?.error?.code === "messaging/mismatched-credential" ||
        resp.responses[idx]?.error?.code === "messaging/invalid-registration-token");
    if (invalidTokens.length > 0) {
        await removeInvalidTokens(userId, invalidTokens);
    }
}
async function sendToAllUsers(title, body, type, excludeUserId) {
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
function getTodayAccraDate() {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Africa/Accra",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());
}
function parseTimeToMinutes(time) {
    if (!time)
        return 360;
    const [hRaw, mRaw] = time.split(":");
    const hours = Number(hRaw);
    const minutes = Number(mRaw);
    if (Number.isNaN(hours) || Number.isNaN(minutes))
        return 360;
    return hours * 60 + minutes;
}
function isEarlyEvent(time) {
    return parseTimeToMinutes(time) < 360;
}
function formatReminderBody(event) {
    const location = event.location ? ` at ${event.location}` : "";
    const time = event.time ? ` (${event.time})` : "";
    return `Reminder: ${event.title || "Upcoming event"}${time}${location} is today.`;
}
async function sendDailyEventReminders(slot) {
    const today = getTodayAccraDate();
    const eventsSnap = await db.collection("events").where("date", "==", today).get();
    if (eventsSnap.empty)
        return;
    const sendJobs = eventsSnap.docs.map(async (eventDocSnap) => {
        const event = eventDocSnap.data();
        const earlyEvent = isEarlyEvent(event.time);
        if (slot === "early" && !earlyEvent)
            return;
        if (slot === "morning" && earlyEvent)
            return;
        const alreadySent = slot === "early"
            ? event.reminderSentAt330On === today
            : event.reminderSentAt600On === today;
        if (alreadySent)
            return;
        await sendToAllUsers("Event Reminder", formatReminderBody(event), "event");
        await eventDocSnap.ref.update(slot === "early"
            ? { reminderSentAt330On: today }
            : { reminderSentAt600On: today });
    });
    await Promise.allSettled(sendJobs);
}
// Trigger on new announcement
exports.onAnnouncementCreate = functions.firestore
    .document("announcements/{announcementId}")
    .onCreate(async (snap) => {
    const announcement = snap.data();
    await sendToAllUsers("New Announcement", announcement.title, "announcement").catch(console.error);
});
// Trigger on new event
exports.onEventCreate = functions.firestore
    .document("events/{eventId}")
    .onCreate(async (snap) => {
    const event = snap.data();
    await sendToAllUsers("New Event", event.title, "event").catch(console.error);
});
// Daily event reminder for events before 06:00 (sent at 03:30)
exports.sendEarlyEventReminders = functions.pubsub
    .schedule("30 3 * * *")
    .timeZone("Africa/Accra")
    .onRun(async () => {
    await sendDailyEventReminders("early");
    return null;
});
// Daily event reminder for events at/after 06:00 (sent at 06:00)
exports.sendMorningEventReminders = functions.pubsub
    .schedule("0 6 * * *")
    .timeZone("Africa/Accra")
    .onRun(async () => {
    await sendDailyEventReminders("morning");
    return null;
});
// Trigger on new chat message
exports.onChatMessageCreate = functions.database
    .ref("chat/{roomId}/{messageId}")
    .onCreate(async (snap) => {
    const message = snap.val();
    await sendToAllUsers(`New Message in #${snap.ref.parent?.key}`, `${message.displayName}: ${message.text}`, "chat", message.uid).catch(console.error);
});
// Health check
exports.helloWorld = functions.https.onRequest((_request, response) => {
    response.send("OHAC Cloud Functions are running!");
});
//# sourceMappingURL=index.js.map