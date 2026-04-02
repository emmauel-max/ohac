# OHAC Flutter Android App – Generation Prompt

Copy and paste the entire contents of this file as a prompt to generate the OHAC app as a Flutter Android native application.

---

## Prompt

Build a complete Flutter Android application called **OHAC** (Oguaa Hall Army Cadet) for the Oguaa Hall Army Cadet unit at the University of Cape Coast, Ghana. Use Firebase as the backend (Firestore, Realtime Database, Firebase Auth, Firebase Storage, and Firebase Cloud Messaging). The app has a military-green colour theme and targets Android API 26+.

---

## Colour Palette

| Token | Hex |
|---|---|
| Primary (dark military green) | `#1a4a1a` |
| Primary light | `#2d6a2d` |
| Accent (navy blue) | `#1a4a7a` |
| Urgent red | `#dc2626` |
| High orange | `#ea580c` |
| Background | `#0f1f0f` |
| Surface | `#1a2a1a` |
| On-surface text | `#e8f5e9` |

Use `ThemeData` with `ColorScheme.dark()` seeded from `#1a4a1a`.

---

## Firebase Project

| Config key | Value |
|---|---|
| Project ID | `oguaa-hall-army-cadet` |
| Auth domain | `oguaa-hall-army-cadet.firebaseapp.com` |
| RTDB URL | `https://oguaa-hall-army-cadet-default-rtdb.firebaseio.com` |
| Storage bucket | `oguaa-hall-army-cadet.firebasestorage.app` |
| Messaging sender ID | `239468093433` |
| App ID (Android) | `1:239468093433:android:<your-android-app-id>` |

Place the `google-services.json` file in `android/app/`. Use `FlutterFire` CLI to initialise Firebase (`firebase_options.dart`).

---

## Dependencies (pubspec.yaml)

```yaml
dependencies:
  flutter:
    sdk: flutter
  firebase_core: ^3.x
  firebase_auth: ^5.x
  cloud_firestore: ^5.x
  firebase_database: ^11.x
  firebase_storage: ^12.x
  firebase_messaging: ^15.x
  google_sign_in: ^6.x
  provider: ^6.x           # state management
  go_router: ^14.x          # navigation
  cached_network_image: ^3.x
  image_picker: ^1.x
  intl: ^0.19.x
  url_launcher: ^6.x
  shared_preferences: ^2.x  # replaces localStorage for unread timestamps
  flutter_local_notifications: ^17.x
  percent_indicator: ^4.x   # course progress bars
  timeago: ^3.x
```

---

## Data Models (Dart classes)

### User
```dart
class UserModel {
  final String uid;
  final String? email;
  final String? displayName;
  final String? photoURL;
  final String role; // 'admin' | 'member' | 'cadet'
  final String rank;
  final String unit;
  final String bio;
  final String indexNumber;
  final bool notificationEnabled;
  final bool notifyAnnouncements;
  final bool notifyChat;
  final bool notifyEvents;
  final List<String> fcmTokens;
  final List<String> enrolledCourses;
  final String logisticsRole; // 'none' | 'rqms'
  final int createdAt;
  final bool banned;
}
```

### Announcement
```dart
class Announcement {
  final String id;
  final String title;
  final String content;
  final String author;
  final String authorId;
  final int createdAt;
  final String priority; // 'low' | 'normal' | 'high' | 'urgent'
  final String? imageUrl;
}
```

### Event
```dart
class Event {
  final String id;
  final String title;
  final String description;
  final String date;       // 'YYYY-MM-DD'
  final String? time;      // 'HH:mm'
  final String location;
  final String organizer;
  final int createdAt;
  final String? imageUrl;
  final List<String> rsvps; // list of user UIDs
}
```

### Course / CourseModule / CourseEnrollment
```dart
class Course {
  final String id;
  final String title;
  final String description;
  final String category;
  final String? imageUrl;
  final List<CourseModule> modules;
  final String duration;
  final String level; // 'Beginner' | 'Intermediate' | 'Advanced'
  final int enrolledCount;
  final int completedCount;
  final int? createdAt;
}

class CourseModule {
  final String id;
  final String title;
  final String content;
  final String? videoUrl;
  final int order;
}

class CourseEnrollment {
  final String? id;
  final String userId;
  final String courseId;
  final int enrolledAt;
  final List<String> completedModules;
  final bool isCompleted;
  final int? completedAt;
  final double progress; // 0.0 – 1.0
}
```

### Chat
```dart
class ChatMessage {
  final String id;
  final String uid;
  final String displayName;
  final String? photoURL;
  final String? rank;
  final String text;
  final String? imageUrl;
  final int timestamp;
  final String room; // group room id
}

class DirectMessage {
  final String id;
  final String uid;
  final String displayName;
  final String? photoURL;
  final String? rank;
  final String text;
  final String? imageUrl;
  final int timestamp;
}

class DMInboxEntry {
  final int latestTs;
  final String latestText;
  final String latestUid;
  final String senderName;
  final String? senderPhoto;
  final String convId;
}
```

### Officer
```dart
// Ranks: 'Major', 'Captain', 'Lieutenant', 'Warrant Officer Class 1', 'Warrant Officer Class 2'
// Portfolios: 'Commander', '2nd in Command', 'Adjutant', 'Quartermaster',
//             'Intelligence Officer', 'Provost Marshall', 'Platoon Commander 1',
//             'Platoon Commander 2', 'Band Master', 'Chief Training Officer',
//             'Assistant Band Master', 'Regimental Sergeant Major'
class Officer {
  final String id;
  final String name;
  final String rank;
  final String? portfolio;
  final String? gender;     // 'male' | 'female'
  final String? email;
  final String? emailLower;
  final bool isQuartermaster;
  final String? googlePhotoURL;
  final String? roleTitle;
  final String? bio;
  final String? photoURL;
  final String? unit;
  final int createdAt;
}
```

### Logistics
```dart
class LogisticsShareRecord { /* id, destinationUnit, purpose, dispatchDate, createdAt, createdByUid, createdByName, items: List<LogisticsShareItem> */ }
class LogisticsShareItem { /* item, quantity, condition, notes */ }

class WeeklyInventoryRecord { /* id, item, entries: Map<weekKey, count>, updatedAt, updatedByUid, updatedByName, updatedByRole */ }

class ProgramDistributionEntry { /* cadetName, phone, itemsGiven, createdAt, createdByUid, createdByName, createdByRole */ }
class LogisticsProgram { /* id, programName, createdAt, createdByUid, createdByName, entries: List<ProgramDistributionEntry> */ }

class BorrowedLogisticsRecord { /* id, borrowerName, contact, hall, purpose, itemsAndQuantities, returnDate, issueCondition, returnCondition, createdAt, createdByUid, createdByName, createdByRole */ }

class LogisticsLog { /* id, userUid, userName, userEmail, userRole, action: 'enter'|'exit', timestamp, date: 'YYYY-MM-DD' */ }
```

---

## Firestore Collections

| Collection | Purpose |
|---|---|
| `users` | User profiles (document ID = Firebase Auth UID) |
| `announcements` | Announcements (ordered by `createdAt` desc) |
| `events` | Events (ordered by `date`) |
| `courses` | Courses |
| `course_enrollments` | Enrollment records (fields: userId, courseId, completedModules, progress, isCompleted) |
| `officers` | Officer profiles |
| `logistics_share` | Logistics share records |
| `logistics_inventory` | Weekly inventory (one document per item, ID = slugified item name) |
| `logistics_programs` | Distribution programs |
| `logistics_borrowed` | Borrowing records |
| `logistics_logs` | Logistics access logs |

## Realtime Database Structure

```
dm/
  {convId}/           # convId = sort([uid1, uid2]).join('_')
    messages/
      {pushId}: { uid, displayName, photoURL, rank, text, imageUrl, timestamp }

dm_inbox/
  {uid}/
    {otherUid}: { latestTs, latestText, latestUid, senderName, senderPhoto, convId }

chat/
  {roomId}/           # roomId: 'general' | 'training' | 'courses' | 'notices'
    messages/
      {pushId}: { uid, displayName, photoURL, rank, text, imageUrl, timestamp, room }
```

## Firebase Storage Paths

| Upload | Path |
|---|---|
| Chat image (group) | `chat/{roomId}/{uid}_{timestamp}_{filename}` |
| Chat image (DM) | `chat/dm/{convId}/{uid}_{timestamp}_{filename}` |
| Announcement image | `announcements/{timestamp}_{filename}` |
| Course image | `courses/{timestamp}_{filename}` |
| Event image | `events/{timestamp}_{filename}` |
| Officer photo | `officers/{officerId}_{timestamp}_{filename}` |

---

## Authentication

- **Only Google Sign-In** (no email/password).
- On first sign-in, create a Firestore `users` document with default fields: `role: 'cadet'`, `rank: 'Cadet'`, `unit: 'Oguaa Hall'`, `logisticsRole: 'none'`, `banned: false`.
- On every sign-in, check `banned` field. If `true`, sign the user out immediately and show a Snackbar: *"You are not allowed to access this app because you have been banned. Please contact an administrator."*
- After sign-in, query the `officers` collection where `emailLower == user.email.toLowerCase()`. Use the result to determine `isQuartermaster`, `isMajor`, and `matchedOfficer`.
- **Roles**:
  - `isAdmin` → `userProfile.role == 'admin'`
  - `isQuartermaster` → matched officer's `portfolio == 'Quartermaster'`
  - `isRqms` → `userProfile.logisticsRole == 'rqms'`
  - `isMajor` → matched officer's `rank == 'Major'`
  - `canAccessLogistics` → `isQuartermaster || isRqms || isMajor`
  - `canEditLogistics` → `isQuartermaster || isRqms`

---

## Navigation (go_router)

Use a `NavigationDrawer` (side drawer) plus a `BottomNavigationBar`. Protected routes redirect to `/login` when not authenticated.

### Routes

| Route | Screen | Guard |
|---|---|---|
| `/login` | LoginScreen | Redirect to `/` if already logged in |
| `/` | DashboardScreen | Auth required |
| `/profile` | ProfileScreen | Auth required |
| `/profile/:uid` | PublicProfileScreen | Auth required |
| `/courses` | CoursesScreen | Auth required |
| `/chat` | ChatScreen | Auth required |
| `/admin` | AdminScreen | Auth + isAdmin |
| `/announcements` | AnnouncementsScreen | Auth required |
| `/events` | EventsScreen | Auth required |
| `/officers` | OfficersScreen | Auth required |
| `/logistics` | LogisticsScreen | Auth + canAccessLogistics |
| `/code-of-conduct` | CodeOfConductScreen | Auth required |
| `/terms-of-service` | TermsOfServiceScreen | Auth required |
| `/privacy-policy` | PrivacyPolicyScreen | Auth required |
| `/faq` | FaqScreen | Auth required |

### Bottom Navigation Bar (4 items)

| Icon | Label | Route |
|---|---|---|
| 🏠 | Dashboard | `/` |
| 📚 | Courses | `/courses` |
| 💬 | Messages | `/chat` |
| 👤 | Profile | `/profile` |

Show numeric badge on Messages and other items when unread count > 0.

### Side Drawer Items

Dashboard, Profile, Courses, Messages, Events, Officers, Logistics (logistics users only), Announcements, Admin Panel (admin only).

---

## Screens

### 1. Splash / Loading Screen
Full-screen background image (`splash-screen-background.jpg`) with a dark green overlay (`rgba(26,42,26,0.85)`). Centre-align the OHAC logo (64×64 dp) above the text **"OHAC Loading..."**. Show while Firebase Auth state is being resolved.

---

### 2. Login Screen
Full-screen background image with a dark green overlay. Centred card containing:
- ⚔️ emblem (large icon)
- **OHAC** heading
- *Oguaa Hall Army Cadet* subtitle
- *University of Cape Coast* institution label
- Horizontal divider
- **"Welcome, Cadet"** heading + short description
- Google Sign-In `ElevatedButton` with Google logo SVG and text **"Continue with Google"**
- Footer: *"By signing in, you agree to the OHAC cadet code of conduct."*

---

### 3. Dashboard Screen
**Hero section** (full-width card with `header-image.jpg` background + green overlay):
- Left: Welcome heading (`Welcome back, {firstName}`) + rank or institution tagline
- Right: OHAC logo + UCC logo side by side

**Stats grid** (2×2):
- Active Cadets (live Firestore count from `users`)
- Courses Available (live count from `courses`)
- Training Hours: *500+* (static)
- Officers: *12* with a **"Meet Officers"** button → `/officers`

**Quick Access** (horizontal scroll or 2×2 grid of cards):
- Browse Courses → `/courses`
- Cadet Chat → `/chat`
- Upcoming Events → `/events`
- Announcements → `/announcements`

**Latest Announcements** (last 5, from Firestore): coloured left-border card per priority. "View All →" link to `/announcements`.

**Our Mission** section: static text about OHAC's mission.

---

### 4. Announcements Screen
Page header. Filter chips: All | Urgent | High | Normal | Low.
Grid of cards with left border coloured by priority. Each card: priority chip, date, title, content, author byline.

Priority colours: urgent = `#dc2626`, high = `#ea580c`, normal = `#1a4a1a`, low = `#666`.

---

### 5. Events Screen
Page header. Two sections: **Upcoming Events** and **Past Events**.

Each upcoming event card:
- Countdown chip (Today / Tomorrow / In N days)
- Title, description
- Details: date, time (optional), location, organizer
- RSVP section: count of RSVPs, avatar stack (up to 4), RSVP / Un-RSVP `ElevatedButton`

Past event cards are greyed out with a "Completed" chip.

RSVP writes `arrayUnion(currentUser.uid)` or `arrayRemove` to the event document.

---

### 6. Courses Screen

Left panel (or top tab on mobile) showing enrolled and available courses. Filter/search bar.

**Course list item**: thumbnail image, title, category chip, level chip, duration, enrolment count.

Tapping a course opens a **Course Detail** view with:
- Header image
- Title, description, level, duration
- Progress bar (if enrolled)
- Modules list — tap a module to open a **Module Detail** view (scrollable text content + optional video via `url_launcher` or `VideoPlayerController`)
- Enrol / Continue / Completed button
- Mark module complete: writes `completedModules: arrayUnion(moduleId)` and recalculates `progress`

**Sample courses** (show if Firestore `courses` collection is empty):
- *Introduction to Military Studies in Ghana* – Military History, Beginner, 4 weeks
- *Drill and Ceremonial Procedures* – Military Skills, Beginner, 3 weeks
- *First Aid and Field Medicine* – Medical, Intermediate, 5 weeks
- *Map Reading and Navigation* – Navigation, Intermediate, 4 weeks

---

### 7. Chat Screen

Two tabs / sections:
1. **Group Rooms** — 4 rooms: General 🏛️, Training 🎯, Courses 📚, Notices 📋
2. **Direct Messages** — DM inbox list

**Group room chat**:
- Background wallpaper image per room (general, training, courses, notices wallpaper)
- Real-time messages from RTDB `chat/{roomId}/messages`
- Message bubble: sender avatar, display name + rank, message text (auto-linkified), optional image, timestamp
- Input bar: text field + image picker button + send button
- Images uploaded to Firebase Storage → Storage URL stored in message
- Auto-scroll to bottom on new messages
- Max 500 messages loaded (or paginated)

**Direct Messages**:
- Inbox list: avatar, name, preview of last message, timestamp
- Conversation ID: `[uid1, uid2].sort().join('_')`
- Real-time from RTDB `dm/{convId}/messages`
- Same chat UI as group rooms
- DM inbox written to RTDB `dm_inbox/{recipientUid}/{senderUid}` on every send

**Unread counts**:
- Store `lastSeenAt` timestamp in `SharedPreferences` (key: `ohac_chat_last_seen_at`)
- Count DM inbox entries where `latestTs > lastSeenAt && latestUid != currentUser.uid`
- Reset on opening the chat screen

---

### 8. Officers Screen

Page header: "Unit Officers" + description.

**Officer Structure card**: strength table showing `current / expected` for each rank:
- Major: 1, Captain: 2, Lieutenant: 8, WO Class 1: 1, WO Class 2: 1

Officers grouped by rank in order: Major → Captain → Lieutenant → WO Class 1 → WO Class 2.

Each officer card: photo (with gender-appropriate placeholder if no photo), name, role/portfolio, bio.

On load, sync `googlePhotoURL` from matching `users` document (match by `emailLower`).

---

### 9. Profile Screen

**Profile header card**: avatar, display name, email.
**Info grid**: Role, Index Number, Courses Enrolled.

**Profile Settings form**: Rank (text input), Unit/Company (text input), Index Number (text input), Bio (multi-line text input). Save button → `updateDoc` on `users/{uid}`.

**Notification Preferences**: toggles for: Enable all notifications, Announcements, Chat messages, Events. Saved to Firestore.

**Resources section**: buttons → Code of Conduct, Terms of Service, Privacy Policy, FAQ.

**Guided Tour section**: "Start Tour Now" and "Reset Tour" buttons (trigger onboarding walkthrough).

---

### 10. Public Profile Screen (`/profile/:uid`)

Read-only view of another user's profile card from Firestore.

---

### 11. Admin Panel Screen

Admin-only (show access denied if not admin). Tab bar with 6 tabs:

**Overview tab**: summary statistics (total users, announcements, courses, events, officers counts).

**Users tab**:
- List all users with avatar, name, email, role, ban status
- Change role (cadet / member / admin) via dropdown → `updateDoc`
- Ban / Unban toggle → sets `banned: true/false`

**Announcements tab**:
- Form: title, content (multi-line), priority (dropdown: low/normal/high/urgent), optional image upload
- Post button → `addDoc` to `announcements`
- List of existing announcements with delete button

**Courses tab**:
- Form: title, description, category, duration, level, optional image, modules (add/remove module rows with title + content fields)
- Create course → `addDoc` to `courses`
- List with delete button

**Events tab**:
- Form: title, description, date picker, time picker (default 06:00), location, organizer, optional image
- Create event → `addDoc` to `events`
- List with delete button

**Officers tab**:
- Form: name, email, gender (male/female), rank (dropdown), portfolio (dropdown filtered by rank), role title, bio, optional photo upload, remove photo checkbox
- Create/edit officer → `addDoc` / `updateDoc` in `officers`
- Delete officer
- Rank limits enforced (Major: 1, Captain: 2, Lieutenant: 8, WO1: 1, WO2: 1)
- Portfolio → rank mapping enforced:
  - Commander → Major
  - 2nd in Command, Adjutant → Captain
  - Quartermaster, Intelligence Officer, Provost Marshall, Platoon Commander 1 & 2, Band Master, Chief Training Officer, Assistant Band Master → Lieutenant
  - Regimental Sergeant Major → WO Class 2

---

### 12. Logistics Management Screen

Accessible to: Quartermaster, RQMS, Major.

On screen open/close, write a `LogisticsLog` entry (action: 'enter'/'exit') to Firestore `logistics_logs`.

**Sub-screens** (bottom navigation or tabs inside Logistics):

#### Dashboard
Summary cards: total inventory items tracked, active programs, borrowed items.

#### Weekly Inventory
- 12 fixed items: Ceremonial Tops, Ceremonial Downs, Forage Caps, White Belts, Black Belts, Green Belts, Mirror Shoes, Rifles, Camouflage Tops, Camouflage Downs, Boots, Camouflage Caps
- Show last 8 weeks (Monday-keyed, format `YYYY-MM-DD`)
- Horizontal scrollable table: rows = items, columns = week labels
- Editable cells (QM/RQMS only) — save via `setDoc` on `logistics_inventory/{slugifiedItem}`
- QM and Major see full edit access; RQMS sees limited access

#### Program Distribution
- Create program: program name → `addDoc` to `logistics_programs`
- Inside a program: add distribution entries (cadet name, phone, items given) → append to `entries` array
- List programs with entry count

#### Borrowing Records
- Form: borrower name, contact, hall, purpose, items & quantities, return date, issue condition, return condition
- Save → `addDoc` to `logistics_borrowed`
- List records with return date indicator

#### Access Logs
- Table of `logistics_logs` ordered by timestamp desc
- Shows user name, role, action (enter/exit), date/time

---

### 13. Static Info Screens

#### Code of Conduct
Header + 5 principle cards (Respect and Professionalism, Integrity, Constructive Communication, Safety and Privacy, Accountability) + Reporting Concerns section.

#### Terms of Service
Header + sections: Acceptance of Terms, Use of the Platform, User Conduct, Content Ownership, Privacy, Termination, Changes to Terms.

#### Privacy Policy
Header + sections: Information We Collect, How We Use Information, Data Storage and Security, Third-Party Services, Your Rights, Contact.

#### FAQ
Header + expandable FAQ items covering: what OHAC is, how to join, course completion, chat rooms, notifications, data privacy, contact.

---

## Push Notifications (Firebase Cloud Messaging)

1. Request notification permission on first launch (using `permission_handler`).
2. On permission granted, call `FirebaseMessaging.instance.getToken()` and store the token via `arrayUnion` to `users/{uid}.fcmTokens` in Firestore.
3. Handle foreground notifications with `flutter_local_notifications` (show a local notification).
4. Handle background/terminated via `FirebaseMessaging.onBackgroundMessage` handler.
5. User can toggle notifications per category (announcements, chat, events) in Profile — save prefs to Firestore. Cloud Functions (Node.js) read these prefs before sending targeted FCM messages.

---

## Unread Badge Counts

Use `SharedPreferences` to store last-seen timestamps:
- `ohac_ann_last_seen_at` — announcements
- `ohac_event_last_seen_at` — events
- `ohac_chat_last_seen_at` — chat/DMs

On app launch, query Firestore for items newer than each stored timestamp and set badge counts. Use `onSnapshot` equivalents (Firestore `snapshots()` stream) to listen for real-time new items and increment counts.

Reset each count when the user navigates to the corresponding screen.

Show badge numbers on Bottom Navigation Bar items and Drawer items.

---

## Onboarding Tour

Implement a guided highlight tour using a package like `tutorial_coach_mark` or `showcaseview`. Steps:
1. Highlight the hamburger menu button → "Open the menu to navigate"
2. Highlight the OHAC brand logo → "Tap to go home"
3. Highlight the Sidebar nav → "Navigate between sections"
4. Highlight the Dashboard nav item → "Your home screen"
5. Highlight the Quick Access section → "Jump to key features"
6. Highlight the Announcements section → "See latest updates here"

Store `tour_completed` in `SharedPreferences`. Show tour on first launch. Allow reset from Profile screen.

---

## Linkify Utility

Parse text and auto-convert URLs (http/https) and plain `www.xxx` patterns to tappable `InkWell` links that open in the browser via `url_launcher`. Apply to chat messages, announcement content, and event descriptions.

---

## Image Handling

- Use `cached_network_image` for all remote images.
- Placeholder: military-green coloured box with the OHAC logo initials.
- Male officer photo placeholder: bundled asset `assets/placeholders/male-officer-image-placeholder.jpg`
- Female officer photo placeholder: bundled asset `assets/placeholders/female-officer-image-placeholder.jpg`

---

## App Assets

Place the following in `assets/`:
- `assets/logo.png` — OHAC logo (square)
- `assets/ucc_logo.png` — UCC logo
- `assets/backgrounds/splash_screen_background.jpg`
- `assets/backgrounds/header_image.jpg`
- `assets/backgrounds/chat_wallpaper.jpg`
- `assets/backgrounds/general_chat_wallpaper.jpg`
- `assets/backgrounds/courses_chat_wallpaper.jpg`
- `assets/backgrounds/notices_chat_wallpaper.jpg`
- `assets/backgrounds/training_chat_wallpaper.jpg`
- `assets/placeholders/male_officer_image_placeholder.jpg`
- `assets/placeholders/female_officer_image_placeholder.jpg`

Declare all in `pubspec.yaml` under `flutter.assets`.

---

## Android Configuration

- `minSdkVersion`: 26
- `targetSdkVersion`: 34
- `applicationId`: `com.ohac.app`
- App name: `OHAC`
- Enable `INTERNET`, `CAMERA`, `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`, `RECEIVE_BOOT_COMPLETED`, `VIBRATE`, `POST_NOTIFICATIONS` permissions in `AndroidManifest.xml`.
- Add `google-services.json` to `android/app/`.
- Configure `FirebaseMessagingService` in `AndroidManifest.xml` for background push.

---

## State Management

Use **Provider** with the following `ChangeNotifier` providers:

- `AuthProvider`: wraps Firebase Auth state, exposes `currentUser`, `userProfile`, `matchedOfficer`, `isAdmin`, `isQuartermaster`, `isRqms`, `isMajor`, `canAccessLogistics`, `canEditLogistics`, `isBanned`, `signInWithGoogle()`, `logout()`.
- `UnreadCountsProvider`: tracks `announcementCount`, `eventCount`, `chatCount`, `totalCount` with `markXxxRead()` methods.

Wrap the app root in `MultiProvider`.

---

## Folder Structure

```
lib/
  main.dart
  firebase_options.dart
  models/
    user_model.dart
    announcement.dart
    event.dart
    course.dart
    course_module.dart
    course_enrollment.dart
    chat_message.dart
    direct_message.dart
    dm_inbox_entry.dart
    officer.dart
    logistics_*.dart
  providers/
    auth_provider.dart
    unread_counts_provider.dart
  screens/
    login_screen.dart
    dashboard_screen.dart
    announcements_screen.dart
    events_screen.dart
    courses_screen.dart
    course_detail_screen.dart
    module_detail_screen.dart
    chat_screen.dart
    officers_screen.dart
    profile_screen.dart
    public_profile_screen.dart
    admin_screen.dart
    logistics_screen.dart
    code_of_conduct_screen.dart
    terms_of_service_screen.dart
    privacy_policy_screen.dart
    faq_screen.dart
  widgets/
    app_scaffold.dart        # Scaffold with Drawer + BottomNav
    announcement_card.dart
    event_card.dart
    course_card.dart
    officer_card.dart
    chat_bubble.dart
    unread_badge.dart
    linkify_text.dart
    loading_overlay.dart
  utils/
    linkify.dart
    date_helpers.dart
    storage_helpers.dart
  constants/
    colors.dart
    routes.dart
    logistics_items.dart     # list of 12 inventory item names
    officer_ranks.dart       # rank & portfolio maps
```

---

## Cloud Functions (Node.js — optional but recommended)

Write Firebase Cloud Functions in `functions/index.js`:

1. **`onNewAnnouncement`** — Firestore trigger on `announcements/{id}` create. Sends FCM to all users with `notifyAnnouncements: true`.
2. **`onNewEvent`** — Firestore trigger on `events/{id}` create. Sends FCM to users with `notifyEvents: true`.
3. **`onNewChatMessage`** — RTDB trigger on `dm/{convId}/messages/{msgId}` create. Sends FCM to the recipient (derived from convId) if `notifyChat: true`.

Each function reads `fcmTokens` from the recipient's Firestore user document and sends a `MulticastMessage`.

---

## Key Business Rules

1. Users with `role == 'admin'` can access the Admin Panel.
2. Users matched as `Quartermaster` officer OR with `logisticsRole == 'rqms'` OR matched as `Major` officer can access Logistics.
3. Only QM and RQMS can edit inventory / create distribution entries / borrowing records.
4. Only QM and Major can see all logistics logs.
5. Banned users are signed out immediately on any auth state change.
6. DM conversation ID is always `[uid1, uid2].sort().join('_')`.
7. Officer rank limits: Major 1, Captain 2, Lieutenant 8, WO1 1, WO2 1. Warn (but don't block) if exceeded in Admin form.
8. When creating an officer, save `emailLower = email.toLowerCase().trim()` for case-insensitive matching.
9. Course progress = `completedModules.length / modules.length`.
10. Unread counts use `SharedPreferences` timestamps as the read-fence; reset timestamp when user visits the corresponding screen.
