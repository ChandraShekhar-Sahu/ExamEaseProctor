// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Import for Storage
import { getDatabase } from "firebase/database"; // Import for Realtime Database

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDw0W-NHfbMIfRdctCFQ-VjHf9llOj17hk",
  authDomain: "exammonitoringsys.firebaseapp.com",
  projectId: "exammonitoringsys",
  storageBucket: "exammonitoringsys.appspot.com",
  messagingSenderId: "1064955378037",
  appId: "1:1064955378037:web:6b10b04356b37413aa7b3c",
  measurementId: "G-PXB70N3BZC",
  databaseURL: "https://exammonitoringsys-default-rtdb.firebaseio.com/" // Add the database URL
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // Export Storage instance
export const database = getDatabase(app); // Export Realtime Database instance

export default app;
