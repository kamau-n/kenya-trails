// // app/api/refund/route.ts

// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
//   const { transaction, amount } = await req.json();

//   if (!transaction || !amount) {
//     return NextResponse.json(
//       { error: "Missing transaction or amount" },
//       { status: 400 }
//     );
//   }

//   try {
//     const response = await fetch("https://api.paystack.co/refund", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//         "Cache-Control": "no-cache",
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         transaction,
//         amount, // amount in kobo (e.g., 10000 = ₦100)
//       }),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       return NextResponse.json(
//         { error: data.message || "Refund failed" },
//         { status: response.status }
//       );
//     }

//     return NextResponse.json({ success: true, data });
//   } catch (error) {
//     console.error("Refund Error:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { transaction, amount } = await req.json();

  if (!transaction || !amount) {
    return NextResponse.json(
      { error: "Missing transaction or amount" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch("https://api.paystack.co/refund", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Cache-Control": "no-cache",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transaction,
        amount:amount * 100, // amount in kobo
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Refund failed" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Refund Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
