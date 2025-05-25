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
  Filter
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([
    {
      id: "pay_1234567890",
      eventId: "evt_abc123",
      userId: "usr_def456",
      reference: "REF-2025-001",
      channel: "M-Pesa",
      currency: "KES",
      amount: 2500,
      status: "completed",
      createdAt: new Date("2025-05-24T14:30:00"),
      completedAt: new Date("2025-05-24T14:32:15")
    },
    {
      id: "pay_1234567891",
      eventId: "evt_abc124",
      userId: "usr_def457",
      reference: "REF-2025-002",
      channel: "Bank Transfer",
      currency: "KES",
      amount: 5000,
      status: "pending",
      createdAt: new Date("2025-05-24T13:15:00"),
      completedAt: null
    },
    {
      id: "pay_1234567892",
      eventId: "evt_abc125",
      userId: "usr_def458",
      reference: "REF-2025-003",
      channel: "Card",
      currency: "KES",
      amount: 1200,
      status: "failed",
      createdAt: new Date("2025-05-24T12:00:00"),
      completedAt: null
    },
    {
      id: "pay_1234567893",
      eventId: "evt_abc126",
      userId: "usr_def459",
      reference: "REF-2025-004",
      channel: "M-Pesa",
      currency: "KES",
      amount: 3500,
      status: "completed",
      createdAt: new Date("2025-05-23T16:45:00"),
      completedAt: new Date("2025-05-23T16:47:30")
    },
    {
      id: "pay_1234567894",
      eventId: "evt_abc127",
      userId: "usr_def460",
      reference: "REF-2025-005",
      channel: "Bank Transfer",
      currency: "KES",
      amount: 7500,
      status: "completed",
      createdAt: new Date("2025-05-23T10:20:00"),
      completedAt: new Date("2025-05-23T10:25:10")
    }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const currencyFormat = (num) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
    }).format(num);

  // Filtering logic
  const filtered = payments
    .filter(
      (payment) =>
        payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.eventId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.reference?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((payment) =>
      statusFilter === "all" ? true : payment.status === statusFilter
    );

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
  const completedPayments = payments.filter(p => p.status === "completed").length;
  const pendingPayments = payments.filter(p => p.status === "pending").length;
  const failedPayments = payments.filter(p => p.status === "failed").length;
  const totalAmount = payments.reduce((acc, p) => acc + (p.status === "completed" ? p.amount : 0), 0);

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
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "completed":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
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
            <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
            <p className="text-gray-600 mt-1">Track and manage all payment transactions</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button 
              onClick={downloadPayments}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
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
                  <p className="text-sm font-medium text-gray-500">Total Payments</p>
                  <p className="text-2xl font-bold text-blue-600">{totalPayments}</p>
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
                  <p className="text-2xl font-bold text-yellow-600">{pendingPayments}</p>
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
                  <p className="text-2xl font-bold text-green-600">{completedPayments}</p>
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
                  <p className="text-2xl font-bold text-red-600">{failedPayments}</p>
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
                  <p className="text-sm font-medium text-gray-500">Total Amount</p>
                  <p className="text-2xl font-bold text-green-600">{currencyFormat(totalAmount)}</p>
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
                <span className="text-sm font-medium text-gray-700">Filters</span>
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
                    className="text-gray-500 hover:text-gray-700"
                  >
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
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="font-semibold text-gray-900">Payment ID</TableHead>
                    <TableHead className="font-semibold text-gray-900">User & Event</TableHead>
                    <TableHead className="font-semibold text-gray-900">Reference</TableHead>
                    <TableHead className="font-semibold text-gray-900">Channel</TableHead>
                    <TableHead 
                      onClick={() => toggleSort("amount")}
                      className="cursor-pointer select-none font-semibold text-gray-900 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-1">
                        Amount
                        {sortField === "amount" && (
                          sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">Status</TableHead>
                    <TableHead 
                      onClick={() => toggleSort("createdAt")}
                      className="cursor-pointer select-none font-semibold text-gray-900 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-1">
                        Request Date
                        {sortField === "createdAt" && (
                          sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-gray-50 border-b border-gray-100">
                      <TableCell>
                        <div className="font-mono text-sm text-gray-900">
                          {payment.id.substring(0, 12)}...
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900">
                            User: {payment.userId.substring(0, 8)}...
                          </div>
                          <div className="text-xs text-gray-500">
                            Event: {payment.eventId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm text-gray-900">{payment.reference}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {payment.channel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-gray-900">
                          {currencyFormat(payment.amount)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={getStatusBadge(payment.status)}>
                          {getStatusIcon(payment.status)}
                          <span className="capitalize">{payment.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {payment.createdAt.toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center p-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sorted.length)} of {sorted.length} payments
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  >
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

// "use client";

// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { db } from "@/lib/firebase";
// import {
//   collection,
//   getDocs,
//   addDoc,
//   doc,
//   deleteDoc,
//   updateDoc,
// } from "firebase/firestore";

// export default function PromotionsPage() {
//   const [promotions, setPromotions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [editingPromotion, setEditingPromotion] = useState(null);
//   const [formData, setFormData] = useState({
//     name: "",
//     description: "",
//     price: "",
//     duration: "",
//     features: "",
//   });

//   useEffect(() => {
//     fetchPromotions();
//   }, []);

//   const fetchPromotions = async () => {
//     try {
//       const promotionsSnapshot = await getDocs(collection(db, "promotions"));
//       const promotionsData = promotionsSnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setPromotions(promotionsData);
//     } catch (error) {
//       console.error("Error fetching promotions:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       if (editingPromotion) {
//         await updateDoc(doc(db, "promotions", editingPromotion.id), formData);
//       } else {
//         await addDoc(collection(db, "promotions"), formData);
//       }
//       fetchPromotions();
//       resetForm();
//     } catch (error) {
//       console.error("Error saving promotion:", error);
//     }
//   };

//   const handleEdit = (promotion) => {
//     setEditingPromotion(promotion);
//     setFormData({
//       name: promotion.name,
//       description: promotion.description,
//       price: promotion.price,
//       duration: promotion.duration,
//       features: promotion.features,
//     });
//   };

//   const handleDelete = async (id) => {
//     if (confirm("Are you sure you want to delete this promotion package?")) {
//       try {
//         await deleteDoc(doc(db, "promotions", id));
//         fetchPromotions();
//       } catch (error) {
//         console.error("Error deleting promotion:", error);
//       }
//     }
//   };

//   const resetForm = () => {
//     setEditingPromotion(null);
//     setFormData({
//       name: "",
//       description: "",
//       price: "",
//       duration: "",
//       features: "",
//     });
//   };

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-8">Manage Promotion Packages</h1>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//         <div>
//           <h2 className="text-xl font-semibold mb-4">
//             {editingPromotion
//               ? "Edit Promotion Package"
//               : "Add New Promotion Package"}
//           </h2>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Package Name
//               </label>
//               <Input
//                 value={formData.name}
//                 onChange={(e) =>
//                   setFormData({ ...formData, name: e.target.value })
//                 }
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Description
//               </label>
//               <Textarea
//                 value={formData.description}
//                 onChange={(e) =>
//                   setFormData({ ...formData, description: e.target.value })
//                 }
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Price (KSh)
//               </label>
//               <Input
//                 type="number"
//                 value={formData.price}
//                 onChange={(e) =>
//                   setFormData({ ...formData, price: e.target.value })
//                 }
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Duration (days)
//               </label>
//               <Input
//                 type="number"
//                 value={formData.duration}
//                 onChange={(e) =>
//                   setFormData({ ...formData, duration: e.target.value })
//                 }
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1">Features</label>
//               <Textarea
//                 value={formData.features}
//                 onChange={(e) =>
//                   setFormData({ ...formData, features: e.target.value })
//                 }
//                 placeholder="Enter features (one per line)"
//                 required
//               />
//             </div>

//             <div className="flex gap-4">
//               <Button type="submit" className="bg-green-600 hover:bg-green-700">
//                 {editingPromotion ? "Update Package" : "Add Package"}
//               </Button>
//               {editingPromotion && (
//                 <Button type="button" variant="outline" onClick={resetForm}>
//                   Cancel
//                 </Button>
//               )}
//             </div>
//           </form>
//         </div>

//         <div>
//           <h2 className="text-xl font-semibold mb-4">Existing Packages</h2>
//           {loading ? (
//             <p>Loading packages...</p>
//           ) : (
//             <div className="border rounded-lg">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Name</TableHead>
//                     <TableHead>Price</TableHead>
//                     <TableHead>Duration</TableHead>
//                     <TableHead>Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {promotions.map((promotion) => (
//                     <TableRow key={promotion.id}>
//                       <TableCell>{promotion.name}</TableCell>
//                       <TableCell>KSh {promotion.price}</TableCell>
//                       <TableCell>{promotion.duration} days</TableCell>
//                       <TableCell>
//                         <div className="flex gap-2">
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() => handleEdit(promotion)}>
//                             Edit
//                           </Button>
//                           <Button
//                             variant="destructive"
//                             size="sm"
//                             onClick={() => handleDelete(promotion.id)}>
//                             Delete
//                           </Button>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
