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

## Promoting Users to Admin

The app has three user roles: **cadet** (default), **member**, and **admin**. Only admins can access the Admin Panel, post announcements, manage courses, and change roles.

### Method 1: Via the Admin Panel (recommended)

If you already have at least one admin account:

1. Sign in with the admin account.
2. Navigate to the **Admin Panel** (⚙️ icon in the navigation bar).
3. Click the **Members** tab.
4. Find the user you want to promote in the members table.
5. In the **Actions** column, open the role dropdown next to their name.
6. Select **Admin** from the dropdown (`Cadet` → `Member` → `Admin`).
7. The change is saved immediately to Firestore.

### Method 2: Via Firebase Console (for the first admin)

Use this method to bootstrap the very first admin when no admin account exists yet:

1. Open the [Firebase Console](https://console.firebase.google.com/) and select your project.
2. Go to **Firestore Database** → **Data**.
3. Open the **`users`** collection.
4. Find the document whose ID matches the UID of the user you want to promote (the UID is shown in **Authentication** → **Users**).
5. Click the `role` field and change its value from `"cadet"` to `"admin"`.
6. Click **Update**.

The user will have admin access the next time they load the app.

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
