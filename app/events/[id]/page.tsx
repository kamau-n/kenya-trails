"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Clock, User, Users, CreditCard } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import BookingForm from "@/components/booking-form";
import { event } from "@/app/types/types";

export default function EventPage({ params }) {
  const { id } = params;
  const [event, setEvent] = useState<event>();
  const [organizer, setOrganizer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const eventDoc = await getDoc(doc(db, "events", id));

        if (eventDoc.exists()) {
          const eventData = {
            id: eventDoc.id,
            ...eventDoc.data(),
            date: eventDoc.data().date?.toDate() || new Date(),
          };
          setEvent(eventData);

          // Fetch organizer data
          if (eventData.organizerId) {
            const organizerDoc = await getDoc(
              doc(db, "users", eventData.organizerId)
            );
            if (organizerDoc.exists()) {
              setOrganizer(organizerDoc.data());
            }
          }
        } else {
          // Event not found, use placeholder data
          // setEvent(placeholderEvent);
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        // Use placeholder data on error
        // setEvent(placeholderEvent);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [id]);

  // Placeholder event for initial render or if event not found

  const formatDate = (date: any) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleBookNow = () => {
    if (!user) {
      router.push("/login?redirect=" + encodeURIComponent(`/events/${id}`));
      return;
    }

    setShowBookingForm(true);
  };

  const handleBookingSuccess = (bookingId: any) => {
    setBookingId(bookingId);
    setBookingSuccess(true);
    setShowBookingForm(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Event not found</h1>
        <p className="mb-8">
          The event you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/events">Browse Events</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Event Header */}
      <div className="relative h-80 md:h-96 rounded-xl overflow-hidden mb-8">
        <img
          src={event.imageUrl || "/placeholder.svg?height=600&width=1200"}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
          <div className="p-6 md:p-8 w-full">
            <Badge className="mb-4 bg-green-600">{event.category}</Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {event.title}
            </h1>
            <div className="flex flex-wrap gap-4 text-white">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                <span>{event.duration}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="details">
            <TabsList className="mb-6">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  About This Adventure
                </h2>
                <p className="text-gray-700">{event.description}</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Meeting Point</h3>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <p>{event.meetingPoint}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    What's Included
                  </h3>
                  <ul className="space-y-2">
                    {event.included?.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    What's Not Included
                  </h3>
                  <ul className="space-y-2">
                    {event.notIncluded?.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-500 mr-2">✗</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div
                onClick={() => {
                  console.log("this is the organizer", organizer);
                  router.push(`/organizer/${event.organizerId}`);
                }}>
                <h3 className="text-xl font-semibold mb-3">Organizer</h3>
                <div className="flex items-start">
                  <User className="h-5 w-5 text-gray-600 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">{event.organizerName}</p>
                    {organizer && organizer.bio && (
                      <p className="text-gray-600 mt-1">{organizer.bio}</p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="itinerary" className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Itinerary</h2>
              <div className="space-y-6">
                {event.itinerary?.map((day, index) => (
                  <div
                    key={index}
                    className="border-l-2 border-green-600 pl-4 pb-6">
                    <h3 className="text-xl font-semibold mb-2">
                      {day.day}: {day.title}
                    </h3>
                    <p className="text-gray-700">{day.description}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="requirements" className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Requirements</h2>
              <div>
                <h3 className="text-xl font-semibold mb-3">What You Need</h3>
                <ul className="space-y-2">
                  {event.requirements?.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Difficulty Level</h3>
                <p className="flex items-center">
                  <span
                    className={`inline-block w-3 h-3 rounded-full mr-2 ${
                      event.difficulty === "Easy"
                        ? "bg-green-500"
                        : event.difficulty === "Moderate"
                        ? "bg-yellow-500"
                        : event.difficulty === "Challenging"
                        ? "bg-orange-500"
                        : "bg-red-500"
                    }`}></span>
                  <span>{event.difficulty}</span>
                </p>
              </div>
            </TabsContent>

            <TabsContent value="gallery" className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Gallery</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {event.images?.map((image, index) => (
                  <div key={index} className="rounded-lg overflow-hidden">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${event.title} - Image ${index + 1}`}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {bookingSuccess ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-green-800 mb-2">
                Booking Confirmed!
              </h3>
              <p className="text-green-700 mb-4">
                Your booking has been successfully confirmed.
              </p>
              <p className="text-gray-600 mb-4">Booking ID: {bookingId}</p>
              <Button
                asChild
                className="w-full bg-green-600 hover:bg-green-700">
                <Link href="/dashboard">View My Bookings</Link>
              </Button>
            </div>
          ) : showBookingForm ? (
            <BookingForm
              event={event}
              onClose={() => setShowBookingForm(false)}
              onSuccess={handleBookingSuccess}
            />
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden sticky top-20">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      KSh {event.price.toLocaleString()}
                    </p>
                    <p className="text-gray-600">per person</p>
                  </div>
                  <Badge
                    className={
                      event.availableSpaces > 0 ? "bg-green-600" : "bg-red-600"
                    }>
                    {event.availableSpaces > 0 ? "Available" : "Sold Out"}
                  </Badge>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center text-gray-700">
                    <Calendar className="h-5 w-5 mr-2" />
                    <div>
                      <p className="font-medium">Date</p>
                      <p>{formatDate(event.date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <Clock className="h-5 w-5 mr-2" />
                    <div>
                      <p className="font-medium">Duration</p>
                      <p>{event.duration}</p>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <Users className="h-5 w-5 mr-2" />
                    <div>
                      <p className="font-medium">Availability</p>
                      <p>
                        {event.availableSpaces} spots left out of{" "}
                        {event.totalSpaces}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <CreditCard className="h-5 w-5 mr-2" />
                    <div>
                      <p className="font-medium">Payment Options</p>
                      <p>{event.paymentMethods.join(", ")}</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleBookNow}
                  disabled={event.availableSpaces <= 0}
                  className="w-full bg-green-600 hover:bg-green-700">
                  {event.availableSpaces > 0 ? "Book Now" : "Sold Out"}
                </Button>

                {event.depositAmount > 0 && (
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    Minimum deposit: KSh {event.depositAmount.toLocaleString()}
                  </p>
                )}
              </div>

              <div className="p-6">
                <h3 className="font-semibold mb-2">Share this event</h3>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full">
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.47h3.047v-2.642c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385c5.737-.9 10.125-5.864 10.125-11.854z" />
                    </svg>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full">
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full">
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24">
                      <path d="M21.582 6.186a2.914 2.914 0 00-2.046-2.046C17.788 3.6 12 3.6 12 3.6s-5.788 0-7.536.54a2.914 2.914 0 00-2.046 2.046C2.4 7.934 2.4 12 2.4 12s0 4.066.54 5.814a2.914 2.914 0 002.046 2.046c1.748.54 7.536.54 7.536.54s5.788 0 7.536-.54a2.914 2.914 0 002.046-2.046C22.2 16.066 22.2 12 22.2 12s0-4.066-.618-5.814zM9.6 15.6V8.4l6.6 3.6-6.6 3.6z" />
                    </svg>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full">
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24">
                      <path d="M7.17 22c-.69 0-1.37-.132-2-.39-4.2-1.69-4.18-7.14-4.18-7.14v-6.9c0-.24.15-.45.37-.53l.22-.09c.51-.19 1.03-.35 1.57-.48C4.93 4.76 7.26 3.97 12 3.97c4.26 0 6.57.61 8.35 2.16.54.14 1.06.3 1.57.48l.22.09c.23.09.38.29.38.53v6.9s.02 5.45-4.18 7.13c-.63.26-1.31.39-2 .39-1.42 0-2.78-.58-3.77-1.59l-.7-.71-.7.71c-1 1.02-2.36 1.59-3.77 1.59zm-3.17-14.32v6.8c0 .09.01 4.14 2.96 5.41.48.2 1 .3 1.52.3.87 0 1.7-.35 2.32-.95 1.04-1.01 2.7-1.01 3.74 0 .62.6 1.45.95 2.32.95.52 0 1.04-.1 1.52-.3 2.95-1.27 2.96-5.32 2.96-5.41v-6.8c-.47-.17-.97-.33-1.5-.47C17.23 5.66 15.21 5 12 5c-3.21 0-5.23.66-6.83 2.22-.53.13-1.03.29-1.5.46z" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
