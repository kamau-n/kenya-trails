"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CheckCircle, FileText, Shield } from "lucide-react";

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

const getUserDisplayInfo = () => {
  if (!user) return { name: "", method: "" };

  const name = user.displayName || user.email || user.phoneNumber || "User";
  let method = "email";

  if (user.phoneNumber && !user.email) {
    method = "phone";
  } else if (
    user.providerData?.some((provider) => provider.providerId === "google.com")
  ) {
    method = "Google";
  }

  return { name, method };
};

const { name, method } = getUserDisplayInfo();

export default function AcceptTerms() {
  const [userType, setUserType] = useState("traveler");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    const currentUser = auth?.user;
    if (!currentUser) {
      router.push("/login");
      return;
    }
    setUser(currentUser);
  }, [auth?.user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!acceptedTerms || !acceptedPrivacy) {
      setError(
        "You must accept both the Terms of Service and Privacy Policy to continue."
      );
      setLoading(false);
      return;
    }

    try {
      if (!user) {
        setError("User not found. Please log in again.");
        setLoading(false);
        return;
      }

      // Update user document with terms acceptance and user type
      await updateDoc(doc(db, "users", user.uid), {
        termsAccepted: true,
        privacyAccepted: true,
        userType: userType,
        termsAcceptedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Redirect to intended destination
      const destination = redirectPath || "/dashboard";
      router.replace(destination);
    } catch (error) {
      console.error("Error updating user terms:", error);
      setError("Failed to save preferences. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth?.signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!user) {
    return (
      <div className="md:px-12 mx-auto px-4 py-16 flex justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          </CardContent>
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
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <FileText className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">
            Welcome to Kenya Trails, {name.split(" ")[0] || "there"}!
          </CardTitle>
          <CardDescription>
            {method === "Google"
              ? "Thanks for signing in with Google. We need a few more details to complete your account setup."
              : method === "phone"
              ? "Thanks for verifying your phone number. We need a few more details to complete your account setup."
              : "We need a few more details to complete your account setup."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  What brings you to Kenya Trails?
                </Label>
                <RadioGroup
                  value={userType}
                  onValueChange={setUserType}
                  className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem
                      value="traveler"
                      id="traveler"
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor="traveler"
                        className="font-medium cursor-pointer">
                        I'm a Traveler
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        I want to discover and book exciting adventures across
                        Kenya
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem
                      value="organizer"
                      id="organizer"
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor="organizer"
                        className="font-medium cursor-pointer">
                        I'm an Organizer
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        I want to create and host travel experiences for others
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Legal Agreements</h3>

                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 border rounded-lg">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor="terms"
                        className="font-medium cursor-pointer flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Terms of Service
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        I agree to the{" "}
                        <Link
                          href="/terms"
                          target="_blank"
                          className="text-green-600 hover:underline">
                          Terms of Service
                        </Link>
                        , including booking policies and user responsibilities.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 border rounded-lg">
                    <input
                      type="checkbox"
                      id="privacy"
                      checked={acceptedPrivacy}
                      onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor="privacy"
                        className="font-medium cursor-pointer flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Privacy Policy
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        I agree to the{" "}
                        <Link
                          href="/privacy"
                          target="_blank"
                          className="text-green-600 hover:underline">
                          Privacy Policy
                        </Link>
                        , including how my data is collected and used.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={loading || !acceptedTerms || !acceptedPrivacy}>
                  {loading ? "Setting up your account..." : "Complete Setup"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-xs text-gray-500">
            By continuing, you acknowledge that you have read and understood our
            terms and policies.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
