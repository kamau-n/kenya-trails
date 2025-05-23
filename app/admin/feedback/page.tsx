"use client";

import {
	getAllFeedback,
	subscribeFeedbackUpdates,
	updateFeedbackStatus,
} from "@/lib/services/feedBackService";
import {
	AlertCircle,
	Building,
	Calendar,
	Check,
	Clock,
	Eye,
	RefreshCw,
	Star,
	User,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";

const AdminFeedbackPage = () => {
	const [feedbacks, setFeedbacks] = useState([]);
	const [filter, setFilter] = useState("all"); // all, pending, approved, rejected
	const [selectedFeedback, setSelectedFeedback] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [actionLoading, setActionLoading] = useState(false);

	useEffect(() => {
		let unsubscribe;

		const setupFeedbackListener = async () => {
			try {
				setLoading(true);
				setError("");

				// Set up real-time listener for feedback updates
				unsubscribe = subscribeFeedbackUpdates((feedbackList) => {
					setFeedbacks(feedbackList);
					setLoading(false);
				});
			} catch (err) {
				console.error("Error setting up feedback listener:", err);
				setError(err.message);
				setLoading(false);

				// Fallback to one-time fetch if real-time fails
				try {
					const feedbackList = await getAllFeedback();
					setFeedbacks(feedbackList);
				} catch (fetchError) {
					console.error("Fallback fetch also failed:", fetchError);
				}
			}
		};

		setupFeedbackListener();

		// Cleanup subscription on unmount
		return () => {
			if (unsubscribe) {
				unsubscribe();
			}
		};
	}, []);

	const handleApprove = async (feedbackId) => {
		setActionLoading(true);
		try {
			await updateFeedbackStatus(feedbackId, "approved");
			setSelectedFeedback(null);
			setError("");
		} catch (err) {
			setError(err.message);
		} finally {
			setActionLoading(false);
		}
	};

	const handleReject = async (feedbackId) => {
		setActionLoading(true);
		try {
			await updateFeedbackStatus(feedbackId, "rejected");
			setSelectedFeedback(null);
			setError("");
		} catch (err) {
			setError(err.message);
		} finally {
			setActionLoading(false);
		}
	};

	const refreshFeedbacks = async () => {
		setLoading(true);
		setError("");
		try {
			const feedbackList = await getAllFeedback();
			setFeedbacks(feedbackList);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const filteredFeedbacks = feedbacks.filter((fb) => {
		if (filter === "all") return true;
		return fb.status === filter;
	});

	const getStatusColor = (status) => {
		switch (status) {
			case "pending":
				return "bg-yellow-100 text-yellow-800";
			case "approved":
				return "bg-green-100 text-green-800";
			case "rejected":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getStatusIcon = (status) => {
		switch (status) {
			case "pending":
				return <Clock size={16} />;
			case "approved":
				return <Check size={16} />;
			case "rejected":
				return <X size={16} />;
			default:
				return null;
		}
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="bg-white shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 py-6">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold text-gray-900">
								Feedback Management
							</h1>
							<p className="text-gray-600 mt-2">
								Review and manage organizer feedback submissions
							</p>
						</div>
						<button
							onClick={refreshFeedbacks}
							disabled={loading}
							className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
						>
							<RefreshCw
								className={`w-4 h-4 ${
									loading ? "animate-spin" : ""
								}`}
							/>
							<span>Refresh</span>
						</button>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto p-6">
				{/* Error Message */}
				{error && (
					<div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
						<AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
						<div>
							<p className="text-red-700 font-medium">Error</p>
							<p className="text-red-600 text-sm">{error}</p>
						</div>
						<button
							onClick={() => setError("")}
							className="ml-auto text-red-400 hover:text-red-600"
						>
							<X className="w-5 h-5" />
						</button>
					</div>
				)}

				{/* Filter Tabs */}
				<div className="mb-6">
					<div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
						{[
							{ key: "all", label: "All Feedback" },
							{ key: "pending", label: "Pending" },
							{ key: "approved", label: "Approved" },
							{ key: "rejected", label: "Rejected" },
						].map((tab) => (
							<button
								key={tab.key}
								onClick={() => setFilter(tab.key)}
								className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
									filter === tab.key
										? "bg-white text-blue-600 shadow-sm"
										: "text-gray-600 hover:text-gray-900"
								}`}
							>
								{tab.label}
								<span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded-full">
									{tab.key === "all"
										? feedbacks.length
										: feedbacks.filter(
												(fb) => fb.status === tab.key
										  ).length}
								</span>
							</button>
						))}
					</div>
				</div>

				<div className="grid lg:grid-cols-3 gap-6">
					{/* Feedback List */}
					<div className="lg:col-span-2 space-y-4">
						{filteredFeedbacks.length === 0 ? (
							<div className="bg-white rounded-lg p-8 text-center">
								<p className="text-gray-500">
									No feedback found for the selected filter.
								</p>
							</div>
						) : (
							filteredFeedbacks.map((feedback) => (
								<div
									key={feedback.id}
									className={`bg-white rounded-lg p-6 shadow-sm border cursor-pointer transition-all hover:shadow-md ${
										selectedFeedback?.id === feedback.id
											? "ring-2 ring-blue-500"
											: ""
									}`}
									onClick={() =>
										setSelectedFeedback(feedback)
									}
								>
									<div className="flex items-start justify-between mb-4">
										<div className="flex items-center space-x-3">
											<div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
												<User className="w-5 h-5 text-blue-600" />
											</div>
											<div>
												<h3 className="font-semibold text-gray-900">
													{feedback.organizerName}
												</h3>
												{feedback.organization && (
													<div className="flex items-center text-sm text-gray-500 mt-1">
														<Building className="w-3 h-3 mr-1" />
														{feedback.organization}
													</div>
												)}
											</div>
										</div>
										<span
											className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(
												feedback.status
											)}`}
										>
											{getStatusIcon(feedback.status)}
											<span className="capitalize">
												{feedback.status}
											</span>
										</span>
									</div>

									<div className="flex items-center mb-3">
										<div className="flex space-x-1">
											{[1, 2, 3, 4, 5].map((star) => (
												<Star
													key={star}
													size={16}
													className={
														star <= feedback.rating
															? "fill-yellow-400 text-yellow-400"
															: "text-gray-300"
													}
												/>
											))}
										</div>
										<span className="ml-2 text-sm text-gray-600">
											{feedback.rating}/5
										</span>
									</div>

									<p className="text-gray-700 text-sm mb-3 line-clamp-2">
										{feedback.feedback}
									</p>

									<div className="flex items-center text-xs text-gray-500">
										<Calendar className="w-4 h-4 mr-1" />
										{formatDate(feedback.createdAt)}
									</div>
								</div>
							))
						)}
					</div>

					{/* Feedback Detail Panel */}
					<div className="lg:col-span-1">
						{selectedFeedback ? (
							<div className="bg-white rounded-lg p-6 shadow-sm border sticky top-6">
								<div className="flex items-center justify-between mb-4">
									<h3 className="text-lg font-semibold text-gray-900">
										Feedback Details
									</h3>
									<button
										onClick={() =>
											setSelectedFeedback(null)
										}
										className="text-gray-400 hover:text-gray-600"
									>
										<X size={20} />
									</button>
								</div>

								<div className="space-y-4">
									<div>
										<label className="text-sm font-medium text-gray-500">
											Organizer
										</label>
										<p className="text-gray-900">
											{selectedFeedback.organizerName}
										</p>
									</div>

									{selectedFeedback.organization && (
										<div>
											<label className="text-sm font-medium text-gray-500">
												Organization
											</label>
											<p className="text-gray-900">
												{selectedFeedback.organization}
											</p>
										</div>
									)}

									<div>
										<label className="text-sm font-medium text-gray-500">
											Rating
										</label>
										<div className="flex items-center space-x-2">
											<div className="flex space-x-1">
												{[1, 2, 3, 4, 5].map((star) => (
													<Star
														key={star}
														size={18}
														className={
															star <=
															selectedFeedback.rating
																? "fill-yellow-400 text-yellow-400"
																: "text-gray-300"
														}
													/>
												))}
											</div>
											<span className="text-sm text-gray-600">
												{selectedFeedback.rating}/5
											</span>
										</div>
									</div>

									<div>
										<label className="text-sm font-medium text-gray-500">
											Feedback
										</label>
										<p className="text-gray-900 text-sm leading-relaxed">
											{selectedFeedback.feedback}
										</p>
									</div>

									<div>
										<label className="text-sm font-medium text-gray-500">
											Submitted
										</label>
										<p className="text-gray-900 text-sm">
											{formatDate(
												selectedFeedback.createdAt
											)}
										</p>
									</div>

									<div>
										<label className="text-sm font-medium text-gray-500">
											Status
										</label>
										<span
											className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
												selectedFeedback.status
											)}`}
										>
											<span className="capitalize">
												{selectedFeedback.status}
											</span>
										</span>
									</div>

									{selectedFeedback.status === "pending" && (
										<div className="pt-4 space-y-2">
											<button
												onClick={() =>
													handleApprove(
														selectedFeedback.id
													)
												}
												disabled={actionLoading}
												className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
											>
												{actionLoading ? (
													<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
												) : (
													<Check size={16} />
												)}
												<span>
													{actionLoading
														? "Approving..."
														: "Approve Feedback"}
												</span>
											</button>
											<button
												onClick={() =>
													handleReject(
														selectedFeedback.id
													)
												}
												disabled={actionLoading}
												className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
											>
												{actionLoading ? (
													<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
												) : (
													<X size={16} />
												)}
												<span>
													{actionLoading
														? "Rejecting..."
														: "Reject Feedback"}
												</span>
											</button>
										</div>
									)}
								</div>
							</div>
						) : (
							<div className="bg-white rounded-lg p-6 shadow-sm border sticky top-6">
								<div className="text-center text-gray-500">
									<Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
									<p>Select a feedback to view details</p>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminFeedbackPage;
