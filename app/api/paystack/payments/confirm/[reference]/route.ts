import { VerificationResponse } from "@/app/types/types";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

type Params = {
  params: {
    reference: string;
  };
};

export async function GET(req: Request, { params }: Params) {
  console.log("this is a payment verification process ", req, params);
  const reference = params.reference;
  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    // check the status of the response

    console.log("this is the response", response);

    if (!response.ok) {
      const text = await response.text();
      console.error("Paystack returned non-OK response:", text);
      return new Response(
        JSON.stringify({
          status: 500,
          message: "Failed to fetch from Paystack",
          details: text,
        }),
        { status: 500 }
      );
    }

    let responseData: VerificationResponse = await response.json();
    console.log("this is the response from paystack", responseData);

    if (responseData.status) {
      const reference = responseData.data.reference;
      console.log("Processing charge.success for:", reference);

      const paymentDocRef = doc(db, "payments", reference);
      const paymentDocSnap = await getDoc(paymentDocRef);

      if (paymentDocSnap.exists()) {
        const paymentData = paymentDocSnap.data();

        await updateDoc(paymentDocRef, {
          status: "completed",
          completedAt: new Date(),
          paidAt: Timestamp.fromDate(new Date(responseData?.data?.paid_at)),
          reference: responseData?.data?.reference,
          channel: responseData?.data?.channel,
          currency: responseData?.data?.currency,
          customer: responseData?.data?.customer,
          logs: responseData?.data.log,
          authorization: responseData.data.authorization,
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

            return new Response(
              JSON.stringify({
                status: 200,
                message: "Payment Verification Successful",
                type: "event_booking",
              })
            );
          }
        } else if (paymentData.promotionId) {
          await updateDoc(doc(db, "events", paymentData.eventId), {
            isPromoted: true,
            promotionId: paymentData.promotionId,
            promotionStartDate: new Date(),
          });

          return new Response(
            JSON.stringify({
              status: 200,
              message: "Payment Verification Successful",
              type: "event_promotion",
            })
          );
        }
      } else {
        // create an unallocated payment with status unallocated

        console.log(
          "No Payment Reference was found, money left as unallocated"
        );
        const paymentDoc = await addDoc(collection(db, "payments"), {
          eventId: "",
          promotionId: "",
          channel: responseData.data.channel,
          currency: responseData.data.currency,
          transactionCode: "",
          user: {},
          customer: responseData.data.customer,
          paidAt: serverTimestamp(),
          reference: "",
          userId: "",
          amount: responseData.data.amount,
          status: "unallocated",
          createdAt: serverTimestamp(),
          paymentFor: "eventPromtion",
          logs: {},
          authorization: {},
        });

        return new Response(
          JSON.stringify({
            status: 201,
            message: "No Payments Ref Found, Payment Saved as Unallocated",
          })
        );
      }
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
        status: 500,
      })
    );
  }
}
