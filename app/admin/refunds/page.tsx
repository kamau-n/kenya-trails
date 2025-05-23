"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { useAuth } from "@/components/auth-provider";
export type refund = {
  id: string;
  paymentId: string;
  paymentDetails: any;
  reason: string;
  amount: number;
  createdAt: Date;
  status: string;
  processedBy: string;
};

export default function AdminRefundsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [refunds, setRefunds] = useState<refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    console.log("am loading the admin refunds page");
    // if (!user || user.role !== "admin") {
    //   router.push("/");
    //   return;
    // }
    fetchRefunds();
  }, [user]);

  const fetchRefunds = async () => {
    console.log("fetching");
    try {
      const refundsQuery = query(collection(db, "refunds"));
      const refundsSnapshot = await getDocs(refundsQuery);

      const refundsData = await Promise.all(
        refundsSnapshot.docs.map(async (docSnap) => {
          const refund = {
            id: docSnap.id,
            ...docSnap.data(),
            createdAt: docSnap.data().createdAt?.toDate(),
          };

          if (refund.paymentId) {
            try {
              const paymentDoc = await getDoc(
                doc(db, "payments", refund.paymentId)
              );
              if (paymentDoc.exists()) {
                refund.paymentDetails = paymentDoc.data();
              }
            } catch (err) {
              console.error(
                "Error fetching payment details for",
                refund.id,
                err
              );
            }
          }

          return refund;
        })
      );

      setRefunds(refundsData);
    } catch (error) {
      console.error("Error fetching refunds:", error);
      setError("Failed to load refund requests");
    } finally {
      setLoading(false);
    }
  };

  // const fetchRefunds = async () => {
  //   console.log("fetching")
  //   try {
  //     const refundsQuery = query(collection(db, "refunds"));
  //     const refundsSnapshot = await getDocs(refundsQuery);
  //     const refundsData = await Promise.all(
  //       refundsSnapshot.docs.map(async (doc) => {
  //         const refund = {
  //           id: doc.id,
  //           ...doc.data(),
  //           createdAt: doc.data().createdAt?.toDate(),
  //         };

  //         // Fetch associated payment details
  //         refunds.map(async (refund) => {
  //           const paymentDoc = await getDoc(doc(db, "payments", refund.paymentId));
  //           if (paymentDoc.exists()) {
  //             refund.paymentDetails = paymentDoc.data();
  //           }

  //         return refund;
  //       })
  //     );
  //     setRefunds(refundsData);
  //   } catch (error) {
  //     console.error("Error fetching refunds:", error);
  //     setError("Failed to load refund requests");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleApproveRefund = async (refund: any) => {
    try {
      // Initiate refund through Paystack
      const response = await fetch("/api/paystack/refund", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction: refund.reference,
          amount: refund.amount,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to process refund");
      }

      // Update refund status in database
      await updateDoc(doc(db, "refunds", refund.id), {
        status: "processing",
        processedAt: new Date(),
        processedBy: user.uid,
      });

      setSuccess("Refund approved and processing");
      fetchRefunds(); // Refresh data
    } catch (error) {
      console.error("Error processing refund:", error);
      setError(error.message);
    }
  };

  const handleRejectRefund = async (refundId: string) => {
    try {
      await updateDoc(doc(db, "refunds", refundId), {
        status: "rejected",
        rejectedAt: new Date(),
        rejectedBy: user.uid,
      });

      setSuccess("Refund request rejected");
      fetchRefunds(); // Refresh data
    } catch (error) {
      console.error("Error rejecting refund:", error);
      setError("Failed to reject refund request");
    }
  };

  const filteredRefunds = refunds.filter(
    (refund) =>
      refund.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // if (loading) {
  //   return <div>Loading...</div>;
  // }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Refund Requests</CardTitle>
            <Input
              placeholder="Search refunds..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-4">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {filteredRefunds.map((refund) => (
              <div key={refund.id} className="border rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">
                      Refund Request #{refund.id.substring(0, 8)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Amount: KSh {refund.amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Original Payment: KSh{" "}
                      {refund.paymentDetails?.amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Reason: {refund.reason}
                    </p>
                    <p className="text-sm text-gray-500">
                      Requested: {refund.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      className={
                        refund.status === "completed"
                          ? "bg-green-600"
                          : refund.status === "pending"
                          ? "bg-yellow-600"
                          : refund.status === "processing"
                          ? "bg-blue-600"
                          : "bg-red-600"
                      }>
                      {refund.status}
                    </Badge>
                    {refund.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApproveRefund(refund)}
                          className="bg-green-600 hover:bg-green-700">
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleRejectRefund(refund.id)}>
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredRefunds.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                No refund requests found
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
