// app/organizer/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth-provider";

type Organizer = {
  bio?: string;
  certifications?: string;
  experience?: string;
  onboardingCompleted?: boolean;
  onboardingDate?: string;
  organization?: string;
  phoneNumber?: string;
  website?: string;
};

type OrganizerProfile = {
  bio?: string;
  conversionDate?: string;
  experience?: string;
  organization?: string;
  phoneNumber?: string;
  website?: string;
  role?: string;
  userType?: "organizer" | "traveler";
  email?: string;
  displayName?: string;
};

export default function OrganizerPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };

  const auth = useAuth();
  const user = auth?.user;

  const [organizer, setOrganizer] = useState<Organizer>({});
  const [organizerProfile, setOrganizerProfile] = useState<OrganizerProfile>(
    {}
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchOrganizerData = async () => {
      try {
        const docRef = doc(db, "users", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setOrganizer(data.organizer ?? {});
          setOrganizerProfile({
            ...data,
            role: data.role ?? "",
            userType: data.userType ?? "organizer",
            email: data.email ?? "",
            displayName: data.displayName ?? "",
          });
        }
      } catch (error) {
        console.error("Error fetching organizer data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizerData();
  }, [id, user, router]);

  if (loading) {
    return (
      <div className="text-center mt-10">Loading organizer profile...</div>
    );
  }

  return (
    <Card className="p-6 max-w-4xl mx-auto mt-10">
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Input id="bio" value={organizerProfile.bio ?? ""} disabled />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={organizerProfile.email ?? ""} disabled />
          </div>
          <div>
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={organizerProfile.displayName ?? ""}
              disabled
            />
          </div>
          <div>
            <Label htmlFor="experience">Experience</Label>
            <Input
              id="experience"
              value={organizerProfile.experience ?? ""}
              disabled
            />
          </div>
          <div>
            <Label htmlFor="organization">Organization</Label>
            <Input
              id="organization"
              value={organizerProfile.organization ?? ""}
              disabled
            />
          </div>
          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              value={organizerProfile.phoneNumber ?? ""}
              disabled
            />
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={organizerProfile.website ?? ""}
              disabled
            />
          </div>
          <div>
            <Label htmlFor="accountType">Account Type</Label>
            <Input
              id="accountType"
              value={
                organizerProfile.userType === "organizer"
                  ? "Event Organizer"
                  : "Traveler"
              }
              disabled
            />
          </div>
          {/* <div>
            <Label htmlFor="role">Role</Label>
            <Input id="role" value={organizerProfile.role ?? ""} disabled />
          </div> */}
          {/* <div>
            <Label htmlFor="onboardingCompleted">Onboarding Completed</Label>
            <Input
              id="onboardingCompleted"
              value={organizer.onboardingCompleted ? "Yes" : "No"}
              disabled
            />
          </div> */}
          {/* <div>
            <Label htmlFor="onboardingDate">Onboarding Date</Label>
            <Input
              id="onboardingDate"
              value={
                organizer.onboardingDate
                  ? new Date(organizer.onboardingDate).toLocaleString()
                  : ""
              }
              disabled
            />
          </div> */}
          {/* <div>
            <Label htmlFor="conversionDate">Conversion Date</Label>
            <Input
              id="conversionDate"
              value={
                organizerProfile.conversionDate
                  ? new Date(organizerProfile.conversionDate).toLocaleString()
                  : ""
              }
              disabled
            />
          </div> */}
        </div>

        <div className="pt-4">
          <Button asChild className="w-full md:w-auto" disabled>
            {/* <Link href={`/organizer/${id}/edit`}>Edit Profile</Link> */}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
