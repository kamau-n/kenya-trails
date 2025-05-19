import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  increment,
  collection,
  where,
  getDocs,
  query,
} from "firebase/firestore";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(req: Request) {
  console.log("this is the webhook with the response for a withdrawal request");
  console.log(req);
  try {
    const event = await req.json();

    // Verify Paystack webhook signature
    const hash = req.headers.get("x-paystack-signature");
    // Add signature verification logic here

    if (event.event === "transfer.success") {
      const reference = event.data.reference;

      // Find withdrawal by transfer reference
      const withdrawalsRef = collection(db, "withdrawals");
      const q = query(
        withdrawalsRef,
        where("transferReference", "==", reference)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const withdrawal = querySnapshot.docs[0];
        const withdrawalData = withdrawal.data();

        // Update withdrawal status
        await updateDoc(doc(db, "withdrawals", withdrawal.id), {
          status: "completed",
          completedAt: new Date(),
        });

        // Update event collection balance
        if (withdrawalData.eventId) {
          await updateDoc(doc(db, "events", withdrawalData.eventId), {
            collectionBalance: increment(-withdrawalData.amount),
          });
        }
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
