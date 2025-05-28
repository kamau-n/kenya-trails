import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { amount, eventId, userId, bookingId } = await req.json();

    // Get event details
    const eventDoc = await getDoc(doc(db, "events", eventId));
    if (!eventDoc.exists()) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const event = eventDoc.data();

    // Store payment record in Firebase
    const paymentDoc = await addDoc(collection(db, "payments"), {
      eventId,
      bookingId,
      channel: "",
      currency: "",
      customer: "",
      reference: "",
      paidAt: serverTimestamp(),
      userId,
      amount,
      status: "pending",
      createdAt: serverTimestamp(),
      refundedAt: null,
      managedBy: event.paymentManagement,
      platformFee: amount * (event.platformFee / 100),
      organizerAmount: amount * (1 - event.platformFee / 100),
      paymentFor: "eventBooking",
      logs: {},
      user: null,
      authorization: {},
      paymentReference: "",
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
