"use client";

import { PaystackBalanceResponse } from "@/app/api/paystack/balance/route";
import { accountDetails } from "@/app/dashboard/page";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import jsPDF from "jspdf";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  Eye,
  Filter,
  RefreshCw,
  Search,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  email?: string;
  username?: string;
  currency?: string;
  method?: string;
  priority?: string;
  processedAt?: Date;
  processedBy?: string;
  paystackSource?: string;
  completedAt?: Date;
  completedBy?: string;
  rejectedAt?: Date;
  rejectedBy?: string;
  lastError?: string;
  lastErrorAt?: Date;
  reason?: string;
  processedDate?: Date;
};

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<withdrawal[]>([]);
  const [filteredWithdrawals, setFilteredWithdrawals] = useState<withdrawal[]>(
    []
  );

  const stats = {
    total: withdrawals.length,
    pending: withdrawals.filter((w) => w.status === "pending").length,
    approved: withdrawals.filter((w) => w.status === "approved").length,
    processing: withdrawals.filter((w) => w.status === "processing").length,
    rejected: withdrawals.filter((w) => w.status === "rejected").length,
    totalAmount: withdrawals.reduce((sum, w) => sum + w.amount, 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "approved":
        return "text-green-600 bg-green-50 border-green-200";
      case "processing":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "rejected":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "processing":
        return <TrendingUp className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Modal states
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<withdrawal | null>(null);
  const [selectedPaystackSource, setSelectedPaystackSource] = useState("");
  const [paystackSources] = useState([
    {
      id: "balance",
      name: "Main Balance",
      description: "Your main Paystack wallet balance",
    },
  ]);
  const [balances, setBalances] = useState<PaystackBalanceResponse>([]);
  const [loadingBalances, setLoadingBalances] = useState(false);

  // Filtering effect
  useEffect(() => {
    let filtered = withdrawals.filter(
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

    if (selectedStatus !== "all") {
      filtered = filtered.filter(
        (withdrawal) => withdrawal.status === selectedStatus
      );
    }

    setFilteredWithdrawals(filtered);
  }, [withdrawals, searchTerm, selectedStatus]);

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
    setLoading(true);
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
      })) as withdrawal[];

      console.log("this is the withdrawals data", withdrawalsData);
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

  const exportToCSV = () => {
    try {
      const headers = [
        "ID",
        "Organizer Name",
        "Email",
        "Amount",
        "Currency",
        "Status",
        "Method",
        "Created At",
        "Bank Name",
        "Account Number",
        "Account Name",
      ];

      const csvContent = [
        headers.join(","),
        ...filteredWithdrawals.map((withdrawal) =>
          [
            withdrawal.id,
            withdrawal.organizerName || "",
            withdrawal.email || "",
            withdrawal.amount,
            withdrawal.currency || "USD",
            withdrawal.status,
            withdrawal.method || "",
            withdrawal.createdAt?.toISOString() || "",
            withdrawal.accountDetails?.bankName || "",
            withdrawal.accountDetails?.accountNumber || "",
            withdrawal.accountDetails?.accountName || "",
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `withdrawals_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: "Withdrawals exported successfully",
      });
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast({
        title: "Error",
        description: "Failed to export withdrawals",
        variant: "destructive",
      });
    }
  };

  const initiatePaystackTransfer = async (
    withdrawalId: string,
    withdrawalData: any,
    source: string
  ) => {
    try {
      // Update status to processing first
      // await updateDoc(doc(db, "withdrawals", withdrawalId), {
      // 	status: "processing",
      // 	processedAt: new Date(),
      // 	processedBy: user.uid,
      // 	paystackSource: source,
      // });

      console.log("this is the withdrawal data", withdrawalData);
      const response = await fetch("/api/paystack/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          withdrawalId,
          accountDetails: withdrawalData.accountDetails,
          amount: withdrawalData.amount,
          eventId: withdrawalData.eventReference,
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
    } catch (error: any) {
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

  const handleApproveClick = (withdrawal: withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setSelectedPaystackSource("");
    setShowApprovalModal(true);
    fetchBalances(); // Fetch current balances when modal opens
  };

  const handleApprove = async (id: string) => {
    if (!selectedPaystackSource) {
      toast({
        title: "Error",
        description: "Please select a Paystack source",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("Are you sure you want to approve this withdrawal?")) return;

    if (!selectedWithdrawal) return;

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
    } catch (error: any) {
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

  const handleReapprove = async (withdrawalId: string) => {
    if (!confirm("Are you sure you want to retry this withdrawal?")) return;

    setProcessingAction(withdrawalId);

    try {
      const withdrawalDoc = await getDoc(doc(db, "withdrawals", withdrawalId));
      const withdrawalData = withdrawalDoc.data();

      // Use the previously selected Paystack source or prompt for selection
      const source = withdrawalData?.paystackSource || "balance";
      await initiatePaystackTransfer(withdrawalId, withdrawalData, source);

      // Refresh withdrawals
      fetchWithdrawals();
    } catch (error: any) {
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

  const handleReject = async (withdrawalId: string) => {
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

  const downloadReceipt = (withdrawal: withdrawal) => {
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

  const getStatusBadgeClass = (status: string) => {
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

  const formatDate = (dateString: any) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Withdrawal Management
          </h1>
          <p className="text-gray-600">
            Manage and process user withdrawal requests
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pending}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.processing}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.approved}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.rejected}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalAmount.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by username, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-80"
                />
              </div>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  // Reset filters
                  setSearchTerm("");
                  setSelectedStatus("all");
                  toast({
                    title: "Filters Reset",
                    description: "All filters have been cleared",
                  });
                }}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                Clear Filters
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <Button
                onClick={fetchWithdrawals}
                variant="outline"
                className="flex items-center gap-2"
                disabled={loading}>
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Withdrawals Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredWithdrawals.map((withdrawal) => (
                  <tr
                    key={withdrawal.id}
                    className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-800">
                              {withdrawal?.username?.charAt(0).toUpperCase() ||
                                withdrawal?.organizerName
                                  ?.charAt(0)
                                  .toUpperCase() ||
                                "U"}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {withdrawal?.organizerName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {withdrawal?.email}
                          </div>
                          <div className="text-xs text-gray-400">
                            ID: {withdrawal.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${withdrawal.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {withdrawal.currency || "USD"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {withdrawal.method || "Bank Transfer"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                          withdrawal.status
                        )}`}>
                        {getStatusIcon(withdrawal.status)}
                        {withdrawal.status.charAt(0).toUpperCase() +
                          withdrawal.status.slice(1)}
                      </span>
                      {withdrawal.priority === "high" && (
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            High Priority
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(withdrawal.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedWithdrawal(withdrawal)}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                          title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                        {withdrawal.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApproveClick(withdrawal)}
                              className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors"
                              title="Approve"
                              disabled={processingAction === withdrawal.id}>
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(withdrawal.id)}
                              className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                              title="Reject"
                              disabled={processingAction === withdrawal.id}>
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {withdrawal.status === "processing" && (
                          <button
                            onClick={() => handleReapprove(withdrawal.id)}
                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                            title="Retry"
                            disabled={processingAction === withdrawal.id}>
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => downloadReceipt(withdrawal)}
                          className="text-purple-600 hover:text-purple-900 p-1 hover:bg-purple-50 rounded transition-colors"
                          title="Download Receipt">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {filteredWithdrawals.length} of {withdrawals.length} results
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>
            <span className="px-3 py-2 text-sm bg-blue-500 text-white rounded-lg">
              1
            </span>
            <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Approve Withdrawal
                </h2>
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
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
                        {balances.data && balances.data[0]
                          ? balances.data[0].balance.toLocaleString()
                          : "N/A"}
                      </p>
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
                      {paystackSources.map((source) => (
                        <SelectItem key={source.id} value={source.id}>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{source.name}</span>
                              {source.id === "balance" &&
                                balances.data &&
                                balances.data[0] && (
                                  <span className="text-xs text-green-600">
                                    KSh{" "}
                                    {balances.data[0].balance.toLocaleString()}
                                  </span>
                                )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {source.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-sm text-gray-600 mb-4">
                    <p>
                      <strong>Withdrawal Amount:</strong> $
                      {selectedWithdrawal.amount.toLocaleString()}
                    </p>
                    <p>
                      <strong>Organizer:</strong>{" "}
                      {selectedWithdrawal.organizerName}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleApprove(selectedWithdrawal.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={
                        !selectedPaystackSource ||
                        processingAction === selectedWithdrawal.id
                      }>
                      Approve Withdrawal
                    </Button>
                    <Button
                      onClick={() => setShowApprovalModal(false)}
                      variant="outline"
                      className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Details Modal */}
      {selectedWithdrawal && !showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Withdrawal Details
                </h2>
                <button
                  onClick={() => setSelectedWithdrawal(null)}
                  className="text-gray-400 hover:text-gray-600 p-1">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Request ID
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedWithdrawal.id}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                        selectedWithdrawal.status
                      )}`}>
                      {getStatusIcon(selectedWithdrawal.status)}
                      {selectedWithdrawal?.status?.charAt(0).toUpperCase() +
                        selectedWithdrawal.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedWithdrawal.organizerName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedWithdrawal.email}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount
                    </label>
                    <p className="text-sm text-gray-900 font-medium">
                      ${selectedWithdrawal.amount.toLocaleString()}{" "}
                      {selectedWithdrawal.currency || "USD"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Withdrawal Method
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedWithdrawal.method || "Bank Transfer"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Details
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedWithdrawal?.accountDetails?.accountName}
                    </p>
                    <p className="text-sm text-gray-900">
                      {selectedWithdrawal?.accountDetails?.accountNumber}
                    </p>
                    <p className="text-sm text-gray-900">
                      {selectedWithdrawal?.accountDetails?.bankName}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Request Date
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatDate(selectedWithdrawal.createdAt)}
                    </p>
                  </div>
                  {selectedWithdrawal.processedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Processed Date
                      </label>
                      <p className="text-sm text-gray-900">
                        {formatDate(selectedWithdrawal.processedAt)}
                      </p>
                    </div>
                  )}
                </div>

                {selectedWithdrawal.reason && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedWithdrawal.reason}
                    </p>
                  </div>
                )}

                {selectedWithdrawal.lastError && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Error
                    </label>
                    <p className="text-sm text-red-600">
                      {selectedWithdrawal.lastError}
                    </p>
                    {selectedWithdrawal.lastErrorAt && (
                      <p className="text-xs text-gray-500">
                        {formatDate(selectedWithdrawal.lastErrorAt)}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  {selectedWithdrawal.status === "pending" && (
                    <>
                      <button
                        onClick={() => {
                          handleApproveClick(selectedWithdrawal);
                          setSelectedWithdrawal(null);
                        }}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        disabled={processingAction === selectedWithdrawal.id}>
                        Approve Withdrawal
                      </button>
                      <button
                        onClick={() => {
                          handleReject(selectedWithdrawal.id);
                          setSelectedWithdrawal(null);
                        }}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        disabled={processingAction === selectedWithdrawal.id}>
                        Reject Withdrawal
                      </button>
                    </>
                  )}
                  {selectedWithdrawal.status === "processing" && (
                    <button
                      onClick={() => {
                        handleReapprove(selectedWithdrawal.id);
                        setSelectedWithdrawal(null);
                      }}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      disabled={processingAction === selectedWithdrawal.id}>
                      Retry Transfer
                    </button>
                  )}
                  <button
                    onClick={() => downloadReceipt(selectedWithdrawal)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Download Receipt
                  </button>
                  <button
                    onClick={() => setSelectedWithdrawal(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
