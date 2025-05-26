// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { db } from "@/lib/firebase";
// import {
//   collection,
//   query,
//   where,
//   getDocs,
//   addDoc,
//   serverTimestamp,
//   doc,
//   getDoc,
// } from "firebase/firestore";
// import { useAuth } from "@/components/auth-provider";

// export default function RefundsPage({ params }) {
//   const { id } = params;
//   const { user } = useAuth();
//   const router = useRouter();
//   const [payments, setPayments] = useState([]);
//   const [refunds, setRefunds] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedPayment, setSelectedPayment] = useState(null);
//   const [refundAmount, setRefundAmount] = useState("");
//   const [reason, setReason] = useState("");
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   useEffect(() => {
//     // if (!user) {
//     //   router.push("/login");
//     //   return;
//     // }
//     fetchData();
//   }, [user, id]);

//   const fetchData = async () => {
//     try {
//       // Fetch completed payments for this event
//       const paymentsQuery = query(
//         collection(db, "payments"),
//         where("eventId", "==", id),
//         where("status", "==", "completed")
//       );
//       const paymentsSnapshot = await getDocs(paymentsQuery);
//       const paymentsData = paymentsSnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//         createdAt: doc.data().createdAt?.toDate(),
//       }));
//       setPayments(paymentsData);

//       // Fetch refund requests for this event
//       const refundsQuery = query(
//         collection(db, "refunds"),
//         where("eventId", "==", id)
//       );
//       const refundsSnapshot = await getDocs(refundsQuery);
//       const refundsData = refundsSnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//         createdAt: doc.data().createdAt?.toDate(),
//       }));
//       setRefunds(refundsData);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       setError("Failed to load data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRefundRequest = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");

//     if (!selectedPayment) {
//       setError("Please select a payment to refund");
//       return;
//     }

//     const amount = Number(refundAmount);
//     if (isNaN(amount) || amount <= 0 || amount > selectedPayment.amount) {
//       setError("Please enter a valid refund amount");
//       return;
//     }

//     try {
//       // Create refund request
//       await addDoc(collection(db, "refunds"), {
//         eventId: id,
//         paymentId: selectedPayment.id,
//         userId: selectedPayment.userId,
//         amount: amount,
//         reason: reason,
//         status: "pending",
//         createdAt: serverTimestamp(),
//         requestedBy: user.uid,
//         organizerId: user.uid,
//         reference: selectedPayment.reference,
//       });

//       setSuccess("Refund request submitted successfully");
//       setSelectedPayment(null);
//       setRefundAmount("");
//       setReason("");
//       fetchData(); // Refresh data
//     } catch (error) {
//       console.error("Error submitting refund request:", error);
//       setError("Failed to submit refund request");
//     }
//   };

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <Card>
//         <CardHeader>
//           <CardTitle>Manage Refunds</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {error && (
//             <Alert variant="destructive" className="mb-4">
//               <AlertDescription>{error}</AlertDescription>
//             </Alert>
//           )}
//           {success && (
//             <Alert className="mb-4">
//               <AlertDescription>{success}</AlertDescription>
//             </Alert>
//           )}

//           <div className="space-y-6">
//             {/* New Refund Request Form */}
//             <div className="bg-gray-50 p-4 rounded-lg">
//               <h3 className="text-lg font-semibold mb-4">New Refund Request</h3>
//               <form onSubmit={handleRefundRequest} className="space-y-4">
//                 <div>
//                   <Label>Select Payment</Label>
//                   <select
//                     className="w-full p-2 border rounded-md"
//                     value={selectedPayment?.id || ""}
//                     onChange={(e) => {
//                       const payment = payments.find(
//                         (p) => p.id === e.target.value
//                       );
//                       setSelectedPayment(payment);
//                       setRefundAmount(payment ? payment.amount.toString() : "");
//                     }}>
//                     <option value="">Select a payment</option>
//                     {payments.map((payment) => (
//                       <option key={payment.id} value={payment.id}>
//                         Payment {payment.id.substring(0, 8)} - KSh{" "}
//                         {payment.amount.toLocaleString()} -{" "}
//                         {payment.customer?.email}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div>
//                   <Label>Refund Amount (KSh)</Label>
//                   <Input
//                     type="number"
//                     value={refundAmount}
//                     onChange={(e) => setRefundAmount(e.target.value)}
//                     max={selectedPayment?.amount}
//                     required
//                   />
//                 </div>

//                 <div>
//                   <Label>Reason for Refund</Label>
//                   <Input
//                     value={reason}
//                     onChange={(e) => setReason(e.target.value)}
//                     required
//                   />
//                 </div>

//                 <Button
//                   type="submit"
//                   className="w-full bg-green-600 hover:bg-green-700">
//                   Submit Refund Request
//                 </Button>
//               </form>
//             </div>

//             {/* Refund History */}
//             <div>
//               <h3 className="text-lg font-semibold mb-4">Refund History</h3>
//               {refunds.length === 0 ? (
//                 <p className="text-gray-500 text-center py-4">
//                   No refund requests found
//                 </p>
//               ) : (
//                 <div className="space-y-4">
//                   {refunds.map((refund) => (
//                     <div
//                       key={refund.id}
//                       className="border rounded-lg p-4 bg-white">
//                       <div className="flex justify-between items-start">
//                         <div>
//                           <p className="font-medium">
//                             Refund Request #{refund.id.substring(0, 8)}
//                           </p>
//                           <p className="text-sm text-gray-500">
//                             Amount: KSh {refund.amount.toLocaleString()}
//                           </p>
//                           <p className="text-sm text-gray-500">
//                             Reason: {refund.reason}
//                           </p>
//                           <p className="text-sm text-gray-500">
//                             Requested: {refund.createdAt.toLocaleDateString()}
//                           </p>
//                         </div>
//                         <Badge
//                           className={
//                             refund.status === "completed"
//                               ? "bg-green-600"
//                               : refund.status === "pending"
//                               ? "bg-yellow-600"
//                               : "bg-red-600"
//                           }>
//                           {refund.status}
//                         </Badge>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { useAuth } from "@/components/auth-provider";

export default function RefundsPage({ params }) {
  const { id } = params;
  const { user } = useAuth();
  const router = useRouter();
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchRefunds();
  }, [id]);

  const fetchRefunds = async () => {
    try {
      const refundsQuery = query(
        collection(db, "refunds"),
        where("eventId", "==", id)
      );
      const snapshot = await getDocs(refundsQuery);
      const refundsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));
      setRefunds(refundsData);
    } catch (error) {
      console.error("Error fetching refunds:", error);
      setError("Failed to load refunds");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRefund = async (refund) => {
    try {
      // Create Paystack refund request
      const response = await fetch("/api/paystack/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transaction: refund.reference,
          amount: refund.amount * 100, // Convert to kobo
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process refund");
      }

      // Update refund status
      await updateDoc(doc(db, "refunds", refund.id), {
        status: "processing",
        processedAt: serverTimestamp(),
      });

      // Update local state
      setRefunds((prevRefunds) =>
        prevRefunds.map((r) =>
          r.id === refund.id ? { ...r, status: "processing" } : r
        )
      );

      setSuccess("Refund approved and processing");
    } catch (error) {
      console.error("Error approving refund:", error);
      setError("Failed to approve refund");
    }
  };

  if (loading) {
    return <div>Loading refunds...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Manage Refunds</CardTitle>
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
            {refunds.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No refund requests found
              </div>
            ) : (
              refunds.map((refund) => (
                <div key={refund.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        Refund Request #{refund.id.substring(0, 8)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Amount: KSh {refund.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Original Amount: KSh{" "}
                        {refund?.originalAmount?.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Requested: {refund.createdAt?.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        className={
                          refund.status === "completed"
                            ? "bg-green-600"
                            : refund.status === "processing"
                            ? "bg-yellow-600"
                            : refund.status === "failed"
                            ? "bg-red-600"
                            : "bg-gray-600"
                        }>
                        {refund.status}
                      </Badge>
                      {refund.status === "pending" && (
                        <Button
                          onClick={() => handleApproveRefund(refund)}
                          className="bg-green-600 hover:bg-green-700">
                          Approve Refund
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
