import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log("This is a booking cancellation request", body);
  const { bookingId, eventId, numberOfPeople, amountPaid, userId } = body;

  if (
    !bookingId ||
    !eventId ||
    !numberOfPeople ||
    amountPaid === undefined ||
    !userId
  ) {
    return NextResponse.json(
      { error: "Missing required fields in request body." },
      { status: 400 }
    );
  }

  try {
    const bookingRef = doc(db, "bookings", bookingId);
    const eventRef = doc(db, "events", eventId);

    const paymentsQuery = query(
      collection(db, "payments"),
      where("bookingId", "==", bookingId)
    );
    const paymentSnapshot = await getDocs(paymentsQuery);
    const paymentData = paymentSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Cancel booking and update event availableSpaces
    await updateDoc(bookingRef, {
      status: "cancelled",
      cancelledAt: new Date(),
    });

    await updateDoc(eventRef, {
      availableSpaces: increment(numberOfPeople),
    });

    // Cancel each payment
    const updatePayments = paymentData.map((pay) =>
      updateDoc(doc(db, "payments", pay.id), {
        status: "cancelled",
        cancelledAt: new Date(),
      })
    );
    await Promise.all(updatePayments);

    // Refund logic
    const refundIds: string[] = [];
    if (paymentData.length > 0 && amountPaid > 0) {
      for (const pay of paymentData) {
        const individualRefundAmount = pay.amount ? pay.amount * 0.99 : 0;

        const refundDoc = await addDoc(collection(db, "refunds"), {
          bookingId,
          eventId,
          userId,
          amount: individualRefundAmount,
          originalAmount: pay.amount ?? 0,
          paymentId: pay.id,
          reference: pay.id ?? "",
          status: "initiated",
          reason: "Booking Cancellation",
          createdAt: serverTimestamp(),
        });

        refundIds.push(refundDoc.id);
      }
    }

    return NextResponse.json({
      message: "Booking cancelled successfully.",
      cancelledBookingId: bookingId,
      cancelledPayments: paymentData.map((p) => p.id),
      refundIds: refundIds,
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json(
      {
        error: "Internal server error. Failed to cancel booking.",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
