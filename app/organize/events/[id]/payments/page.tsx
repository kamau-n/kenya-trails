"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Download,
  CreditCard,
  DollarSign,
  CalendarDays,
  Users,
  ArrowLeft,
  Clock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  BanknoteIcon,
  ChevronLeft,
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
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import jsPDF from "jspdf";
import { booking, events } from "@/app/dashboard/page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/components/auth-provider";

type accountDetails = {
  accountName: string;
  accountNumber: string;
  bankName: string;
};

export default function EventPaymentsPage({ params }) {
  const auth = useAuth();
  const user = auth?.user;
  const { id } = params;
  const [event, setEvent] = useState<events | null>(null);
  const [bookings, setBookings] = useState<booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [collectionBalance, setCollectionBalance] = useState(0);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [withdrawals, setWithdrawals] = useState([]);
  const [accountDetails, setAccountDetails] = useState<accountDetails>();
  const router = useRouter();

  const totalCollections = bookings.reduce(
    (sum, b) => sum + (b.amountPaid || 0),
    0
  );
  const totalDue = bookings.reduce((sum, b) => sum + (b.amountDue || 0), 0);
  const paidBookings = bookings.filter(
    (b) => b.paymentStatus === "paid"
  ).length;
  const partialBookings = bookings.filter(
    (b) => b.paymentStatus === "partial"
  ).length;
  const pendingBookings = bookings.filter(
    (b) => b.paymentStatus === "pending"
  ).length;

  useEffect(() => {
    fetchEventData();
  }, [id]);

  const fetchEventData = async () => {
    try {
      // Fetch event details
      const eventDoc = await getDoc(doc(db, "events", id));
      if (eventDoc.exists()) {
        const eventData = {
          id: eventDoc.id,
          ...eventDoc.data(),
        };
        setEvent(eventData);
        setCollectionBalance(eventData.collectionBalance || 0);

        // fetch withdrawals related to the event

        const withdrawalsQuery = query(
          collection(db, "withdrawals"),
          where("eventReference", "==", id)
        );
        const withdrawalsSnapshot = await getDocs(withdrawalsQuery);
        const withdrawalsData = withdrawalsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        }));
        setWithdrawals(withdrawalsData);

        // Fetch bookings for this event
        const bookingsQuery = query(
          collection(db, "bookings"),
          where("eventId", "==", id)
        );
        const bookingsSnapshot = await getDocs(bookingsQuery);
        const bookingsData = bookingsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          bookingDate: doc.data().bookingDate?.toDate(),
        }));
        setBookings(bookingsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load payment data");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalRequest = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const withdrawAmount = Number(withdrawalAmount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (withdrawAmount > collectionBalance) {
      setError("Withdrawal amount cannot exceed available balance");
      return;
    }

    try {
      // Calculate platform fee (3%)
      const platformFee = Math.max(withdrawAmount * 0.005, 10);
      const netAmount = withdrawAmount - platformFee;

      // Create withdrawal request
      await addDoc(collection(db, "withdrawals"), {
        organizerId: event?.organizerId,
        organizerName: user.displayName || user.email,
        transferReference: "",
        eventReference: id,
        transferRecipientCode: "",
        amount: withdrawAmount,
        platformFee,
        netAmount,
        status: "pending",
        createdAt: serverTimestamp(),
        accountDetails: event?.accountDetails,
      });

      setSuccess("Withdrawal request submitted successfully");
      setSuccess("Withdrawal request submitted successfully");
      setWithdrawalAmount("");
      setWithdrawalDialogOpen(false);
      fetchEventData(); // Refresh data
    } catch (error) {
      console.error("Error submitting withdrawal:", error);
      setError("Failed to submit withdrawal request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadReceipt = (booking: booking) => {
    const doc = new jsPDF();

    // Add company logo/header
    doc.setFillColor(22, 101, 52); // Dark green header
    doc.rect(0, 0, 210, 30, "F");

    // Add company info
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Kenya Trails", 20, 20);

    // Reset color for rest of content
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Payment Receipt", 20, 45);

    // Add line
    doc.setDrawColor(22, 101, 52);
    doc.setLineWidth(0.5);
    doc.line(20, 50, 190, 50);

    // Event info
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Event: ${event.title}`, 20, 65);

    // Add booking details
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Booking ID: ${booking.id}`, 20, 80);
    doc.text(`Customer: ${booking.userName}`, 20, 90);
    doc.text(`Email: ${booking.userEmail}`, 20, 100);
    doc.text(
      `Booking Date: ${booking.bookingDate.toLocaleDateString()}`,
      20,
      110
    );

    // Payment details in a box
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.2);
    doc.rect(20, 120, 170, 50);

    doc.setFillColor(240, 240, 240);
    doc.rect(20, 120, 170, 12, "F");

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("PAYMENT DETAILS", 25, 128);

    doc.setFont("helvetica", "normal");
    doc.text(`Total Amount:`, 25, 140);
    doc.text(`Amount Paid:`, 25, 150);
    doc.text(`Balance Due:`, 25, 160);

    // Align values to the right
    doc.text(`KSh ${booking.totalAmount.toLocaleString()}`, 160, 140, {
      align: "right",
    });
    doc.text(`KSh ${booking.amountPaid.toLocaleString()}`, 160, 150, {
      align: "right",
    });
    doc.text(`KSh ${booking.amountDue.toLocaleString()}`, 160, 160, {
      align: "right",
    });

    // Payment status
    doc.setFont("helvetica", "bold");
    const paymentStatus = booking.paymentStatus.toUpperCase();
    const textWidth = doc.getTextWidth(paymentStatus);

    if (booking.paymentStatus === "paid") {
      doc.setFillColor(34, 197, 94); // Green
    } else if (booking.paymentStatus === "partial") {
      doc.setFillColor(234, 179, 8); // Yellow
    } else {
      doc.setFillColor(239, 68, 68); // Red
    }

    doc.roundedRect(160 - textWidth - 6, 165, textWidth + 12, 10, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.text(paymentStatus, 160, 172, { align: "right" });

    // Add footer
    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(22, 101, 52);
    doc.setLineWidth(0.5);
    doc.line(20, 250, 190, 250);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Thank you for choosing Kenya Trails", 105, 260, {
      align: "center",
    });
    doc.text(
      "For any inquiries, please contact support@kenyatrails.com",
      105,
      268,
      { align: "center" }
    );

    // Add QR code placeholder (would be implemented with a QR library in production)
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.2);
    doc.rect(155, 195, 30, 30);
    doc.setFontSize(8);
    doc.text("QR Code", 170, 210, { align: "center" });

    // Save the PDF
    doc.save(`Kenya_Trails_Receipt_${booking.id}.pdf`);
  };

  const filteredBookings = () => {
    if (filterStatus === "all") return bookings;
    return bookings.filter((booking) => booking.paymentStatus === filterStatus);
  };

  if (loading) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
        <p className="text-lg font-medium text-gray-600">
          Loading payment information...
        </p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Event Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The event you're looking for doesn't exist or you don't have access to
          it.
        </p>
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 w-6/8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              {event.title}
            </h1>
            <p className="text-gray-500 flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {new Date(event.date?.seconds * 1000).toLocaleDateString()}
              <span className="mx-2">•</span>
              <Users className="h-4 w-4" />
              {bookings.length} {bookings.length === 1 ? "Booking" : "Bookings"}
            </p>
          </div>

          {success && (
            <Alert className="mb-0 bg-green-50 border-green-200 text-green-800">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </div>

        <Separator className="my-6" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-gray-700">
              <CreditCard className="h-5 w-5 text-purple-500" />
              Total Collections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">
              KSh {totalCollections.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              From {bookings.length} bookings
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-gray-700">
              <DollarSign className="h-5 w-5 text-green-500" />
              Available Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">
              KSh {collectionBalance.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Available for withdrawal
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-gray-700">
              <Clock className="h-5 w-5 text-yellow-500" />
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">
              KSh {totalDue.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Across {partialBookings + pendingBookings} bookings
            </p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-gray-700">
              <BanknoteIcon className="h-5 w-5 text-green-600" />
              Request Withdrawal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setWithdrawalDialogOpen(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={collectionBalance <= 0}>
              Withdraw Funds
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Funds will be processed within 24-48 hours
            </p>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Payment History */}
      <Card className="mb-8 bg-white shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl">Payment History</CardTitle>
              <CardDescription>
                Track all bookings and payments for this event
              </CardDescription>
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Bookings</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partial">Partially Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="stats">Payment Stats</TabsTrigger>
              <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            </TabsList>

            <TabsContent value="list">
              {filteredBookings().length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    No bookings match the selected filter
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredBookings().map((booking) => (
                    <Card
                      key={booking.id}
                      className="overflow-hidden border-gray-200">
                      <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {booking.userName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {booking.userEmail}
                          </p>
                        </div>
                        <Badge
                          className={`
                            ${
                              booking.paymentStatus === "paid"
                                ? "bg-green-600 hover:bg-green-700"
                                : booking.paymentStatus === "partial"
                                ? "bg-yellow-600 hover:bg-yellow-700"
                                : "bg-red-600 hover:bg-red-700"
                            }
                            text-white px-3 py-1 text-sm
                          `}>
                          {booking.paymentStatus === "paid"
                            ? "Paid"
                            : booking.paymentStatus === "partial"
                            ? "Partially Paid"
                            : "Payment Pending"}
                        </Badge>
                      </div>

                      <div className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">
                              Booking Date
                            </p>
                            <p className="font-medium">
                              {booking.bookingDate.toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">
                              Total Amount
                            </p>
                            <p className="font-medium">
                              KSh {booking.totalAmount.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">
                              Amount Paid
                            </p>
                            <p className="font-medium text-green-600">
                              KSh {booking.amountPaid.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">
                              Balance Due
                            </p>
                            <p className="font-medium text-red-600">
                              KSh {booking.amountDue.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadReceipt(booking)}
                            className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
                            <Download className="h-4 w-4" />
                            Download Receipt
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="stats">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-gray-500 text-sm mb-1">Paid Bookings</p>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold text-green-600">
                        {paidBookings}
                      </p>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                        {bookings.length > 0
                          ? Math.round((paidBookings / bookings.length) * 100)
                          : 0}
                        %
                      </Badge>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-gray-500 text-sm mb-1">Partially Paid</p>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold text-yellow-600">
                        {partialBookings}
                      </p>
                      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                        {bookings.length > 0
                          ? Math.round(
                              (partialBookings / bookings.length) * 100
                            )
                          : 0}
                        %
                      </Badge>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-gray-500 text-sm mb-1">
                      Pending Payments
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold text-red-600">
                        {pendingBookings}
                      </p>
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                        {bookings.length > 0
                          ? Math.round(
                              (pendingBookings / bookings.length) * 100
                            )
                          : 0}
                        %
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-gray-700 font-medium mb-3">
                    Payment Collection Rate
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-green-600 h-4 rounded-full"
                      style={{
                        width: `${
                          totalCollections > 0
                            ? Math.min(
                                100,
                                Math.round(
                                  (totalCollections /
                                    (totalCollections + totalDue)) *
                                    100
                                )
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <p className="text-gray-600">
                      Collected: KSh {totalCollections.toLocaleString()}(
                      {totalCollections + totalDue > 0
                        ? Math.round(
                            (totalCollections / (totalCollections + totalDue)) *
                              100
                          )
                        : 0}
                      %)
                    </p>
                    <p className="text-gray-600">
                      Outstanding: KSh {totalDue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="withdrawals">
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Withdrawal Dialog */}
      <Dialog
        open={withdrawalDialogOpen}
        onOpenChange={setWithdrawalDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Withdrawal</DialogTitle>
            <DialogDescription>
              Enter the amount you would like to withdraw from your event
              balance.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-4">
              <div className="mb-4">
                <Label htmlFor="withdrawal-amount" className="text-gray-700">
                  Available Balance: KSh {collectionBalance.toLocaleString()}
                </Label>
                <div className="mt-2 relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    KSh
                  </span>
                  <Input
                    id="withdrawal-amount"
                    type="number"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    className="pl-12"
                    placeholder="0.00"
                    max={collectionBalance}
                  />
                </div>

                {Number(withdrawalAmount) > collectionBalance && (
                  <p className="text-red-500 text-sm mt-1">
                    Amount exceeds available balance
                  </p>
                )}
              </div>

              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-600">
                  Funds will be sent to your registered account and processed
                  within 24-48 hours. A confirmation email will be sent once the
                  transfer is initiated.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setWithdrawalDialogOpen(false)}
              disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleWithdrawalRequest}
              disabled={
                !withdrawalAmount ||
                Number(withdrawalAmount) <= 0 ||
                Number(withdrawalAmount) > collectionBalance ||
                isSubmitting
              }
              className="bg-green-600 hover:bg-green-700 text-white">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Request Withdrawal"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
