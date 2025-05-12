"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function PromoteEventPage({ params }) {
  const { id } = params;
  const [promotions, setPromotions] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
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

  const handlePromote = async () => {
    if (!selectedPromotion || !paymentMethod) return;

    try {
      // Create promotion record
      const promotionData = {
        eventId: id,
        promotionId: selectedPromotion.id,
        organizerId: event.organizerId,
        startDate: serverTimestamp(),
        endDate: new Date(
          Date.now() + selectedPromotion.duration * 24 * 60 * 60 * 1000
        ),
        status: "active",
        paymentMethod,
        amount: selectedPromotion.price,
      };

      await addDoc(collection(db, "event_promotions"), promotionData);

      // Update event with promotion status
      await updateDoc(doc(db, "events", id), {
        isPromoted: true,
        promotionEndDate: promotionData.endDate,
      });

      router.push("/organize/events");
    } catch (error) {
      console.error("Error promoting event:", error);
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
                onClick={() => setSelectedPromotion(promotion)}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{promotion.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {promotion.duration} days
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-lg">
                      KSh {promotion.price}
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
          <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
          <div className="grid gap-4">
            <Card
              className={`cursor-pointer transition-all ${
                paymentMethod === "mpesa"
                  ? "border-green-600 shadow-lg"
                  : "hover:border-gray-400"
              }`}
              onClick={() => setPaymentMethod("mpesa")}>
              <CardContent className="flex items-center gap-4 p-4">
                <img src="/mpesa-logo.png" alt="M-Pesa" className="h-8" />
                <div>
                  <h3 className="font-medium">Pay with M-Pesa</h3>
                  <p className="text-sm text-gray-600">
                    Pay directly using your M-Pesa mobile money
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all ${
                paymentMethod === "card"
                  ? "border-green-600 shadow-lg"
                  : "hover:border-gray-400"
              }`}
              onClick={() => setPaymentMethod("card")}>
              <CardContent className="flex items-center gap-4 p-4">
                <img src="/card-logo.png" alt="Card Payment" className="h-8" />
                <div>
                  <h3 className="font-medium">Pay with Card</h3>
                  <p className="text-sm text-gray-600">
                    Pay using your credit or debit card
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8">
              <Button
                onClick={handlePromote}
                disabled={!selectedPromotion || !paymentMethod}
                className="w-full bg-green-600 hover:bg-green-700">
                Promote Event for KSh{" "}
                {selectedPromotion ? selectedPromotion.price : "0"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
