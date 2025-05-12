import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Firebase configuration with the provided credentials
const firebaseConfig = {
  apiKey: "AIzaSyCUnwFzkqNrk8Ai9Z8lCRcv4sAw-uhg7Mk",
  authDomain: "ecomerce-site-d6b4a.firebaseapp.com",
  projectId: "ecomerce-site-d6b4a",
  storageBucket: "ecomerce-site-d6b4a.appspot.com",
  messagingSenderId: "540630851940",
  appId: "1:540630851940:web:e1e6464f5d0ee223531a71",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Set isFirebaseConfigured to true since we now have valid credentials
export const isFirebaseConfigured = true

export default app
