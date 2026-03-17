# OHAC - Oguaa Hall Army Cadet Portal

A Progressive Web App (PWA) for the Oguaa Hall Army Cadet (OHAC) at the University of Cape Coast.

## Features

- 🔐 **Google Sign-In / Sign-Up** — Secure authentication via Firebase Auth
- 📚 **Military Courses** — Training modules covering Ghana Armed Forces history, drill, navigation, first aid, leadership, and fitness
- 💬 **In-App Chat** — Real-time chat rooms (General, Training, Courses, Notices) powered by Firebase Realtime Database
- ⚙️ **Admin Panel** — Manage members/roles, post announcements, oversee courses and events
- 📢 **Announcements** — Official notices with priority levels (Urgent/High/Normal/Low)
- 📅 **Events** — Upcoming parades, exercises, and cadet activities
- 📱 **PWA** — Installable on mobile and desktop, with offline support via service worker

## Tech Stack

- React 19 + TypeScript + Vite
- Firebase (Auth, Firestore, Realtime Database, Storage)
- React Router v7
- Vite PWA Plugin

## Getting Started

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Firebase Setup

The app uses the OHAC Firebase project by default. To use your own Firebase project:

1. Copy `.env.example` to `.env.local`
2. Fill in your Firebase credentials
3. Enable Google Sign-In in Firebase Auth
4. Set up Firestore and Realtime Database security rules

## Firebase Security Rules

### Firestore
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    match /announcements/{id} {
      allow read: if request.auth != null;
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /courses/{id} {
      allow read: if request.auth != null;
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /events/{id} {
      allow read: if request.auth != null;
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### Realtime Database
```json
{
  "rules": {
    "chat": {
      "$room": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```
