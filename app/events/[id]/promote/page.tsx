"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { PaystackButton } from "react-paystack";
import { FirebaseUser } from "@/app/dashboard/page";
import { useAuth } from "@/components/auth-provider";
import { CheckCircle, Star, Zap, TrendingUp, Users, Calendar, X } from "lucide-react";

const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

export default function PromoteEventPage({ params }) {
  const auth = useAuth();
  const user: FirebaseUser = auth?.user;
  const { id } = params;
  const [promotions, setPromotions] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const eventDoc = await getDoc(doc(db, "events", id));
      if (eventDoc.exists()) {
        setEvent({ id: eventDoc.id, ...eventDoc.data() });
      }

      const promotionsSnapshot = await getDocs(collection(db, "promotions"));
      const promotionsData = promotionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPromotions(promotionsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromotionSelect = async (promotion) => {
    setSelectedPromotion(promotion);
    setPaymentData(null);
    setProcessingPayment(true);

    try {
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: promotion.price,
          eventId: id,
          promotionId: promotion.id,
          userId: event?.organizerId || "anonymous",
          user: user,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setPaymentData(data);
        setShowPaymentModal(true);
      } else {
        alert("Failed to create payment intent.");
        console.error(data.error);
      }
    } catch (error) {
      console.error("Payment intent error:", error);
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePaymentSuccess = async (reference) => {
    console.log("Payment successful:", reference);
    setShowPaymentModal(false);
    router.push("/payment/success");
  };

  const handlePaymentClose = () => {
    console.log("Payment popup closed");
  };

  const getPromotionIcon = (promotionName) => {
    const name = promotionName.toLowerCase();
    if (name.includes('basic') || name.includes('starter')) return <Calendar className="w-6 h-6" />;
    if (name.includes('premium') || name.includes('pro')) return <Star className="w-6 h-6" />;
    if (name.includes('ultimate') || name.includes('enterprise')) return <Zap className="w-6 h-6" />;
    return <TrendingUp className="w-6 h-6" />;
  };

  const getPromotionColor = (index) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600', 
      'from-green-500 to-green-600',
      'from-orange-500 to-orange-600'
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading promotion packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Boost Your Event's Reach
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-6">
              Choose the perfect promotion package to get your event in front of thousands of potential attendees
            </p>
            {event && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 inline-block">
                <p className="text-sm opacity-80">Promoting:</p>
                <p className="font-semibold text-lg">{event.title}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Choose Your Promotion Package
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Select the package that best fits your event's needs and budget. All packages include our core promotion features.
            </p>
          </div>

          {/* Promotion Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {promotions.map((promotion, index) => (
              <Card
                key={promotion.id}
                className={`relative cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  selectedPromotion?.id === promotion.id
                    ? "ring-2 ring-blue-500 shadow-xl"
                    : "hover:shadow-lg"
                } ${processingPayment && selectedPromotion?.id === promotion.id ? "opacity-75" : ""}`}
                onClick={() => !processingPayment && handlePromotionSelect(promotion)}
              >
                {/* Popular Badge */}
                {index === 1 && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-orange-400 to-pink-400 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  {/* Icon */}
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${getPromotionColor(index)} flex items-center justify-center text-white`}>
                    {getPromotionIcon(promotion.name)}
                  </div>
                  
                  <CardTitle className="text-xl md:text-2xl mb-2">{promotion.name}</CardTitle>
                  
                  {/* Price */}
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-gray-900">KES {promotion.price}</span>
                  </div>
                  
                  {/* Duration */}
                  <div className="flex items-center justify-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span className="text-sm">{promotion.duration} days promotion</span>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-gray-600 text-center mb-6 min-h-[3rem]">
                    {promotion.description}
                  </p>
                  
                  {/* Features */}
                  <div className="space-y-3">
                    {promotion.features.split("\n").map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Select Button */}
                  <Button
                    className={`w-full mt-6 ${
                      selectedPromotion?.id === promotion.id
                        ? "bg-green-600 hover:bg-green-700"
                        : `bg-gradient-to-r ${getPromotionColor(index)} hover:opacity-90`
                    } text-white`}
                    disabled={processingPayment}
                  >
                    {processingPayment && selectedPromotion?.id === promotion.id ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : selectedPromotion?.id === promotion.id ? (
                      "Selected"
                    ) : (
                      "Select Package"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Reach Thousands</h3>
                <p className="text-gray-600 text-sm">Get your event in front of our active community of event-goers</p>
              </div>
              <div>
                <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Boost Attendance</h3>
                <p className="text-gray-600 text-sm">Increase your event attendance by up to 300% with our promotion</p>
              </div>
              <div>
                <Star className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Premium Placement</h3>
                <p className="text-gray-600 text-sm">Get featured in prime spots across our platform and newsletters</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getPromotionColor(promotions.findIndex(p => p.id === selectedPromotion?.id))} flex items-center justify-center text-white mr-3`}>
                {selectedPromotion && getPromotionIcon(selectedPromotion.name)}
              </div>
              Complete Your Purchase
            </DialogTitle>
            <DialogDescription>
              You're about to purchase the <strong>{selectedPromotion?.name}</strong> package for <strong>KES {selectedPromotion?.price}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="modal-email">Email Address *</Label>
              <Input
                id="modal-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modal-phone">Phone Number *</Label>
              <Input
                id="modal-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full"
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mt-6">
              <h4 className="font-semibold text-gray-900 mb-2">Package Summary</h4>
              <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
                <span>{selectedPromotion?.name}</span>
                <span>KES {selectedPromotion?.price}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Duration</span>
                <span>{selectedPromotion?.duration} days</span>
              </div>
              <div className="border-t border-gray-200 mt-2 pt-2">
                <div className="flex justify-between items-center font-semibold">
                  <span>Total</span>
                  <span>KES {selectedPromotion?.price}</span>
                </div>
              </div>
            </div>

            {email && phone && paymentData ? (
              <PaystackButton
                publicKey={paystackPublicKey}
                email={email}
                phone={phone}
                amount={paymentData.amount}
                reference={paymentData.reference}
                currency="KES"
                metadata={{
                  eventId: id,
                  promotionId: selectedPromotion.id,
                  organizerId: event?.organizerId,
                }}
                text="Pay with Paystack"
                onSuccess={handlePaymentSuccess}
                onClose={handlePaymentClose}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              />
            ) : (
              <Button disabled className="w-full" variant="secondary">
                {!email || !phone ? "Please fill in all required fields" : "Preparing payment..."}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
