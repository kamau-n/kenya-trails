"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigured, googleProvider } from "@/lib/firebase";

// Create the context with a default value of null
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(!isFirebaseConfigured);

  useEffect(() => {
    // If we're in demo mode, don't try to connect to Firebase
    if (demoMode) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get additional user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUser({
              ...user,
              ...userDoc.data(),
            });
          } else {
            setUser(user);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(user);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [demoMode]);

  const signUp = async (email, password, displayName) => {
    if (demoMode) {
      throw new Error(
        "Firebase is not configured. Please add your Firebase credentials to use authentication features."
      );
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update profile with display name
      await updateProfile(userCredential.user, { displayName });

      // Create user document in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        displayName,
        userType: "traveler", // Default user type
        createdAt: new Date(),
      });

      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  const signIn = async (email, password) => {
    if (demoMode) {
      throw new Error(
        "Firebase is not configured. Please add your Firebase credentials to use authentication features."
      );
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    if (demoMode) {
      throw new Error(
        "Firebase is not configured. Please add your Firebase credentials to use authentication features."
      );
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user document exists
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {
        // Create new user document if it doesn't exist
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          displayName: user.displayName,
          userType: "traveler", // Default user type
          createdAt: new Date(),
        });
      }

      return user;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    if (demoMode) {
      return;
    }

    try {
      await firebaseSignOut(auth);
    } catch (error) {
      throw error;
    }
  };

  const updateUserProfile = async (data) => {
    if (demoMode) {
      throw new Error(
        "Firebase is not configured. Please add your Firebase credentials to use authentication features."
      );
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, data, { merge: true });

      // Update local user state
      setUser((prevUser) => ({
        ...prevUser,
        ...data,
      }));

      return true;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateUserProfile,
    demoMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Export the useAuth hook with a null check
export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};

export default AuthProvider;
