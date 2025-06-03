"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Table components will be custom styled
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  Download,
  ArrowUp,
  ArrowDown,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  Filter,
  X,
  Wallet2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { isAfter, isBefore, parseISO } from "date-fns";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const q = query(collection(db, "payments"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const paymentsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        completedAt: doc.data().completedAt?.toDate(),
      }));
      setPayments(paymentsData);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const currencyFormat = (num) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
    }).format(num);

  // Filtering logic
  // Filtering with search, status, and date range
  const filtered = payments
    .filter(
      (payment) =>
        payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.eventId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.userId?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((payment) =>
      statusFilter === "all" ? true : payment.status === statusFilter
    )
    .filter((payment) => {
      if (!dateFrom && !dateTo) return true;
      if (!payment.createdAt) return false;

      const fromDate = dateFrom ? parseISO(dateFrom) : null;
      const toDate = dateTo ? parseISO(dateTo) : null;
      const created = payment.createdAt;

      if (fromDate && toDate) {
        return (
          (isAfter(created, fromDate) ||
            created.getTime() === fromDate.getTime()) &&
          (isBefore(created, toDate) || created.getTime() === toDate.getTime())
        );
      }
      if (fromDate) {
        return (
          isAfter(created, fromDate) || created.getTime() === fromDate.getTime()
        );
      }
      if (toDate) {
        return (
          isBefore(created, toDate) || created.getTime() === toDate.getTime()
        );
      }
      return true;
    });

  // Sorting
  const sorted = filtered.sort((a, b) => {
    const aVal =
      sortField === "amount"
        ? a.amount
        : sortField === "createdAt"
        ? a.createdAt?.getTime() || 0
        : a.completedAt?.getTime() || 0;
    const bVal =
      sortField === "amount"
        ? b.amount
        : sortField === "createdAt"
        ? b.createdAt?.getTime() || 0
        : b.completedAt?.getTime() || 0;

    return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
  });

  // Pagination
  const paginated = sorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(sorted.length / itemsPerPage);

  // Statistics
  const totalPayments = payments.length;
  const completedPayments = payments.filter(
    (p) => p.status === "completed"
  ).length;
  const pendingPayments = payments.filter((p) => p.status === "pending").length;
  const failedPayments = payments.filter((p) => p.status === "failed").length;
  const cancelledPayments = payments.filter(
    (p) => p.status === "refunded" || p.status === "cancelled"
  ).length;
  const totalAmount = payments.reduce(
    (acc, p) => acc + (p.status === "completed" ? Number(p.amount) : 0),
    0
  );

  // Toggle sort direction
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const downloadPayments = () => {
    const headers = [
      "Payment ID",
      "Event ID",
      "User ID",
      "Reference",
      "Channel",
      "Amount",
      "Status",
      "Created At",
      "Completed At",
    ];

    const csvData = sorted.map((payment) => [
      payment.id,
      payment.eventId,
      payment.userId,
      payment.reference,
      payment.channel,
      payment.amount,
      payment.status,
      payment.createdAt ? payment.createdAt.toISOString() : "-",
      payment.completedAt ? payment.completedAt.toISOString() : "-",
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;

      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "refunded":
        return <Wallet2 className="h-4 w-4 text-red-600" />;

      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses =
      "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "completed":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "refunded":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "failed":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Payment Management
            </h1>
            <p className="text-gray-600 mt-1">
              Track and manage all payment transactions
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              onClick={downloadPayments}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Payments
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {totalPayments}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {pendingPayments}
                  </p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {completedPayments}
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Failed</p>
                  <p className="text-2xl font-bold text-red-600">
                    {failedPayments}
                  </p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Refunded</p>
                  <p className="text-2xl font-bold text-red-600">
                    {cancelledPayments}
                  </p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <X className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Amount
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {currencyFormat(totalAmount)}
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Filters
                </span>
              </div>

              <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
                <div className="relative min-w-[250px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by ID, reference, or user..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] border-gray-300">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                {(searchTerm || statusFilter !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                    className="text-gray-500 hover:text-gray-700">
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">
                      User & Event
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">
                      Reference
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">
                      Channel
                    </th>
                    <th
                      onClick={() => toggleSort("amount")}
                      className="px-6 py-4 text-left cursor-pointer select-none font-semibold text-gray-900 hover:bg-gray-100">
                      <div className="flex items-center gap-1">
                        Amount
                        {sortField === "amount" &&
                          (sortOrder === "asc" ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          ))}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">
                      Status
                    </th>
                    <th
                      onClick={() => toggleSort("createdAt")}
                      className="px-6 py-4 text-left cursor-pointer select-none font-semibold text-gray-900 hover:bg-gray-100">
                      <div className="flex items-center gap-1">
                        Request Date
                        {sortField === "createdAt" &&
                          (sortOrder === "asc" ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          ))}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((payment) => (
                    <tr
                      key={payment.id}
                      className="hover:bg-gray-50 border-b border-gray-100">
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900">
                            User: {payment.userId.substring(0, 8)}...
                          </div>
                          <div className="text-xs text-gray-500">
                            Event: {payment.eventId}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-sm text-gray-900">
                          {payment.reference}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200">
                          {payment.channel}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">
                          {currencyFormat(payment.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={getStatusBadge(payment.status)}>
                          {getStatusIcon(payment.status)}
                          <span className="capitalize">{payment.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {payment.createdAt.toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center p-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, sorted.length)} of{" "}
                  {sorted.length} payments
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}>
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "ghost"
                          }
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-8 h-8 p-0">
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
