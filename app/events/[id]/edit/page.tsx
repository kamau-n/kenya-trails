"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Trash2, Upload, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EditEventPage({ params }) {
  const { id } = params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventDoc = await getDoc(doc(db, "events", id));
        if (eventDoc.exists()) {
          const eventData = eventDoc.data();
          setEvent({ id: eventDoc.id, ...eventData });
          setExistingImages(eventData.images || []);
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        setError("Failed to fetch event details");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  const removeNewImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const removeExistingImage = (url) => {
    setExistingImages(existingImages.filter((image) => image !== url));
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    setDeleting(true);
    try {
      // Delete images from storage
      const imageRefs = existingImages.map((url) => ref(storage, url));
      await Promise.all(imageRefs.map((ref) => deleteObject(ref)));

      // Delete event document
      await deleteDoc(doc(db, "events", id));
      router.push("/admin/events");
    } catch (error) {
      console.error("Error deleting event:", error);
      setError("Failed to delete event");
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Upload new images
      const uploadedUrls = [];
      for (const image of images) {
        const storageRef = ref(storage, `events/${Date.now()}_${image.name}`);
        await uploadBytes(storageRef, image);
        const url = await getDownloadURL(storageRef);
        uploadedUrls.push(url);
      }

      // Combine existing and new images
      const allImages = [...existingImages, ...uploadedUrls];

      const eventRef = doc(db, "events", id);
      await updateDoc(eventRef, {
        title: event.title,
        description: event.description,
        price: Number(event.price),
        location: event.location,
        meetingPoint: event.meetingPoint,
        date: event.date,
        duration: event.duration,
        category: event.category,
        difficulty: event.difficulty,
        totalSpaces: Number(event.totalSpaces),
        availableSpaces: Number(event.availableSpaces),
        included: event.included || [],
        notIncluded: event.notIncluded || [],
        requirements: event.requirements || [],
        images: allImages,
        imageUrl: allImages[0] || null,
      });

      router.push("/admin/events");
    } catch (error) {
      console.error("Error updating event:", error);
      setError("Failed to update event");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="md:px-12 mx-auto px-4 py-8">Loading...</div>;
  }

  if (!event) {
    return <div className="md:px-12 mx-auto px-4 py-8">Event not found</div>;
  }

  return (
    <div className="md:px-12 mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Event</h1>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={deleting}>
          {deleting ? "Deleting..." : "Delete Event"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              value={event.title}
              onChange={(e) => setEvent({ ...event, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={event.category}
              onValueChange={(value) =>
                setEvent({ ...event, category: value })
              }>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Hiking">Hiking</SelectItem>
                <SelectItem value="Safari">Safari</SelectItem>
                <SelectItem value="Beach">Beach</SelectItem>
                <SelectItem value="Camping">Camping</SelectItem>
                <SelectItem value="Cultural">Cultural</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={event.description}
            onChange={(e) =>
              setEvent({ ...event, description: e.target.value })
            }
            required
            rows={5}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              value={event.price}
              onChange={(e) => setEvent({ ...event, price: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="totalSpaces">Total Spaces</Label>
            <Input
              id="totalSpaces"
              type="number"
              value={event.totalSpaces}
              onChange={(e) =>
                setEvent({ ...event, totalSpaces: e.target.value })
              }
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={event.location}
            onChange={(e) => setEvent({ ...event, location: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="meetingPoint">Meeting Point</Label>
          <Input
            id="meetingPoint"
            value={event.meetingPoint}
            onChange={(e) =>
              setEvent({ ...event, meetingPoint: e.target.value })
            }
            required
          />
        </div>

        <div>
          <Label>Images</Label>
          <div className="mt-2 space-y-4">
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {existingImages.map((url, index) => (
                  <div key={url} className="relative">
                    <img
                      src={url}
                      alt={`Event ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removeExistingImage(url)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* New Images */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`New ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removeNewImage(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-center w-full">
              <label className="w-full flex flex-col items-center px-4 py-6 bg-white text-blue rounded-lg shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-blue-50">
                <Upload className="w-8 h-8" />
                <span className="mt-2 text-base leading-normal">
                  Select Images
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            type="submit"
            className="bg-green-600 hover:bg-green-700"
            disabled={loading}>
            {loading ? "Updating..." : "Update Event"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
