import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, setDoc, serverTimestamp, where } from "firebase/firestore";
import { auth, googleProvider, db } from "../firebase";
import type { Officer, User } from "../types";

interface AuthContextType {
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

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [matchedOfficer, setMatchedOfficer] = useState<Officer | null>(null);
  const [isQuartermaster, setIsQuartermaster] = useState(false);
  const [isRqms, setIsRqms] = useState(false);
  const [isMajor, setIsMajor] = useState(false);
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
        logisticsRole: "none",
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
      setMatchedOfficer(null);
      setIsQuartermaster(false);
      setIsRqms(false);
      setIsMajor(false);

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
            setIsRqms(userData.logisticsRole === "rqms");

            const emailLower = user.email?.toLowerCase().trim();
            if (emailLower) {
              const officerQuery = query(
                collection(db, "officers"),
                where("emailLower", "==", emailLower)
              );
              const officerSnap = await getDocs(officerQuery);
              const linkedOfficers = officerSnap.docs.map((d) => ({
                id: d.id,
                ...d.data(),
              })) as Officer[];

              const quartermasterOfficer = linkedOfficers.find(
                (officer) =>
                  officer.isQuartermaster ||
                  /quarter\s*master/i.test(officer.roleTitle || officer.appointment || "")
              );
              const majorOfficer = linkedOfficers.find((officer) => officer.rank === "Major");

              setMatchedOfficer(quartermasterOfficer || majorOfficer || linkedOfficers[0] || null);
              setIsQuartermaster(Boolean(quartermasterOfficer));
              setIsMajor(Boolean(majorOfficer));
            }
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
  const canAccessLogistics = isQuartermaster || isRqms || isMajor;
  const canEditLogistics = isQuartermaster || isRqms;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        matchedOfficer,
        loading,
        isBanned,
        signInWithGoogle,
        logout,
        isAdmin,
        isQuartermaster,
        isRqms,
        isMajor,
        canAccessLogistics,
        canEditLogistics,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
