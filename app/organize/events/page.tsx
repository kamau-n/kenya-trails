"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, MapPin, Users, Search, Plus } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { event } from "@/app/types/types";

export default function OrganizerEventsPage() {
  const auth = useAuth();
  const user = auth?.user;
  const authLoading = auth?.loading || false;
  const router = useRouter();

  const [events, setEvents] = useState<event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login?redirect=/organize/events");
      return;
    }

    if (user.userType !== "organizer") {
      router.push("/organize");
      return;
    }

    const fetchEvents = async () => {
      console.log("this is the user who has organized the events", user);
      try {
        const eventsQuery = query(
          collection(db, "events"),
          where("organizerId", "==", user.uid),
          orderBy("date", sortBy.endsWith("desc") ? "desc" : "asc")
        );

        const eventsSnapshot = await getDocs(eventsQuery);
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

    fetchEvents();
  }, [user, authLoading, router, sortBy]);

  // Placeholder events for initial render

  const displayEvents = events;

  // Filter events based on search term and status
  const filteredEvents = displayEvents.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());

    const now = new Date();
    const eventStatus = event.date > now ? "upcoming" : "completed";

    const matchesStatus =
      statusFilter === "all" || eventStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Router will redirect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">My Events</h1>

        <Button asChild className="bg-green-600 hover:bg-green-700">
          <Link href="/organize/create" className="flex items-center">
            <Plus className="mr-2 h-4 w-4" /> Create New Event
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p>Loading your events...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600 mb-4">
            No events found matching your criteria.
          </p>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/organize/create">Create New Event</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const isUpcoming = new Date(event.date) > new Date();

            return (
              <Card
                key={event.id}
                className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={
                      event.imageUrl || "/placeholder.svg?height=300&width=500"
                    }
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge
                    className={`absolute top-3 right-3 ${
                      isUpcoming ? "bg-green-600" : "bg-gray-600"
                    }`}>
                    {isUpcoming ? "Upcoming" : "Completed"}
                  </Badge>
                </div>
                <CardHeader className="pb-2">
                  <h3 className="text-xl font-bold">{event.title}</h3>
                  <div className="flex items-center text-gray-500 text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    {event.location}
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-center text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-700">
                      <Users className="h-4 w-4 mr-2" />
                      <span>
                        {event.availableSpaces} / {event.totalSpaces} spots left
                      </span>
                    </div>
                    <div className="font-bold text-green-600">
                      KSh {event.price?.toLocaleString()}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-between">
                  <Button asChild variant="outline">
                    <Link href={`/events/${event.id}`}>View</Link>
                  </Button>

                  <Button asChild className="bg-green-600 hover:bg-green-700">
                    <Link href={`/organize/events/${event.id}/promote`}>
                      Promote Event
                    </Link>
                  </Button>

                  <Button asChild>
                    <Link href={`/organize/events/${event.id}/bookings`}>
                      Manage Bookings
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
