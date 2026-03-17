import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBBTa78XvNW3CKzIQffibEsZLNAMkLG3m4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "oguaa-hall-army-cadet.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://oguaa-hall-army-cadet-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "oguaa-hall-army-cadet",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "oguaa-hall-army-cadet.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "239468093433",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:239468093433:web:24fd12bac3639cb2112728",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-3FTKLWLJ6Z",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const storage = getStorage(app);

export default app;
