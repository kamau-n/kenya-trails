"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/firebase";
import { Elements } from "@stripe/react-stripe-js";

import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import PaymentForm from "@/components/pay-form";
import { getStripe } from "@/lib/stripe";

export default function PromoteEventPage({ params }) {
  const { id } = params;
  const [promotions, setPromotions] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      // Fetch event details
      const eventDoc = await getDoc(doc(db, "events", id));
      if (eventDoc.exists()) {
        setEvent({ id: eventDoc.id, ...eventDoc.data() });
      }

      // Fetch promotion packages
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
    try {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: promotion.price,
          eventId: id,
          promotionId: promotion.id,
          userId: event.organizerId,
        }),
      });

      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error("Error creating payment intent:", error);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      // Payment success is handled by the webhook
      router.push("/organize/events");
    } catch (error) {
      console.error("Error handling payment success:", error);
    }
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
                      ${promotion.price}
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
          {selectedPromotion && clientSecret && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
              <Card>
                <CardContent className="pt-6">
                  <Elements
                    stripe={getStripe()}
                    options={{
                      clientSecret,
                      appearance: {
                        theme: "stripe",
                      },
                    }}>
                    <PaymentForm
                      amount={selectedPromotion.price}
                      onSuccess={handlePaymentSuccess}
                    />
                  </Elements>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
