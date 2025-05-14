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
import { Search, Download } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

    const csvData = payments.map((payment) => [
      payment.id,
      payment.eventId,
      payment.userId,
      payment.amount,
      payment.status,
      payment.createdAt?.toLocaleString(),
      payment.completedAt?.toLocaleString(),
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

  const filteredPayments = payments.filter(
    (payment) =>
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.eventId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Payments</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={downloadPayments}
            variant="outline"
            className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Payments
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment ID</TableHead>
              <TableHead>Event ID</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Completed At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-mono">{payment.id}</TableCell>
                <TableCell>{payment.eventId}</TableCell>
                <TableCell>{payment.userId}</TableCell>
                <TableCell>${payment.amount}</TableCell>
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
                <TableCell>{payment.createdAt?.toLocaleString()}</TableCell>
                <TableCell>
                  {payment.completedAt?.toLocaleString() || "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
