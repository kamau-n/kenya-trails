import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
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
  //   apiKey: "AIzaSyDjWQtI-u_o__WBvWWBY2Gjvci-V_Kbx4Y",
  // authDomain: "kenya-trails.firebaseapp.com",
  // projectId: "kenya-trails",
  // storageBucket: "kenya-trails.firebasestorage.app",
  // messagingSenderId: "299194029625",
  // appId: "1:299194029625:web:474153228a44cd28ac5fe8",
  // measurementId: "G-VNC6SZ914M"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const googleProvider = new GoogleAuthProvider()

// Set isFirebaseConfigured to true since we now have valid credentials
export const isFirebaseConfigured = true

export default app
