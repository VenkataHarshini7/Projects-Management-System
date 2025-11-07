import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// TODO: Get your Web App config from Firebase Console
// See FIREBASE_SETUP.md for detailed instructions
// Go to: https://console.firebase.google.com/project/eastman-eb9cf/settings/general
// Scroll to "Your apps" and copy the firebaseConfig object

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",  // Get from Firebase Console
  authDomain: "eastman-eb9cf.firebaseapp.com",
  projectId: "eastman-eb9cf",
  storageBucket: "eastman-eb9cf.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",  // Get from Firebase Console
  appId: "YOUR_APP_ID"  // Get from Firebase Console
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
