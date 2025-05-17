"use client";

import jsPDF from "jspdf";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
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
  Download,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { PaystackButton } from "react-paystack";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function DashboardPage() {
  const auth = useAuth();
  const user = auth?.user;
  const authLoading = auth?.loading || false;

  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    // const handleDeleteEvent = async (eventId) => {
    //   const confirmed = window.confirm(
    //     "Are you sure you want to delete this event?"
    //   );
    //   if (!confirmed) return;

    //   try {
    //     await deleteDoc(doc(db, "events", eventId));
    //     setEvents((prev) => prev.filter((event) => event.id !== eventId));
    //   } catch (error) {
    //     console.error("Error deleting event:", error);
    //     alert("Failed to delete the event. Please try again.");
    //   }
    // };

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

        // If user is an organizer, fetch their events and payments
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

          // Fetch payments for promoted events
          const paymentsQuery = query(
            collection(db, "payments"),
            where("userId", "==", user.uid),
            where("status", "==", "completed")
          );

          console.log("fetching payment data");
          const paymentsSnapshot = await getDocs(paymentsQuery);
          const paymentsData = paymentsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          }));

          console.log("this is the payment data", paymentsData);

          setPayments(paymentsData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, authLoading, router]);

  const displayBookings = bookings;
  const displayEvents = events;
  const displayPayments = payments;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handlePayBalance = async (booking: any) => {
    setSelectedBooking(booking);
    setPaymentData(null); // reset

    try {
      const response = await fetch("/api/create-book-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: booking.amountDue,
          eventId: booking.eventId,
          userId: user.uid,
          bookingId: booking.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPaymentData(data);
      } else {
        alert("Failed to create payment intent.");
      }
    } catch (error) {
      console.error("Payment intent error:", error);
      alert("Error creating payment.");
    }
  };

  // const handlePayBalance = async (booking) => {
  //   try {
  //     // Create payment intent
  //     const response = await fetch("/api/create-book-payment", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         amount: booking.amountDue,
  //         eventId: booking.eventId,
  //         userId: user.uid,
  //         bookingId: booking.id,
  //       }),
  //     });

  //     const data = await response.json();

  //     // Initialize Paystack payment
  //     const paystack = new window.PaystackPop();
  //     paystack.newTransaction({
  //       key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
  //       email: user.email,
  //       amount: data.amount,
  //       reference: data.reference,
  //       onSuccess: () => {
  //         // Update booking status
  //         updateBookingStatus(booking.id, booking.amountDue);
  //       },
  //     });
  //   } catch (error) {
  //     console.error("Error processing payment:", error);
  //     alert("Payment failed. Please try again.");
  //   }
  // };

  const updateBookingStatus = async (bookingId, amount) => {
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      const bookingDoc = await getDoc(bookingRef);
      const bookingData = bookingDoc.data();

      const newAmountPaid = (bookingData.amountPaid || 0) + amount;
      const newAmountDue = bookingData.totalAmount - newAmountPaid;

      await updateDoc(bookingRef, {
        amountPaid: newAmountPaid,
        amountDue: newAmountDue,
        paymentStatus: newAmountDue <= 0 ? "paid" : "partial",
        lastPaymentDate: new Date(),
      });

      // If event uses platform payment management, update collection balance
      if (bookingData.paymentManagement === "platform") {
        const eventRef = doc(db, "events", bookingData.eventId);
        await updateDoc(eventRef, {
          collectionBalance: increment(
            amount * (1 - bookingData.platformFee / 100)
          ),
        });
      }

      // Refresh bookings
      const updatedBooking = {
        ...bookingData,
        amountPaid: newAmountPaid,
        amountDue: newAmountDue,
        paymentStatus: newAmountDue <= 0 ? "paid" : "partial",
      };

      setBookings((prevBookings) =>
        prevBookings.map((b) => (b.id === bookingId ? updatedBooking : b))
      );
    } catch (error) {
      console.error("Error updating booking status:", error);
    }
  };

  const downloadReceipt = (booking) => {
    const doc = new jsPDF();

    // Add company info
    doc.setFontSize(20);
    doc.text("Kenya Trails", 20, 20);

    doc.setFontSize(12);
    doc.text("Payment Receipt", 20, 30);

    // Add line
    doc.line(20, 35, 190, 35);

    // Add booking details
    doc.text(`Booking ID: ${booking.id}`, 20, 45);
    doc.text(`Event: ${booking.eventTitle}`, 20, 55);
    doc.text(`Customer: ${booking.userName}`, 20, 65);
    doc.text(
      `Booking Date: ${booking.bookingDate.toLocaleDateString()}`,
      20,
      75
    );
    doc.text(`Amount Paid: KSh ${booking.amountPaid.toLocaleString()}`, 20, 85);
    doc.text(`Balance Due: KSh ${booking.amountDue.toLocaleString()}`, 20, 95);

    // Add footer
    doc.line(20, 180, 190, 180);
    doc.setFontSize(10);
    doc.text("Thank you for choosing Kenya Trails", 20, 190);

    // Save the PDF
    doc.save(`receipt-${booking.id}.pdf`);
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

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
      {selectedBooking && paymentData && (
        <div className="mt-4">
          <p>
            You’re about to pay <strong>KES {selectedBooking.amountDue}</strong>{" "}
            for booking <strong>{selectedBooking.eventTitle}</strong>
          </p>

          <PaystackButton
            publicKey={process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY}
            email={user.email}
            amount={paymentData.amount}
            reference={paymentData.reference}
            currency="KES"
            metadata={{
              bookingId: selectedBooking.id,
              eventId: selectedBooking.eventId,
              userId: user.uid,
            }}
            text="Pay Now"
            onSuccess={() =>
              updateBookingStatus(selectedBooking.id, selectedBooking.amountDue)
            }
            onClose={() => console.log("Payment popup closed")}
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
          />
        </div>
      )}

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

        {user.userType === "traveler" && (
          <Button asChild className="mt-4 bg-green-600 hover:bg-green-700">
            <Link href="/dashboard/convert-to-organizer">
              Become an Organizer
            </Link>
          </Button>
        )}
      </div>

      <Tabs defaultValue="bookings">
        <TabsList className="mb-8">
          <TabsTrigger value="bookings">My Bookings</TabsTrigger>
          {user.userType === "organizer" && (
            <>
              <TabsTrigger value="events">My Events</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </>
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
                      <div className="flex gap-2">
                        {booking.amountDue > 0 && (
                          <Button
                            onClick={() => handlePayBalance(booking)}
                            className="bg-green-600 hover:bg-green-700">
                            Pay Balance
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => downloadReceipt(booking)}
                          className="flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          Receipt
                        </Button>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {user.userType === "organizer" && (
          <>
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
                      <Link href="/organize/create">
                        Create Your First Event
                      </Link>
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
                          {event?.location || "location"}
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
                              {event.availableSpaces} / {event.totalSpaces}{" "}
                              spots left
                            </span>
                          </div>
                          <div className="font-bold text-green-600">
                            KSh {event.price?.toLocaleString()}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <div className="flex flex-wrap gap-2 justify-between w-full">
                          <Button asChild variant="outline">
                            <Link href={`/events/${event.id}`}>View</Link>
                          </Button>
                          <Button asChild variant="outline">
                            <Link href={`/events/${event.id}/promote`}>
                              Promote
                            </Link>
                          </Button>
                          <Button asChild>
                            <Link
                              href={`/organize/events/${event.id}/payments`}>
                              Manage Payments
                            </Link>
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="payments">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Promotion Payments</CardTitle>
                    <CardDescription>
                      View and manage your promotion payments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {displayPayments.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600">
                          No promotion payments found
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {displayPayments.map((payment) => (
                          <div
                            key={payment.id}
                            className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg">
                            <div className="space-y-2 mb-4 md:mb-0">
                              <p className="font-medium">
                                {payment.eventTitle}
                              </p>
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="h-4 w-4 mr-2" />
                                {formatDate(payment.createdAt)}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <CreditCard className="h-4 w-4 mr-2" />
                                KSh {payment.amount.toLocaleString()}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge
                                className={
                                  payment.status === "completed"
                                    ? "bg-green-600"
                                    : "bg-yellow-600"
                                }>
                                {payment.status}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadReceipt(payment)}>
                                <Download className="h-4 w-4 mr-2" />
                                Receipt
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
