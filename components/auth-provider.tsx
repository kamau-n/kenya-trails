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
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  ConfirmationResult,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, isFirebaseConfigured, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(!isFirebaseConfigured);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [recaptchaVerifier, setRecaptchaVerifier] =
    useState<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (demoMode) {
      setLoading(false);
      return;
    }

    if (!auth) {
      setLoading(false);
      return;
    }

    let verifier: RecaptchaVerifier | null = null;

    // Initialize recaptcha verifier only when needed
    const initRecaptcha = () => {
      if (!verifier && typeof window !== "undefined") {
        try {
          verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
            size: "invisible",
            callback: () => {
              // reCAPTCHA solved, allow signInWithPhoneNumber
            },
            "expired-callback": () => {
              // Response expired, ask user to solve reCAPTCHA again
              console.log("reCAPTCHA expired");
            },
          });
          setRecaptchaVerifier(verifier);
        } catch (error) {
          console.error("Error initializing reCAPTCHA:", error);
        }
      }
    };

    // Set up auth state listener
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

    // Initialize recaptcha when component mounts
    initRecaptcha();

    return () => {
      unsubscribe();
      if (verifier) {
        verifier.clear();
      }
    };
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
        url: "https://kenyatrails.co.ke/login",
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

  const signInWithPhoneNumberAuth = async (
    phoneNumber: string
  ): Promise<string> => {
    if (!auth || !recaptchaVerifier) {
      throw new Error("Auth not initialized or reCAPTCHA not ready");
    }

    try {
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        recaptchaVerifier
      );
      return confirmationResult.verificationId;
    } catch (error) {
      console.error("Error during phone number verification:", error);
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

      // Check if user has 2FA enabled (uncommented and fixed)
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      const userData = userDoc.data();

      if (userData?.twoFactorEnabled) {
        if (!verificationCode) {
          setNeedsVerification(true);
          return { needsVerification: true };
        }

        // Verify 2FA code
        try {
          const response = await fetch("/api/2fa/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: verificationCode }),
          });

          if (!response.ok) {
            throw new Error("Invalid verification code");
          }
        } catch (fetchError) {
          console.error("2FA verification error:", fetchError);
          throw new Error("Invalid verification code");
        }
      }

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
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          displayName: user.displayName,
          userType: "traveler",
          createdAt: new Date(),
          twoFactorEnabled: false,
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
      router.push("/login");
    } catch (error) {
      throw error;
    }
  };

  const signInWithPhone = async (
    phoneNumber: string,
    recaptchaVerifier: RecaptchaVerifier
  ) => {
    try {
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        recaptchaVerifier
      );
      return confirmationResult;
    } catch (error) {
      console.error("Error in signInWithPhone:", error);
      throw error;
    }
  };

  const verifyPhoneCode = async (verificationId: string, code: string) => {
    try {
      const credential = PhoneAuthProvider.credential(verificationId, code);
      const userCredential = await signInWithCredential(auth, credential);
      return { user: userCredential.user };
    } catch (error) {
      console.error("Error in verifyPhoneCode:", error);
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

  const confirmPhoneVerification = async (
    verificationId: string,
    verificationCode: string
  ) => {
    if (!auth) {
      throw new Error("Auth not initialized");
    }

    try {
      const credential = PhoneAuthProvider.credential(
        verificationId,
        verificationCode
      );
      const result = await signInWithCredential(auth, credential);

      // Create user document if it doesn't exist
      if (result.user) {
        await createUserDocument(result.user, {
          phoneNumber: result.user.phoneNumber,
          signInMethod: "phone",
        });
      }

      return result;
    } catch (error) {
      console.error("Error during phone verification:", error);
      throw error;
    }
  };

  const updateUserProfile = async (data) => {
    if (demoMode) {
      throw new Error(
        "Firebase is not configured. Please add your Firebase credentials to use authentication features."
      );
    }

    if (!user?.uid) {
      throw new Error("No authenticated user found");
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

  const createUserDocument = async (user: any, additionalData: any = {}) => {
    if (!user?.uid) return;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const { displayName, email, photoURL, phoneNumber, providerData } = user;

      try {
        await setDoc(userRef, {
          displayName: displayName || additionalData.name || "",
          email: email || "",
          photoURL: photoURL || "",
          phoneNumber: phoneNumber || additionalData.phoneNumber || "",
          signInMethod: additionalData.signInMethod || "email",
          providerData: providerData || [],
          createdAt: serverTimestamp(),
          termsAccepted: false,
          privacyAccepted: false,
          userType: additionalData.userType || "traveler",
          status: "active",
          twoFactorEnabled: false,
          ...additionalData,
        });
      } catch (error) {
        console.error("Error creating user document:", error);
      }
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
    signInWithPhone,
    verifyPhoneCode,
    signInWithPhoneNumber: signInWithPhoneNumberAuth,
    confirmPhoneVerification,
    sendPasswordReset,
    createUserDocument,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;
