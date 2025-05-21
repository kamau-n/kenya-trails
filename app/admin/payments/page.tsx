"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Download, ArrowUp, ArrowDown } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { format, parseISO, isAfter, isBefore } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<
    "amount" | "createdAt" | "completedAt"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
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

  const currencyFormat = (num: number) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
    }).format(num);

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

  // Totals on filtered data (all pages)
  const totalAmount = filtered.reduce(
    (acc, p) => acc + (Number(p.amount) || 0),
    0
  );

  // Toggle sort direction
  const toggleSort = (field: "amount" | "createdAt" | "completedAt") => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Export only filtered and sorted (all pages)
  const downloadPayments = () => {
    const headers = [
      "Payment ID",
      "Event ID",
      "User ID",
      "Amount",
      "Status",
      "Created At",
      "Completed At",
    ];

    const csvData = sorted.map((payment) => [
      payment.id,
      payment.eventId,
      payment.userId,
      payment.amount,
      payment.status,
      payment.createdAt ? format(payment.createdAt, "dd/MM/yyyy HH:mm") : "-",
      payment.completedAt
        ? format(payment.completedAt, "dd/MM/yyyy HH:mm")
        : "-",
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Payments</h1>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <div>
            <label className="block text-sm font-medium mb-1">From</label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">To</label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <Button
            onClick={downloadPayments}
            variant="outline"
            className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment ID</TableHead>
              <TableHead>Event ID</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead
                onClick={() => toggleSort("amount")}
                className="cursor-pointer select-none">
                Amount{" "}
                {sortField === "amount" &&
                  (sortOrder === "asc" ? (
                    <ArrowUp size={14} />
                  ) : (
                    <ArrowDown size={14} />
                  ))}
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead
                onClick={() => toggleSort("createdAt")}
                className="cursor-pointer select-none">
                Created At{" "}
                {sortField === "createdAt" &&
                  (sortOrder === "asc" ? (
                    <ArrowUp size={14} />
                  ) : (
                    <ArrowDown size={14} />
                  ))}
              </TableHead>
              <TableHead
                onClick={() => toggleSort("completedAt")}
                className="cursor-pointer select-none">
                Completed At{" "}
                {sortField === "completedAt" &&
                  (sortOrder === "asc" ? (
                    <ArrowUp size={14} />
                  ) : (
                    <ArrowDown size={14} />
                  ))}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-mono">{payment.id}</TableCell>
                <TableCell>{payment.eventId}</TableCell>
                <TableCell>{payment.userId}</TableCell>
                <TableCell>{currencyFormat(payment.amount)}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      payment.status === "completed"
                        ? "bg-green-600"
                        : payment.status === "pending"
                        ? "bg-yellow-600"
                        : "bg-red-600"
                    }>
                    {payment.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {payment.createdAt
                    ? format(payment.createdAt, "dd/MM/yyyy HH:mm")
                    : "-"}
                </TableCell>
                <TableCell>
                  {payment.completedAt
                    ? format(payment.completedAt, "dd/MM/yyyy HH:mm")
                    : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Totals */}
        <div className="p-4 border-t flex justify-end text-lg font-semibold">
          Total Amount: {currencyFormat(totalAmount)}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center items-center gap-4 p-4">
          <Button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}>
            Prev
          </Button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <Button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
