import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAcnBmyVrwzABRm0FHD_Dw5C4U0ofHdW0k",
  authDomain: "halorashop.firebaseapp.com",
  databaseURL:
    "https://halorashop-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "halorashop",
  storageBucket: "halorashop.firebasestorage.app",
  messagingSenderId: "470313202528",
  appId: "1:470313202528:web:21b996672005919663a405",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getDatabase(app);
