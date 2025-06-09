"use client";

import { FirebaseUser } from "@/app/dashboard/page";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  increment,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  Users,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { PaystackButton } from "react-paystack";
import PayButton from "./paystack/paybutton";

export type user = {
  uid: string;
  email: string;
  displayName?: string;
};

interface BookingFormProps {
  event: any;
  onClose: () => void;
  onSuccess: (bookingId: string) => void;
  open: boolean;
}

export default function BookingFormModal({
  event,
  onClose,
  onSuccess,
  open,
}: BookingFormProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<"details" | "payment" | "processing">(
    "details"
  );
  const [formData, setFormData] = useState({
    numberOfPeople: 1,
    specialRequirements: "",
    paymentOption: event.depositAmount > 0 ? "deposit" : "full",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentData, setPaymentData] = useState(null);
  const [bookingId, setBookingId] = useState("");
  const [isPaystackOpen, setIsPaystackOpen] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value ? Number.parseInt(value) : 1,
    }));
  };

  const calculateAmount = () => {
    const baseAmount = event.price * formData.numberOfPeople;
    if (formData.paymentOption === "deposit" && event.depositAmount > 0) {
      return event.depositAmount * formData.numberOfPeople;
    }
    return baseAmount;
  };

  const totalAmount = event.price * formData.numberOfPeople;
  const paymentAmount = calculateAmount();
  const remainingAmount = totalAmount - paymentAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("this is the step", step);
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.numberOfPeople > event.availableSpaces) {
      setError(`Only ${event.availableSpaces} spaces available`);
      setLoading(false);
      return;
    }

    try {
      const bookingData = {
        eventId: event.id,
        eventTitle: event.title,
        userId: user.uid,
        userName: user.displayName || user.email,
        userEmail: user.email,
        numberOfPeople: formData.numberOfPeople,
        specialRequirements: formData.specialRequirements,
        totalAmount: totalAmount,
        amountPaid: 0,
        amountDue: totalAmount,
        paymentStatus: "pending",
        bookingDate: serverTimestamp(),
        status: event.paymentManagement === "manual" ? "confirmed" : "pending",
        paymentManagement: event.paymentManagement,
        platformFee: event.platformFee || 3,
      };

      const bookingRef = await addDoc(collection(db, "bookings"), bookingData);
      setBookingId(bookingRef.id);

      if (event.paymentManagement === "platform") {
        const response = await fetch("/api/create-book-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: paymentAmount,
            eventId: event.id,
            userId: user.uid,
            bookingId: bookingRef.id,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          setPaymentData(data);
          setStep("payment");
        } else {
          throw new Error("Failed to create payment intent");
        }
      } else {
        // Manual payment - confirm booking immediately
        await updateDoc(doc(db, "events", event.id), {
          availableSpaces: increment(-formData.numberOfPeople),
        });
        onSuccess(bookingRef.id);
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      setError("Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (reference: any) => {
    setStep("processing");

    setIsPaystackOpen(false);
    try {
      await updateDoc(doc(db, "events", event.id), {
        availableSpaces: increment(-formData.numberOfPeople),
      });
      onSuccess(bookingId);
    } catch (error) {
      console.error("Error updating after payment:", error);
      setError(
        "Payment successful but failed to update booking. Please contact support."
      );
    }
  };

  const handlePaymentClose = () => {
    setStep("details");
    setPaymentData(null);
    setIsPaystackOpen(false);
  };

  // Handle Paystack popup open
  const handlePaystackOpen = () => {
    console.log("am opening paystack module");
    setIsPaystackOpen(false);
  };

  // Handle Paystack popup close
  const handlePaystackPopupClose = () => {
    onClose();
    // Optionally go back to payment step or stay on current step
  };

  const resetForm = () => {
    setStep("details");
    setFormData({
      numberOfPeople: 1,
      specialRequirements: "",
      paymentOption: event.depositAmount > 0 ? "deposit" : "full",
    });
    setError("");
    setPaymentData(null);
    setBookingId("");
    setIsPaystackOpen(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Close this modal when Paystack opens
  const shouldShowModal = open && !isPaystackOpen;

  return (
    <Dialog open={shouldShowModal} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto md:mx-4 max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg sm:text-xl font-semibold">
              {step === "details" && "Book Your Adventure"}
              {step === "payment" && "Complete Payment"}
              {step === "processing" && "Processing..."}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Event Summary Card - Always Visible */}
        {/* <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2">
                {event.title}
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="line-clamp-1">{event.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{event.duration}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg sm:text-xl font-bold text-green-600">
                KSh {event.price.toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">per person</p>
            </div>
          </div>
        </div> */}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Booking Details */}
        {step === "details" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Number of People */}
            <div className="space-y-3">
              <Label htmlFor="numberOfPeople" className="text-sm font-medium">
                Number of People
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  id="numberOfPeople"
                  name="numberOfPeople"
                  type="number"
                  min="1"
                  max={event.availableSpaces}
                  value={formData.numberOfPeople}
                  onChange={handleNumberChange}
                  className="w-20 text-center"
                />
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{event.availableSpaces} spots available</span>
                </div>
              </div>
            </div>

            {/* Payment Option - Only show if deposit is available */}
            {event.depositAmount > 0 &&
              event.paymentManagement === "platform" && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Payment Option</Label>
                  <RadioGroup
                    value={formData.paymentOption}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        paymentOption: value,
                      }))
                    }
                    className="flex-col md:flex-row md:justify-between p-2">
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="full" id="full" />
                      <div className="flex-1">
                        <Label
                          htmlFor="full"
                          className="font-medium cursor-pointer">
                          Pay Full Amount
                        </Label>
                        <p className="text-sm text-gray-600">
                          KSh {totalAmount.toLocaleString()} - Complete payment
                          now
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="deposit" id="deposit" />
                      <div className="flex-1">
                        <Label
                          htmlFor="deposit"
                          className="font-medium cursor-pointer">
                          Pay Deposit
                        </Label>
                        <p className="text-sm text-gray-600">
                          KSh {paymentAmount.toLocaleString()} now, KSh{" "}
                          {remainingAmount.toLocaleString()} later
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              )}

            {/* Special Requirements */}
            <div className="space-y-2">
              <Label
                htmlFor="specialRequirements"
                className="text-sm font-medium">
                Special Requirements (Optional)
              </Label>
              <Textarea
                id="specialRequirements"
                name="specialRequirements"
                value={formData.specialRequirements}
                onChange={handleChange}
                placeholder="Any dietary restrictions, medical conditions, or special requests..."
                className="resize-none"
                rows={2}
              />
            </div>

            <Separator />

            {/* Booking Summary */}
            <div className="space-y-3 bg-gray-50 rounded-lg p-3">
              <h4 className="font-semibold text-gray-900">Booking Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Price per person:</span>
                  <span>KSh {event.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Number of people:</span>
                  <span>{formData.numberOfPeople}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total amount:</span>
                  <span>KSh {totalAmount.toLocaleString()}</span>
                </div>
                {formData.paymentOption === "deposit" &&
                  event.depositAmount > 0 && (
                    <>
                      <Separator />
                      <div className="flex justify-between text-green-600">
                        <span>Amount to pay now:</span>
                        <span>KSh {paymentAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Remaining balance:</span>
                        <span>KSh {remainingAmount.toLocaleString()}</span>
                      </div>
                    </>
                  )}

                {/* Manual payment info */}
                {event.paymentManagement === "manual" && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-blue-700">
                        <p className="font-medium">Manual Payment</p>
                        <p>
                          You'll receive payment instructions after booking
                          confirmation.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 py-3 text-base font-medium"
              disabled={
                loading || formData.numberOfPeople > event.availableSpaces
              }>
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : event.paymentManagement === "platform" ? (
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Continue to Payment</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Confirm Booking</span>
                </div>
              )}
            </Button>
          </form>
        )}

        {/* Step 2: Payment */}
        {step === "payment" && paymentData && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Complete Your Payment
              </h3>
              <p className="text-gray-600 text-sm">
                You're about to pay KSh {paymentAmount.toLocaleString()} for
                your booking
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Event:</span>
                <span className="font-medium">{event.title}</span>
              </div>
              <div className="flex justify-between">
                <span>People:</span>
                <span className="font-medium">{formData.numberOfPeople}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment:</span>
                <span className="font-medium">
                  {formData.paymentOption === "deposit"
                    ? "Deposit"
                    : "Full Amount"}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-green-600">
                <span>Amount to Pay:</span>
                <span>KSh {paymentAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3">
              <PayButton
                amount={paymentData.amount}
                reference={paymentData.reference}
                email={user.email}
                metadata={{
                  bookingId: bookingId,
                  eventId: event.id,
                  userId: user.uid,
                }}
                onClose={handlePaystackPopupClose}
                onSuccess={handlePaymentSuccess}
                onStart={handlePaystackPopupClose}
              />

              {/* <PaystackButton
                publicKey={process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY}
                email={user.email}
                amount={paymentData.amount}
                reference={paymentData.reference}
                currency="KES"
                metadata={{
                  bookingId: bookingId,
                  eventId: event.id,
                  userId: user.uid,
                }}
                onClick={() => {
                  "i have been clicked";
                }}
                text="Pay with Paystack"
                onSuccess={handlePaymentSuccess}
                onClose={handlePaystackPopupClose}
                onStart={handlePaystackOpen}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              /> */}

              <Button
                variant="outline"
                onClick={handlePaymentClose}
                className="w-full">
                Back to Details
              </Button>
            </div>

            {/* Hidden Paystack button that will open in a popup/iframe */}
            {isPaystackOpen && (
              <div className="fixed inset-0 z-50 bg-black/50" />
            )}
          </div>
        )}

        {/* Step 3: Processing */}
        {step === "processing" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Processing Your Booking
            </h3>
            <p className="text-gray-600">
              Please wait while we confirm your payment and finalize your
              booking...
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
