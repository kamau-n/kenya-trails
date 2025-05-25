"use client";

import { useAuth } from "@/components/auth-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/lib/firebase";
import { format } from "date-fns";
import {
	collection,
	doc,
	getDoc,
	getDocs,
	orderBy,
	query,
	updateDoc,
} from "firebase/firestore";
import {
	AlertCircle,
	Calendar,
	CheckCircle,
	Clock,
	DollarSign,
	Download,
	Eye,
	FileText,
	Loader2,
	RefreshCw,
	Search,
	User,
	XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export type refund = {
	id: string;
	paymentId: string;
	paymentDetails: any;
	reason: string;
	amount: number;
	createdAt: Date;
	status: string;
	processedBy?: string;
	processedAt?: Date;
	rejectedBy?: string;
	rejectedAt?: Date;
	userEmail?: string;
	userName?: string;
	eventTitle?: string;
	reference?: string;
};

export default function AdminRefundsPage() {
	const { user } = useAuth();
	const router = useRouter();
	const [refunds, setRefunds] = useState<refund[]>([]);
	const [loading, setLoading] = useState(true);
	const [processing, setProcessing] = useState<string | null>(null);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [selectedRefund, setSelectedRefund] = useState<refund | null>(null);
	const [showDetailsModal, setShowDetailsModal] = useState(false);
	const [showRejectModal, setShowRejectModal] = useState(false);
	const [rejectionReason, setRejectionReason] = useState("");

	// Statistics
	const [stats, setStats] = useState({
		total: 0,
		initiated: 0,
		processing: 0,
		completed: 0,
		rejected: 0,
		totalAmount: 0,
	});

	useEffect(() => {
		if (!user || user.role !== "admin") {
			router.push("/");
			return;
		}
		fetchRefunds();
	}, [user, router]);

	const fetchRefunds = async () => {
		setLoading(true);
		try {
			const refundsQuery = query(
				collection(db, "refunds"),
				orderBy("createdAt", "desc")
			);
			const refundsSnapshot = await getDocs(refundsQuery);

			const refundsData = await Promise.all(
				refundsSnapshot.docs.map(async (docSnap) => {
					const refundData = {
						id: docSnap.id,
						...docSnap.data(),
						createdAt: docSnap.data().createdAt?.toDate(),
						processedAt: docSnap.data().processedAt?.toDate(),
						rejectedAt: docSnap.data().rejectedAt?.toDate(),
					};

					// Fetch payment details if paymentId exists
					if (refundData.paymentId) {
						try {
							const paymentDoc = await getDoc(
								doc(db, "payments", refundData.paymentId)
							);
							if (paymentDoc.exists()) {
								const paymentData = paymentDoc.data();
								refundData.paymentDetails = paymentData;
								refundData.userEmail = paymentData.userEmail;
								refundData.reference = paymentData.reference;

								// Fetch event title if eventId exists
								if (paymentData.eventId) {
									const eventDoc = await getDoc(
										doc(db, "events", paymentData.eventId)
									);
									if (eventDoc.exists()) {
										refundData.eventTitle =
											eventDoc.data().title;
									}
								}
							}
						} catch (err) {
							console.warn(
								"Error fetching payment details:",
								err
							);
						}
					}

					return refundData;
				})
			);

			setRefunds(refundsData);
			calculateStats(refundsData);
		} catch (error) {
			console.error("Error fetching refunds:", error);
			setError("Failed to load refund requests");
		} finally {
			setLoading(false);
		}
	};

	const calculateStats = (refundsData: refund[]) => {
		const stats = {
			total: refundsData.length,
			initiated: refundsData.filter((r) => r.status === "initiated").length,
			processing: refundsData.filter((r) => r.status === "processing")
				.length,
			completed: refundsData.filter((r) => r.status === "completed")
				.length,
			rejected: refundsData.filter((r) => r.status === "rejected").length,
			totalAmount: refundsData.reduce(
				(sum, r) => sum + (r.amount || 0),
				0
			),
		};
		setStats(stats);
	};

	const handleApproveRefund = async (refund: refund) => {
		if (!refund.paymentDetails?.reference) {
			setError("Payment reference not found. Cannot process refund.");
			return;
		}

		setProcessing(refund.id);
		try {
			const response = await fetch("/api/paystack/refund", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					transaction: refund.paymentDetails.reference,
					amount: refund.amount,
				}),
			});

			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.error || "Failed to process refund");
			}

			await updateDoc(doc(db, "refunds", refund.id), {
				status: "processing",
				processedAt: new Date(),
				processedBy: user.uid,
			});

			setSuccess("Refund approved and processing with payment provider");
			fetchRefunds();
		} catch (error) {
			console.error("Error processing refund:", error);
			setError(error.message || "Failed to approve refund");
		} finally {
			setProcessing(null);
		}
	};

	const handleRejectRefund = async () => {
		if (!selectedRefund || !rejectionReason.trim()) {
			setError("Please provide a reason for rejection");
			return;
		}

		setProcessing(selectedRefund.id);
		try {
			await updateDoc(doc(db, "refunds", selectedRefund.id), {
				status: "rejected",
				rejectedAt: new Date(),
				rejectedBy: user.uid,
				rejectionReason: rejectionReason,
			});

			setSuccess("Refund request rejected");
			setShowRejectModal(false);
			setRejectionReason("");
			setSelectedRefund(null);
			fetchRefunds();
		} catch (error) {
			console.error("Error rejecting refund:", error);
			setError("Failed to reject refund request");
		} finally {
			setProcessing(null);
		}
	};

	const exportRefunds = () => {
		const csvData = filteredRefunds.map((refund) => [
			refund.id,
			refund.eventTitle || "N/A",
			refund.userEmail || "N/A",
			refund.amount,
			refund.status,
			refund.reason,
			format(refund.createdAt, "yyyy-MM-dd HH:mm:ss"),
			refund.processedAt
				? format(refund.processedAt, "yyyy-MM-dd HH:mm:ss")
				: "N/A",
		]);

		const headers = [
			"ID",
			"Event",
			"User Email",
			"Amount",
			"Status",
			"Reason",
			"Created",
			"Processed",
		];
		const csvContent = [headers, ...csvData]
			.map((row) => row.map((cell) => `"${cell}"`).join(","))
			.join("\n");

		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `refunds-${format(new Date(), "yyyy-MM-dd")}.csv`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	const filteredRefunds = refunds.filter((refund) => {
		const matchesSearch =
			refund.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
			refund.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
			refund.eventTitle
				?.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			refund.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesStatus =
			statusFilter === "all" || refund.status === statusFilter;

		return matchesSearch && matchesStatus;
	});

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "completed":
				return <CheckCircle className="h-4 w-4 text-green-600" />;
			case "initiated":
				return (
					<RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
				);
			case "processing":
				return <Clock className="h-4 w-4 text-yellow-600" />;	
			case "rejected":
				return <XCircle className="h-4 w-4 text-red-600" />;
			default:
				return <Clock className="h-4 w-4 text-yellow-600" />;
		}
	};

	const getStatusBadge = (status: string) => {
		const baseClasses = "font-semibold";
		switch (status) {
			case "completed":
				return `${baseClasses} bg-green-100 text-green-800 hover:bg-green-200`;
			case "processing":
				return `${baseClasses} bg-blue-100 text-blue-800 hover:bg-blue-200`;
			case "rejected":
				return `${baseClasses} bg-red-100 text-red-800 hover:bg-red-200`;
			default:
				return `${baseClasses} bg-yellow-100 text-yellow-800 hover:bg-yellow-200`;
		}
	};

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
				<div className="text-center">
					<Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
					<p className="text-lg font-medium">
						Loading refund requests...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8 max-w-7xl">
			{/* Header */}
			<div className="mb-8">
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">
							Refund Management
						</h1>
						<p className="text-gray-600 mt-1">
							Process and manage customer refund requests
						</p>
					</div>
					<div className="flex gap-3">
						<Button
							onClick={fetchRefunds}
							variant="outline"
							className="flex items-center gap-2"
						>
							<RefreshCw className="h-4 w-4" />
							Refresh
						</Button>
						<Button
							onClick={exportRefunds}
							variant="outline"
							className="flex items-center gap-2"
						>
							<Download className="h-4 w-4" />
							Export CSV
						</Button>
					</div>
				</div>
			</div>

			{/* Alerts */}
			{error && (
				<Alert variant="destructive" className="mb-6">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}
			{success && (
				<Alert className="mb-6 border-green-200 bg-green-50">
					<CheckCircle className="h-4 w-4 text-green-600" />
					<AlertTitle className="text-green-800">Success</AlertTitle>
					<AlertDescription className="text-green-700">
						{success}
					</AlertDescription>
				</Alert>
			)}

			{/* Statistics Cards */}
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
				<Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-blue-700">
									Total
								</p>
								<p className="text-2xl font-bold text-blue-900">
									{stats.total}
								</p>
							</div>
							<FileText className="h-8 w-8 text-blue-600" />
						</div>
					</CardContent>
				</Card>

				<Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-yellow-700">
									Initiated
								</p>
								<p className="text-2xl font-bold text-yellow-900">
									{stats.initiated}
								</p>
							</div>
							<Clock className="h-8 w-8 text-yellow-600" />
						</div>
					</CardContent>
				</Card>

				<Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-blue-700">
									Processing
								</p>
								<p className="text-2xl font-bold text-blue-900">
									{stats.processing}
								</p>
							</div>
							<RefreshCw className="h-8 w-8 text-blue-600" />
						</div>
					</CardContent>
				</Card>

				<Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-green-700">
									Completed
								</p>
								<p className="text-2xl font-bold text-green-900">
									{stats.completed}
								</p>
							</div>
							<CheckCircle className="h-8 w-8 text-green-600" />
						</div>
					</CardContent>
				</Card>

				<Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-red-700">
									Rejected
								</p>
								<p className="text-2xl font-bold text-red-900">
									{stats.rejected}
								</p>
							</div>
							<XCircle className="h-8 w-8 text-red-600" />
						</div>
					</CardContent>
				</Card>

				<Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-purple-700">
									Total Amount
								</p>
								<p className="text-lg font-bold text-purple-900">
									KSh {stats.totalAmount.toLocaleString()}
								</p>
							</div>
							<DollarSign className="h-8 w-8 text-purple-600" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Filters */}
			<Card className="mb-6">
				<CardContent className="p-6">
					<div className="flex flex-col md:flex-row gap-4">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
							<Input
								placeholder="Search by ID, reason, event, or user email..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10"
							/>
						</div>
						<Select
							value={statusFilter}
							onValueChange={setStatusFilter}
						>
							<SelectTrigger className="w-full md:w-48">
								<SelectValue placeholder="Filter by status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="initiated">Initiated</SelectItem>
								<SelectItem value="processing">
									Processing
								</SelectItem>
								<SelectItem value="completed">
									Completed
								</SelectItem>
								<SelectItem value="rejected">
									Rejected
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Refunds List */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<FileText className="h-5 w-5" />
						Refund Requests ({filteredRefunds.length})
					</CardTitle>
				</CardHeader>
				<CardContent>
					{filteredRefunds.length === 0 ? (
						<div className="text-center py-12">
							<FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
							<h3 className="text-lg font-medium text-gray-900 mb-2">
								No refund requests found
							</h3>
							<p className="text-gray-500">
								{searchTerm || statusFilter !== "all"
									? "Try adjusting your search criteria"
									: "No refund requests have been submitted yet"}
							</p>
						</div>
					) : (
						<div className="space-y-4">
							{filteredRefunds.map((refund) => (
								<div
									key={refund.id}
									className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
								>
									<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
										<div className="flex-1 space-y-3">
											{/* Header Row */}
											<div className="flex items-start justify-between">
												<div className="flex items-center gap-3">
													{getStatusIcon(
														refund.status
													)}
													<div>
														<h3 className="font-semibold text-gray-900">
															Refund #
															{refund.id.substring(
																0,
																8
															)}
														</h3>
														<p className="text-sm text-gray-500">
															{format(
																refund.createdAt,
																"PPp"
															)}
														</p>
													</div>
												</div>
												<Badge
													className={getStatusBadge(
														refund.status
													)}
												>
													{refund.status
														.charAt(0)
														.toUpperCase() +
														refund.status.slice(1)}
												</Badge>
											</div>

											{/* Details Grid */}
											<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
												<div className="flex items-center gap-2">
													<DollarSign className="h-4 w-4 text-gray-400" />
													<div>
														<p className="text-gray-500">
															Amount
														</p>
														<p className="font-semibold">
															KSh{" "}
															{refund.amount.toLocaleString()}
														</p>
													</div>
												</div>

												<div className="flex items-center gap-2">
													<Calendar className="h-4 w-4 text-gray-400" />
													<div>
														<p className="text-gray-500">
															Event
														</p>
														<p className="font-medium">
															{refund.eventTitle ||
																"N/A"}
														</p>
													</div>
												</div>

												<div className="flex items-center gap-2">
													<User className="h-4 w-4 text-gray-400" />
													<div>
														<p className="text-gray-500">
															Customer
														</p>
														<p className="font-medium">
															{refund.userEmail ||
																"N/A"}
														</p>
													</div>
												</div>

												<div className="flex items-center gap-2">
													<FileText className="h-4 w-4 text-gray-400" />
													<div>
														<p className="text-gray-500">
															Reference
														</p>
														<p className="font-mono text-xs">
															{refund.reference?.substring(
																0,
																12
															) || "N/A"}
														</p>
													</div>
												</div>
											</div>

											{/* Reason */}
											<div className="bg-gray-50 rounded-lg p-3">
												<p className="text-sm font-medium text-gray-700 mb-1">
													Reason:
												</p>
												<p className="text-sm text-gray-600">
													{refund.reason}
												</p>
											</div>
										</div>

										{/* Actions */}
										<div className="flex flex-col gap-2 min-w-fit">
											<Button
												variant="outline"
												size="sm"
												onClick={() => {
													setSelectedRefund(refund);
													setShowDetailsModal(true);
												}}
												className="flex items-center gap-2"
											>
												<Eye className="h-4 w-4" />
												View Details
											</Button>

											{refund.status === "initiated" && (
												<div className="flex gap-2">
													<Button
														size="sm"
														onClick={() =>
															handleApproveRefund(
																refund
															)
														}
														disabled={
															processing ===
															refund.id
														}
														className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
													>
														{processing ===
														refund.id ? (
															<Loader2 className="h-4 w-4 animate-spin" />
														) : (
															<CheckCircle className="h-4 w-4" />
														)}
														Approve
													</Button>
													<Button
														size="sm"
														variant="destructive"
														onClick={() => {
															setSelectedRefund(
																refund
															);
															setShowRejectModal(
																true
															);
														}}
														disabled={
															processing ===
															refund.id
														}
														className="flex items-center gap-2"
													>
														<XCircle className="h-4 w-4" />
														Reject
													</Button>
												</div>
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Details Modal */}
			<Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<FileText className="h-5 w-5" />
							Refund Details
						</DialogTitle>
						<DialogDescription>
							Complete information about this refund request
						</DialogDescription>
					</DialogHeader>

					{selectedRefund && (
						<div className="space-y-6">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label className="text-sm font-medium text-gray-500">
										Refund ID
									</Label>
									<p className="font-mono text-sm">
										{selectedRefund.id}
									</p>
								</div>
								<div>
									<Label className="text-sm font-medium text-gray-500">
										Status
									</Label>
									<div className="flex items-center gap-2 mt-1">
										{getStatusIcon(selectedRefund.status)}
										<Badge
											className={getStatusBadge(
												selectedRefund.status
											)}
										>
											{selectedRefund.status
												.charAt(0)
												.toUpperCase() +
												selectedRefund.status.slice(1)}
										</Badge>
									</div>
								</div>
								<div>
									<Label className="text-sm font-medium text-gray-500">
										Amount
									</Label>
									<p className="text-lg font-semibold">
										KSh{" "}
										{selectedRefund.amount.toLocaleString()}
									</p>
								</div>
								<div>
									<Label className="text-sm font-medium text-gray-500">
										Created At
									</Label>
									<p>
										{format(
											selectedRefund.createdAt,
											"PPp"
										)}
									</p>
								</div>
							</div>

							<div>
								<Label className="text-sm font-medium text-gray-500">
									Event
								</Label>
								<p className="font-medium">
									{selectedRefund.eventTitle || "N/A"}
								</p>
							</div>

							<div>
								<Label className="text-sm font-medium text-gray-500">
									Customer Email
								</Label>
								<p>{selectedRefund.userEmail || "N/A"}</p>
							</div>

							<div>
								<Label className="text-sm font-medium text-gray-500">
									Payment Reference
								</Label>
								<p className="font-mono text-sm">
									{selectedRefund.reference || "N/A"}
								</p>
							</div>

							<div>
								<Label className="text-sm font-medium text-gray-500">
									Reason
								</Label>
								<div className="bg-gray-50 rounded-lg p-3 mt-1">
									<p className="text-sm">
										{selectedRefund.reason}
									</p>
								</div>
							</div>

							{selectedRefund.processedAt && (
								<div>
									<Label className="text-sm font-medium text-gray-500">
										Processed At
									</Label>
									<p>
										{format(
											selectedRefund.processedAt,
											"PPp"
										)}
									</p>
								</div>
							)}

							{selectedRefund.rejectedAt && (
								<div>
									<Label className="text-sm font-medium text-gray-500">
										Rejected At
									</Label>
									<p>
										{format(
											selectedRefund.rejectedAt,
											"PPp"
										)}
									</p>
								</div>
							)}
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Reject Modal */}
			<Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-red-600">
							<XCircle className="h-5 w-5" />
							Reject Refund Request
						</DialogTitle>
						<DialogDescription>
							Please provide a reason for rejecting this refund
							request.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<div>
							<Label htmlFor="rejectionReason">
								Rejection Reason *
							</Label>
							<Textarea
								id="rejectionReason"
								placeholder="Explain why this refund request is being rejected..."
								value={rejectionReason}
								onChange={(e) =>
									setRejectionReason(e.target.value)
								}
								rows={4}
								className="mt-1"
							/>
						</div>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setShowRejectModal(false);
								setRejectionReason("");
								setSelectedRefund(null);
							}}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleRejectRefund}
							disabled={!rejectionReason.trim() || processing}
							className="flex items-center gap-2"
						>
							{processing ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<XCircle className="h-4 w-4" />
							)}
							Reject Refund
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
