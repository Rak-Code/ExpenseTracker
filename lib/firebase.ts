import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBBqkr07H-XkodNcBIYkGkdjnw0YbmuWBE",
  authDomain: "expense-tracker-30f95.firebaseapp.com",
  projectId: "expense-tracker-30f95",
  storageBucket: "expense-tracker-30f95.appspot.com",
  messagingSenderId: "911435961882",
  appId: "1:911435961882:web:e232472ef8b7ebdff3a3a3",
  measurementId: "G-HJ17CKG64R",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
