import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

const generateUniqueReference = (): string => {
  const timestamp = Date.now().toString(); // Current time in milliseconds
  const randomPart = Math.random().toString(36).substring(2, 8); // Random alphanumeric string
  return `payout_kenya_trails_${timestamp}_${randomPart}`;
};

export async function POST(req: Request) {
  try {
    const { withdrawalId, accountDetails, amount } = await req.json();

    // Create transfer recipient
    const recipientResponse = await fetch(
      "https://api.paystack.co/transferrecipient",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "kepss",
          name: accountDetails.accountName,
          account_number: accountDetails.accountNumber,
          bank_code: "03",
          currency: "KES",
        }),
      }
    );

    const recipientData = await recipientResponse.json();
    console.log("this is the recipient response");
    console.log(recipientData);
    if (!recipientData.status) {
      throw new Error(recipientData.message);
    }

    // Initiate transfer
    const transferResponse = await fetch("https://api.paystack.co/transfer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "balance",
        recipient: recipientData.data.recipient_code,
        reference: generateUniqueReference(),
        amount: amount * 100, // Convert to kobo
        reason: `Withdrawal payout - ${withdrawalId}`,
      }),
    });

    const transferData = await transferResponse.json();

    console.log("this is the transfer response");
    console.log(transferData);
    if (!transferData.status) {
      throw new Error(transferData.message);
    }

    // Update withdrawal status
    await updateDoc(doc(db, "withdrawals", withdrawalId), {
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
