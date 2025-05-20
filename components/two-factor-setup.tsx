"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth-provider";
import QRCode from "qrcode";

export default function TwoFactorSetup() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerification, setShowVerification] = useState(false);

  const generateSecret = async () => {
    try {
      const response = await fetch("/api/2fa/generate", {
        method: "POST",
      });
      const data = await response.json();
      
      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(data.otpAuthUrl);
      setQrCode(qrCodeUrl);
      setShowVerification(true);
    } catch (error) {
      console.error("Error generating 2FA secret:", error);
      setError("Failed to generate 2FA secret");
    }
  };

  const verifyAndEnable2FA = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/2fa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: verificationCode }),
      });

      if (!response.ok) {
        throw new Error("Invalid verification code");
      }

      // Update user's 2FA status in Firestore
      await updateDoc(doc(db, "users", user.uid), {
        twoFactorEnabled: true,
      });

      setSuccess("Two-factor authentication enabled successfully");
      setShowVerification(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    try {
      setLoading(true);
      await updateDoc(doc(db, "users", user.uid), {
        twoFactorEnabled: false,
      });
      setSuccess("Two-factor authentication disabled");
    } catch (error) {
      setError("Failed to disable 2FA");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
          <p className="text-sm text-gray-500">
            Add an extra layer of security to your account using Google Authenticator
          </p>
        </div>
        <Switch
          checked={user?.twoFactorEnabled}
          onCheckedChange={(checked) => {
            if (checked) {
              generateSecret();
            } else {
              disable2FA();
            }
          }}
          disabled={loading || showVerification}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {showVerification && (
        <div className="space-y-4">
          <div className="flex justify-center">
            <img src={qrCode} alt="QR Code" className="w-48 h-48" />
          </div>
          <p className="text-sm text-center text-gray-500">
            Scan this QR code with Google Authenticator app
          </p>
          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
          </div>
          <Button
            onClick={verifyAndEnable2FA}
            disabled={loading || verificationCode.length !== 6}
            className="w-full">
            {loading ? "Verifying..." : "Verify and Enable 2FA"}
          </Button>
        </div>
      )}
    </div>
  );
}