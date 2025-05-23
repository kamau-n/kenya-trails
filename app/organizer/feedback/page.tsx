"use client";

import { createFeedback } from "@/lib/services/feedBackService";
import { AlertCircle, CheckCircle, Send, Star } from "lucide-react";
import { useState } from "react";

const OrganizerFeedbackPage = () => {
	const [rating, setRating] = useState(0);
	const [hoverRating, setHoverRating] = useState(0);
	const [feedback, setFeedback] = useState("");
	const [organizerName, setOrganizerName] = useState("");
	const [organization, setOrganization] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");

	const handleStarClick = (starValue) => {
		setRating(starValue);
	};

	const handleStarHover = (starValue) => {
		setHoverRating(starValue);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!rating || !feedback.trim() || !organizerName.trim()) {
			setError(
				"Please fill in all required fields and provide a rating."
			);
			return;
		}

		setIsSubmitting(true);
		setError("");

		try {
			const feedbackData = {
				organizerName: organizerName.trim(),
				organization: organization.trim(),
				rating,
				feedback: feedback.trim(),
			};

			await createFeedback(feedbackData);

			setSubmitted(true);

			// Reset form after 3 seconds
			setTimeout(() => {
				setRating(0);
				setFeedback("");
				setOrganizerName("");
				setOrganization("");
				setSubmitted(false);
				setError("");
			}, 3000);
		} catch (err) {
			setError(err.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (submitted) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-green-50 to-indigo-100 flex items-center justify-center p-4">
				<div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
					<CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
					<h2 className="text-2xl font-bold text-gray-800 mb-2">
						Thank You!
					</h2>
					<p className="text-gray-600 mb-4">
						Your feedback has been submitted and is pending
						approval.
					</p>
					<p className="text-sm text-gray-500">
						You'll be redirected shortly...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 to-indigo-100 py-12 px-4">
			<div className="max-w-2xl mx-auto">
				<div className="bg-white rounded-xl shadow-lg overflow-hidden">
					<div className="bg-gradient-to-r from-green-600 to-indigo-600 px-8 py-6">
						<h1 className="text-3xl font-bold text-white">
							Share Your Experience
						</h1>
						<p className="text-blue-100 mt-2">
							Help us improve by sharing your feedback as an
							organizer
						</p>
					</div>

					<div className="p-8 space-y-6">
						{/* Organizer Details */}
						<div className="grid md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Your Name *
								</label>
								<input
									type="text"
									value={organizerName}
									onChange={(e) =>
										setOrganizerName(e.target.value)
									}
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="Enter your full name"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Organization
								</label>
								<input
									type="text"
									value={organization}
									onChange={(e) =>
										setOrganization(e.target.value)
									}
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="Your organization (optional)"
								/>
							</div>
						</div>

						{/* Star Rating */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-3">
								Overall Rating *
							</label>
							<div className="flex items-center space-x-1">
								{[1, 2, 3, 4, 5].map((star) => (
									<button
										key={star}
										type="button"
										onClick={() => handleStarClick(star)}
										onMouseEnter={() =>
											handleStarHover(star)
										}
										onMouseLeave={() => setHoverRating(0)}
										className="p-1 transition-colors duration-200"
									>
										<Star
											size={32}
											className={`${
												star <= (hoverRating || rating)
													? "fill-yellow-400 text-yellow-400"
													: "text-gray-300"
											} transition-colors duration-200`}
										/>
									</button>
								))}
								<span className="ml-3 text-sm text-gray-600">
									{rating > 0 && (
										<>
											{rating} out of 5 stars
											{rating === 5 && " - Excellent!"}
											{rating === 4 && " - Very Good"}
											{rating === 3 && " - Good"}
											{rating === 2 && " - Fair"}
											{rating === 1 &&
												" - Needs Improvement"}
										</>
									)}
								</span>
							</div>
						</div>

						{/* Feedback Text */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Your Feedback *
							</label>
							<textarea
								value={feedback}
								onChange={(e) => setFeedback(e.target.value)}
								rows={5}
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
								placeholder="Please share your experience, suggestions, or any feedback you'd like to provide..."
								required
							/>
							<div className="mt-1 text-sm text-gray-500">
								{feedback.length}/500 characters
							</div>
						</div>

						{/* Error Message */}
						{error && (
							<div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
								<AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
								<p className="text-red-700 text-sm">{error}</p>
							</div>
						)}

						{/* Submit Button */}
						<div className="pt-4">
							<button
								type="submit"
								disabled={
									isSubmitting ||
									!rating ||
									!feedback.trim() ||
									!organizerName.trim()
								}
								className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center space-x-2 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
							>
								{isSubmitting ? (
									<>
										<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
										<span>Submitting...</span>
									</>
								) : (
									<>
										<Send size={20} />
										<span>Submit Feedback</span>
									</>
								)}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default OrganizerFeedbackPage;
