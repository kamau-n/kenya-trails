"use client";
import {
	Building,
	Calendar,
	Check,
	Clock,
	Eye,
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

	useEffect(() => {
		// Load feedbacks from localStorage (in real app, this would be an API call)
		const loadFeedbacks = () => {
			const storedFeedbacks = JSON.parse(
				localStorage.getItem("organizerFeedbacks") || "[]"
			);
			// Add some sample data if none exists
			if (storedFeedbacks.length === 0) {
				const sampleFeedbacks = [
					{
						id: 1,
						organizerName: "Sarah Johnson",
						organization: "Tech Events Co.",
						rating: 5,
						feedback:
							"Absolutely fantastic platform! The event management tools are intuitive and powerful. Our team was able to coordinate a 500-person conference seamlessly.",
						createdAt: "2025-05-20T10:30:00Z",
						status: "pending",
					},
					{
						id: 2,
						organizerName: "Michael Chen",
						organization: "Community Builders",
						rating: 4,
						feedback:
							"Great experience overall. The registration system worked flawlessly and the analytics helped us understand our audience better.",
						createdAt: "2025-05-19T15:45:00Z",
						status: "approved",
					},
					{
						id: 3,
						organizerName: "Emily Rodriguez",
						organization: "",
						rating: 3,
						feedback:
							"Good platform but could use some improvements in the mobile interface. Desktop version is excellent though.",
						createdAt: "2025-05-18T09:15:00Z",
						status: "pending",
					},
				];
				localStorage.setItem(
					"organizerFeedbacks",
					JSON.stringify(sampleFeedbacks)
				);
				setFeedbacks(sampleFeedbacks);
			} else {
				setFeedbacks(storedFeedbacks);
			}
			setLoading(false);
		};

		loadFeedbacks();
	}, []);

	const handleApprove = (feedbackId) => {
		const updatedFeedbacks = feedbacks.map((fb) =>
			fb.id === feedbackId ? { ...fb, status: "approved" } : fb
		);
		setFeedbacks(updatedFeedbacks);
		localStorage.setItem(
			"organizerFeedbacks",
			JSON.stringify(updatedFeedbacks)
		);
		setSelectedFeedback(null);
	};

	const handleReject = (feedbackId) => {
		const updatedFeedbacks = feedbacks.map((fb) =>
			fb.id === feedbackId ? { ...fb, status: "rejected" } : fb
		);
		setFeedbacks(updatedFeedbacks);
		localStorage.setItem(
			"organizerFeedbacks",
			JSON.stringify(updatedFeedbacks)
		);
		setSelectedFeedback(null);
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
					<h1 className="text-3xl font-bold text-gray-900">
						Feedback Management
					</h1>
					<p className="text-gray-600 mt-2">
						Review and manage organizer feedback submissions
					</p>
				</div>
			</div>

			<div className="max-w-7xl mx-auto p-6">
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
												className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
											>
												<Check size={16} />
												<span>Approve Feedback</span>
											</button>
											<button
												onClick={() =>
													handleReject(
														selectedFeedback.id
													)
												}
												className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
											>
												<X size={16} />
												<span>Reject Feedback</span>
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
