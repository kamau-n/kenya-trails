"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, Phone, Mail } from "lucide-react";

// Phone number validation
const validatePhoneNumber = (phone: string): boolean => {
  // Kenya phone number format: +254XXXXXXXXX or 07XXXXXXXX or 01XXXXXXXX
  const kenyaPhoneRegex = /^(\+254|0)[17]\d{8}$/;
  return kenyaPhoneRegex.test(phone);
};

const formatPhoneNumber = (phone: string): string => {
  // Convert to international format
  if (phone.startsWith("0")) {
    return "+254" + phone.substring(1);
  }
  return phone.startsWith("+") ? phone : "+254" + phone;
};

// Suspense-safe wrapper to get `redirect` param
function SuspendedRedirect({
  onReady,
}: {
  onReady: (redirect: string | null) => void;
}) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  useEffect(() => {
    onReady(redirect);
  }, [redirect, onReady]);

  return null;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [phoneStep, setPhoneStep] = useState<"phone" | "code">("phone");
  const [verificationId, setVerificationId] = useState<string | null>(null);

  const auth = useAuth();
  const router = useRouter();

  const performRedirect = (destination: string) => {
    console.log("Redirecting to:", destination);

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

  const checkUserTermsAcceptance = async (user: any) => {
    try {
      // Check if user has accepted terms
      const userDoc = await auth?.getUserDoc(user.uid);

      if (!userDoc?.termsAccepted) {
        // Redirect to terms acceptance page
        const destination = `/accept-terms?redirect=${encodeURIComponent(
          redirectPath || "/dashboard"
        )}`;
        performRedirect(destination);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error checking terms acceptance:", error);
      return true; // Default to allowing login if check fails
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await auth?.signIn(email, password);
      const user = userCredential?.user;

      if (user && !user.emailVerified && user.status === "active") {
        await auth?.signOut();
        setError("Please verify your email before logging in.");
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 150));

      // Check terms acceptance
      const termsAccepted = await checkUserTermsAcceptance(user);
      if (!termsAccepted) return;

      const destination = redirectPath || "/dashboard";
      performRedirect(destination);
    } catch (error) {
      console.error("Error during login:", error);
      setError("Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!validatePhoneNumber(phoneNumber)) {
        setError(
          "Please enter a valid Kenya phone number (e.g., 0712345678 or +254712345678)"
        );
        return;
      }

      const formattedPhone = formatPhoneNumber(phoneNumber);
      const verificationId = await auth?.signInWithPhoneNumber(formattedPhone);

      if (verificationId) {
        setVerificationId(verificationId);
        setPhoneStep("code");
      }
    } catch (error) {
      console.error("Error during phone authentication:", error);
      setError("Failed to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!verificationId) {
        setError("Verification session expired. Please try again.");
        setPhoneStep("phone");
        return;
      }

      const userCredential = await auth?.confirmPhoneVerification(
        verificationId,
        verificationCode
      );
      const user = userCredential?.user;

      await new Promise((resolve) => setTimeout(resolve, 150));

      // Check terms acceptance
      const termsAccepted = await checkUserTermsAcceptance(user);
      if (!termsAccepted) return;

      const destination = redirectPath || "/dashboard";
      performRedirect(destination);
    } catch (error) {
      console.error("Error during code verification:", error);
      setError("Invalid verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      const result = await auth?.signInWithGoogle();
      const user = result?.user;

      if (user && !user.emailVerified) {
        await auth?.signOut();
        setError("Please verify your email before logging in.");
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 150));

      // Check terms acceptance
      const termsAccepted = await checkUserTermsAcceptance(user);
      if (!termsAccepted) return;

      const destination = redirectPath || "/dashboard";
      performRedirect(destination);
    } catch (error) {
      console.error("Error during Google sign in:", error);
      setError("Failed to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  const resetPhoneFlow = () => {
    setPhoneStep("phone");
    setVerificationId(null);
    setVerificationCode("");
    setError("");
  };

  if (auth?.demoMode) {
    return (
      <div className="md:px-12 mx-auto px-4 py-16 flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">
              Firebase Configuration Required
            </CardTitle>
            <CardDescription>
              Authentication features are not available in demo mode
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

  return (
    <div className="md:px-12 mx-auto px-4 py-16 flex justify-center">
      <Suspense fallback={null}>
        <SuspendedRedirect onReady={setRedirectPath} />
      </Suspense>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Log in to your Kenya Trails account</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4">
              <form onSubmit={handleEmailSubmit}>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link
                        href="/forgot"
                        className="text-sm text-green-600 hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={loading}>
                    {loading ? "Logging in..." : "Log In"}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="phone" className="space-y-4">
              {phoneStep === "phone" ? (
                <form onSubmit={handlePhoneSubmit}>
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="0712345678 or +254712345678"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={loading}>
                      {loading ? "Sending Code..." : "Send Verification Code"}
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleCodeVerification}>
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
                        placeholder="Enter 6-digit code"
                        required
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                      />
                      <p className="text-sm text-gray-600">
                        Code sent to {phoneNumber}
                      </p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={loading}>
                      {loading ? "Verifying..." : "Verify Code"}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={resetPhoneFlow}>
                      Change Phone Number
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>
          </Tabs>

          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full mt-4"
            onClick={handleGoogleSignIn}
            disabled={loading}>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/signup" className="text-green-600 hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>

      <div id="recaptcha-container"></div>
    </div>
  );
}
