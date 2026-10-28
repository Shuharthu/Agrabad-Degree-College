/**
 * AGRABAD DEGREE COLLEGE - LIVE FIREBASE CONFIGURATION & MODULAR SDK ADAPTER
 * Connected to official Firebase Project: agrabad-degree-college-e0de5
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

// User's Official Firebase Configuration
export const firebaseConfig = {
  apiKey: "AIzaSyDDAXpQebcweoWKY3nqYjJ6-SI_L4uyHVI",
  authDomain: "agrabad-degree-college-e0de5.firebaseapp.com",
  projectId: "agrabad-degree-college-e0de5",
  storageBucket: "agrabad-degree-college-e0de5.firebasestorage.app",
  messagingSenderId: "968480999212",
  appId: "1:968480999212:web:a2e14f415933fc4d758e89",
  measurementId: "G-XQ1Z1ZKYW6"
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
