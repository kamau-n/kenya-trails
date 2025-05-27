// lib/services/feedBackService.js
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase"; // Adjust the import path based on your Firebase config location

const FEEDBACK_COLLECTION = "feedback";

/**
 * Create new feedback entry
 * @param {Object} feedbackData - The feedback data to save
 * @param {string} feedbackData.organizerName - Name of the organizer
 * @param {string} feedbackData.organization - Organization name (optional)
 * @param {number} feedbackData.rating - Rating from 1-5
 * @param {string} feedbackData.feedback - Feedback text
 * @returns {Promise<string>} - Returns the document ID of the created feedback
 */
export const createFeedback = async (feedbackData) => {
  try {
    // Validate required fields
    if (
      !feedbackData.organizerName ||
      !feedbackData.rating ||
      !feedbackData.feedback
    ) {
      throw new Error(
        "Missing required fields: organizerName, rating, and feedback are required"
      );
    }

    // Validate rating range
    if (feedbackData.rating < 1 || feedbackData.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    // Prepare document data
    const docData = {
      organizerName: feedbackData.organizerName.trim(),
      organization: feedbackData.organization?.trim() || "",
      rating: Number(feedbackData.rating),
      feedback: feedbackData.feedback.trim(),
      status: "pending", // Default status
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Add document to Firestore
    const docRef = await addDoc(collection(db, FEEDBACK_COLLECTION), docData);

    console.log("Feedback created with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error creating feedback:", error);
    throw new Error(`Failed to submit feedback: ${error.message}`);
  }
};

/**
 * Get all feedback entries
 * @returns {Promise<Array>} - Returns array of all feedback entries
 */
export const getAllFeedback = async () => {
  try {
    const q = query(
      collection(db, FEEDBACK_COLLECTION),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const feedbacks = [];

    querySnapshot.forEach((doc) => {
      feedbacks.push({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamps to ISO strings for easier handling
        createdAt:
          doc.data().createdAt?.toDate?.()?.toISOString() ||
          new Date().toISOString(),
        updatedAt:
          doc.data().updatedAt?.toDate?.()?.toISOString() ||
          new Date().toISOString(),
      });
    });

    return feedbacks;
  } catch (error) {
    console.error("Error fetching feedback:", error);
    throw new Error(`Failed to fetch feedback: ${error.message}`);
  }
};

/**
 * Update feedback status (approve/reject)
 * @param {string} feedbackId - The document ID of the feedback
 * @param {string} status - New status: 'pending', 'approved', or 'rejected'
 * @returns {Promise<void>}
 */
export const updateFeedbackStatus = async (feedbackId, status) => {
  try {
    // Validate status
    const validStatuses = ["pending", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
      throw new Error(
        "Invalid status. Must be: pending, approved, or rejected"
      );
    }

    const feedbackRef = doc(db, FEEDBACK_COLLECTION, feedbackId);

    await updateDoc(feedbackRef, {
      status: status,
      updatedAt: serverTimestamp(),
    });

    console.log(`Feedback ${feedbackId} status updated to: ${status}`);
  } catch (error) {
    console.error("Error updating feedback status:", error);
    throw new Error(`Failed to update feedback status: ${error.message}`);
  }
};

/**
 * Subscribe to real-time feedback updates
 * @param {Function} callback - Callback function to handle feedback updates
 * @returns {Function} - Unsubscribe function
 */
export const subscribeFeedbackUpdates = (callback) => {
  try {
    const q = query(
      collection(db, FEEDBACK_COLLECTION),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const feedbacks = [];

        querySnapshot.forEach((doc) => {
          feedbacks.push({
            id: doc.id,
            ...doc.data(),
            // Convert Firestore timestamps to ISO strings
            createdAt:
              doc.data().createdAt?.toDate?.()?.toISOString() ||
              new Date().toISOString(),
            updatedAt:
              doc.data().updatedAt?.toDate?.()?.toISOString() ||
              new Date().toISOString(),
          });
        });

        callback(feedbacks);
      },
      (error) => {
        console.error("Error in feedback subscription:", error);
        throw new Error(
          `Failed to subscribe to feedback updates: ${error.message}`
        );
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error("Error setting up feedback subscription:", error);
    throw new Error(`Failed to set up real-time updates: ${error.message}`);
  }
};

/**
 * Get feedback by status
 * @param {string} status - Filter by status: 'pending', 'approved', or 'rejected'
 * @returns {Promise<Array>} - Returns filtered feedback array
 */
export const getFeedbackByStatus = async (status) => {
  try {
    const validStatuses = ["pending", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
      throw new Error("Invalid status filter");
    }

    const q = query(
      collection(db, FEEDBACK_COLLECTION),
      where("status", "==", status),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const feedbacks = [];

    querySnapshot.forEach((doc) => {
      feedbacks.push({
        id: doc.id,
        ...doc.data(),
        createdAt:
          doc.data().createdAt?.toDate?.()?.toISOString() ||
          new Date().toISOString(),
        updatedAt:
          doc.data().updatedAt?.toDate?.()?.toISOString() ||
          new Date().toISOString(),
      });
    });

    return feedbacks;
  } catch (error) {
    console.error("Error fetching feedback by status:", error);
    throw new Error(`Failed to fetch feedback: ${error.message}`);
  }
};

/**
 * Delete feedback (if needed for admin purposes)
 * @param {string} feedbackId - The document ID to delete
 * @returns {Promise<void>}
 */
export const deleteFeedback = async (feedbackId) => {
  try {
    await deleteDoc(doc(db, FEEDBACK_COLLECTION, feedbackId));
    console.log("Feedback deleted:", feedbackId);
  } catch (error) {
    console.error("Error deleting feedback:", error);
    throw new Error(`Failed to delete feedback: ${error.message}`);
  }
};
