// Firebase Configuration
// SETUP REQUIRED: Follow instructions in FIREBASE_SETUP.md

// Import Firebase modules (loaded from CDN)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, onSnapshot, updateDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// YOUR Firebase configuration - REPLACE WITH YOUR VALUES
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
let app, db;
let firebaseEnabled = false;

try {
  if (firebaseConfig.apiKey !== "YOUR_API_KEY_HERE") {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    firebaseEnabled = true;
    console.log("✅ Firebase connected");
  } else {
    console.log("⚠️ Firebase not configured - using localStorage");
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
  firebaseEnabled = false;
}

// Export Firebase functions
export { db, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, onSnapshot, updateDoc, firebaseEnabled };
