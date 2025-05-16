"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { PaystackButton } from "react-paystack";

export default function BookingForm({ event, onClose, onSuccess }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    numberOfPeople: 1,
    specialRequirements: "",
    paymentAmount: event.depositAmount || event.price,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentData, setPaymentData] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value ? Number.parseInt(value) : 1,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate available spaces
      if (formData.numberOfPeople > event.availableSpaces) {
        setError(`Only ${event.availableSpaces} spaces available`);
        setLoading(false);
        return;
      }

      const totalAmount = event.price * formData.numberOfPeople;

      // Create booking document
      const bookingData = {
        eventId: event.id,
        eventTitle: event.title,
        userId: user.uid,
        userName: user.displayName || user.email,
        userEmail: user.email,
        numberOfPeople: formData.numberOfPeople,
        specialRequirements: formData.specialRequirements,
        totalAmount: totalAmount,
        amountPaid: 0,
        amountDue: totalAmount,
        paymentStatus: "pending",
        bookingDate: serverTimestamp(),
        status: event.paymentManagement === "manual" ? "confirmed" : "pending",
        paymentManagement: event.paymentManagement,
        platformFee: event.platformFee || 3,
      };

      const bookingRef = await addDoc(collection(db, "bookings"), bookingData);

      // If platform manages payments, initiate payment
      if (event.paymentManagement === "platform") {
        // Create payment intent
        const response = await fetch("/api/create-book-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: formData.paymentAmount,
            eventId: event.id,
            userId: user.uid,
            bookingId: bookingRef.id,
          }),
        });

        const data = await response.json();
        console.log(data);
        if (response.ok) {
          setPaymentData(data);
        } else {
          throw new Error("Failed to create payment intent");
        }
      } else {
        // For manual payment management, just update spaces and complete
        await updateDoc(doc(db, "events", event.id), {
          availableSpaces: increment(-formData.numberOfPeople),
        });
        onSuccess(bookingRef.id);
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      setError("Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (reference) => {
    try {
      // Update event available spaces
      await updateDoc(doc(db, "events", event.id), {
        availableSpaces: increment(-formData.numberOfPeople),
      });
      onSuccess(reference.bookingId);
    } catch (error) {
      console.error("Error updating after payment:", error);
      setError(
        "Payment successful but failed to update booking. Please contact support."
      );
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">Book Your Spot</h2>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="numberOfPeople">Number of People</Label>
          <Input
            id="numberOfPeople"
            name="numberOfPeople"
            type="number"
            min="1"
            max={event.availableSpaces}
            value={formData.numberOfPeople}
            onChange={handleNumberChange}
            className="mt-1"
          />
          <p className="text-sm text-gray-500 mt-1">
            {event.availableSpaces} spaces available
          </p>
        </div>

        <div>
          <Label htmlFor="specialRequirements">Special Requirements</Label>
          <Textarea
            id="specialRequirements"
            name="specialRequirements"
            value={formData.specialRequirements}
            onChange={handleChange}
            placeholder="Any dietary restrictions, medical conditions, etc."
            className="mt-1"
            rows={3}
          />
        </div>

        {event.paymentManagement === "platform" && (
          <div>
            <Label className="mb-2 block">Payment Amount</Label>
            <div className="text-sm text-gray-600 mb-2">
              Total Amount: KSh{" "}
              {(event.price * formData.numberOfPeople).toLocaleString()}
            </div>
            <div className="flex gap-4 mb-4">
              <Button
                type="button"
                variant={
                  formData.paymentAmount ===
                  event.price * formData.numberOfPeople
                    ? "default"
                    : "outline"
                }
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    paymentAmount: event.price * formData.numberOfPeople,
                  }))
                }>
                Pay Full Amount
              </Button>
              {event.depositAmount > 0 && (
                <Button
                  type="button"
                  variant={
                    formData.paymentAmount === event.depositAmount
                      ? "default"
                      : "outline"
                  }
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      paymentAmount: event.depositAmount,
                    }))
                  }>
                  Pay Deposit (KSh {event.depositAmount.toLocaleString()})
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="pt-4 flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-green-600 hover:bg-green-700"
            disabled={loading}>
            {loading
              ? "Processing..."
              : event.paymentManagement === "platform"
              ? "Continue to Payment"
              : "Confirm Booking"}
          </Button>
        </div>
      </form>

      {paymentData && (
        <div className="mt-4 p-4 border-t border-gray-200">
          <PaystackButton
            publicKey={process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY}
            email={user.email}
            amount={paymentData.amount}
            reference={paymentData.reference}
            currency="KES"
            metadata={{
              bookingId: paymentData.bookingId,
              eventId: event.id,
              userId: user.uid,
            }}
            text="Pay Now"
            onSuccess={handlePaymentSuccess}
            onClose={() => setPaymentData(null)}
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
          />
        </div>
      )}
    </div>
  );
}
