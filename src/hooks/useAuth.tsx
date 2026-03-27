import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "../firebase";
import type { User } from "../types";

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  isBanned: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBanned, setIsBanned] = useState(false);

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    
    // Check if user is banned
    if (userSnap.exists() && userSnap.data().banned) {
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      setIsBanned(true);
      alert("You are not allowed to access this app because you have been banned. Please contact an administrator if you believe this is an error.");
      return;
    }
    
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: "cadet",
        rank: "Cadet",
        unit: "Oguaa Hall",
        bio: "",
        notificationEnabled: true,
        notifyAnnouncements: true,
        notifyChat: true,
        notifyEvents: true,
        enrolledCourses: [],
        banned: false,
        createdAt: serverTimestamp(),
      });
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data() as User;
          // Check if user is banned
          if (userData.banned) {
            await signOut(auth);
            setCurrentUser(null);
            setUserProfile(null);
            setIsBanned(true);
          } else {
            setUserProfile(userData);
            setIsBanned(false);
          }
        }
      } else {
        setUserProfile(null);
        setIsBanned(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const isAdmin = userProfile?.role === "admin";

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, loading, isBanned, signInWithGoogle, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
