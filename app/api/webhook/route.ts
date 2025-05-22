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
import { channel } from "diagnostics_channel";

export async function POST(req: Request) {
  console.log("Received Paystack webhook...");

  try {
    const event = await req.json();
    const eventType = event.event;
    const hash = req.headers.get("x-paystack-signature");

    console.log("this is the received event");
    console.log(event);
    // TODO: Add signature verification here if needed

    switch (eventType) {
      case "charge.success": {
        const reference = event.data.reference;
        console.log("Processing charge.success for:", reference);

        const paymentDocRef = doc(db, "payments", reference);
        const paymentDocSnap = await getDoc(paymentDocRef);

        if (paymentDocSnap.exists()) {
          const paymentData = paymentDocSnap.data();

          await updateDoc(paymentDocRef, {
            status: "completed",
            completedAt: new Date(),
            paidAt: event.paid_at,
            reference: event.reference,
            channel: event.channel,
            currency: event.currency,
            customer: event.customer,
          });

          if (paymentData.bookingId) {
            const bookingRef = doc(db, "bookings", paymentData.bookingId);
            const bookingDoc = await getDoc(bookingRef);

            if (bookingDoc.exists()) {
              const bookingData = bookingDoc.data();
              const newAmountPaid =
                (bookingData.amountPaid || 0) + paymentData.amount;
              const newAmountDue = bookingData.totalAmount - newAmountPaid;

              await updateDoc(bookingRef, {
                amountPaid: newAmountPaid,
                amountDue: newAmountDue,
                paymentStatus: newAmountDue <= 0 ? "paid" : "partial",
                status: "confirmed",
                lastPaymentDate: new Date(),
              });

              if (paymentData.managedBy === "platform") {
                await updateDoc(doc(db, "events", paymentData.eventId), {
                  collectionBalance: increment(paymentData.organizerAmount),
                });
              }
            }
          } else if (paymentData.promotionId) {
            await updateDoc(doc(db, "events", paymentData.eventId), {
              isPromoted: true,
              promotionId: paymentData.promotionId,
              promotionStartDate: new Date(),
            });
          }
        } else {
          console.warn("No payment found for reference:", reference);
        }

        break;
      }

      case "transfer.success": {
        const reference = event.data.reference;
        console.log("Processing transfer.success for:", reference);

        const withdrawalsRef = collection(db, "withdrawals");
        const q = query(
          withdrawalsRef,
          where("transferReference", "==", reference)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const withdrawal = querySnapshot.docs[0];
          const withdrawalData = withdrawal.data();

          await updateDoc(doc(db, "withdrawals", withdrawal.id), {
            status: "completed",
            completedAt: new Date(),
          });

          if (withdrawalData.eventReference) {
            await updateDoc(doc(db, "events", withdrawalData.eventReference), {
              collectionBalance: increment(-withdrawalData.amount),
            });
          }
        } else {
          console.warn("No withdrawal found for reference:", reference);
        }

        break;
      }

      default:
        console.log("Unhandled Paystack event type:", eventType);
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
