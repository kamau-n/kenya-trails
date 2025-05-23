// services/feedbackService.js
import {
	addDoc,
	collection,
	doc,
	getDocs,
	onSnapshot,
	orderBy,
	query,
	serverTimestamp,
	updateDoc,
	where,
} from "firebase/firestore";
import { db } from "../firebase";

const COLLECTION_NAME = "organizerFeedback";

// Create new feedback
export const createFeedback = async (feedbackData) => {
	try {
		const docRef = await addDoc(collection(db, COLLECTION_NAME), {
			...feedbackData,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
			status: "pending",
		});

		return {
			id: docRef.id,
			...feedbackData,
			status: "pending",
			createdAt: new Date(),
			updatedAt: new Date(),
		};
	} catch (error) {
		console.error("Error creating feedback:", error);
		throw new Error("Failed to submit feedback. Please try again.");
	}
};

// Get all feedback with optional filtering
export const getAllFeedback = async (statusFilter = null) => {
	try {
		let q = query(
			collection(db, COLLECTION_NAME),
			orderBy("createdAt", "desc")
		);

		if (statusFilter && statusFilter !== "all") {
			q = query(q, where("status", "==", statusFilter));
		}

		const querySnapshot = await getDocs(q);
		interface FeedbackData {
			name: string;
			email: string;
			message: string;
			rating: number;
			tourId?: string;
			status?: "pending" | "approved" | "rejected";
			createdAt?: Date | string;
			updatedAt?: Date | string;
		}

		interface Feedback extends FeedbackData {
			id: string;
		}

		interface FeedbackStats {
			total: number;
			approved: number;
			pending: number;
			rejected: number;
			averageRating: number;
		}

		querySnapshot.forEach((doc) => {
			const data = doc.data();
			feedbacks.push({
				id: doc.id,
				...data,
				createdAt:
					data.createdAt?.toDate()?.toISOString() ||
					new Date().toISOString(),
				updatedAt:
					data.updatedAt?.toDate()?.toISOString() ||
					new Date().toISOString(),
			});
		});

		return feedbacks;
	} catch (error) {
		console.error("Error fetching feedback:", error);
		throw new Error("Failed to load feedback. Please try again.");
	}
};

// Get only approved feedback for public display
export const getApprovedFeedback = async () => {
	try {
		const q = query(
			collection(db, COLLECTION_NAME),
			where("status", "==", "approved"),
			orderBy("createdAt", "desc")
		);

		const querySnapshot = await getDocs(q);
		const approvedFeedbacks = [];

		querySnapshot.forEach((doc) => {
			const data = doc.data();
			approvedFeedbacks.push({
				id: doc.id,
				...data,
				createdAt:
					data.createdAt?.toDate()?.toISOString() ||
					new Date().toISOString(),
				updatedAt:
					data.updatedAt?.toDate()?.toISOString() ||
					new Date().toISOString(),
			});
		});

		return approvedFeedbacks;
	} catch (error) {
		console.error("Error fetching approved feedback:", error);
		throw new Error("Failed to load testimonials. Please try again.");
	}
};

// Update feedback status (approve/reject)
export const updateFeedbackStatus = async (feedbackId, newStatus) => {
	try {
		const feedbackRef = doc(db, COLLECTION_NAME, feedbackId);
		await updateDoc(feedbackRef, {
			status: newStatus,
			updatedAt: serverTimestamp(),
		});

		return { success: true };
	} catch (error) {
		console.error("Error updating feedback status:", error);
		throw new Error("Failed to update feedback status. Please try again.");
	}
};

// Real-time listener for feedback updates (useful for admin dashboard)
export const subscribeFeedbackUpdates = (callback, statusFilter = null) => {
	try {
		let q = collection(db, COLLECTION_NAME);

		if (statusFilter && statusFilter !== "all") {
			q = query(q, where("status", "==", statusFilter));
		}

		q = query(q, orderBy("createdAt", "desc"));

		return onSnapshot(q, (querySnapshot) => {
			const feedbacks = [];
			querySnapshot.forEach((doc) => {
				const data = doc.data();
				feedbacks.push({
					id: doc.id,
					...data,
					createdAt:
						data.createdAt?.toDate()?.toISOString() ||
						new Date().toISOString(),
					updatedAt:
						data.updatedAt?.toDate()?.toISOString() ||
						new Date().toISOString(),
				});
			});
			callback(feedbacks);
		});
	} catch (error) {
		console.error("Error setting up feedback listener:", error);
		throw new Error("Failed to setup real-time updates.");
	}
};

// Get feedback statistics
export const getFeedbackStats = async () => {
	try {
		const allFeedback = await getAllFeedback();
		const approved = allFeedback.filter((f) => f.status === "approved");
		const pending = allFeedback.filter((f) => f.status === "pending");
		const rejected = allFeedback.filter((f) => f.status === "rejected");

		const totalRating = approved.reduce(
			(sum, feedback) => sum + feedback.rating,
			0
		);
		const averageRating =
			approved.length > 0
				? (totalRating / approved.length).toFixed(1)
				: 0;

		return {
			total: allFeedback.length,
			approved: approved.length,
			pending: pending.length,
			rejected: rejected.length,
			averageRating: parseFloat(averageRating),
		};
	} catch (error) {
		console.error("Error fetching feedback stats:", error);
		throw new Error("Failed to load feedback statistics.");
	}
};
