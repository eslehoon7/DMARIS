import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDpPe2wf2ddDy0l8tNMZE2y4NdyNBK_aAU",
  authDomain: "onbrandium.firebaseapp.com",
  projectId: "onbrandium",
  storageBucket: "onbrandium.firebasestorage.app",
  messagingSenderId: "226462937186",
  appId: "1:226462937186:web:46fc76228b238aeffa613b"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Pass custom databaseId to getFirestore
const db = getFirestore(app, "ai-studio-dmarispremiumbuf-844eda9b-a845-4783-93c1-1e06e717b89e");

const storage = getStorage(app);

export { app, db, storage };
