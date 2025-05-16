import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  increment,
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
        const paymentData = paymentDocSnap.data();

        // Update payment status
        await updateDoc(paymentDocRef, {
          status: "completed",
          completedAt: new Date(),
        });

        // If this is a booking payment
        if (paymentData.bookingId) {
          const bookingRef = doc(db, "bookings", paymentData.bookingId);
          const bookingDoc = await getDoc(bookingRef);
          
          if (bookingDoc.exists()) {
            const bookingData = bookingDoc.data();
            const newAmountPaid = (bookingData.amountPaid || 0) + paymentData.amount;
            const newAmountDue = bookingData.totalAmount - newAmountPaid;

            // Update booking payment status
            await updateDoc(bookingRef, {
              amountPaid: newAmountPaid,
              amountDue: newAmountDue,
              paymentStatus: newAmountDue <= 0 ? "paid" : "partial",
              status: "confirmed",
              lastPaymentDate: new Date()
            });

            // If using platform payment management, update collection balance
            if (paymentData.managedBy === "platform") {
              await updateDoc(doc(db, "events", paymentData.eventId), {
                collectionBalance: increment(paymentData.organizerAmount)
              });
            }
          }
        }
        // If this is a promotion payment
        else if (paymentData.promotionId) {
          await updateDoc(doc(db, "events", paymentData.eventId), {
            isPromoted: true,
            promotionId: paymentData.promotionId,
            promotionStartDate: new Date(),
          });
        }
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