// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/components/auth-provider";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { doc, updateDoc } from "firebase/firestore";
// import { db } from "@/lib/firebase";

// export default function ConvertToOrganizer() {
//   const { user, updateUserProfile } = useAuth();
//   const router = useRouter();

//   const [formData, setFormData] = useState({
//     organization: "",
//     experience: "",
//     phoneNumber: "",
//     website: "",
//     bio: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       // Update user document with organizer details and new role
//       await updateDoc(doc(db, "users", user.uid), {
//         userType: "organizer",
//         organizerProfile: {
//           ...formData,
//           conversionDate: new Date(),
//         },
//       });

//       // Update local user state
//       await updateUserProfile({
//         userType: "organizer",
//         organizerProfile: formData,
//       });

//       router.push("/organize/onboarding");
//     } catch (error: any) {
//       console.error("Error converting to organizer:", error);
//       setError(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   if (!user) {
//     router.push("/login");
//     return null;
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <Card className="max-w-2xl mx-auto">
//         <CardHeader>
//           <CardTitle>Become an Organizer</CardTitle>
//           <CardDescription>
//             Convert your account to an organizer account to start creating and
//             managing events.
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-6">
//             {error && (
//               <Alert variant="destructive">
//                 <AlertDescription>{error}</AlertDescription>
//               </Alert>
//             )}

//             <div className="space-y-4">
//               <div>
//                 <Label htmlFor="organization">Organization/Company Name</Label>
//                 <Input
//                   id="organization"
//                   name="organization"
//                   value={formData.organization}
//                   onChange={handleChange}
//                   placeholder="Your organization name"
//                   required
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="bio">Bio</Label>
//                 <Textarea
//                   id="bio"
//                   name="bio"
//                   value={formData.bio}
//                   onChange={handleChange}
//                   placeholder="Tell us about yourself and your experience"
//                   required
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="experience">Experience</Label>
//                 <Textarea
//                   id="experience"
//                   name="experience"
//                   value={formData.experience}
//                   onChange={handleChange}
//                   placeholder="Describe your relevant experience in organizing events"
//                   required
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="phoneNumber">Phone Number</Label>
//                 <Input
//                   id="phoneNumber"
//                   name="phoneNumber"
//                   value={formData.phoneNumber}
//                   onChange={handleChange}
//                   placeholder="+254 7XX XXX XXX"
//                   required
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="website">Website (Optional)</Label>
//                 <Input
//                   id="website"
//                   name="website"
//                   type="url"
//                   value={formData.website}
//                   onChange={handleChange}
//                   placeholder="https://yourwebsite.com"
//                 />
//               </div>
//             </div>

//             <div className="flex justify-end gap-4">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => router.back()}>
//                 Cancel
//               </Button>
//               <Button
//                 type="submit"
//                 className="bg-green-600 hover:bg-green-700"
//                 disabled={loading}>
//                 {loading ? "Converting..." : "Convert to Organizer"}
//               </Button>
//             </div>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
