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
  location: string;
  organizer: string;
  createdAt: number;
  imageUrl?: string;
  rsvps?: string[]; // Array of user UIDs who have RSVP'd
}
