"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigured, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(!isFirebaseConfigured);
  const [needsVerification, setNeedsVerification] = useState(false);

  useEffect(() => {
    if (demoMode) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
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

      const actionCodeSettings = {
        url: "https://kenyatrails.co.ke/login", // 👈 redirect URL after verification
        handleCodeInApp: false,
      };

      await updateProfile(userCredential.user, { displayName });
      await sendEmailVerification(userCredential.user, actionCodeSettings);

      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        displayName,
        userType: "traveler",
        createdAt: new Date(),
        twoFactorEnabled: false,
      });

      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  const signIn = async (email, password, verificationCode = null) => {
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

      if (!userCredential.user.emailVerified) {
        await firebaseSignOut(auth);
        throw new Error(
          "Email not verified. Please check your inbox for a verification link."
        );
      }

      //  Check if user has 2FA enabled
      // const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      // const userData = userDoc.data();

      // if (userData?.twoFactorEnabled) {
      //   if (!verificationCode) {
      //     setNeedsVerification(true);
      //     return { needsVerification: true };
      //   }

      //   // Verify 2FA code
      //   const response = await fetch("/api/2fa/verify", {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({ code: verificationCode }),
      //   });

      //   if (!response.ok) {
      //     throw new Error("Invalid verification code");
      //   }
      // }

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

      // (Optional) Enforce email verification
      if (!user.emailVerified) {
        await firebaseSignOut(auth);
        throw new Error("Your Google account email is not verified.");
      }

      // Check if user document exists
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          displayName: user.displayName,
          userType: "traveler",
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
      // navigate to login page
      router.push("/login");
    } catch (error) {
      throw error;
    }
  };

  const sendPasswordReset = async (email: string) => {
    if (demoMode) {
      throw new Error(
        "Firebase is not configured. Please add your Firebase credentials to use authentication features."
      );
    }

    try {
      await sendPasswordResetEmail(auth, email);
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
    needsVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};

export default AuthProvider;
