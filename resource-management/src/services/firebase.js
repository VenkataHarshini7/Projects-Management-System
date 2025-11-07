import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// TODO: Replace with your Firebase project configuration
// Get these values from Firebase Console > Project Settings > General
const firebaseConfig = {
  apiKey: "AIzaSyDf5DrGv9PuOyIg0uqpcE1Q09-iHAb1hrI",
  authDomain: "eastman-eb9cf.firebaseapp.com",
  projectId: "eastman-eb9cf",
  storageBucket: "eastman-eb9cf.firebasestorage.app",
  messagingSenderId: "850492769137",
  appId: "1:850492769137:web:303f6ad420b350d65dacd0",
  measurementId: "G-KSQLZFVY10"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
