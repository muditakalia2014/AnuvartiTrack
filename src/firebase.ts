// 1. You must have these imports at the very top
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// 2. This config MUST have your real values from the Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDb_DKbp_GjIr4y5J6M-ugDaubRGy-O81w",
  authDomain: "anuvartitrack.firebaseapp.com",
  projectId: "anuvartitrack",
  storageBucket: "anuvartitrack.firebasestorage.app",
  messagingSenderId: "483115879693",
  appId: "1:483115879693:web:60fc5319ddb280cabbf444"
};

// 3. Initialize Firebase (The app variable)
const app = initializeApp(firebaseConfig);

// 4. Export the tools (This is where your error likely was)
export const db = getFirestore(app);
export const auth = getAuth(app);