// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
const db = getFirestore(app);

// Export
export { db, collection, addDoc, onSnapshot, query, orderBy };