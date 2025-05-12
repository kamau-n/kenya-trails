"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore"

export default function FeaturedEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const now = new Date()
        const eventsRef = collection(db, "events")
        const q = query(eventsRef, where("date", ">=", now), orderBy("date", "asc"), limit(3))

        const querySnapshot = await getDocs(q)
        const eventsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate() || new Date(),
        }))

        setEvents(eventsData)
      } catch (error) {
        console.error("Error fetching events:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  // Placeholder events for initial render
  const placeholderEvents = [
    {
      id: "1",
      title: "Mt. Kenya Hiking Adventure",
      location: "Mt. Kenya National Park",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      price: 15000,
      totalSpaces: 20,
      availableSpaces: 8,
      category: "Hiking",
      imageUrl: "/placeholder.svg?height=300&width=500",
    },
    {
      id: "2",
      title: "Maasai Mara Safari Weekend",
      location: "Maasai Mara National Reserve",
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      price: 25000,
      totalSpaces: 15,
      availableSpaces: 5,
      category: "Safari",
      imageUrl: "/placeholder.svg?height=300&width=500",
    },
    {
      id: "3",
      title: "Diani Beach Getaway",
      location: "Diani Beach, Mombasa",
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      price: 18000,
      totalSpaces: 25,
      availableSpaces: 12,
      category: "Beach",
      imageUrl: "/placeholder.svg?height=300&width=500",
    },
  ]

  const displayEvents = events.length > 0 ? events : placeholderEvents

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Featured Adventures</h2>
          <Button asChild variant="ghost" className="text-green-600 hover:text-green-700">
            <Link href="/events" className="flex items-center">
              View all <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={event.imageUrl || "/placeholder.svg?height=300&width=500"}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-3 right-3 bg-green-600">{event.category}</Badge>
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
                  <div className="font-bold text-green-600">KSh {event.price.toLocaleString()}</div>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                  <Link href={`/events/${event.id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
