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
  | "Warrant Officer Class 1";

export interface Officer {
  id: string;
  name: string;
  rank: OfficerRank;
  gender?: "male" | "female";
  email?: string;
  emailLower?: string;
  isQuartermaster?: boolean;
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
