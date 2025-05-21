"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import jsPDF from "jspdf";

type accountDetails = {
  accountName: string;
  accountNumber: string;
  bankName: string;
};

export default function WithdrawalsPage() {
  const auth = useAuth();
  const user = auth?.user;
  const router = useRouter;
  const [withdrawals, setWithdrawals] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [eventId, setEventId] = useState<string>();
  const [accountDetails, setAccountDetails] = useState<accountDetails>();

  useEffect(() => {
    // if (!user) {
    //   router.push("/login");
    //   return;
    // }

    fetchData();
  }, [user, router]);

  const fetchData = async () => {
    if (!user) {
      return;
    }
    try {
      // Fetch organizer's events to calculate total balance
      const eventsQuery = query(
        collection(db, "events"),
        where("organizerId", "==", user.uid),
        where("paymentManagement", "==", "platform")
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      let totalBalance = 0;
      eventsSnapshot.docs.forEach((doc) => {
        const event = doc.data();
        console.log("event data", event);
        setAccountDetails(event.accountDetails);
        setEventId(doc.id);
        totalBalance += event.collectionBalance || 0;
      });
      setBalance(totalBalance);

      // Fetch withdrawal history
      const withdrawalsQuery = query(
        collection(db, "withdrawals"),
        where("organizerId", "==", user.uid)
      );
      const withdrawalsSnapshot = await getDocs(withdrawalsQuery);
      const withdrawalsData = withdrawalsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));
      setWithdrawals(withdrawalsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load withdrawal data");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const withdrawAmount = Number(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (withdrawAmount > balance) {
      setError("Withdrawal amount cannot exceed available balance");
      return;
    }

    try {
      // Calculate platform fee (6%)
      const platformFee = Math.max(withdrawAmount * 0.005, 10);
      const netAmount = withdrawAmount - platformFee;

      // Create withdrawal request
      await addDoc(collection(db, "withdrawals"), {
        organizerId: user.uid,
        organizerName: user.displayName || user.email,
        transferReference: "",
        eventReference: eventId,
        transferRecipientCode: "",
        amount: withdrawAmount,
        platformFee,
        netAmount,
        status: "pending",
        createdAt: serverTimestamp(),
        accountDetails: {
          bankName: accountDetails?.bankName,
          accountNumber: accountDetails?.accountNumber,
          accountName: accountDetails?.accountName,
        },
      });

      setSuccess("Withdrawal request submitted successfully");
      setAmount("");
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error submitting withdrawal:", error);
      setError("Failed to submit withdrawal request");
    }
  };

  const downloadReceipt = (withdrawal) => {
    const doc = new jsPDF();

    // Add company info
    doc.setFontSize(20);
    doc.text("Kenya Trails", 20, 20);

    doc.setFontSize(12);
    doc.text("Withdrawal Receipt", 20, 30);

    // Add line
    doc.line(20, 35, 190, 35);

    // Add withdrawal details
    doc.text(`Withdrawal ID: ${withdrawal.id}`, 20, 45);
    doc.text(`Amount: KSh ${withdrawal.amount.toLocaleString()}`, 20, 55);
    doc.text(
      `Platform Fee: KSh ${withdrawal.platformFee.toLocaleString()}`,
      20,
      65
    );
    doc.text(
      `Net Amount: KSh ${withdrawal.netAmount.toLocaleString()}`,
      20,
      75
    );
    doc.text(`Status: ${withdrawal.status}`, 20, 85);
    doc.text(`Date: ${withdrawal.createdAt.toLocaleDateString()}`, 20, 95);

    // Add footer
    doc.line(20, 180, 190, 180);
    doc.setFontSize(10);
    doc.text("Thank you for using Kenya Trails", 20, 190);

    // Save the PDF
    doc.save(`withdrawal-${withdrawal.id}.pdf`);
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Available Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">KSh {balance.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">
              Available for withdrawal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request Withdrawal</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleWithdraw} className="space-y-4">
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

              <div>
                <Label htmlFor="amount">Amount (KSh)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="1"
                  max={balance}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Platform fee: 0.5% (KSh{" "}
                  {amount ? (Number(amount) * 0.03).toLocaleString() : "0"})
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={
                  !amount || Number(amount) <= 0 || Number(amount) > balance
                }>
                Request Withdrawal
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {withdrawals.map((withdrawal) => (
              <div
                key={withdrawal.id}
                className="border border-gray-200 rounded-lg p-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      {withdrawal.createdAt.toLocaleDateString()}
                    </p>
                    <p className="font-medium">
                      KSh {withdrawal.amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Fee: KSh {withdrawal.platformFee.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Net: KSh {withdrawal.netAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        withdrawal.status === "completed"
                          ? "bg-green-600"
                          : withdrawal.status === "pending"
                          ? "bg-yellow-600"
                          : "bg-red-600"
                      }>
                      {withdrawal.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadReceipt(withdrawal)}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {withdrawals.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                No withdrawal history found
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
