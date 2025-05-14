import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  console.log(
    "this is the callback url for money intent payment and its body is below"
  );
  console.log(req);
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature")!;

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      // Update payment status in Firebase
      const paymentsRef = collection(db, "payments");
      const q = query(
        paymentsRef,
        where("paymentIntentId", "==", paymentIntent.id)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const paymentDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, "payments", paymentDoc.id), {
          status: "completed",
          completedAt: new Date(),
        });

        // Update event promotion status
        const { eventId, promotionId } = paymentIntent.metadata;
        await updateDoc(doc(db, "events", eventId), {
          isPromoted: true,
          promotionId,
          promotionStartDate: new Date(),
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
}
