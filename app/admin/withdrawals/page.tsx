"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, Download, RefreshCw, CreditCard } from "lucide-react";
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
import { toast } from "@/components/ui/use-toast";
import { PaystackBalanceResponse } from "@/app/api/paystack/balance/route";
import { accountDetails } from "@/app/dashboard/page";

export type withdrawal = {
  id: string;
  transactionReference: string;
  organizerName: string;
  createdAt: Date;
  platformFee: number;
  amount: number;
  netAmount: number;
  status: string;
  accountDetails: accountDetails;
};

export default function AdminWithdrawalsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [withdrawals, setWithdrawals] = useState<withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [selectedPaystackSource, setSelectedPaystackSource] = useState("");
  const [paystackSources] = useState([
    {
      id: "balance",
      name: "Main Balance",
      description: "Your main Paystack wallet balance",
    },
    // {
    //   id: "settlement",
    //   name: "Settlement",
    //   description: "Transfer from unsettled funds",
    // },
    // {
    //   id: "subaccount",
    //   name: "Subaccount",
    //   description: "Transfer from subaccount balance",
    // },
    // {
    //   id: "payout",
    //   name: "Direct Payout",
    //   description: "Direct bank transfer (bypasses wallet)",
    // },
  ]);
  const [balances, setBalances] = useState<PaystackBalanceResponse>([]);
  const [loadingBalances, setLoadingBalances] = useState(false);

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
      toast({
        title: "Error",
        description: "Failed to load withdrawal requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBalances = async () => {
    setLoadingBalances(true);
    try {
      const response = await fetch("/api/paystack/balance");
      const data = await response.json();

      console.log("this is the response", data);

      if (data.status) {
        setBalances(data || []);
      } else {
        console.error("Failed to fetch balances:", data);
      }
    } catch (error) {
      console.error("Error fetching balances:", error);
    } finally {
      setLoadingBalances(false);
    }
  };

  const initiatePaystackTransfer = async (
    withdrawalId,
    withdrawalData,
    source
  ) => {
    try {
      // Update status to processing first
      await updateDoc(doc(db, "withdrawals", withdrawalId), {
        status: "processing",
        processedAt: new Date(),
        processedBy: user.uid,
        paystackSource: source,
      });

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
          source, // Include the selected source
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Transfer failed");
      }

      // Update to completed if successful
      await updateDoc(doc(db, "withdrawals", withdrawalId), {
        status: "completed",
        completedAt: new Date(),
        completedBy: user.uid,
        transactionReference: data.reference || null,
        transferDetails: data.transferDetails || null,
      });

      toast({
        title: "Success",
        description: "Withdrawal approved successfully",
      });
    } catch (error) {
      console.error("Error in Paystack transfer:", error);

      // Keep it in processing state with error details
      await updateDoc(doc(db, "withdrawals", withdrawalId), {
        status: "processing",
        lastError: error.message,
        lastErrorAt: new Date(),
      });

      throw error;
    }
  };

  const handleApproveClick = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setSelectedPaystackSource("");
    setShowApprovalModal(true);
    fetchBalances(); // Fetch current balances when modal opens
  };

  const handleApprove = async () => {
    if (!selectedPaystackSource) {
      toast({
        title: "Error",
        description: "Please select a Paystack source",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("Are you sure you want to approve this withdrawal?")) return;

    setProcessingAction(selectedWithdrawal.id);
    setShowApprovalModal(false);

    try {
      const withdrawalDoc = await getDoc(
        doc(db, "withdrawals", selectedWithdrawal.id)
      );
      const withdrawalData = withdrawalDoc.data();

      await initiatePaystackTransfer(
        selectedWithdrawal.id,
        withdrawalData,
        selectedPaystackSource
      );

      // Refresh withdrawals
      fetchWithdrawals();
    } catch (error) {
      console.error("Error approving withdrawal:", error);
      toast({
        title: "Error",
        description: `Failed to approve withdrawal: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setProcessingAction(null);
      setSelectedWithdrawal(null);
      setSelectedPaystackSource("");
    }
  };

  const handleReapprove = async (withdrawalId) => {
    if (!confirm("Are you sure you want to retry this withdrawal?")) return;

    setProcessingAction(withdrawalId);

    try {
      const withdrawalDoc = await getDoc(doc(db, "withdrawals", withdrawalId));
      const withdrawalData = withdrawalDoc.data();

      // Use the previously selected Paystack source or prompt for selection
      const source = withdrawalData.paystackSource || "balance";
      await initiatePaystackTransfer(withdrawalId, withdrawalData, source);

      // Refresh withdrawals
      fetchWithdrawals();
    } catch (error) {
      console.error("Error reapproving withdrawal:", error);
      toast({
        title: "Error",
        description: `Failed to reapprove withdrawal: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setProcessingAction(null);
    }
  };

  const handleReject = async (withdrawalId) => {
    if (!confirm("Are you sure you want to reject this withdrawal?")) return;

    setProcessingAction(withdrawalId);

    try {
      await updateDoc(doc(db, "withdrawals", withdrawalId), {
        status: "rejected",
        rejectedAt: new Date(),
        rejectedBy: user.uid,
      });

      toast({
        title: "Success",
        description: "Withdrawal rejected successfully",
      });

      // Refresh withdrawals
      fetchWithdrawals();
    } catch (error) {
      console.error("Error rejecting withdrawal:", error);
      toast({
        title: "Error",
        description: "Failed to reject withdrawal",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(null);
    }
  };

  const downloadReceipt = (withdrawal) => {
    try {
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
      doc.text(
        `Platform Fee: KSh ${withdrawal.platformFee.toLocaleString()}`,
        20,
        75
      );
      doc.text(
        `Net Amount: KSh ${withdrawal.netAmount.toLocaleString()}`,
        20,
        85
      );
      doc.text(`Status: ${withdrawal.status}`, 20, 95);
      doc.text(`Date: ${withdrawal.createdAt.toLocaleDateString()}`, 20, 105);

      if (withdrawal.accountDetails) {
        doc.text("Bank Details:", 20, 120);
        doc.text(`Bank: ${withdrawal.accountDetails.bankName}`, 30, 130);
        doc.text(
          `Account: ${withdrawal.accountDetails.accountNumber}`,
          30,
          140
        );
        doc.text(`Name: ${withdrawal.accountDetails.accountName}`, 30, 150);
      }

      // Add Paystack source info if available
      if (withdrawal.paystackSource) {
        const source = paystackSources.find(
          (src) => src.id === withdrawal.paystackSource
        );
        doc.text(
          `Paystack Source: ${
            source ? source.name : withdrawal.paystackSource
          }`,
          20,
          160
        );
      }

      // Add transaction reference if available
      if (withdrawal.transactionReference) {
        doc.text(
          `Transaction Ref: ${withdrawal.transactionReference}`,
          20,
          withdrawal.paystackSource ? 170 : 165
        );
      }

      // Add footer
      doc.line(20, 180, 190, 180);
      doc.setFontSize(10);
      doc.text("Kenya Trails - Admin Copy", 20, 190);

      // Save the PDF
      doc.save(`withdrawal-${withdrawal.id}-admin.pdf`);

      toast({
        title: "Success",
        description: "Receipt downloaded successfully",
      });
    } catch (error) {
      console.error("Error downloading receipt:", error);
      toast({
        title: "Error",
        description: "Failed to download receipt",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-600 hover:bg-green-700";
      case "pending":
        return "bg-yellow-600 hover:bg-yellow-700";
      case "processing":
        return "bg-blue-600 hover:bg-blue-700";
      case "rejected":
        return "bg-red-600 hover:bg-red-700";
      default:
        return "bg-gray-600 hover:bg-gray-700";
    }
  };

  const filteredWithdrawals = withdrawals.filter(
    (withdrawal) =>
      withdrawal.organizerName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      withdrawal.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (withdrawal.transactionReference &&
        withdrawal.transactionReference
          .toLowerCase()
          .includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-4">Loading withdrawal requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto md:px-4 md:py-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="md:text-2xl text-lg">
              Withdrawal Requests
            </CardTitle>
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
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="w-full md:w-3/4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <p className="font-medium">{withdrawal.organizerName}</p>
                      <Badge className={getStatusBadgeClass(withdrawal.status)}>
                        {withdrawal.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">ID: {withdrawal.id}</p>
                    <p className="text-sm text-gray-500">
                      {withdrawal.createdAt.toLocaleDateString()} at{" "}
                      {withdrawal.createdAt.toLocaleTimeString()}
                    </p>

                    <div className="mt-2">
                      <p className="text-sm">
                        Amount:{" "}
                        <span className="font-medium">
                          KSh {withdrawal.amount.toLocaleString()}
                        </span>
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
                        <p>
                          Account: {withdrawal.accountDetails.accountNumber}
                        </p>
                        <p>Name: {withdrawal.accountDetails.accountName}</p>
                      </div>
                    )}

                    {withdrawal.paystackSource && (
                      <p className="text-sm text-gray-500 mt-2">
                        Source:{" "}
                        {paystackSources.find(
                          (src) => src.id === withdrawal.paystackSource
                        )?.name || withdrawal.paystackSource}
                      </p>
                    )}

                    {withdrawal.transactionReference && (
                      <p className="text-sm text-gray-500 mt-2">
                        Ref: {withdrawal.transactionReference}
                      </p>
                    )}

                    {withdrawal.lastError && (
                      <p className="text-sm text-red-500 mt-2">
                        Error: {withdrawal.lastError}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 w-full md:w-1/4">
                    <div className="flex flex-wrap gap-2 justify-end">
                      {withdrawal.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            disabled={processingAction === withdrawal.id}
                            onClick={() => handleApproveClick(withdrawal)}>
                            {processingAction === withdrawal.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <CreditCard className="h-4 w-4 mr-2" />
                            )}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={processingAction === withdrawal.id}
                            onClick={() => handleReject(withdrawal.id)}>
                            Reject
                          </Button>
                        </>
                      )}

                      {withdrawal.status === "processing" && (
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                          disabled={processingAction === withdrawal.id}
                          onClick={() => handleReapprove(withdrawal.id)}>
                          {processingAction === withdrawal.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                          )}
                          Reapprove
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadReceipt(withdrawal)}>
                        <Download className="h-4 w-4 mr-2" />
                        Receipt
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredWithdrawals.length === 0 && (
              <div className="text-center text-gray-500 py-8 border border-dashed rounded-lg">
                <p>No withdrawal requests found</p>
                {searchTerm && (
                  <p className="text-sm mt-2">
                    Try adjusting your search criteria
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Approval Modal */}
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Select Paystack Source
            </DialogTitle>
            <DialogDescription>
              Choose which Paystack source to use for this withdrawal.
            </DialogDescription>
          </DialogHeader>

          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium">
                  {selectedWithdrawal.organizerName}
                </p>
                <p className="text-sm text-gray-600">
                  Amount: KSh {selectedWithdrawal.netAmount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Bank: {selectedWithdrawal.accountDetails?.bankName}
                </p>
              </div>

              {/* Balance Information */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">Account Balances</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchBalances}
                    disabled={loadingBalances}
                    className="h-6 px-2">
                    <RefreshCw
                      className={`h-3 w-3 ${
                        loadingBalances ? "animate-spin" : ""
                      }`}
                    />
                  </Button>
                </div>
                {loadingBalances ? (
                  <p className="text-xs text-gray-500">Loading balances...</p>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600">
                      Main Balance: KSh{" "}
                      {balances.data
                        ? balances.data[0].balance.toLocaleString()
                        : "N/A"}
                    </p>
                    {/* <p className="text-xs text-gray-600">
                      Settlement: KSh{" "}
                      {balances.settlement
                        ? balances.settlement.toLocaleString()
                        : "N/A"}
                    </p> */}
                    {/* {balances.subaccount && (
                      <p className="text-xs text-gray-600">
                        Subaccount: KSh {balances.subaccount.toLocaleString()}
                      </p>
                    )} */}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="paystack-source">Paystack Source</Label>
                <Select
                  value={selectedPaystackSource}
                  onValueChange={setSelectedPaystackSource}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a source" />
                  </SelectTrigger>
                  <SelectContent>
                    {paystackSources.map((source) => {
                      // const hasBalance =
                      // (source.id === "balance" && balances.balance > 0) ||
                      // (source.id === "settlement" &&
                      //   balances.settlement > 0) ||
                      // (source.id === "subaccount" &&
                      //   balances.subaccount > 0) ||
                      // source.id === "payout";

                      return (
                        <SelectItem
                          key={source.id}
                          value={source.id}
                          // disabled={!hasBalance && source.id !== "payout"}
                        >
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{source.name}</span>
                              {source.id === "balance" && balances.balance && (
                                <span className="text-xs text-green-600">
                                  KSh {balances.balance.toLocaleString()}
                                </span>
                              )}
                              {source.id === "settlement" &&
                                balances.settlement && (
                                  <span className="text-xs text-green-600">
                                    KSh {balances.settlement.toLocaleString()}
                                  </span>
                                )}
                              {source.id === "subaccount" &&
                                balances.subaccount && (
                                  <span className="text-xs text-green-600">
                                    KSh {balances.subaccount.toLocaleString()}
                                  </span>
                                )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {source.description}
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApprovalModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={!selectedPaystackSource}
              className="bg-green-600 hover:bg-green-700">
              Approve Withdrawal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
