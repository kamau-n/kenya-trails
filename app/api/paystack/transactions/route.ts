export type BalanceLedgerEntry = {
  balance: number;
  createdAt: string; // ISO timestamp
  currency: string;
  difference: number;
  domain: string;
  id: number;
  integration: number;
  model_responsible: string;
  model_row: number;
  reason: string;
  updatedAt: string; // ISO timestamp
};

export type BalanceLedgerResponse = {
  status: boolean;
  message: string;
  data: BalanceLedgerEntry[];
};
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function GET(req: Request) {
  try {
    const response = await fetch("https://api.paystack.co/balance/ledger", {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch balance");
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
