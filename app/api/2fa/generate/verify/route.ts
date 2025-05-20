import { NextResponse } from "next/server";
import speakeasy from "speakeasy";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    // Get secret from secure storage
    // This is just an example - implement your secure storage
    const secret = "TEMPORARY_SECRET";

    const verified = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token: code,
    });

    if (!verified) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error verifying 2FA code:", error);
    return NextResponse.json(
      { error: "Failed to verify code" },
      { status: 500 }
    );
  }
}
