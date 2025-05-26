import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  getDoc,
} from "firebase/firestore";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

interface WithdrawalRequest {
  withdrawalId: string;
  accountDetails: {
    accountName: string;
    accountNumber: string;
  };
  amount: number;
  source: string;
  eventId: string;
}

interface EventData {
  id: string;
  collectionBalance: number;
}

const generateUniqueReference = (): string => {
  const timestamp = Date.now().toString();
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `payout_kenya_trails_${timestamp}_${randomPart}`;
};

const callPaystack = async (endpoint: string, body: any) => {
  const res = await fetch(`https://api.paystack.co/${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!data.status) throw new Error(data.message);
  return data;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as WithdrawalRequest;

    console.log("this is the request body", body);

    if (
      !body.withdrawalId ||
      !body.accountDetails?.accountName ||
      !body.accountDetails?.accountNumber ||
      !body.amount ||
      !body.source ||
      !body.eventId
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
const eventRef = doc(db, "events", body.eventId);
const eventSnapshot = await getDoc(eventRef);

    if (eventSnapshot.empty) {
      console.log("event not found");
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const eventDoc = eventSnapshot.docs[0];
    const event = eventDoc.data() as EventData;
    console.log("this is the event Data", event);

    if (event.collectionBalance < body.amount) {
      console.log("insufficient balance");
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    const recipientData = await callPaystack("transferrecipient", {
      type: "kepss",
      name: body.accountDetails.accountName,
      account_number: body.accountDetails.accountNumber,
      bank_code: "03",
      currency: "KES",
    });

    const transferData = await callPaystack("transfer", {
      source: body.source,
      recipient: recipientData.data.recipient_code,
      reference: generateUniqueReference(),
      amount: body.amount * 100, // KES cents
      reason: `Withdrawal payout - ${body.withdrawalId}`,
    });

    await updateDoc(doc(db, "withdrawals", body.withdrawalId), {
      status: "processing",
      transferReference: transferData.data.reference,
      transferRecipientCode: recipientData.data.recipient_code,
    });

    return NextResponse.json({ success: true, data: transferData.data });
  } catch (error: any) {
    console.error("Transfer error:", error);
    return NextResponse.json(
      { error: error.message || "Transfer failed" },
      { status: 500 }
    );
  }
}
