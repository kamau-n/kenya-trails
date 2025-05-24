"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    features: "",
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const promotionsSnapshot = await getDocs(collection(db, "promotions"));
      const promotionsData = promotionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPromotions(promotionsData);
    } catch (error) {
      console.error("Error fetching promotions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPromotion) {
        await updateDoc(doc(db, "promotions", editingPromotion.id), formData);
      } else {
        await addDoc(collection(db, "promotions"), formData);
      }
      fetchPromotions();
      resetForm();
    } catch (error) {
      console.error("Error saving promotion:", error);
    }
  };

  const handleEdit = (promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      name: promotion.name,
      description: promotion.description,
      price: promotion.price,
      duration: promotion.duration,
      features: promotion.features,
    });
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this promotion package?")) {
      try {
        await deleteDoc(doc(db, "promotions", id));
        fetchPromotions();
      } catch (error) {
        console.error("Error deleting promotion:", error);
      }
    }
  };

  const resetForm = () => {
    setEditingPromotion(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      duration: "",
      features: "",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Promotion Packages</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {editingPromotion
              ? "Edit Promotion Package"
              : "Add New Promotion Package"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Package Name
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Price (KSh)
              </label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Duration (days)
              </label>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Features</label>
              <Textarea
                value={formData.features}
                onChange={(e) =>
                  setFormData({ ...formData, features: e.target.value })
                }
                placeholder="Enter features (one per line)"
                required
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {editingPromotion ? "Update Package" : "Add Package"}
              </Button>
              {editingPromotion && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Existing Packages</h2>
          {loading ? (
            <p>Loading packages...</p>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promotions.map((promotion) => (
                    <TableRow key={promotion.id}>
                      <TableCell>{promotion.name}</TableCell>
                      <TableCell>KSh {promotion.price}</TableCell>
                      <TableCell>{promotion.duration} days</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(promotion)}>
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(promotion.id)}>
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
