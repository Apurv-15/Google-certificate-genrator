import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC5Y7_54EBEDy3oBrRXYbt6Imf-0xvAtLk",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "certificate-generator-7f99f.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "certificate-generator-7f99f",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "certificate-generator-7f99f.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "213627870290",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:213627870290:web:05d259df4d489f85d7538b",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-8WC6ES9QSP"
};

// Warn if environment variables are not loaded
if (!import.meta.env.VITE_FIREBASE_API_KEY) {
    console.warn("⚠️ Firebase environment variables not found. Using fallback values. Please restart the dev server if you just created the .env file.");
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, db, storage };
