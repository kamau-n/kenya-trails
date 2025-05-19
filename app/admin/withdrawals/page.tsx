"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Download } from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  orderBy,
  where,
  getDoc,
} from "firebase/firestore";
import jsPDF from "jspdf";

export default function AdminWithdrawalsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "admin") {
      router.push("/");
      return;
    }

    fetchWithdrawals();
  }, [user, router]);

  const fetchWithdrawals = async () => {
    try {
      const q = query(
        collection(db, "withdrawals"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const withdrawalsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));
      setWithdrawals(withdrawalsData);
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (withdrawalId) => {
    if (!confirm("Are you sure you want to approve this withdrawal?")) return;

    try {
      const withdrawalDoc = await getDoc(doc(db, "withdrawals", withdrawalId));
      const withdrawalData = withdrawalDoc.data();

      // Initiate Paystack transfer
      const response = await fetch("/api/paystack/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          withdrawalId,
          accountDetails: withdrawalData.accountDetails,
          amount: withdrawalData.amount,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Transfer failed");
      }

      // Refresh withdrawals
      fetchWithdrawals();
    } catch (error) {
      console.error("Error approving withdrawal:", error);
      alert("Failed to approve withdrawal: " + error.message);
    }
  };

  const handleReject = async (withdrawalId) => {
    if (!confirm("Are you sure you want to reject this withdrawal?")) return;

    try {
      await updateDoc(doc(db, "withdrawals", withdrawalId), {
        status: "rejected",
        rejectedAt: new Date(),
        rejectedBy: user.uid,
      });

      // Refresh withdrawals
      fetchWithdrawals();
    } catch (error) {
      console.error("Error rejecting withdrawal:", error);
      alert("Failed to reject withdrawal");
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
    doc.text(`Organizer: ${withdrawal.organizerName}`, 20, 55);
    doc.text(`Amount: KSh ${withdrawal.amount.toLocaleString()}`, 20, 65);
    doc.text(`Platform Fee: KSh ${withdrawal.platformFee.toLocaleString()}`, 20, 75);
    doc.text(`Net Amount: KSh ${withdrawal.netAmount.toLocaleString()}`, 20, 85);
    doc.text(`Status: ${withdrawal.status}`, 20, 95);
    doc.text(`Date: ${withdrawal.createdAt.toLocaleDateString()}`, 20, 105);

    if (withdrawal.accountDetails) {
      doc.text("Bank Details:", 20, 120);
      doc.text(`Bank: ${withdrawal.accountDetails.bankName}`, 30, 130);
      doc.text(`Account: ${withdrawal.accountDetails.accountNumber}`, 30, 140);
      doc.text(`Name: ${withdrawal.accountDetails.accountName}`, 30, 150);
    }

    // Add footer
    doc.line(20, 180, 190, 180);
    doc.setFontSize(10);
    doc.text("Kenya Trails - Admin Copy", 20, 190);

    // Save the PDF
    doc.save(`withdrawal-${withdrawal.id}-admin.pdf`);
  };

  const filteredWithdrawals = withdrawals.filter(
    (withdrawal) =>
      withdrawal.organizerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>Withdrawal Requests</CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search withdrawals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredWithdrawals.map((withdrawal) => (
              <div
                key={withdrawal.id}
                className="border border-gray-200 rounded-lg p-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <p className="font-medium">{withdrawal.organizerName}</p>
                    <p className="text-sm text-gray-500">
                      {withdrawal.createdAt.toLocaleDateString()}
                    </p>
                    <div className="mt-2">
                      <p className="text-sm">
                        Amount: KSh {withdrawal.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Fee: KSh {withdrawal.platformFee.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Net: KSh {withdrawal.netAmount.toLocaleString()}
                      </p>
                    </div>
                    {withdrawal.accountDetails && (
                      <div className="mt-2 text-sm text-gray-500">
                        <p>Bank: {withdrawal.accountDetails.bankName}</p>
                        <p>Account: {withdrawal.accountDetails.accountNumber}</p>
                        <p>Name: {withdrawal.accountDetails.accountName}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
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
                    <div className="flex gap-2">
                      {withdrawal.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(withdrawal.id)}>
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(withdrawal.id)}>
                            Reject
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadReceipt(withdrawal)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredWithdrawals.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                No withdrawal requests found
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}