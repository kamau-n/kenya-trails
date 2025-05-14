"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { Search, Edit, Trash2, Download } from "lucide-react";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const eventsSnapshot = await getDocs(collection(db, "events"));
      const eventsData = eventsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date(),
      }));
      setEvents(eventsData);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteDoc(doc(db, "events", eventId));
        fetchEvents();
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    }
  };

  const downloadEvents = () => {
    // Convert events to CSV format
    const headers = [
      "Title",
      "Location",
      "Date",
      "Price",
      "Available Spaces",
      "Total Spaces",
      "Status",
    ];
    const csvData = events.map((event) => [
      event.title,
      event.location,
      new Date(event.date).toLocaleDateString(),
      event.price,
      event.availableSpaces,
      event.totalSpaces,
      new Date(event.date) > new Date() ? "Upcoming" : "Past",
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `events-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const filteredEvents = events.filter(
    (event) =>
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Events</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={downloadEvents}
            variant="outline"
            className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Events
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Spaces</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.map((event) => (
              <TableRow key={event.id}>
                <TableCell>{event.title}</TableCell>
                <TableCell>{event.location}</TableCell>
                <TableCell>{formatDate(event.date)}</TableCell>
                <TableCell>KSh {event.price?.toLocaleString()}</TableCell>
                <TableCell>
                  {event.availableSpaces} / {event.totalSpaces}
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      new Date(event.date) > new Date()
                        ? "bg-green-600"
                        : "bg-gray-600"
                    }>
                    {new Date(event.date) > new Date() ? "Upcoming" : "Past"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/events/${event.id}/edit`)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteEvent(event.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
