"use client";

import dynamic from "next/dynamic";

const PaystackButton = dynamic(
  () => import("react-paystack").then((mod) => mod.PaystackButton),
  {
    ssr: false,
  }
);

import { useAuth } from "@/components/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/firebase";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  CreditCard,
  Download,
  Edit,
  Edit2,
  MapPin,
  MessageCircle,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BookingReceiptData,
  downloadBookingReceipt,
  downloadPaymentReceipt,
  PaymentReceiptData,
} from "@/lib/modern-receipt-generator";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  updateDoc,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { cancelResponse } from "../api/bookings/cancel/route";
import {
  booking,
  events,
  FirebaseUser,
  payments,
} from "../types/dashboardtypes";

export default function DashboardPage() {
  const auth = useAuth();
  const user: FirebaseUser = auth?.user;
  const authLoading = auth?.loading || false;

  const [bookings, setBookings] = useState<booking[]>([]);
  const [events, setEvents] = useState<events[]>([]);
  const [payments, setPayments] = useState<payments[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<booking | null>(null);
  const [paymentData, setPaymentData] = useState<payments | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [selectedBookingEvent, setSelectedBookingEvent] = useState<events>();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [cancelSuccess, setCancelSuccess] = useState("");

  const [cancelLoading, setCancelLoading] = useState(false);
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const router = useRouter();

  const handleDeactivateAccount = async () => {
    setDeactivateLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        accountStatus: "deactivated",
        deactivatedAt: new Date(),
      });

      // Sign out the user after deactivation
      await auth.signOut();
      router.push("/login?message=account-deactivated");
    } catch (error) {
      console.error("Error deactivating account:", error);
      alert("Failed to deactivate account. Please try again.");
    } finally {
      setDeactivateLoading(false);
      setShowDeleteModal(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
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

        // If user is an organizer, fetch their events and payments
        if (user.userType === "organizer") {
          const eventsQuery = query(
            collection(db, "events"),
            // where("organizerId", "==", user.uid),
            orderBy("date", "desc")
          );

          const eventsSnapshot = await getDocs(eventsQuery);
          const eventsData = eventsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date?.toDate() || new Date(),
          }));

          console.log(eventsData);

          setEvents(eventsData);

          // Fetch payments for promoted events
          const paymentsQuery = query(
            collection(db, "payments"),
            where("userId", "==", user.uid),
            where("status", "==", "completed")
          );

          const paymentsSnapshot = await getDocs(paymentsQuery);
          const paymentsData = paymentsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          }));

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

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;

    try {
      await deleteDoc(doc(db, "events", eventToDelete));
      setEvents((prev) => prev.filter((event) => event.id !== eventToDelete));
      setShowDeleteModal(false);
      setEventToDelete(null);
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete the event. Please try again.");
    }
  };

  const filteredUserEvents: events[] = events.filter(
    (ev) => ev.organizerId === user?.uid
  );

  console.log("filteredUserEvents", filteredUserEvents);

  const displayBookings = bookings;
  const displayEvents = filteredUserEvents;
  const displayPayments = payments;

  const formatDate = (date: any) => {
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
        setShowPaymentModal(true);
      } else {
        setSelectedBooking(null);
        alert("Failed to create payment intent.");
      }
    } catch (error) {
      console.error("Payment intent error:", error);
      alert("Error creating payment.");
    }
  };

  const updateBookingStatus = async (bookingId: any, amount: any) => {
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      const bookingDoc = await getDoc(bookingRef);
      const bookingData = bookingDoc.data();

      const newAmountPaid = (bookingData?.amountPaid || 0) + amount;
      const newAmountDue = bookingData?.totalAmount - newAmountPaid;

      await updateDoc(bookingRef, {
        amountPaid: newAmountPaid,
        amountDue: newAmountDue,
        paymentStatus: newAmountDue <= 0 ? "paid" : "partial",
        lastPaymentDate: new Date(),
      });

      // If event uses platform payment management, update collection balance
      if (bookingData?.paymentManagement === "platform") {
        const eventRef = doc(db, "events", bookingData?.eventId);
        await updateDoc(eventRef, {
          collectionBalance: increment(
            amount * (1 - bookingData.platformFee / 100)
          ),
        });
      }

      // Refresh bookings
      const updatedBooking = {
        ...bookingData,
        id: bookingId,
        amountPaid: newAmountPaid,
        amountDue: newAmountDue,
        paymentStatus: newAmountDue <= 0 ? "paid" : "partial",
      };

      setBookings((prevBookings) =>
        prevBookings.map((b) => (b.id === bookingId ? updatedBooking : b))
      );

      setShowPaymentModal(false);
      setSelectedBooking(null);
      setPaymentData(null);
    } catch (error) {
      console.error("Error updating booking status:", error);
    }
  };

  const handleCancelBooking = async (booking: booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
    setCancelError("");
    setCancelSuccess("");
  };

  const confirmCancelBooking = async () => {
    if (!selectedBooking) return;

    setCancelLoading(true);

    const res = await fetch("/api/bookings/cancel", {
      method: "POST",
      body: JSON.stringify({
        bookingId: selectedBooking.id,
        eventId: selectedBooking.eventId,
        numberOfPeople: selectedBooking.numberOfPeople,
        amountPaid: selectedBooking.amountPaid,
        userId: user.uid,
        userEmail: user?.email || " ",
      }),
    });
    const data: cancelResponse = await res.json();

    if (res.status == 200) {
      setCancelSuccess(data.message);

      setBookings((prevBookings) =>
        prevBookings.map((b) =>
          b.id === selectedBooking.id ? { ...b, status: "cancelled" } : b
        )
      );

      setTimeout(() => {
        setShowCancelModal(false);
        setSelectedBooking(null);
      }, 2000);

      setCancelLoading(false);
    } else {
      setCancelLoading(false);
      setCancelError(data.error);
    }

    // try {
    //   const bookingRef = doc(db, "bookings", selectedBooking.id);
    //   const eventRef = doc(db, "events", selectedBooking.eventId);

    //   // create a query for fetching all payments where bookingId  is selectedBooking.id

    //   const paymentsQuery = query(
    //     collection(db, "payments"),
    //     where("bookingId", "==", selectedBooking.id)
    //   );

    //   const paymentSnapshot = await getDocs(paymentsQuery);
    //   const paymentData = paymentSnapshot.docs.map((doc) => ({
    //     id: doc.id,
    //     ...doc.data(),
    //   }));

    //   console.log(
    //     "this are all the payments associated with that booking",
    //     paymentData
    //   );

    //   // Update booking status
    //   await updateDoc(bookingRef, {
    //     status: "cancelled",
    //     cancelledAt: new Date(),
    //   });

    //   // Restore available spaces
    //   await updateDoc(eventRef, {
    //     availableSpaces: increment(selectedBooking.numberOfPeople),
    //   });

    //   let paymentsIds = paymentData.forEach((pay) => pay.id);

    //   // If payment was made, create refund request
    //   if (selectedBooking.amountPaid > 0) {
    //     const refundAmount = selectedBooking.amountPaid * 0.98; // 98% refund
    //     await addDoc(collection(db, "refunds"), {
    //       bookingId: selectedBooking.id,
    //       eventId: selectedBooking.eventId,
    //       userId: user.uid,
    //       amount: refundAmount,
    //       originalAmount: selectedBooking.amountPaid,
    //       status: "pending",
    //       reference: "",
    //       paymentRefs: paymentsIds,
    //       reason: "Booking Cancellation",
    //       createdAt: serverTimestamp(),
    //     });
    //   }

    //   setCancelSuccess(
    //     "Booking cancelled successfully. If you made a payment, a refund request has been created."
    //   );

    //   // Update local state
    //   setBookings((prevBookings) =>
    //     prevBookings.map((b) =>
    //       b.id === selectedBooking.id ? { ...b, status: "cancelled" } : b
    //     )
    //   );

    //   setTimeout(() => {
    //     setShowCancelModal(false);
    //     setSelectedBooking(null);
    //   }, 2000);
    // } catch (error) {
    //   console.error("Error cancelling booking:", error);
    //   setCancelError("Failed to cancel booking. Please try again.");
    // } finally {
    //   setCancelLoading(false);
    // }
  };

  const downloadBookingReceiptModern = (booking: any) => {
    const receiptData: BookingReceiptData = {
      id: booking.id,
      eventTitle: booking.eventTitle,
      userName: booking.userName || user.displayName,
      userEmail: user.email,
      bookingDate: new Date(booking.bookingDate),
      amountPaid: booking.amountPaid || 0,
      amountDue: booking.amountDue || 0,
      totalAmount: booking.totalAmount || 0,
      numberOfPeople: booking.numberOfPeople || 1,
      eventId: booking.eventId,
      paymentStatus: booking.paymentStatus || "pending",
    };

    downloadBookingReceipt(receiptData);
  };

  const downloadPaymentReceiptModern = (payment: any) => {
    const receiptData: PaymentReceiptData = {
      id: payment.id,
      eventTitle: payment.eventTitle,
      amount: payment.amount,
      reference: payment.reference || `PAY-${payment.id.substring(0, 8)}`,
      status: payment.status,
      paymentFor: payment.paymentFor,
      createdAt: new Date(payment.createdAt),
      userEmail: user.email,
      userName: user.displayName,
    };

    downloadPaymentReceipt(receiptData);
  };

  let platformManagedEvents: string[] = [];

  if (events.length > 0) {
    platformManagedEvents = events
      .filter((ev) => ev.paymentManagement === "platform")
      .map((ev) => ev.id);
  }

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <div className="animate-pulse text-xl font-medium">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Router will redirect
  }

  return (
    <div className="container mx-auto px-4 py-8 ">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-slate-50 p-6 rounded-lg shadow-sm">
        <div>
          <h1 className="md:text-3xl lg:text-3xl text-xl font-bold text-slate-800">
            My Dashboard
          </h1>
          <p className="text-slate-600 text-sm md:text-lg mt-1">
            Welcome back, {user.displayName || user.email}
          </p>
        </div>

        {user.userType === "organizer" && (
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/organize/create">
              <Calendar className="mr-2 h-4  w-4" />
              Create New Event
            </Link>
          </Button>
        )}

        <Button
          asChild
          variant="outline"
          className="border-blue-300 text-blue-700 hover:bg-blue-50">
          <Link href="/organizer/feedback">
            <MessageCircle className="mr-2 h-4 w-4" />
            Feedback
          </Link>
        </Button>

        {user.userType === "traveler" && (
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/dashboard/convert-to-organizer">
              <Users className="mr-2 h-4 w-4" />
              Become an Organizer
            </Link>
          </Button>
        )}
      </div>

      <Tabs defaultValue="bookings" className="space-y-4">
        <TabsList className="mb-8  bg-white shadow-sm rounded-lg ">
          <TabsTrigger
            value="bookings"
            className="data-[state=active]:bg-green-50 md:text-lg text-xs data-[state=active]:text-green-800">
            My Bookings
          </TabsTrigger>
          {user.userType === "organizer" && (
            <>
              <TabsTrigger
                value="events"
                className="data-[state=active]:bg-green-50 md:text-lg text-xs data-[state=active]:text-green-800">
                My Events
              </TabsTrigger>
            </>
          )}

          <TabsTrigger
            value="payments"
            className="data-[state=active]:bg-green-50 md:text-lg text-xs data-[state=active]:text-green-800">
            Payments
          </TabsTrigger>
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-green-50 md:text-lg text-xs data-[state=active]:text-green-800">
            Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50">
              <CardTitle className="md:text-2xl text-lg">
                Profile Information
              </CardTitle>
              <CardDescription>Manage your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name" className="text-slate-700 mb-1.5 block">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={user.displayName || "Not set"}
                    disabled
                    className="bg-slate-50"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="email"
                    className="text-slate-700 mb-1.5 block">
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={user.email || ""}
                    disabled
                    className="bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="userType"
                  className="text-slate-700 mb-1.5 block">
                  Account Type
                </Label>
                <Input
                  id="userType"
                  value={
                    user.userType === "organizer"
                      ? "Event Organizer"
                      : "Traveler"
                  }
                  disabled
                  className="bg-slate-50"
                />
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-medium text-slate-800 mb-4">
                  Account Management
                </h3>
                <div className="flex flex-wrap gap-4">
                  <Button
                    variant="outline"
                    className="border-yellow-300 text-yellow-700 hover:bg-yellow-50">
                    Update Profile
                  </Button>
                  <Button
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50">
                    Change Password
                  </Button>

                  <Button
                    onClick={handleDeactivateAccount}
                    variant="destructive"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50">
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Confirmation</DialogTitle>
            <DialogDescription>
              Complete your payment to secure your booking
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && paymentData && (
            <div className="py-4">
              <div className="bg-slate-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-slate-600">Event:</div>
                  <div className="font-medium">
                    {selectedBooking.eventTitle}
                  </div>
                  <div className="text-slate-600">Amount Due:</div>
                  <div className="font-medium text-green-700">
                    KES {selectedBooking.amountDue.toLocaleString()}
                  </div>
                  <div className="text-slate-600">Booking ID:</div>
                  <div className="font-medium">
                    {selectedBooking.id.substring(0, 8)}...
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
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
                    updateBookingStatus(
                      selectedBooking.id,
                      selectedBooking.amountDue
                    )
                  }
                  onClose={() => {
                    setShowPaymentModal(false);
                    setSelectedBooking(null);
                  }}
                  className="bg-green-600 text-white py-3 px-6 rounded hover:bg-green-700 w-full"
                />
              </div>
            </div>
          )}
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button variant="outline" className="mt-2">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Booking Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking?{" "}
              {selectedBooking?.amountPaid > 0 &&
                "A refund request will be created for 99% of your payment."}
            </DialogDescription>
          </DialogHeader>

          {cancelError && (
            <Alert variant="destructive">
              <AlertDescription>{cancelError}</AlertDescription>
            </Alert>
          )}

          {cancelSuccess && (
            <Alert>
              <AlertDescription>{cancelSuccess}</AlertDescription>
            </Alert>
          )}

          <div className="py-4">
            {selectedBooking && (
              <div className="bg-slate-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-slate-600">Event:</div>
                  <div className="font-medium">
                    {selectedBooking.eventTitle}
                  </div>
                  <div className="text-slate-600">Amount Paid:</div>
                  <div className="font-medium">
                    KES {selectedBooking.amountPaid.toLocaleString()}
                  </div>
                  {selectedBooking.amountPaid > 0 && (
                    <>
                      <div className="text-slate-600">Refund Amount (99%):</div>
                      <div className="font-medium text-green-700">
                        KES{" "}
                        {(selectedBooking.amountPaid * 0.95).toLocaleString()}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(false)}
              disabled={cancelLoading}>
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={confirmCancelBooking}
              disabled={cancelLoading}>
              {cancelLoading ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
