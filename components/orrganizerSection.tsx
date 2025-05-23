import {
	Building,
	Calendar,
	ChevronLeft,
	ChevronRight,
	Quote,
	Star,
} from "lucide-react";
import { useEffect, useState } from "react";

const OrganizersSection = () => {
	const [approvedFeedbacks, setApprovedFeedbacks] = useState([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		// Load approved feedbacks from localStorage (in real app, this would be an API call)
		const loadApprovedFeedbacks = () => {
			const allFeedbacks = JSON.parse(
				localStorage.getItem("organizerFeedbacks") || "[]"
			);
			const approved = allFeedbacks.filter(
				(feedback) => feedback.status === "approved"
			);

			// Add some default approved feedbacks if none exist
			if (approved.length === 0) {
				const defaultFeedbacks = [
					{
						id: 101,
						organizerName: "Sarah Johnson",
						organization: "Tech Events Co.",
						rating: 5,
						feedback:
							"Absolutely fantastic platform! The event management tools are intuitive and powerful. Our team was able to coordinate a 500-person conference seamlessly. The registration system, attendee management, and real-time analytics made everything so much easier.",
						createdAt: "2025-05-20T10:30:00Z",
						status: "approved",
					},
					{
						id: 102,
						organizerName: "Michael Chen",
						organization: "Community Builders",
						rating: 5,
						feedback:
							"This platform transformed how we organize events. The automated workflows saved us countless hours, and the mobile app kept us connected with our team throughout the event. Highly recommend to any event organizer!",
						createdAt: "2025-05-19T15:45:00Z",
						status: "approved",
					},
					{
						id: 103,
						organizerName: "Emily Rodriguez",
						organization: "Creative Workshops LLC",
						rating: 4,
						feedback:
							"Great experience overall! The registration system worked flawlessly and the analytics helped us understand our audience better. The customer support team was also incredibly responsive when we had questions.",
						createdAt: "2025-05-18T09:15:00Z",
						status: "approved",
					},
					{
						id: 104,
						organizerName: "David Park",
						organization: "Innovation Hub",
						rating: 5,
						feedback:
							"We've organized over 50 events using this platform, and it never fails to impress. The scalability is amazing - whether it's a 20-person workshop or a 1000-person conference, everything runs smoothly.",
						createdAt: "2025-05-17T14:20:00Z",
						status: "approved",
					},
					{
						id: 105,
						organizerName: "Lisa Thompson",
						organization: "Professional Networks",
						rating: 4,
						feedback:
							"The platform made our networking events so much more engaging. The attendee matching feature and interactive tools helped create meaningful connections. Our satisfaction scores increased by 40%!",
						createdAt: "2025-05-16T11:30:00Z",
						status: "approved",
					},
					{
						id: 106,
						organizerName: "Ahmed Hassan",
						organization: "",
						rating: 5,
						feedback:
							"As an independent organizer, I was looking for something powerful yet affordable. This platform exceeded my expectations. The free tier got me started, and the premium features are worth every penny.",
						createdAt: "2025-05-15T16:45:00Z",
						status: "approved",
					},
				];
				setApprovedFeedbacks(defaultFeedbacks);
			} else {
				setApprovedFeedbacks(approved);
			}
			setLoading(false);
		};

		loadApprovedFeedbacks();
	}, []);

	const nextFeedback = () => {
		setCurrentIndex(
			(prev) => (prev + 1) % Math.ceil(approvedFeedbacks.length / 2)
		);
	};

	const prevFeedback = () => {
		setCurrentIndex(
			(prev) =>
				(prev - 1 + Math.ceil(approvedFeedbacks.length / 2)) %
				Math.ceil(approvedFeedbacks.length / 2)
		);
	};

	const getCurrentFeedbacks = () => {
		const startIndex = currentIndex * 2;
		return approvedFeedbacks.slice(startIndex, startIndex + 2);
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
		});
	};

	const getAverageRating = () => {
		if (approvedFeedbacks.length === 0) return 0;
		const total = approvedFeedbacks.reduce(
			(sum, feedback) => sum + feedback.rating,
			0
		);
		return (total / approvedFeedbacks.length).toFixed(1);
	};

	if (loading) {
		return (
			<section
				id="what-organizers-say"
				className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100"
			>
				<div className="max-w-7xl mx-auto px-4">
					<div className="animate-pulse">
						<div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
						<div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-12"></div>
						<div className="grid md:grid-cols-2 gap-8">
							{[1, 2].map((i) => (
								<div
									key={i}
									className="bg-white rounded-xl p-8"
								>
									<div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
									<div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
									<div className="h-20 bg-gray-200 rounded mb-4"></div>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section
			id="what-organizers-say"
			className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100"
		>
			<div className="max-w-7xl mx-auto px-4">
				{/* Section Header */}
				<div className="text-center mb-16">
					<h2 className="text-4xl font-bold text-gray-900 mb-4">
						What Organizers Say
					</h2>
					<p className="text-xl text-gray-600 mb-8">
						Hear from event organizers who've transformed their
						events with our platform
					</p>

					{/* Stats */}
					<div className="flex justify-center items-center space-x-8 mb-12">
						<div className="text-center">
							<div className="text-3xl font-bold text-blue-600">
								{approvedFeedbacks.length}+
							</div>
							<div className="text-sm text-gray-600">
								Happy Organizers
							</div>
						</div>
						<div className="text-center">
							<div className="flex items-center justify-center space-x-1">
								<span className="text-3xl font-bold text-yellow-500">
									{getAverageRating()}
								</span>
								<Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
							</div>
							<div className="text-sm text-gray-600">
								Average Rating
							</div>
						</div>
					</div>
				</div>

				{approvedFeedbacks.length === 0 ? (
					<div className="text-center py-12">
						<Quote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
						<p className="text-gray-500 text-lg">
							No approved feedback available yet.
						</p>
						<p className="text-gray-400 text-sm mt-2">
							Check back soon for organizer testimonials!
						</p>
					</div>
				) : (
					<>
						{/* Testimonials Grid */}
						<div className="grid md:grid-cols-2 gap-8 mb-12">
							{getCurrentFeedbacks().map((feedback) => (
								<div
									key={feedback.id}
									className="bg-white rounded-xl shadow-lg p-8 relative hover:shadow-xl transition-shadow duration-300"
								>
									{/* Quote Icon */}
									<div className="absolute top-6 right-6">
										<Quote className="w-8 h-8 text-blue-200" />
									</div>

									{/* Rating */}
									<div className="flex items-center space-x-1 mb-4">
										{[1, 2, 3, 4, 5].map((star) => (
											<Star
												key={star}
												size={20}
												className={
													star <= feedback.rating
														? "fill-yellow-400 text-yellow-400"
														: "text-gray-300"
												}
											/>
										))}
										<span className="ml-2 text-sm text-gray-600 font-medium">
											{feedback.rating}/5
										</span>
									</div>

									{/* Feedback Text */}
									<blockquote className="text-gray-700 text-lg leading-relaxed mb-6 italic">
										"{feedback.feedback}"
									</blockquote>

									{/* Author Info */}
									<div className="flex items-center space-x-4">
										<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
											{feedback.organizerName.charAt(0)}
										</div>
										<div>
											<div className="font-semibold text-gray-900">
												{feedback.organizerName}
											</div>
											{feedback.organization ? (
												<div className="flex items-center text-sm text-gray-600 mt-1">
													<Building className="w-4 h-4 mr-1" />
													{feedback.organization}
												</div>
											) : (
												<div className="text-sm text-gray-500">
													Independent Organizer
												</div>
											)}
											<div className="flex items-center text-xs text-gray-400 mt-1">
												<Calendar className="w-3 h-3 mr-1" />
												{formatDate(feedback.createdAt)}
											</div>
										</div>
									</div>
								</div>
							))}
						</div>

						{/* Navigation Controls */}
						{Math.ceil(approvedFeedbacks.length / 2) > 1 && (
							<div className="flex justify-center items-center space-x-4">
								<button
									onClick={prevFeedback}
									className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-shadow duration-200 text-gray-600 hover:text-blue-600"
									aria-label="Previous testimonials"
								>
									<ChevronLeft size={24} />
								</button>

								{/* Pagination Dots */}
								<div className="flex space-x-2">
									{Array.from({
										length: Math.ceil(
											approvedFeedbacks.length / 2
										),
									}).map((_, index) => (
										<button
											key={index}
											onClick={() =>
												setCurrentIndex(index)
											}
											className={`w-3 h-3 rounded-full transition-colors duration-200 ${
												currentIndex === index
													? "bg-blue-600"
													: "bg-gray-300 hover:bg-gray-400"
											}`}
											aria-label={`Go to testimonial page ${
												index + 1
											}`}
										/>
									))}
								</div>

								<button
									onClick={nextFeedback}
									className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-shadow duration-200 text-gray-600 hover:text-blue-600"
									aria-label="Next testimonials"
								>
									<ChevronRight size={24} />
								</button>
							</div>
						)}

						{/* Call to Action */}
						<div className="text-center mt-16">
							<div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
								<h3 className="text-2xl font-bold text-gray-900 mb-4">
									Join Thousands of Successful Organizers
								</h3>
								<p className="text-gray-600 mb-6">
									Ready to transform your events? Start your
									journey today and see why organizers love
									our platform.
								</p>
								<div className="flex flex-col sm:flex-row gap-4 justify-center">
									<button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl">
										Start Free Trial
									</button>
									<button className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-200">
										Schedule Demo
									</button>
								</div>
							</div>
						</div>
					</>
				)}
			</div>
		</section>
	);
};

export default OrganizersSection;
