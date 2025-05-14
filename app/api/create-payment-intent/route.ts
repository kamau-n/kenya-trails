import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: Request) {
  console.log(" a payment intent has been posted");
  console.log("this is the request body");
  console.log(req);
  try {
    const { amount, eventId, promotionId, userId } = await req.json();

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: "usd",
      metadata: {
        eventId,
        promotionId,
        userId,
      },
    });

    // Store payment record in Firebase
    await addDoc(collection(db, "payments"), {
      paymentIntentId: paymentIntent.id,
      eventId,
      promotionId,
      userId,
      amount,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: "Error creating payment" },
      { status: 500 }
    );
  }
}
