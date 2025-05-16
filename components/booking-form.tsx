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

export default function BookingForm({ event, onClose, onSuccess }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    numberOfPeople: 1,
    specialRequirements: "",
    paymentMethod: event.paymentMethods[0] || "M-Pesa",
    paymentAmount: event.depositAmount || event.price,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const handlePaymentAmountChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      paymentAmount: type === "full" ? event.price : event.depositAmount,
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
        paymentMethod: formData.paymentMethod,
        totalAmount: totalAmount,
        amountPaid: 0,
        amountDue: totalAmount,
        paymentStatus: "pending",
        bookingDate: serverTimestamp(),
        status: event.paymentManagement === "manual" ? "confirmed" : "pending",
        paymentManagement: event.paymentManagement,
        platformFee: event.platformFee || 3,
      };

      // Add booking to database
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
            amount: totalAmount,
            eventId: event.id,
            userId: user.uid,
            bookingId: bookingRef.id,
          }),
        });

        const data = await response.json();

        // Initialize Paystack payment
        const paystack = new window.PaystackPop();
        paystack.newTransaction({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
          email: user.email,
          amount: data.amount,
          reference: data.reference,
          onSuccess: () => {
            // Update event available spaces
            updateDoc(doc(db, "events", event.id), {
              availableSpaces: increment(-formData.numberOfPeople),
            });
            onSuccess(bookingRef.id);
          },
          onCancel: () => {
            // Delete the booking if payment is cancelled
            deleteDoc(doc(db, "bookings", bookingRef.id));
            setError("Payment was cancelled");
            setLoading(false);
          },
        });
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
            <div className="text-sm text-gray-600 mb-4">
              Payment must be completed to confirm booking
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
              ? "Book & Pay"
              : "Confirm Booking"}
          </Button>
        </div>
      </form>
    </div>
  );
}
