"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { PaystackButton } from "react-paystack";
import { FirebaseUser } from "@/app/dashboard/page";
import { useAuth } from "@/components/auth-provider";

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
    setPaymentData(null); // reset on new selection

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
      } else {
        alert("Failed to create payment intent.");
        console.error(data.error);
      }
    } catch (error) {
      console.error("Payment intent error:", error);
    }
  };

  const handlePaymentSuccess = async (reference) => {
    console.log("Payment successful:", reference);

    // Optional: call an endpoint or update status manually in Firebase
    // e.g., /api/verify-payment?reference=reference.reference

    router.push("/payment/success");
  };

  const handlePaymentClose = () => {
    console.log("Payment popup closed");
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Promote Your Event</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Select a Promotion Package
          </h2>
          <div className="grid gap-4">
            {promotions.map((promotion) => (
              <Card
                key={promotion.id}
                className={`cursor-pointer transition-all ${
                  selectedPromotion?.id === promotion.id
                    ? "border-green-600 shadow-lg"
                    : "hover:border-gray-400"
                }`}
                onClick={() => handlePromotionSelect(promotion)}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{promotion.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {promotion.duration} days
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-lg">
                      KES {promotion.price}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{promotion.description}</p>
                  <div className="space-y-2">
                    {promotion.features.split("\n").map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <span className="text-green-600 mr-2">✓</span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          {selectedPromotion && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <p className="text-gray-700">
                    You are about to pay{" "}
                    <span className="font-semibold">
                      KES {selectedPromotion.price}
                    </span>{" "}
                    for the <strong>{selectedPromotion.name}</strong> package.
                  </p>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="mt-1 w-full p-2 border border-gray-300 rounded"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      className="mt-1 w-full p-2 border border-gray-300 rounded"
                    />
                  </div>

                  {email && phone && paymentData && (
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
                      className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
