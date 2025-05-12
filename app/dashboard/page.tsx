"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider"; // Updated import path
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Users,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

export default function DashboardPage() {
  const auth = useAuth();
  const user = auth?.user;
  const authLoading = auth?.loading || false;

  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login?redirect=/dashboard");
      return;
    }

    const fetchUserData = async () => {
      try {
        // Fetch user's bookings
        const bookingsQuery = query(
          collection(db, "bookings"),
          where("userId", "==", user.uid),
          orderBy("bookingDate", "desc")
        );

        const bookingsSnapshot = await getDocs(bookingsQuery);
        const bookingsData = bookingsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          bookingDate: doc.data().bookingDate?.toDate() || new Date(),
        }));

        setBookings(bookingsData);

        // If user is an organizer, fetch their events
        if (user.userType === "organizer") {
          const eventsQuery = query(
            collection(db, "events"),
            where("organizerId", "==", user.uid),
            orderBy("date", "desc")
          );

          const eventsSnapshot = await getDocs(eventsQuery);
          const eventsData = eventsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date?.toDate() || new Date(),
          }));

          setEvents(eventsData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, authLoading, router]);

  // Placeholder data for initial render
  const placeholderBookings = [
    {
      id: "booking1",
      eventId: "event1",
      eventTitle: "Mt. Kenya Hiking Adventure",
      numberOfPeople: 2,
      totalAmount: 30000,
      amountPaid: 10000,
      amountDue: 20000,
      paymentStatus: "partial",
      bookingDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: "confirmed",
    },
    {
      id: "booking2",
      eventId: "event2",
      eventTitle: "Maasai Mara Safari Weekend",
      numberOfPeople: 1,
      totalAmount: 25000,
      amountPaid: 25000,
      amountDue: 0,
      paymentStatus: "paid",
      bookingDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      status: "confirmed",
    },
  ];

  const displayBookings = bookings.length > 0 ? bookings : placeholderBookings;
  const displayEvents = events;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Router will redirect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user.displayName || user.email}
          </p>
        </div>

        {user.userType === "organizer" && (
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/organize/create">Create New Event</Link>
          </Button>
        )}
      </div>

      <Tabs defaultValue="bookings">
        <TabsList className="mb-8">
          <TabsTrigger value="bookings">My Bookings</TabsTrigger>
          {user.userType === "organizer" && (
            <TabsTrigger value="events">My Events</TabsTrigger>
          )}
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          <div className="grid grid-cols-1 gap-6">
            {loading ? (
              <p className="text-center py-12">Loading your bookings...</p>
            ) : displayBookings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-gray-600 mb-4">
                  You haven't made any bookings yet.
                </p>
                <Button asChild className="bg-green-600 hover:bg-green-700">
                  <Link href="/events">Explore Events</Link>
                </Button>
              </div>
            ) : (
              displayBookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{booking.eventTitle}</CardTitle>
                        <CardDescription>
                          Booked on {formatDate(booking.bookingDate)}
                        </CardDescription>
                      </div>
                      <Badge
                        className={
                          booking.paymentStatus === "paid"
                            ? "bg-green-600"
                            : booking.paymentStatus === "partial"
                            ? "bg-yellow-600"
                            : "bg-red-600"
                        }>
                        {booking.paymentStatus === "paid"
                          ? "Paid"
                          : booking.paymentStatus === "partial"
                          ? "Partially Paid"
                          : "Unpaid"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-700">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Booking ID: {booking.id}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Users className="h-4 w-4 mr-2" />
                          <span>
                            Number of People: {booking.numberOfPeople}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-700">
                          <CreditCard className="h-4 w-4 mr-2" />
                          <span>
                            Total Amount: KSh{" "}
                            {booking.totalAmount?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          {booking.amountDue > 0 ? (
                            <>
                              <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" />
                              <span>
                                Amount Due: KSh{" "}
                                {booking.amountDue?.toLocaleString()}
                              </span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                              <span>Fully Paid</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="flex justify-between w-full">
                      <Button asChild variant="outline">
                        <Link href={`/events/${booking.eventId}`}>
                          View Event
                        </Link>
                      </Button>
                      {booking.amountDue > 0 && (
                        <Button
                          asChild
                          className="bg-green-600 hover:bg-green-700">
                          <Link href={`/bookings/${booking.id}/payment`}>
                            Complete Payment
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {user.userType === "organizer" && (
          <TabsContent value="events">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <p className="text-center py-12 col-span-full">
                  Loading your events...
                </p>
              ) : displayEvents.length === 0 ? (
                <div className="text-center py-12 col-span-full">
                  <p className="text-lg text-gray-600 mb-4">
                    You haven't created any events yet.
                  </p>
                  <Button asChild className="bg-green-600 hover:bg-green-700">
                    <Link href="/organize/create">Create Your First Event</Link>
                  </Button>
                </div>
              ) : (
                displayEvents.map((event) => (
                  <Card key={event.id} className="overflow-hidden">
                    <div className="h-40 overflow-hidden">
                      <img
                        src={
                          event.imageUrl ||
                          "/placeholder.svg?height=300&width=500"
                        }
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <div className="flex items-center text-gray-500 text-sm">
                        <MapPin className="h-4 w-4 mr-1" />
                        {event.location}
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center text-gray-700 mb-2">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-700">
                          <Users className="h-4 w-4 mr-2" />
                          <span>
                            {event.availableSpaces} / {event.totalSpaces} spots
                            left
                          </span>
                        </div>
                        <div className="font-bold text-green-600">
                          KSh {event.price?.toLocaleString()}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="flex justify-between w-full">
                        <Button asChild variant="outline">
                          <Link href={`/events/${event.id}`}>View</Link>
                        </Button>
                        <Button asChild>
                          <Link href={`/organize/events/${event.id}/bookings`}>
                            Manage Bookings
                          </Link>
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        )}

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Manage your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={user.displayName || ""} disabled />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user.email || ""} disabled />
                </div>
              </div>

              <div>
                <Label htmlFor="userType">Account Type</Label>
                <Input
                  id="userType"
                  value={
                    user.userType === "organizer"
                      ? "Event Organizer"
                      : "Traveler"
                  }
                  disabled
                />
              </div>

              <div className="pt-4">
                <Button asChild className="w-full md:w-auto">
                  <Link href="/profile/edit">Edit Profile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
