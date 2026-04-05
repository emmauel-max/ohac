# OHAC — Oguaa Hall Army Cadet Website

The official public website for the **Oguaa Hall Army Cadet (OHAC)** at the University of Cape Coast, Ghana. Built as a Progressive Web App (PWA).

## Pages

| Route | Description |
|---|---|
| `/` | Home — hero banner, latest announcements, quick-access cards, achievements, join CTA |
| `/about` | History, mission statement, core values, organisational structure, and affiliations |
| `/officers` | Current commissioned officers and warrant officers sourced from Firestore |
| `/events` | Upcoming parades, exercises, and cadet activities sourced from Firestore |
| `/announcements` | Official notices with priority levels (Urgent / High / Normal / Low) from Firestore |
| `/join` | Eligibility requirements, enlistment process steps, FAQ, and enlistment form |
| `/gallery` | Photo gallery with category filtering and lightbox viewer |
| `/contact` | Unit contact details and general enquiry form |

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **Firebase** (Firestore for public data reads)
- **React Router v7**
- **Vite PWA Plugin** — installable on mobile and desktop with service-worker caching

## Getting Started

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Preview production build

```bash
npm run preview
```

## Lint

```bash
npm run lint
```

## Firebase Setup

The site reads public data (announcements, events, officers) from Firestore. The OHAC Firebase project credentials are bundled by default. To use your own Firebase project:

1. Copy `.env.example` to `.env.local`
2. Fill in your Firebase project credentials
3. Set up Firestore security rules (see below)

## Firebase Security Rules

### Firestore

Allow unauthenticated reads for public collections; restrict writes to authenticated admins.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /announcements/{id} {
      allow read: if true;
      allow write: if request.auth != null
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /events/{id} {
      allow read: if true;
      allow write: if request.auth != null
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /officers/{id} {
      allow read: if true;
      allow write: if request.auth != null
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```
