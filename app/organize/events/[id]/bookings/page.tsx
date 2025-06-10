"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Users,
  CreditCard,
  Search,
  CheckCircle,
  AlertCircle,
  Download,
  MoreHorizontal,
  Edit3,
  FileText,
  ArrowLeft,
  Eye,
  Filter,
  TrendingUp,
  Clock,
  DollarSign,
} from "lucide-react";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";

import { event } from "@/app/types/types";
import { booking, events } from "@/app/dashboard/page";

const generateCSV = (
  bookings: booking[],
  eventName: string,
  format: "summary" | "detailed" = "detailed"
) => {
  let header: string[];
  let rows: (string | number)[][];

  if (format === "summary") {
    header = [
      "Customer Name",
      "Email",
      "People",
      "Total Amount",
      "Payment Status",
    ];

    rows = bookings.map((b) => [
      b.userName,
      b.userEmail,
      b.numberOfPeople,
      b.totalAmount,
      b.paymentStatus,
    ]);
  } else {
    header = [
      "Booking ID",
      "Customer Name",
      "Email",
      "Phone",
      "Booking Date",
      "Number of People",
      "Total Amount",
      "Amount Paid",
      "Amount Due",
      "Payment Status",
      "Notes",
    ];

    rows = bookings.map((b) => [
      b.id,
      b.userName,
      b.userEmail,
      b.userPhone || "N/A",
      new Date(b.bookingDate).toLocaleDateString("en-KE"),
      b.numberOfPeople,
      b.totalAmount,
      b.amountPaid,
      b.amountDue,
      b.paymentStatus,
      b.notes || "",
    ]);
  }

  const csvContent = [header, ...rows]
    .map((row) =>
      row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `${eventName}_bookings_${format}_${
      new Date().toISOString().split("T")[0]
    }.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default function EventBookingsPage({ params }) {
  const { id } = params;
  const { user, loading: authLoading } = useAuth();
  const [event, setEvent] = useState<events>();
  const [bookings, setBookings] = useState<booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<booking | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login?redirect=/organize/events");
      return;
    }

    const fetchEventData = async () => {
      try {
        const eventDoc = await getDoc(doc(db, "events", id));

        if (eventDoc.exists()) {
          const eventData: Partial<event> = {
            id: eventDoc.id,
            ...eventDoc.data(),
            date: eventDoc.data().date?.toDate() || new Date(),
          };

          if (eventData.organizerId !== user.uid) {
            router.push("/organize/events");
            return;
          }

          setEvent(eventData);

          const bookingsQuery = query(
            collection(db, "bookings"),
            where("eventId", "==", id)
          );

          const bookingsSnapshot = await getDocs(bookingsQuery);
          const bookingsData = bookingsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            bookingDate: doc.data().bookingDate?.toDate() || new Date(),
          }));

          setBookings(bookingsData);
        } else {
          router.push("/organize/events");
        }
      } catch (error) {
        console.error("Error fetching event data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [id, user, authLoading, router]);

  const displayEvent = event;
  const displayBookings = bookings;

  // Filter bookings based on search term and status
  const filteredBookings = displayBookings.filter((booking) => {
    const matchesSearch =
      booking.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || booking.paymentStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return `KSh ${amount.toLocaleString()}`;
  };

  const handleSelectBooking = (booking: booking) => {
    setSelectedBooking(booking);
    setPaymentAmount("");
    setUpdateSuccess(false);
    setUpdateError("");
    setPaymentDialogOpen(true);
  };

  const handleUpdatePayment = async () => {
    if (!selectedBooking) return;

    const amount = Number(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setUpdateError("Please enter a valid payment amount");
      return;
    }

    if (amount > selectedBooking.amountDue) {
      setUpdateError(
        `Maximum amount due is ${formatCurrency(selectedBooking.amountDue)}`
      );
      return;
    }

    try {
      const newAmountPaid = selectedBooking.amountPaid + amount;
      const newAmountDue = selectedBooking.totalAmount - newAmountPaid;
      const newPaymentStatus = newAmountDue <= 0 ? "paid" : "partial";

      await updateDoc(doc(db, "bookings", selectedBooking.id), {
        amountPaid: newAmountPaid,
        amountDue: newAmountDue,
        paymentStatus: newPaymentStatus,
      });

      setBookings(
        bookings.map((booking) =>
          booking.id === selectedBooking.id
            ? {
                ...booking,
                amountPaid: newAmountPaid,
                amountDue: newAmountDue,
                paymentStatus: newPaymentStatus,
              }
            : booking
        )
      );

      setSelectedBooking({
        ...selectedBooking,
        amountPaid: newAmountPaid,
        amountDue: newAmountDue,
        paymentStatus: newPaymentStatus,
      });

      setUpdateSuccess(true);
      setPaymentAmount("");

      // Close dialog after 2 seconds
      setTimeout(() => {
        setPaymentDialogOpen(false);
        setUpdateSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error updating payment:", error);
      setUpdateError("Failed to update payment. Please try again.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "partial":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-red-100 text-red-800 border-red-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-3 w-3" />;
      case "partial":
        return <Clock className="h-3 w-3" />;
      default:
        return <AlertCircle className="h-3 w-3" />;
    }
  };

  // Statistics calculations
  const totalBookings = displayBookings.length;
  const totalPeople = displayBookings.reduce(
    (sum, booking) => sum + booking.numberOfPeople,
    0
  );
  const totalRevenue = displayBookings.reduce(
    (sum, booking) => sum + booking.amountPaid,
    0
  );
  const pendingPayments = displayBookings.reduce(
    (sum, booking) => sum + booking.amountDue,
    0
  );
  const paidBookings = displayBookings.filter(
    (b) => b.paymentStatus === "paid"
  ).length;
  const partialBookings = displayBookings.filter(
    (b) => b.paymentStatus === "partial"
  ).length;
  const unpaidBookings = displayBookings.filter(
    (b) => b.paymentStatus === "unpaid"
  ).length;

  if (authLoading || loading) {
    return (
      <div className="md:px-12 mx-auto px-4 py-16 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="md:px-12 mx-auto md:px-4  px-2 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="p-1 h-8 w-8">
              <Link href="/organize/events">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold truncate">
              {displayEvent?.title}
            </h1>
          </div>
          <p className="text-gray-600 text-sm">
            Manage bookings • {formatDate(displayEvent?.date)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  generateCSV(
                    filteredBookings,
                    event?.title || "Event",
                    "summary"
                  )
                }>
                <FileText className="h-4 w-4 mr-2" />
                Summary CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  generateCSV(
                    filteredBookings,
                    event?.title || "Event",
                    "detailed"
                  )
                }>
                <FileText className="h-4 w-4 mr-2" />
                Detailed CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Bookings
                </p>
                <p className="md:text-2xl text-xl font-bold">{totalBookings}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total People
                </p>
                <p className="md:text-2xl text-xl font-bold">{totalPeople}</p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="md:text-2xl text-xl font-bold text-green-600">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="md:text-2xl text-xl font-bold text-yellow-600">
                  {formatCurrency(pendingPayments)}
                </p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg">
              Bookings ({filteredBookings.length})
            </CardTitle>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Payment Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                    All ({totalBookings})
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("paid")}>
                    Paid ({paidBookings})
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("partial")}>
                    Partial ({partialBookings})
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("unpaid")}>
                    Unpaid ({unpaidBookings})
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No bookings found</p>
              <p className="text-gray-400 text-sm">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filters"
                  : "Bookings will appear here once customers start booking"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-4 border rounded-lg hover:shadow-sm transition-shadow bg-white">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    {/* Customer Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 truncate">
                            {booking.userName}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">
                            {booking.userEmail}
                          </p>
                        </div>
                        <Badge
                          className={`ml-2 text-xs ${getStatusColor(
                            booking.paymentStatus
                          )} flex items-center gap-1`}>
                          {getStatusIcon(booking.paymentStatus)}
                          {booking.paymentStatus === "paid"
                            ? "Paid"
                            : booking.paymentStatus === "partial"
                            ? "Partial"
                            : "Unpaid"}
                        </Badge>
                      </div>

                      {/* Booking Details */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">Date</p>
                          <p className="font-medium">
                            {formatDate(booking.bookingDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">People</p>
                          <p className="font-medium">
                            {booking.numberOfPeople}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Total</p>
                          <p className="font-medium">
                            {formatCurrency(booking.totalAmount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Due</p>
                          <p className="font-medium text-red-600">
                            {formatCurrency(booking.amountDue)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {booking.amountDue > 0 && (
                        <Button
                          size="sm"
                          onClick={() => handleSelectBooking(booking)}
                          className="bg-green-600 hover:bg-green-700">
                          <Edit3 className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">
                            Update Payment
                          </span>
                          <span className="sm:hidden">Pay</span>
                        </Button>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleSelectBooking(booking)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {booking.amountDue > 0 && (
                            <DropdownMenuItem
                              onClick={() => handleSelectBooking(booking)}>
                              <Edit3 className="h-4 w-4 mr-2" />
                              Update Payment
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Update Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Payment</DialogTitle>
            <DialogDescription>
              Record a payment for this booking
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              {/* Booking Summary */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-medium">
                    {selectedBooking.userName}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Booking ID:</span>
                  <span className="font-mono text-xs">
                    {selectedBooking.id}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-medium">
                    {formatCurrency(selectedBooking.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(selectedBooking.amountPaid)}
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2">
                  <span className="text-gray-600">Amount Due:</span>
                  <span className="font-medium text-red-600">
                    {formatCurrency(selectedBooking.amountDue)}
                  </span>
                </div>
              </div>

              {selectedBooking.amountDue > 0 ? (
                <>
                  <div>
                    <label
                      htmlFor="paymentAmount"
                      className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Amount (KSh)
                    </label>
                    <Input
                      id="paymentAmount"
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="Enter amount"
                      min="1"
                      max={selectedBooking.amountDue}
                      className="text-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum: {formatCurrency(selectedBooking.amountDue)}
                    </p>
                  </div>

                  {updateError && (
                    <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                      <AlertCircle className="h-4 w-4" />
                      {updateError}
                    </div>
                  )}

                  {updateSuccess && (
                    <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg">
                      <CheckCircle className="h-4 w-4" />
                      Payment updated successfully!
                    </div>
                  )}

                  <Button
                    onClick={handleUpdatePayment}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={!paymentAmount || Number(paymentAmount) <= 0}>
                    Record Payment of{" "}
                    {paymentAmount
                      ? formatCurrency(Number(paymentAmount))
                      : "KSh 0"}
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-4 rounded-lg justify-center">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">
                    This booking is fully paid
                  </span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
