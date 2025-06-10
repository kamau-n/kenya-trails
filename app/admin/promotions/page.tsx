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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  DollarSign,
  Calendar,
  Star,
  Search,
  Filter,
  MoreHorizontal,
} from "lucide-react";
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
  const [filteredPromotions, setFilteredPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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

  useEffect(() => {
    const filtered = promotions.filter(
      (promotion) =>
        promotion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promotion.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPromotions(filtered);
  }, [searchTerm, promotions]);

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
      toast({
        title: "Error",
        description: "Failed to fetch promotions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.price ||
      !formData.duration ||
      !formData.features.trim()
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const promotionData = {
        ...formData,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        createdAt: editingPromotion ? editingPromotion.createdAt : new Date(),
        updatedAt: new Date(),
      };

      if (editingPromotion) {
        await updateDoc(
          doc(db, "promotions", editingPromotion.id),
          promotionData
        );
        toast({
          title: "Success",
          description: "Promotion package updated successfully!",
        });
      } else {
        await addDoc(collection(db, "promotions"), promotionData);
        toast({
          title: "Success",
          description: "New promotion package added successfully!",
        });
      }

      fetchPromotions();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving promotion:", error);
      toast({
        title: "Error",
        description: "Failed to save promotion. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      name: promotion.name,
      description: promotion.description,
      price: promotion.price.toString(),
      duration: promotion.duration.toString(),
      features: promotion.features,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "promotions", id));
      fetchPromotions();
      toast({
        title: "Success",
        description: "Promotion package deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting promotion:", error);
      toast({
        title: "Error",
        description: "Failed to delete promotion. Please try again.",
        variant: "destructive",
      });
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

  const formatFeatures = (features) => {
    return features
      .split("\n")
      .filter((f) => f.trim())
      .map((feature, index) => (
        <span key={index} className="inline-block">
          • {feature.trim()}
          {index < features.split("\n").filter((f) => f.trim()).length - 1 && (
            <br />
          )}
        </span>
      ));
  };

  return (
    <div className="md:px-12 mx-auto px-4 py-8 max-w-7xl">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-600" />
            Promotion Packages
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your promotional offerings and packages
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-blue-600 hover:bg-blue-700 shadow-lg"
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Package
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {editingPromotion
                  ? "Edit Promotion Package"
                  : "Add New Promotion Package"}
              </DialogTitle>
              <DialogDescription>
                {editingPromotion
                  ? "Update the details of your promotion package"
                  : "Create a new promotion package for your customers"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Package Name *
                  </label>
                  <Input
                    placeholder="e.g., Premium Marketing Package"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description *
                  </label>
                  <Textarea
                    placeholder="Describe what this package includes..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Price (KSh) *
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Duration (days) *
                    </label>
                    <Input
                      type="number"
                      placeholder="30"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Features *
                  </label>
                  <Textarea
                    placeholder="Enter features (one per line)&#10;e.g., Social media management&#10;SEO optimization&#10;Monthly reports"
                    value={formData.features}
                    onChange={(e) =>
                      setFormData({ ...formData, features: e.target.value })
                    }
                    rows={4}
                    required
                  />
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(false);
                  }}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingPromotion ? "Update Package" : "Create Package"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Packages
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{promotions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KSh{" "}
              {promotions.length > 0
                ? Math.round(
                    promotions.reduce(
                      (sum, p) => sum + parseFloat(p.price || 0),
                      0
                    ) / promotions.length
                  )
                : 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Duration
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {promotions.length > 0
                ? Math.round(
                    promotions.reduce(
                      (sum, p) => sum + parseInt(p.duration || 0),
                      0
                    ) / promotions.length
                  )
                : 0}{" "}
              days
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Section */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search packages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Packages Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Packages</CardTitle>
          <CardDescription>
            {filteredPromotions.length} of {promotions.length} packages
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading packages...</p>
              </div>
            </div>
          ) : filteredPromotions.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "No packages found" : "No packages yet"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Get started by creating your first promotion package"}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Package
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">
                      Package Details
                    </TableHead>
                    <TableHead className="font-semibold">Pricing</TableHead>
                    <TableHead className="font-semibold">Duration</TableHead>
                    <TableHead className="font-semibold">Features</TableHead>
                    <TableHead className="font-semibold text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPromotions.map((promotion) => (
                    <TableRow key={promotion.id} className="hover:bg-gray-50">
                      <TableCell className="py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {promotion.name}
                          </div>
                          <div className="text-sm text-gray-600 mt-1 max-w-xs">
                            {promotion.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800">
                            KSh{" "}
                            {parseFloat(promotion.price || 0).toLocaleString()}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{promotion.duration} days</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="text-sm text-gray-600 max-w-xs">
                          {formatFeatures(promotion.features)}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(promotion)}
                            className="h-8 w-8 p-0">
                            <Edit2 className="h-4 w-4" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Package
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "
                                  {promotion.name}"? This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(promotion.id)}
                                  className="bg-red-600 hover:bg-red-700">
                                  Delete Package
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
