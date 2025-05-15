import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

export async function POST(req: Request) {
  console.log("this is a paystack callback with data below");

  try {
    const event = await req.json();
    console.log(event);

    // Verify Paystack signature here
    const hash = req.headers.get("x-paystack-signature");
    // Add signature verification logic here (optional)

    if (event.event === "charge.success") {
      const reference = event.data.reference;

      console.log("Attempting to update payment and event with reference:", reference);

      // Assume reference is the Firestore document ID
      const paymentDocRef = doc(db, "payments", reference);
      const paymentDocSnap = await getDoc(paymentDocRef);

      if (paymentDocSnap.exists()) {
        console.log("Updating the following transaction with ID:", reference);

        // Update payment status
        await updateDoc(paymentDocRef, {
          status: "completed",
          completedAt: new Date(),
        });

        // Update event promotion status
        const { eventId, promotionId } = paymentDocSnap.data();

        console.log("Updating event:", eventId);
        await updateDoc(doc(db, "events", eventId), {
          isPromoted: true,
          promotionId,
          promotionStartDate: new Date(),
        });
      } else {
        console.warn("No payment document found with ID:", reference);
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
