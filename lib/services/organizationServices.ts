// lib/firestore.js
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";

// Collection names
const COLLECTIONS = {
  PRIVACY_POLICIES: "privacy_policies",
  FAQ: "faq",
  RESOURCES: "resources",
  FEEDBACK: "feedback",
};

// Generic CRUD operations
export const firestoreService = {
  // Create document
  async create(collectionName, data) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error(`Error creating document in ${collectionName}:`, error);
      throw error;
    }
  },

  // Read all documents
  async getAll(collectionName, orderField = "createdAt") {
    try {
      const q = query(
        collection(db, collectionName),
        orderBy(orderField, "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error(`Error fetching documents from ${collectionName}:`, error);
      throw error;
    }
  },

  // Update document
  async update(collectionName, id, data) {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      return { id, ...data };
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      throw error;
    }
  },

  // Delete document
  async delete(collectionName, id) {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      return id;
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  },

  // Subscribe to real-time updates
  subscribe(collectionName, callback, orderField = "createdAt") {
    const q = query(
      collection(db, collectionName),
      orderBy(orderField, "desc")
    );
    return onSnapshot(q, (querySnapshot) => {
      const documents = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(documents);
    });
  },
};

// Specific service functions for organization data
export const organizationService = {
  // Privacy Policies
  async createPrivacyPolicy(data) {
    return firestoreService.create(COLLECTIONS.PRIVACY_POLICIES, {
      title: data.title,
      content: data.content,
      status: data.status || "draft",
      lastUpdated: new Date().toISOString().split("T")[0],
    });
  },

  async getPrivacyPolicies() {
    return firestoreService.getAll(COLLECTIONS.PRIVACY_POLICIES, "updatedAt");
  },

  async updatePrivacyPolicy(id, data) {
    return firestoreService.update(COLLECTIONS.PRIVACY_POLICIES, id, {
      ...data,
      lastUpdated: new Date().toISOString().split("T")[0],
    });
  },

  async deletePrivacyPolicy(id) {
    return firestoreService.delete(COLLECTIONS.PRIVACY_POLICIES, id);
  },

  // FAQ
  async createFAQ(data) {
    return firestoreService.create(COLLECTIONS.FAQ, {
      question: data.question,
      answer: data.answer,
      category: data.category,
      status: data.status || "draft",
    });
  },

  async getFAQs() {
    return firestoreService.getAll(COLLECTIONS.FAQ, "updatedAt");
  },

  async updateFAQ(id, data) {
    return firestoreService.update(COLLECTIONS.FAQ, id, data);
  },

  async deleteFAQ(id) {
    return firestoreService.delete(COLLECTIONS.FAQ, id);
  },

  // Resources
  async createResource(data) {
    return firestoreService.create(COLLECTIONS.RESOURCES, {
      title: data.title,
      description: data.description,
      url: data.url,
      category: data.category,
      status: data.status || "draft",
    });
  },

  async getResources() {
    return firestoreService.getAll(COLLECTIONS.RESOURCES, "updatedAt");
  },

  async updateResource(id, data) {
    return firestoreService.update(COLLECTIONS.RESOURCES, id, data);
  },

  async deleteResource(id) {
    return firestoreService.delete(COLLECTIONS.RESOURCES, id);
  },

  // Feedback
  async createFeedback(data) {
    return firestoreService.create(COLLECTIONS.FEEDBACK, {
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      status: "unread",
      priority: data.priority || "medium",
    });
  },

  async getFeedback() {
    return firestoreService.getAll(COLLECTIONS.FEEDBACK, "createdAt");
  },

  async updateFeedback(id, data) {
    return firestoreService.update(COLLECTIONS.FEEDBACK, id, data);
  },

  async deleteFeedback(id) {
    return firestoreService.delete(COLLECTIONS.FEEDBACK, id);
  },

  // Real-time subscriptions
  subscribeToPrivacyPolicies(callback) {
    return firestoreService.subscribe(
      COLLECTIONS.PRIVACY_POLICIES,
      callback,
      "updatedAt"
    );
  },

  subscribeToFAQs(callback) {
    return firestoreService.subscribe(COLLECTIONS.FAQ, callback, "updatedAt");
  },

  subscribeToResources(callback) {
    return firestoreService.subscribe(
      COLLECTIONS.RESOURCES,
      callback,
      "updatedAt"
    );
  },

  subscribeToFeedback(callback) {
    return firestoreService.subscribe(
      COLLECTIONS.FEEDBACK,
      callback,
      "createdAt"
    );
  },
};

export { COLLECTIONS };
