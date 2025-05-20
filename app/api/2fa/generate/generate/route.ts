import { NextResponse } from "next/server";
import speakeasy from "speakeasy";

export async function POST() {
  try {
    // Generate new secret
    const secret = speakeasy.generateSecret({
      name: "Kenya Trails",
    });

    // Store secret in session or temporary storage
    // This is just an example - you should implement secure storage
    const otpAuthUrl = secret.otpauth_url;

    return NextResponse.json({ 
      otpAuthUrl,
      secret: secret.base32 
    });
  } catch (error) {
    console.error("Error generating 2FA secret:", error);
    return NextResponse.json(
      { error: "Failed to generate 2FA secret" },
      { status: 500 }
    );
  }
}