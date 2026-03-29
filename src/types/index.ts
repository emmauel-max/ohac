export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: "admin" | "member" | "cadet";
  rank?: string;
  unit?: string;
  bio?: string;
  indexNumber?: string;
  notificationEnabled?: boolean;
  notifyAnnouncements?: boolean;
  notifyChat?: boolean;
  notifyEvents?: boolean;
  fcmTokens?: string[];
  enrolledCourses?: string[];
  logisticsRole?: "none" | "rqms";
  createdAt?: number;
  banned?: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  modules: CourseModule[];
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  enrolledCount?: number;
  completedCount?: number;
  createdAt?: number;
}

export interface CourseModule {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  order: number;
}

export interface CourseEnrollment {
  id?: string;
  userId: string;
  courseId: string;
  enrolledAt: number;
  completedModules: string[];
  isCompleted: boolean;
  completedAt?: number;
  progress: number; 
}

export interface ChatMessage {
  id: string;
  uid: string;
  displayName: string;
  photoURL: string | null;
  rank?: string | null;
  text: string;
  imageUrl?: string | null;
  timestamp: number;
  room: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface DirectMessage {
  id: string;
  uid: string;
  displayName: string;
  photoURL: string | null;
  rank?: string | null;
  text: string;
  imageUrl?: string | null;
  timestamp: number;
}

export interface DMInboxEntry {
  latestTs: number;
  latestText: string;
  latestUid: string;
  senderName: string;
  senderPhoto: string | null;
  convId: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  createdAt: number;
  priority: "low" | "normal" | "high" | "urgent";
  imageUrl?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  organizer: string;
  createdAt: number;
  imageUrl?: string;
  rsvps?: string[]; // Array of user UIDs who have RSVP'd
}

export type OfficerRank =
  | "Major"
  | "Captain"
  | "Lieutenant"
  | "Warrant Officer Class 1"
  | "Warrant Officer Class 2";

export type OfficerPortfolio =
  | "Commander"
  | "2nd in Command"
  | "Adjutant"
  | "Quartermaster"
  | "Intelligence Officer"
  | "Provost Marshall"
  | "Platoon Commander 1"
  | "Platoon Commander 2"
  | "Band Master"
  | "Chief Training Officer"
  | "Assistant Band Master"
  | "Regimental Sergeant Major";

export const PORTFOLIO_RANK_MAP: Record<OfficerPortfolio, OfficerRank> = {
  "Commander": "Major",
  "2nd in Command": "Captain",
  "Adjutant": "Captain",
  "Quartermaster": "Lieutenant",
  "Intelligence Officer": "Lieutenant",
  "Provost Marshall": "Lieutenant",
  "Platoon Commander 1": "Lieutenant",
  "Platoon Commander 2": "Lieutenant",
  "Band Master": "Lieutenant",
  "Chief Training Officer": "Lieutenant",
  "Assistant Band Master": "Lieutenant",
  "Regimental Sergeant Major": "Warrant Officer Class 2",
};

export const PORTFOLIOS_BY_RANK: Record<OfficerRank, OfficerPortfolio[]> = {
  "Major": ["Commander"],
  "Captain": ["2nd in Command", "Adjutant"],
  "Lieutenant": [
    "Quartermaster",
    "Intelligence Officer",
    "Provost Marshall",
    "Platoon Commander 1",
    "Platoon Commander 2",
    "Band Master",
    "Chief Training Officer",
    "Assistant Band Master",
  ],
  "Warrant Officer Class 1": [],
  "Warrant Officer Class 2": ["Regimental Sergeant Major"],
};

export interface Officer {
  id: string;
  name: string;
  rank: OfficerRank;
  portfolio?: OfficerPortfolio;
  gender?: "male" | "female";
  email?: string;
  emailLower?: string;
  isQuartermaster?: boolean; // Deprecated: use portfolio === "Quartermaster" instead
  googlePhotoURL?: string;
  roleTitle?: string;
  bio?: string;
  photoURL?: string;
  unit?: string;
  createdAt: number;
  // Compatibility fields for previously stored officer records.
  fullName?: string;
  appointment?: string;
  imageUrl?: string;
}

export interface LogisticsShareItem {
  item: string;
  quantity: string;
  condition: string;
  notes?: string;
}

export interface LogisticsShareRecord {
  id: string;
  destinationUnit: string;
  purpose: string;
  dispatchDate: string;
  createdAt: number;
  createdByUid: string;
  createdByName: string;
  items: LogisticsShareItem[];
}

export interface WeeklyInventoryRecord {
  id: string;
  item: string;
  entries: Record<string, number>;
  updatedAt: number;
  updatedByUid: string;
  updatedByName: string;
  updatedByRole: "qm" | "rqms" | "major";
}

export interface ProgramDistributionEntry {
  cadetName: string;
  phone: string;
  itemsGiven: string;
  createdAt: number;
  createdByUid: string;
  createdByName: string;
  createdByRole: "qm" | "rqms";
}

export interface LogisticsProgram {
  id: string;
  programName: string;
  createdAt: number;
  createdByUid: string;
  createdByName: string;
  entries: ProgramDistributionEntry[];
}

export interface BorrowedLogisticsItem {
  item: string;
  quantity: string;
  expectedReturnCondition: string;
}

export interface BorrowedLogisticsRecord {
  id: string;
  borrowerName: string;
  contact: string;
  hall: string;
  purpose: string;
  itemsAndQuantities: string;
  returnDate: string;
  issueCondition: string;
  returnCondition: string;
  createdAt: number;
  createdByUid: string;
  createdByName: string;
  createdByRole: "qm" | "rqms";
}

export interface LogisticsLog {
  id: string;
  userUid: string;
  userName: string;
  userEmail: string;
  userRole: "qm" | "rqms" | "major";
  action: "enter" | "exit"; // entry or exit from logistics page
  timestamp: number;
  date: string; // YYYY-MM-DD for easy querying by date
}
