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
exports.helloWorld = exports.onChatMessageCreate = exports.onEventCreate = exports.onAnnouncementCreate = void 0;
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