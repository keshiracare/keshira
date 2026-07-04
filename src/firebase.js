import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration loaded from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCkpM4dgB90bJsD_o-1ItWPFLKW_3oinoE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "keshira-414d0.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "keshira-414d0",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "keshira-414d0.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "280779017189",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:280779017189:web:daf62d03ba2bfc71403d0c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and export it
export const db = getFirestore(app);

// Normalizes email addresses to prevent sub-addressing (+) and dots (.) bypass hacks
export const normalizeEmail = (email) => {
  if (!email) return '';
  const cleanEmail = email.trim().toLowerCase();
  const parts = cleanEmail.split('@');
  if (parts.length !== 2) return cleanEmail;
  
  let [local, domain] = parts;
  
  // Strip sub-addressing (+...) for all domains
  local = local.split('+')[0];
  
  // Remove dots for Gmail domains specifically
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    local = local.replace(/\./g, '');
  }
  
  return `${local}@${domain}`;
};
