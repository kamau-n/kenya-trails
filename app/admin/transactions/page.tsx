// app/dashboard/payments/page.tsx
"use client";

import { useEffect, useState } from "react";
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
import { Search, Download, ArrowDown, ArrowUp } from "lucide-react";
import { format } from "date-fns";

type BalanceLedger = {
  balance: number;
  createdAt: string;
  currency: string;
  difference: number;
  domain: string;
  id: number;
  integration: number;
  model_responsible: string;
  model_row: number;
  reason: string;
  updatedAt: string;
};

type BalanceLedgerResponse = {
  status: boolean;
  message: string;
  data: BalanceLedger[];
};

export default function PaymentsPage() {
  const [balances, setBalances] = useState<BalanceLedger[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<"balance" | "createdAt">(
    "createdAt"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchBalances() {
      try {
        const res = await fetch("/api/paystack/transactions");
        const data: BalanceLedgerResponse = await res.json();

        if (data.status) {
          setBalances(data.data);
        }
      } catch (e) {
        console.error("Failed to fetch balances:", e);
      }
    }

    fetchBalances();
  }, []);

  const toggleSort = (field: "balance" | "createdAt") => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const filteredBalances = balances.filter((b) =>
    b.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedBalances = filteredBalances.sort((a, b) => {
    const aField =
      sortField === "createdAt"
        ? new Date(a.createdAt).getTime()
        : a[sortField];
    const bField =
      sortField === "createdAt"
        ? new Date(b.createdAt).getTime()
        : b[sortField];
    return sortOrder === "asc" ? aField - bField : bField - aField;
  });

  const paginatedBalances = sortedBalances.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedBalances.length / itemsPerPage);

  const formatCurrency = (amount: number) =>
    "KSh " + amount.toLocaleString("en-KE");

  const downloadCSV = () => {
    const headers = [
      "ID",
      "Balance",
      "Currency",
      "Difference",
      "Reason",
      "Created At",
    ];
    const csvRows = balances.map((b) => [
      b.id,
      b.balance,
      b.currency,
      b.difference,
      `"${b.reason}"`,
      format(new Date(b.createdAt), "dd/MM/yyyy"),
    ]);

    const csvContent = [headers, ...csvRows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `balance-ledger-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="md:px-12 mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Balance Ledger</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={downloadCSV}
            variant="outline"
            className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead
                onClick={() => toggleSort("balance")}
                className="cursor-pointer">
                Balance{" "}
                {sortField === "balance" &&
                  (sortOrder === "asc" ? (
                    <ArrowUp size={14} />
                  ) : (
                    <ArrowDown size={14} />
                  ))}
              </TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Difference</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead
                onClick={() => toggleSort("createdAt")}
                className="cursor-pointer">
                Created At{" "}
                {sortField === "createdAt" &&
                  (sortOrder === "asc" ? (
                    <ArrowUp size={14} />
                  ) : (
                    <ArrowDown size={14} />
                  ))}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedBalances.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-mono">{entry.id}</TableCell>
                <TableCell>{formatCurrency(entry.balance)}</TableCell>
                <TableCell>{entry.currency}</TableCell>
                <TableCell>{formatCurrency(entry.difference)}</TableCell>
                <TableCell>{entry.reason}</TableCell>
                <TableCell>
                  {format(new Date(entry.createdAt), "dd/MM/yyyy")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end mt-4 gap-4">
        <Button
          variant="outline"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}>
          Prev
        </Button>
        <span className="self-center">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}>
          Next
        </Button>
      </div>
    </div>
  );
}
