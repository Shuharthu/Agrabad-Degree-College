/**
 * AGRABAD DEGREE COLLEGE - LIVE FIREBASE CONFIGURATION & MODULAR SDK ADAPTER
 * Connected to live Firebase Project: agrabad-degree-college
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// User's Verified Firebase Configuration
export const firebaseConfig = {
  apiKey: "AIzaSyDHfHCJVSdvo4be0Cd38546awAynmlI9ls",
  authDomain: "agrabad-degree-college.firebaseapp.com",
  projectId: "agrabad-degree-college",
  storageBucket: "agrabad-degree-college.firebasestorage.app",
  messagingSenderId: "364847290659",
  appId: "1:364847290659:web:934037eb8a6b69c7611496",
  measurementId: "G-7BP6PQBP46"
};

// Initialize Live Firebase Services
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

if (typeof window !== 'undefined') {
  window.firebaseDb = db;
  window.firebaseAuth = auth;
  window.firebaseStorage = storage;
}

export const isLiveFirebaseConfigured = () => true;

console.log(
  `%c[Agrabad Degree College]%c Live Cloud Firebase connected: ${firebaseConfig.projectId}`,
  'background: #0c2340; color: #fbbf24; font-weight: bold; padding: 4px 8px; border-radius: 4px;',
  'color: #059669; font-weight: bold;'
);

// Exports for direct Firestore & Auth operations
export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  ref,
  uploadBytes,
  getDownloadURL
};
