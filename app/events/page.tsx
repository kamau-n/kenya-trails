"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  MapPin,
  Users,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";

export default function EventsPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    categoryParam || "all"
  );
  const [sortBy, setSortBy] = useState("date-asc");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const now = new Date();
        const eventsRef = collection(db, "events");
        let q = query(eventsRef, where("date", ">=", now));

        if (selectedCategory && selectedCategory !== "all") {
          q = query(q, where("category", "==", selectedCategory));
        }

        if (sortBy === "date-asc") {
          q = query(q, orderBy("date", "asc"));
        } else if (sortBy === "date-desc") {
          q = query(q, orderBy("date", "desc"));
        } else if (sortBy === "price-asc") {
          q = query(q, orderBy("price", "asc"));
        } else if (sortBy === "price-desc") {
          q = query(q, orderBy("price", "desc"));
        }

        const querySnapshot = await getDocs(q);
        const eventsData = querySnapshot.docs.map((doc) => ({
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
  }, [selectedCategory, sortBy]);

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "Hiking", label: "Hiking" },
    { value: "Safari", label: "Safari" },
    { value: "Beach", label: "Beach" },
    { value: "Camping", label: "Camping" },
    { value: "Cycling", label: "Cycling" },
    { value: "Gaming", label: "Gaming" },
    { value: "Nature", label: "Nature" },
  ];

  const sortOptions = [
    { value: "date-asc", label: "Date (Soonest first)" },
    { value: "date-desc", label: "Date (Latest first)" },
    { value: "price-asc", label: "Price (Low to high)" },
    { value: "price-desc", label: "Price (High to low)" },
  ];

  return (
    <div className="md:px-12 mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="md:text-3xl text-2xl font-bold">Explore Adventures</h1>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters - Desktop */}
        <div className="hidden md:block">
          <div className="bg-white p-6 rounded-lg border border-gray-200 sticky top-20">
            <h2 className="font-semibold text-lg mb-4">Filters</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Category
                </label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Sort by
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Filters - Mobile */}
        {showFilters && (
          <div className="md:hidden col-span-1 mb-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Category
                  </label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Sort by
                  </label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Events Grid */}
        <div className="col-span-1 lg:col-span-3">
          {loading ? (
            <div className="text-center py-12">Loading events...</div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600 mb-4">
                No events found matching your criteria.
              </p>
              <Button
                asChild
                variant="outline"
                className="text-green-600 border-green-600">
                <Link href="/events">Clear filters</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <Card
                  key={event.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow relative">
                  {/* Test mode banner */}
                  {event.data_mode === "test" && (
                    <div className="absolute top-0 left-0 w-full bg-yellow-500 text-white text-center text-xs font-semibold py-1 z-10">
                      THIS IS A TEST EVENT
                    </div>
                  )}

                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={
                        event.imageUrl ||
                        "/placeholder.svg?height=300&width=500"
                      }
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-3 right-3 bg-green-600">
                      {event.category}
                    </Badge>
                  </div>
                  <CardHeader className="pb-2">
                    <h3 className="md:text-xl text-lg font-bold">
                      {event.title}
                    </h3>
                    <div className="flex items-center text-gray-500  text-xs md:text-sm">
                      <MapPin className="h-4 w-4 mr-1" />
                      {event.location}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center text-gray-700 mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="md:text-lg text-sm">
                        {formatDate(event.date)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-700">
                        <Users className="h-4 w-4 mr-2" />
                        <span className="md:text-lg text-sm">
                          {event.availableSpaces} / {event.totalSpaces} spots
                          left
                        </span>
                      </div>
                      <div className="font-bold md:text-lg text-sm text-green-600">
                        KSh {event.price.toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      asChild
                      className="w-full bg-green-600 hover:bg-green-700">
                      <Link href={`/events/${event.id}`}>View Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
