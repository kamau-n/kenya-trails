import { db } from "@/lib/firebase";
import {
	collection,
	doc,
	getDoc,
	getDocs,
	increment,
	query,
	Timestamp,
	updateDoc,
	where,
} from "firebase/firestore";
import { NextResponse } from "next/server";

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
						paidAt: Timestamp.fromDate(
							new Date(event?.data?.paid_at)
						),
						reference: event?.data?.reference,
						channel: event?.data?.channel,
						currency: event?.data?.currency,
						customer: event?.data?.customer,
					});

					if (paymentData.bookingId) {
						const bookingRef = doc(
							db,
							"bookings",
							paymentData.bookingId
						);
						const bookingDoc = await getDoc(bookingRef);

						if (bookingDoc.exists()) {
							const bookingData = bookingDoc.data();
							const newAmountPaid =
								(bookingData.amountPaid || 0) +
								paymentData.amount;
							const newAmountDue =
								bookingData.totalAmount - newAmountPaid;

							await updateDoc(bookingRef, {
								amountPaid: newAmountPaid,
								amountDue: newAmountDue,
								paymentStatus:
									newAmountDue <= 0 ? "paid" : "partial",
								status: "confirmed",
								lastPaymentDate: new Date(),
							});

							if (paymentData.managedBy === "platform") {
								await updateDoc(
									doc(db, "events", paymentData.eventId),
									{
										collectionBalance: increment(
											paymentData.organizerAmount
										),
									}
								);
							}
						}
					} else if (paymentData.promotionId) {
						await updateDoc(
							doc(db, "events", paymentData.eventId),
							{
								isPromoted: true,
								promotionId: paymentData.promotionId,
								promotionStartDate: new Date(),
							}
						);
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
						await updateDoc(
							doc(db, "events", withdrawalData.eventReference),
							{
								collectionBalance: increment(
									-withdrawalData.amount
								),
							}
						);
					}
				} else {
					console.warn(
						"No withdrawal found for reference:",
						reference
					);
				}

				break;
			}
			case "refund.processing": {
				const reference = event.data.reference;
				console.log("Processing refund.processing for:", reference);

				const refundsRef = collection(db, "refunds");
				const q = query(
					refundsRef,
					where("reference", "==", reference)
				);
				const snapshot = await getDocs(q);

				if (!snapshot.empty) {
					const refundDoc = snapshot.docs[0];

					await updateDoc(doc(db, "refunds", refundDoc.id), {
						status: "processing",
						updatedAt: new Date(),
					});
					console.log("Refund status updated to processing.");
				} else {
					console.warn("No refund found for reference:", reference);
				}

				break;
			}

			case "refund.processed": {
				const reference = event.data.reference;
				console.log("Processing refund.processed for:", reference);

				const refundsRef = collection(db, "refunds");
				const q = query(
					refundsRef,
					where("reference", "==", reference)
				);
				const snapshot = await getDocs(q);

				if (!snapshot.empty) {
					const refundDoc = snapshot.docs[0];

					await updateDoc(doc(db, "refunds", refundDoc.id), {
						status: "completed",
						updatedAt: new Date(),
					});
					console.log("Refund status updated to completed.");
				} else {
					console.warn("No refund found for reference:", reference);
				}

				break;
			}

			case "refund.failed": {
				const reference = event.data.reference;
				console.log("Processing refund.failed for:", reference);

				const refundsRef = collection(db, "refunds");
				const q = query(
					refundsRef,
					where("reference", "==", reference)
				);
				const snapshot = await getDocs(q);

				if (!snapshot.empty) {
					const refundDoc = snapshot.docs[0];
					await updateDoc(doc(db, "refunds", refundDoc.id), {
						status: "failed",
						updatedAt: new Date(),
					});
					console.log("Refund status updated to failed.");
				} else {
					console.warn("No refund found for reference:", reference);
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
