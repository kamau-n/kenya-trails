"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  MapPin,
  Clock,
  User,
  Users,
  CreditCard,
  Check,
  Link as LinkIcon,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import BookingForm from "@/components/booking-form";
import { event } from "@/app/types/types";

export default function EventPage({ params }) {
  const [copied, setCopied] = useState(false);
  const { id } = params;
  const [event, setEvent] = useState<Partial<event>>();
  const [organizer, setOrganizer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [currentUrl, setCurrentUrl] = useState("");
  const { user } = useAuth();
  const router = useRouter();

  // Set current URL after component mounts (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);

  // Create share links based on current URL and event data
  const getShareLinks = () => {
    if (!event || !currentUrl) return {};

    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedTitle = encodeURIComponent(event.title || "Amazing Event");
    const encodedDescription = encodeURIComponent(
      event.description || "Join us for this incredible event!"
    );

    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      youtube: `https://www.youtube.com/results?search_query=${encodedTitle}`,
      discord: `https://discord.com/channels/@me`,
    };
  };

  const handleShare = (platform) => {
    const shareLinks = getShareLinks();

    if (platform === "discord") {
      // For Discord, we'll copy the link since there's no direct share URL
      copyToClipboard();
      alert("Link copied! You can now paste it in Discord.");
      return;
    }

    if (shareLinks[platform]) {
      window.open(shareLinks[platform], "_blank", "width=600,height=400");
    }
  };

  const copyToClipboard = async () => {
    if (!currentUrl) return;

    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = currentUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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

  const formatDate = (date: any) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleBookNow = (eventId) => {
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
      {showBookingForm && (
        <BookingForm
          open={() => {}}
          event={event}
          onSuccess={handleBookingSuccess}
          onClose={() => {
            setShowBookingForm(false);
          }}
        />
      )}
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
          ) : (
            //  showBookingForm ? (
            //   <BookingForm
            //     event={event}
            //     onClose={() => setShowBookingForm(false)}
            //     onSuccess={handleBookingSuccess}
            //   />
            // )
            //  :
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden sticky top-20">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      KSh {event.price?.toLocaleString()}
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
                      <p>{event.paymentMethods?.join(", ")}</p>
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
                    Minimum deposit: KSh {event.depositAmount?.toLocaleString()}
                  </p>
                )}
              </div>

              <div className="p-6 bg-white rounded-lg border">
                <h3 className="font-semibold mb-4 text-lg">Share this event</h3>
                <div className="flex flex-wrap gap-3">
                  {/* Facebook */}
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full hover:bg-blue-50 hover:border-blue-300"
                    onClick={() => handleShare("facebook")}
                    title="Share on Facebook">
                    <svg
                      className="h-4 w-4 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.47h3.047v-2.642c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385c5.737-.9 10.125-5.864 10.125-11.854z" />
                    </svg>
                  </Button>

                  {/* Twitter */}
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full hover:bg-blue-50 hover:border-blue-400"
                    onClick={() => handleShare("twitter")}
                    title="Share on Twitter">
                    <svg
                      className="h-4 w-4 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </Button>

                  {/* YouTube */}
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full hover:bg-red-50 hover:border-red-300"
                    onClick={() => handleShare("youtube")}
                    title="Search on YouTube">
                    <svg
                      className="h-4 w-4 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 24 24">
                      <path d="M21.582 6.186a2.914 2.914 0 00-2.046-2.046C17.788 3.6 12 3.6 12 3.6s-5.788 0-7.536.54a2.914 2.914 0 00-2.046 2.046C2.4 7.934 2.4 12 2.4 12s0 4.066.54 5.814a2.914 2.914 0 002.046 2.046c1.748.54 7.536.54 7.536.54s5.788 0 7.536-.54a2.914 2.914 0 002.046-2.046C22.2 16.066 22.2 12 22.2 12s0-4.066-.618-5.814zM9.6 15.6V8.4l6.6 3.6-6.6 3.6z" />
                    </svg>
                  </Button>

                  {/* Discord */}
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full hover:bg-indigo-50 hover:border-indigo-300"
                    onClick={() => handleShare("discord")}
                    title="Share on Discord">
                    <svg
                      className="h-4 w-4 text-indigo-600"
                      fill="currentColor"
                      viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.211.375-.445.865-.608 1.249a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.249.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.197.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                  </Button>

                  {/* Copy Link Button */}
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full hover:bg-gray-50 hover:border-gray-300"
                    onClick={copyToClipboard}
                    title="Copy link">
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <LinkIcon className="h-4 w-4 text-gray-600" />
                    )}
                  </Button>
                </div>

                {copied && (
                  <div className="mt-3 text-sm text-green-600 font-medium">
                    Link copied to clipboard!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
