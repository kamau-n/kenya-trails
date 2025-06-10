"use client";

import Link from "next/link";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CheckCircle } from "lucide-react";

export default function OrganizerOnboarding() {
  const auth = useAuth();
  const user = auth?.user;
  const router = useRouter();

  const [formData, setFormData] = useState({
    bio: "",
    experience: "",
    phoneNumber: "",
    organization: "",
    website: "",
    certifications: "",
  });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!user) {
        throw new Error("You must be logged in to complete onboarding");
      }

      // Update user profile with organizer details
      await updateDoc(doc(db, "users", user.uid), {
        organizer: {
          ...formData,
          onboardingCompleted: true,
          onboardingDate: new Date(),
        },
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/organize/create");
      }, 3000);
    } catch (error) {
      console.error("Error during onboarding:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  if (!user) {
    return (
      <div className="md:px-12 mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-8">You need to be logged in to access this page.</p>
        <Button asChild>
          <Link href="/login?redirect=/organize/onboarding">Log In</Link>
        </Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="md:px-12 mx-auto px-4 py-16 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Onboarding Complete!</CardTitle>
            <CardDescription>
              Your organizer profile has been set up successfully. You'll be
              redirected to create your first event.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/organize/create">Create Your First Event</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="md:px-12 mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2 text-center">
        Organizer Onboarding
      </h1>
      <p className="text-gray-600 mb-8 text-center">
        Complete your profile to start organizing events on Kenya Trails
      </p>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div
            className={`flex-1 h-2 ${
              step >= 1 ? "bg-green-600" : "bg-gray-200"
            } rounded-l-full transition-colors duration-300`}></div>
          <div
            className={`flex-1 h-2 ${
              step >= 2 ? "bg-green-600" : "bg-gray-200"
            } transition-colors duration-300`}></div>
          <div
            className={`flex-1 h-2 ${
              step >= 3 ? "bg-green-600" : "bg-gray-200"
            } rounded-r-full transition-colors duration-300`}></div>
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span
            className={
              step >= 1 ? "text-green-600 font-medium" : "text-gray-500"
            }>
            Basic Info
          </span>
          <span
            className={
              step >= 2 ? "text-green-600 font-medium" : "text-gray-500"
            }>
            Experience
          </span>
          <span
            className={
              step >= 3 ? "text-green-600 font-medium" : "text-gray-500"
            }>
            Finish
          </span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && "Personal Information"}
            {step === 2 && "Experience & Qualifications"}
            {step === 3 && "Review & Submit"}
          </CardTitle>
          <CardDescription>
            {step === 1 &&
              "Tell us about yourself and how travelers can contact you"}
            {step === 2 &&
              "Share your experience and qualifications as an event organizer"}
            {step === 3 && "Review your information before submitting"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    placeholder="+254 7XX XXX XXX"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization">
                    Company/Organization (Optional)
                  </Label>
                  <Input
                    id="organization"
                    name="organization"
                    placeholder="Your company or organization name"
                    value={formData.organization}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website (Optional)</Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    placeholder="https://yourwebsite.com"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    placeholder="Tell travelers about yourself and why they should join your events"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Experience</Label>
                  <Textarea
                    id="experience"
                    name="experience"
                    placeholder="Describe your experience organizing travel or hiking events"
                    value={formData.experience}
                    onChange={handleChange}
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certifications">
                    Certifications (Optional)
                  </Label>
                  <Textarea
                    id="certifications"
                    name="certifications"
                    placeholder="List any relevant certifications or qualifications you have"
                    value={formData.certifications}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Personal Information
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="mb-2">
                      <span className="font-medium">Name:</span>{" "}
                      {user.displayName}
                    </p>
                    <p className="mb-2">
                      <span className="font-medium">Email:</span> {user.email}
                    </p>
                    <p className="mb-2">
                      <span className="font-medium">Phone:</span>{" "}
                      {formData.phoneNumber || "Not provided"}
                    </p>
                    <p className="mb-2">
                      <span className="font-medium">Organization:</span>{" "}
                      {formData.organization || "Not provided"}
                    </p>
                    <p>
                      <span className="font-medium">Website:</span>{" "}
                      {formData.website || "Not provided"}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Experience & Qualifications
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="mb-4">
                      <p className="font-medium mb-1">Bio:</p>
                      <p className="text-gray-700">{formData.bio}</p>
                    </div>
                    <div className="mb-4">
                      <p className="font-medium mb-1">Experience:</p>
                      <p className="text-gray-700">{formData.experience}</p>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Certifications:</p>
                      <p className="text-gray-700">
                        {formData.certifications || "None provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          {step > 1 ? (
            <Button type="button" variant="outline" onClick={prevStep}>
              Back
            </Button>
          ) : (
            <div></div>
          )}

          {step < 3 ? (
            <Button
              type="button"
              className="bg-green-600 hover:bg-green-700"
              onClick={nextStep}>
              Continue
            </Button>
          ) : (
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700"
              onClick={handleSubmit}
              disabled={loading}>
              {loading ? "Submitting..." : "Complete Setup"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
