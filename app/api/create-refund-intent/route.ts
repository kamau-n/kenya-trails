import { db } from "@/lib/firebase";
import {
	addDoc,
	collection,
	doc,
	getDoc,
	serverTimestamp,
} from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	try {
		const { reference, amount, eventId, userId, bookingId, paymentId } =
			await req.json();

		// Get event details
		const eventDoc = await getDoc(doc(db, "payments", paymentId));
		if (!eventDoc.exists()) {
			return NextResponse.json(
				{ error: "paymemt not found" },
				{ status: 404 }
			);
		}

		const payment = eventDoc.data();

		// Store payment record in Firebase
		const refundDoc = await addDoc(collection(db, "refunds"), {
			eventId,
			bookingId,
			refundReference: reference,
			userId,
			amount: Number(amount) * 100,
			status: "pending",
			createdAt: serverTimestamp(),
			refundFor: "eventBooking",
			customer:"",
			currency:""
		});

		// Return payment reference for Paystack
		return NextResponse.json({
			reference: refundDoc.id,
			amount: amount,
			created: true,
			// Convert to kobo for Paystack
		});
	} catch (error) {
		console.error("Error creating payment:", error);
		return NextResponse.json(
			{ error: "Error creating payment" },
			{ status: 500 }
		);
	}
}
