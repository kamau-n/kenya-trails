"use client";
import { loadPaystackScript } from "@/lib/paystack";
import { useEffect, useState } from "react";

interface Props {
  amount: number;
  email: string;
  reference: string;
  metadata: any;
  onSuccess: (response: any) => void;
  onClose: () => void;
  onStart?: () => void;
}

export default function PayButton({
  amount,
  email,
  reference,
  metadata,
  onSuccess,
  onClose,
  onStart,
}: Props) {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    loadPaystackScript().then(() => {
      setScriptLoaded(true);
    });
  }, []);
  const handlePay = () => {
    // Optional: close your modal here
    onStart?.();
    console.log(" Am to close the modal");

    const paystack = (window as any).PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email,
      amount: amount, // Paystack expects amount in kobo
      currency: "KES",
      ref: reference,
      metadata,
      callback: () => {
        console.log("succefull payment");
      },
      onClose,
    });

    paystack.openIframe();
  };

  return (
    <button
      disabled={!scriptLoaded}
      onClick={handlePay}
      className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors">
      Pay with Paystack
    </button>
  );
}
