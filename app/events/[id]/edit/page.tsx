"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function EditEventPage({ params }) {
  const { id } = params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventDoc = await getDoc(doc(db, "events", id));
        if (eventDoc.exists()) {
          setEvent({ id: eventDoc.id, ...eventDoc.data() });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const eventRef = doc(db, "events", id);
      await updateDoc(eventRef, {
        title: event.title,
        description: event.description,
        price: Number(event.price),
        location: event.location,
        // Add other fields as needed
      });

      router.push("/admin/events");
    } catch (error) {
      console.error("Error updating event:", error);
      setError("Failed to update event");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!event) {
    return <div>Event not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Event</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
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
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={event.description}
            onChange={(e) =>
              setEvent({ ...event, description: e.target.value })
            }
            required
          />
        </div>

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
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={event.location}
            onChange={(e) => setEvent({ ...event, location: e.target.value })}
            required
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" className="bg-green-600 hover:bg-green-700">
            Update Event
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
