"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { events } from "@/app/dashboard/page";

export default function FeaturedEvents() {
  const [events, setEvents] = useState<events[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const now = new Date();
        const eventsRef = collection(db, "events");
        const q = query(
          eventsRef,
          where("date", ">=", now),
          where("isPromoted", "==", true),
          orderBy("date", "asc")
        );

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
  }, []);

  const displayEvents = events;

  const formatDate = (date: any) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="md:text-3xl text-sm font-bold">Featured Adventures</h2>
          <Button
            asChild
            variant="ghost"
            className="text-green-600 hover:text-green-700">
            <Link href="/events" className="flex items-center">
              View all <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
          {displayEvents.map((event) => {
            const isTest = event.data_mode === "test";

            return (
              <Card
                key={event.id}
                className={`relative overflow-hidden hover:shadow-lg transition-shadow ${
                  isTest ? "" : ""
                }`}>
                {isTest && (
                  <div className="absolute top-0 left-0 w-full bg-yellow-400 text-black text-center py-1 z-10">
                    This is a test event
                  </div>
                )}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={
                      event.imageUrl || "/placeholder.svg?height=300&width=500"
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
                  <div className="flex text-xs  items-center text-gray-500 md:text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    {event.location}
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-center text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="md:text-lg text-sm">
                      {" "}
                      {formatDate(event.date)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-700">
                      <Users className="h-4 w-4 mr-2" />
                      <span className="md:text-lg text-sm">
                        {event.availableSpaces} / {event.totalSpaces} spots left
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
