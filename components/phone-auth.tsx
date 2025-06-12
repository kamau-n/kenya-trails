// components/phone-auth.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { InfoIcon, Phone, MessageSquare, ArrowLeft } from "lucide-react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface CountryCode {
  code: string;
  country: string;
  flag: string;
}

const COUNTRY_CODES: CountryCode[] = [
  { code: "+254", country: "Kenya", flag: "🇰🇪" },
  { code: "+1", country: "United States", flag: "🇺🇸" },
  { code: "+44", country: "United Kingdom", flag: "🇬🇧" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+234", country: "Nigeria", flag: "🇳🇬" },
  { code: "+27", country: "South Africa", flag: "🇿🇦" },
  { code: "+256", country: "Uganda", flag: "🇺🇬" },
  { code: "+255", country: "Tanzania", flag: "🇹🇿" },
];

interface PhoneAuthProps {
  mode: "login" | "signup";
  onBack?: () => void;
}

export default function PhoneAuth({ mode, onBack }: PhoneAuthProps) {
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect");
  const userTypeParam = searchParams.get("userType");

  const [step, setStep] = useState<"phone" | "verify" | "profile">("phone");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<any>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  // Profile form for new users
  const [profileData, setProfileData] = useState({
    name: "",
    userType: userTypeParam === "organizer" ? "organizer" : "traveler",
    status: "active",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const recaptchaRef = useRef<HTMLDivElement>(null);
  const authContext = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Initialize reCAPTCHA
    if (step === "phone" && !recaptchaVerifier && recaptchaRef.current) {
      const verifier = new RecaptchaVerifier(auth, recaptchaRef.current, {
        size: "invisible",
        callback: () => {
          console.log("reCAPTCHA solved");
        },
        "expired-callback": () => {
          console.log("reCAPTCHA expired");
        },
      });
      setRecaptchaVerifier(verifier);
    }

    return () => {
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
      }
    };
  }, [step, recaptchaVerifier]);

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, "");

    // Format based on country
    if (selectedCountry.code === "+254") {
      // Kenya format: +254 7XX XXX XXX
      if (cleaned.length <= 3) return cleaned;
      if (cleaned.length <= 6)
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(
        6,
        9
      )}`;
    }

    // Default formatting
    return cleaned;
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const fullPhoneNumber = `${selectedCountry.code}${phoneNumber.replace(
        /\D/g,
        ""
      )}`;

      if (!recaptchaVerifier) {
        throw new Error("reCAPTCHA not initialized");
      }

      const confirmation = await signInWithPhoneNumber(
        auth,
        fullPhoneNumber,
        recaptchaVerifier
      );

      setConfirmationResult(confirmation);
      setStep("verify");
    } catch (error: any) {
      console.error("Error sending SMS:", error);
      if (error.code === "auth/invalid-phone-number") {
        setError("Invalid phone number format");
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many requests. Please try again later.");
      } else {
        setError("Failed to send verification code. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!confirmationResult) {
        throw new Error("No confirmation result");
      }

      const result = await confirmationResult.confirm(verificationCode);
      const user = result.user;

      // Check if this is a new user
      const isFirstTime = result.additionalUserInfo?.isNewUser;
      setIsNewUser(isFirstTime || false);

      if (mode === "signup" || isFirstTime) {
        // For signup or new users, go to profile step
        setStep("profile");
      } else {
        // For login of existing users, redirect directly
        await handleSuccessfulAuth(user);
      }
    } catch (error: any) {
      console.error("Error verifying code:", error);
      if (error.code === "auth/invalid-verification-code") {
        setError("Invalid verification code");
      } else {
        setError("Failed to verify code. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!acceptedTerms) {
      setError("You must accept the Terms of Service and Privacy Policy.");
      setLoading(false);
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No authenticated user");
      }

      // Save user profile to Firestore
      await setDoc(
        doc(db, "users", user.uid),
        {
          userType: profileData.userType,
          status: profileData.status,
          name: profileData.name,
          phoneNumber: user.phoneNumber,
          createdAt: serverTimestamp(),
          ipAddress: "fetch-from-server-or-cloud-function",
        },
        { merge: true }
      );

      await handleSuccessfulAuth(user);
    } catch (error: any) {
      console.error("Error saving profile:", error);
      setError("Failed to create profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessfulAuth = async (user: any) => {
    // Wait for auth state to settle
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Use redirect path if available, otherwise default to dashboard
    const destination = redirectPath || "/dashboard";

    try {
      router.replace(destination);
    } catch (routerError) {
      console.warn(
        "Router.replace failed, trying window.location:",
        routerError
      );
      window.location.href = destination;
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  if (authContext?.demoMode) {
    return (
      <div className="md:px-12 mx-auto px-4 py-16 flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">
              Firebase Configuration Required
            </CardTitle>
            <CardDescription>
              Phone authentication is not available in demo mode
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Firebase credentials not found</AlertTitle>
              <AlertDescription>
                Please add Firebase configuration to environment variables.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Phone number input step
  if (step === "phone") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center space-x-2">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <CardTitle className="text-2xl flex items-center">
                <Phone className="mr-2 h-5 w-5" />
                {mode === "login" ? "Sign in" : "Sign up"} with phone
              </CardTitle>
              <CardDescription>
                We'll send you a verification code via SMS
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePhoneSubmit}>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Country</Label>
                <select
                  value={selectedCountry.code}
                  onChange={(e) => {
                    const country = COUNTRY_CODES.find(
                      (c) => c.code === e.target.value
                    );
                    if (country) setSelectedCountry(country);
                  }}
                  className="w-full p-2 border rounded-md">
                  {COUNTRY_CODES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.country} ({country.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex">
                  <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50">
                    <span className="text-sm font-medium">
                      {selectedCountry.flag} {selectedCountry.code}
                    </span>
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={
                      selectedCountry.code === "+254"
                        ? "712 345 678"
                        : "Enter phone number"
                    }
                    required
                    value={phoneNumber}
                    onChange={(e) =>
                      setPhoneNumber(formatPhoneNumber(e.target.value))
                    }
                    className="rounded-l-none"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Enter your phone number without the country code
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={loading || !phoneNumber.trim()}>
                {loading ? "Sending..." : "Send Verification Code"}
              </Button>
            </div>
          </form>

          {/* Invisible reCAPTCHA container */}
          <div ref={recaptchaRef}></div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            {mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}{" "}
            <Link
              href={mode === "login" ? "/signup" : "/login"}
              className="text-green-600 hover:underline">
              {mode === "login" ? "Sign up" : "Sign in"}
            </Link>
          </p>
        </CardFooter>
      </Card>
    );
  }

  // Verification code step
  if (step === "verify") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            Enter verification code
          </CardTitle>
          <CardDescription>
            We sent a 6-digit code to {selectedCountry.code} {phoneNumber}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerificationSubmit}>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  required
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) =>
                    setVerificationCode(e.target.value.replace(/\D/g, ""))
                  }
                  className="text-center text-lg tracking-wider"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={loading || verificationCode.length !== 6}>
                {loading ? "Verifying..." : "Verify Code"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setStep("phone")}
                disabled={loading}>
                Change Phone Number
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Profile setup step (for new users)
  if (step === "profile") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Complete your profile</CardTitle>
          <CardDescription>
            Tell us a bit about yourself to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit}>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  required
                  value={profileData.name}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="space-y-2">
                <Label>I want to:</Label>
                <RadioGroup
                  value={profileData.userType}
                  onValueChange={(value) =>
                    setProfileData((prev) => ({ ...prev, userType: value }))
                  }
                  className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="traveler" id="traveler" />
                    <Label htmlFor="traveler">
                      Book adventures as a traveler
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="organizer" id="organizer" />
                    <Label htmlFor="organizer">Organize and host events</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-start space-x-2 text-sm">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="terms" className="text-gray-700">
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-green-600 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/policies"
                    className="text-green-600 hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={
                  loading || !profileData.name.trim() || !acceptedTerms
                }>
                {loading ? "Creating Profile..." : "Complete Registration"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return null;
}
