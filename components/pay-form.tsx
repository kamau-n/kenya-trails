"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getPaystack } from "@/lib/paystack";
import { FirebaseUser } from "@/app/dashboard/page";
import { metadata } from "@/app/layout";

type PaymentForm = {
  amount: string;
  onSuccess: () => void;
  user: FirebaseUser;
};

export default function PaymentForm({ amount, onSuccess, user }: PaymentForm) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setError("");
    setLoading(true);

    try {
      const paystack = await getPaystack();

      // Create payment intent
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount, user }),
      });

      const { reference } = await response.json();

      // Initialize Paystack payment
      paystack.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        amount: amount * 100, // Convert to kobo
        email: user.email,
        metadata: user,
        // Get from user context
        reference,
        onSuccess: () => {
          onSuccess();
        },
        onCancel: () => {
          setError("Payment was cancelled");
          setLoading(false);
        },
      });
    } catch (error) {
      setError("Payment failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handlePayment}
        className="w-full bg-green-600 hover:bg-green-700"
        disabled={loading}>
        {loading ? "Processing..." : `Pay ₦${amount.toLocaleString()}`}
      </Button>
    </div>
  );
}
