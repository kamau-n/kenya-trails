import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

export async function POST(req: Request) {
  console.log("this is a paystack callback with data below");
  try {
    const event = await req.json();

    console.log(event);

    // Verify Paystack signature here
    const hash = req.headers.get("x-paystack-signature");
    // Add signature verification logic

    if (event.event === "charge.success") {
      const reference = event.data.reference;

      console.log("am updating the event and also the payment",reference);
      

      // Update payment status in Firebase
      const paymentsRef = collection(db, "payments");
      const q = query(paymentsRef, where("id", "==", reference));
      const querySnapshot = await getDocs(q);

      console.log(querySnapshot)

      if (!querySnapshot.empty) {
        console.log("am updating the following transaction",querySnapshot.docs[0])
        const paymentDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, "payments", paymentDoc.id), {
          status: "completed",
          completedAt: new Date(),
        });

        // Update event promotion status
        const { eventId, promotionId } = paymentDoc.data();

        console.log("event id",eventId)
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
