// Firebase core
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";

import { getDocs } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// Firestore (THIS WAS MISSING)
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy,
  where
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// Your config
const firebaseConfig = {
  apiKey: "AIzaSyB72MpXfxjLnaTk2MwpGikHStKzX6z3DOI",
  authDomain: "pulse-guard-5ea48.firebaseapp.com",
  projectId: "pulse-guard-5ea48",
  storageBucket: "pulse-guard-5ea48.firebasestorage.app",
  messagingSenderId: "192924932915",
  appId: "1:192924932915:web:4c254c168cda63a6f4bc46",
  measurementId: "G-MBM5CMTTDC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore ✅
const db = getFirestore(app);

// Export everything you need
export { db, collection, addDoc, onSnapshot, query, orderBy, where, getDocs };