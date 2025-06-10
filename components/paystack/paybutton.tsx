"use client";
import { loadPaystackScript } from "@/lib/paystack";
import { doc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

interface Props {
  amount: number;
  email: string;
  reference: string;
  metadata: any;
  onSuccess: () => void;
  onClose: () => void;
  onStart: () => void;
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
    console.log(typeof onSuccess);
    loadPaystackScript().then(() => {
      setScriptLoaded(true);
    });
  }, []);
  const handlePay = () => {
    // Optional: close your modal here
    onStart;
    console.log(" Am to close the modal");

    console.log(typeof onStart);
    if (typeof onStart === "function") {
      onStart();
    }

    const paystack = (window as any).PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email,
      amount: amount, // Paystack expects amount in kobo
      currency: "KES",
      ref: reference,
      metadata,
      onSuccess,
      callback: () => {
        console.log("succefull payment");
        onSuccess();
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
