// app/api/bookings/cancel/route.ts

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

    await updateDoc(bookingRef, {
      status: "cancelled",
      cancelledAt: new Date(),
    });

    await updateDoc(eventRef, {
      availableSpaces: increment(numberOfPeople),
    });

    const updatePayments = paymentData.map((pay) =>
      updateDoc(doc(db, "payments", pay.id), {
        status: "cancelled",
        cancelledAt: new Date(),
      })
    );
    await Promise.all(updatePayments);

    const paymentIds = paymentData.map((pay) => pay.id);

    let refundId = null;
    if (amountPaid > 0) {
      const refundAmount = amountPaid * 0.98;

      const refundDoc = await addDoc(collection(db, "refunds"), {
        bookingId,
        eventId,
        userId,
        amount: refundAmount,
        originalAmount: amountPaid,
        status: "pending",
        reference: "",
        paymentRefs: paymentIds,
        reason: "Booking Cancellation",
        createdAt: serverTimestamp(),
      });

      refundId = refundDoc.id;
    }

    return NextResponse.json({
      message: "Booking cancelled successfully.",
      cancelledBookingId: bookingId,
      cancelledPayments: paymentIds,
      refundId: refundId,
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
