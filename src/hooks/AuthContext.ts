import { createContext } from "react";
import type { User as FirebaseUser } from "firebase/auth";
import type { Officer, User } from "../types";

export interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: User | null;
  matchedOfficer: Officer | null;
  loading: boolean;
  isBanned: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isQuartermaster: boolean;
  isRqms: boolean;
  isMajor: boolean;
  canAccessLogistics: boolean;
  canEditLogistics: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);
