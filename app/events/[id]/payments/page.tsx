"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ManagePaymentsPage({ params }) {
  const { id } = params;
  const [booking, setBooking] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const bookingDoc = await getDoc(doc(db, "bookings", id));
        if (bookingDoc.exists()) {
          setBooking({ id: bookingDoc.id, ...bookingDoc.data() });
        }
      } catch (error) {
        console.error("Error fetching booking:", error);
        setError("Failed to fetch booking details");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const amount = Number(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid payment amount");
      return;
    }

    try {
      const newAmountPaid = (booking.amountPaid || 0) + amount;
      const newAmountDue = booking.totalAmount - newAmountPaid;
      const newPaymentStatus = newAmountDue <= 0 ? "paid" : "partial";

      await updateDoc(doc(db, "bookings", id), {
        amountPaid: newAmountPaid,
        amountDue: newAmountDue,
        paymentStatus: newPaymentStatus,
        lastPaymentDate: new Date(),
      });

      setSuccess(true);
      setPaymentAmount("");
      setBooking({
        ...booking,
        amountPaid: newAmountPaid,
        amountDue: newAmountDue,
        paymentStatus: newPaymentStatus,
      });
    } catch (error) {
      console.error("Error updating payment:", error);
      setError("Failed to update payment");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!booking) {
    return <div>Booking not found</div>;
  }

  return (
    <div className="md:px-12 mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Update Payment</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6">
          <AlertDescription>Payment updated successfully</AlertDescription>
        </Alert>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <Label>Total Amount</Label>
            <p className="text-lg font-semibold">
              KSh {booking.totalAmount?.toLocaleString()}
            </p>
          </div>
          <div>
            <Label>Amount Due</Label>
            <p className="text-lg font-semibold">
              KSh {booking.amountDue?.toLocaleString()}
            </p>
          </div>
        </div>

        <form onSubmit={handlePayment} className="space-y-4">
          <div>
            <Label htmlFor="paymentAmount">Payment Amount (KSh)</Label>
            <Input
              id="paymentAmount"
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="Enter payment amount"
              min="1"
              max={booking.amountDue}
              required
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700"
              disabled={!paymentAmount || Number(paymentAmount) <= 0}>
              Record Payment
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
