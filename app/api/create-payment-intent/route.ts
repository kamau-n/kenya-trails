import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req: Request) {
  console.log("Posting payment intent with the following body");
  console.log(req);
  try {
    const { amount, eventId, promotionId, userId } = await req.json();

    // Store payment record in Firebase
    const paymentDoc = await addDoc(collection(db, "payments"), {
      eventId,
      promotionId,
      channel: "",
      currency: "",
      customer: "",
      paidAt: serverTimestamp(),
      reference: "",
      userId,
      amount,
      status: "pending",
      createdAt: serverTimestamp(),
      paymentFor: "eventPromtion",
    });

    // Return payment reference for Paystack
    return NextResponse.json({
      reference: paymentDoc.id,
      amount: amount * 100, // Convert to kobo for Paystack
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Error creating payment" },
      { status: 500 }
    );
  }
}
