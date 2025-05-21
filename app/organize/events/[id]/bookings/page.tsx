"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  CreditCard,
  Search,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";

import { event } from "@/app/types/types";
import { booking, events } from "@/app/dashboard/page";

const generateCSV = (bookings, eventName) => {
  const header = [
    "Booking ID",
    "User Name",
    "User Email",
    "Booking Date",
    "Number of People",
    "Total Amount",
    "Amount Paid",
    "Amount Due",
    "Payment Status",
  ];

  const rows = bookings.map((b: any) => [
    b.id,
    b.userName,
    b.userEmail,
    new Date(b.bookingDate).toLocaleDateString("en-KE"),
    b.numberOfPeople,
    b.totalAmount,
    b.amountPaid,
    b.amountDue,
    b.paymentStatus,
  ]);

  const csvContent = [header, ...rows]
    .map((row) => row.map((val) => `"${val}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", eventName + "_" + "bookings.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url); // Clean up
};

export default function EventBookingsPage({ params }) {
  const { id } = params;
  const { user, loading: authLoading } = useAuth();
  const [event, setEvent] = useState<events>();
  const [bookings, setBookings] = useState<booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login?redirect=/organize/events");
      return;
    }

    const fetchEventData = async () => {
      try {
        // Fetch event details
        const eventDoc = await getDoc(doc(db, "events", id));

        if (eventDoc.exists()) {
          const eventData: Partial<event> = {
            id: eventDoc.id,
            ...eventDoc.data(),
            date: eventDoc.data().date?.toDate() || new Date(),
          };

          // Verify that the current user is the organizer
          if (eventData.organizerId !== user.uid) {
            router.push("/organize/events");
            return;
          }

          setEvent(eventData);

          // Fetch bookings for this event
          const bookingsQuery = query(
            collection(db, "bookings"),
            where("eventId", "==", id)
          );

          const bookingsSnapshot = await getDocs(bookingsQuery);
          const bookingsData = bookingsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            bookingDate: doc.data().bookingDate?.toDate() || new Date(),
          }));

          setBookings(bookingsData);
        } else {
          router.push("/organize/events");
        }
      } catch (error) {
        console.error("Error fetching event data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [id, user, authLoading, router]);

  const displayEvent = event;
  const displayBookings = bookings;

  // Filter bookings based on search term
  const filteredBookings = displayBookings.filter(
    (booking) =>
      booking.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleSelectBooking = (booking) => {
    setSelectedBooking(booking);
    setPaymentAmount("");
    setUpdateSuccess(false);
    setUpdateError("");
  };

  const handleUpdatePayment = async () => {
    if (!selectedBooking) return;

    const amount = Number(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setUpdateError("Please enter a valid payment amount");
      return;
    }

    if (amount > selectedBooking.amountDue) {
      setUpdateError(
        `Maximum amount due is KSh ${selectedBooking.amountDue.toLocaleString()}`
      );
      return;
    }

    try {
      const newAmountPaid = selectedBooking.amountPaid + amount;
      const newAmountDue = selectedBooking.totalAmount - newAmountPaid;
      const newPaymentStatus = newAmountDue <= 0 ? "paid" : "partial";

      await updateDoc(doc(db, "bookings", selectedBooking.id), {
        amountPaid: newAmountPaid,
        amountDue: newAmountDue,
        paymentStatus: newPaymentStatus,
      });

      // Update local state
      setBookings(
        bookings.map((booking) =>
          booking.id === selectedBooking.id
            ? {
                ...booking,
                amountPaid: newAmountPaid,
                amountDue: newAmountDue,
                paymentStatus: newPaymentStatus,
              }
            : booking
        )
      );

      setSelectedBooking({
        ...selectedBooking,
        amountPaid: newAmountPaid,
        amountDue: newAmountDue,
        paymentStatus: newPaymentStatus,
      });

      setUpdateSuccess(true);
      setPaymentAmount("");
    } catch (error) {
      console.error("Error updating payment:", error);
      setUpdateError("Failed to update payment. Please try again.");
    }
  };

  if (authLoading || loading) {
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
          <h1 className="text-3xl font-bold">{displayEvent.title}</h1>
          <p className="text-gray-600">Manage bookings for this event</p>
        </div>

        <Button asChild variant="outline">
          <Link href="/organize/events">Back to Events</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Event Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-gray-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Date: {formatDate(displayEvent.date)}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Users className="h-4 w-4 mr-2" />
                  <span>
                    Spaces: {displayEvent.availableSpaces} /{" "}
                    {displayEvent.totalSpaces} available
                  </span>
                </div>
                <div className="flex items-center text-gray-700">
                  <CreditCard className="h-4 w-4 mr-2" />
                  <span>Price: KSh {displayEvent.price?.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-4">
                <h3 className="font-semibold mb-2">Booking Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Total Bookings</p>
                    <p className="text-xl font-bold">
                      {displayBookings.length}
                    </p>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">People Booked</p>
                    <p className="text-xl font-bold">
                      {displayBookings.reduce(
                        (sum, booking) => sum + booking.numberOfPeople,
                        0
                      )}
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-xl font-bold text-green-700">
                      KSh{" "}
                      {displayBookings
                        .reduce((sum, booking) => sum + booking.amountPaid, 0)
                        .toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Pending Payments</p>
                    <p className="text-xl font-bold text-yellow-700">
                      KSh{" "}
                      {displayBookings
                        .reduce((sum, booking) => sum + booking.amountDue, 0)
                        .toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedBooking && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Update Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Booking ID</p>
                    <p className="font-medium">{selectedBooking.id}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="font-medium">{selectedBooking.userName}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-medium">
                        KSh {selectedBooking.totalAmount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Amount Due</p>
                      <p className="font-medium">
                        KSh {selectedBooking.amountDue.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {selectedBooking.amountDue > 0 ? (
                    <>
                      <div>
                        <label
                          htmlFor="paymentAmount"
                          className="block text-sm font-medium text-gray-700 mb-1">
                          Record Payment (KSh)
                        </label>
                        <Input
                          id="paymentAmount"
                          type="number"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          placeholder="Enter amount"
                          min="1"
                          max={selectedBooking.amountDue}
                        />
                      </div>

                      {updateError && (
                        <div className="text-red-500 text-sm flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {updateError}
                        </div>
                      )}

                      {updateSuccess && (
                        <div className="text-green-500 text-sm flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Payment updated successfully
                        </div>
                      )}

                      <Button
                        onClick={handleUpdatePayment}
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={!paymentAmount || Number(paymentAmount) <= 0}>
                        Update Payment
                      </Button>
                    </>
                  ) : (
                    <div className="text-green-500 text-sm flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Fully paid
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <CardTitle>Bookings</CardTitle>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search bookings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => generateCSV(bookings, event?.title)}>
                  Download All Bookings
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {filteredBookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No bookings found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedBooking?.id === booking.id
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleSelectBooking(booking)}>
                      <div className="flex flex-col md:flex-row justify-between mb-2">
                        <div>
                          <h3 className="font-medium">{booking.userName}</h3>
                          <p className="text-sm text-gray-600">
                            {booking.userEmail}
                          </p>
                        </div>
                        <div className="flex items-center mt-2 md:mt-0">
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
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <p className="text-gray-500">Booking Date</p>
                          <p>{formatDate(booking.bookingDate)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">People</p>
                          <p>{booking.numberOfPeople}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Total</p>
                          <p>KSh {booking.totalAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Amount Due</p>
                          <p>KSh {booking.amountDue.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
