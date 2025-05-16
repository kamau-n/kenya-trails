"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, CreditCard, DollarSign } from "lucide-react";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import jsPDF from "jspdf";

export default function EventPaymentsPage({ params }) {
  const { id } = params;
  const [event, setEvent] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collectionBalance, setCollectionBalance] = useState(0);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchEventData();
  }, [id]);

  const fetchEventData = async () => {
    try {
      // Fetch event details
      const eventDoc = await getDoc(doc(db, "events", id));
      if (eventDoc.exists()) {
        const eventData = {
          id: eventDoc.id,
          ...eventDoc.data(),
        };
        setEvent(eventData);
        setCollectionBalance(eventData.collectionBalance || 0);

        // Fetch bookings for this event
        const bookingsQuery = query(
          collection(db, "bookings"),
          where("eventId", "==", id)
        );
        const bookingsSnapshot = await getDocs(bookingsQuery);
        const bookingsData = bookingsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          bookingDate: doc.data().bookingDate?.toDate(),
        }));
        setBookings(bookingsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load payment data");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalRequest = async () => {
    try {
      const amount = Number(withdrawalAmount);
      if (isNaN(amount) || amount <= 0) {
        setError("Please enter a valid amount");
        return;
      }

      if (amount > collectionBalance) {
        setError("Withdrawal amount cannot exceed collection balance");
        return;
      }

      // Create withdrawal request
      await addDoc(collection(db, "withdrawalRequests"), {
        eventId: id,
        organizerId: event.organizerId,
        amount,
        status: "pending",
        createdAt: serverTimestamp(),
        accountDetails: event.accountDetails,
      });

      // Update collection balance
      await updateDoc(doc(db, "events", id), {
        collectionBalance: collectionBalance - amount,
      });

      setCollectionBalance((prev) => prev - amount);
      setSuccess("Withdrawal request submitted successfully");
      setWithdrawalAmount("");
    } catch (error) {
      console.error("Error submitting withdrawal:", error);
      setError("Failed to submit withdrawal request");
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
    doc.text(`Event: ${event.title}`, 20, 55);
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

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Total Collections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              KSh{" "}
              {bookings
                .reduce((sum, b) => sum + (b.amountPaid || 0), 0)
                .toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Collection Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              KSh {collectionBalance.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request Withdrawal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="withdrawalAmount">Amount (KSh)</Label>
                <Input
                  id="withdrawalAmount"
                  type="number"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              <Button
                onClick={handleWithdrawalRequest}
                disabled={!withdrawalAmount || Number(withdrawalAmount) <= 0}
                className="w-full">
                Request Withdrawal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium">{booking.userName}</h3>
                    <p className="text-sm text-gray-500">{booking.userEmail}</p>
                  </div>
                  <Badge
                    className={
                      booking.paymentStatus === "paid"
                        ? "bg-green-600"
                        : booking.paymentStatus === "partial"
                        ? "bg-yellow-600"
                        : "bg-red-600"
                    }>
                    {booking.paymentStatus}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Booking Date</p>
                    <p>{booking.bookingDate.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Amount</p>
                    <p>KSh {booking.totalAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Amount Paid</p>
                    <p>KSh {booking.amountPaid.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Balance Due</p>
                    <p>KSh {booking.amountDue.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadReceipt(booking)}
                    className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download Receipt
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
