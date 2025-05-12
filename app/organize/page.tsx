"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, CreditCard, TrendingUp, CheckCircle } from "lucide-react"

export default function OrganizePage() {
  const auth = useAuth()
  const user = auth?.user
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleCreateEvent = () => {
    setLoading(true)
    if (!user) {
      router.push("/signup?redirect=/organize/create")
    } else {
      router.push("/organize/create")
    }
  }

  const benefits = [
    {
      icon: <Users className="h-10 w-10 text-green-600" />,
      title: "Reach More Travelers",
      description: "Connect with adventure seekers across Kenya looking for their next experience.",
    },
    {
      icon: <Calendar className="h-10 w-10 text-green-600" />,
      title: "Easy Scheduling",
      description: "Create and manage your events with our intuitive scheduling tools.",
    },
    {
      icon: <CreditCard className="h-10 w-10 text-green-600" />,
      title: "Secure Payments",
      description: "Accept deposits or full payments through our secure payment system.",
    },
    {
      icon: <TrendingUp className="h-10 w-10 text-green-600" />,
      title: "Grow Your Business",
      description: "Expand your customer base and increase bookings for your travel experiences.",
    },
  ]

  const steps = [
    {
      number: "1",
      title: "Sign Up as an Organizer",
      description: "Create an account or switch your existing account to organizer mode.",
    },
    {
      number: "2",
      title: "Create Your First Event",
      description: "Add details, photos, itinerary, and set your pricing and available spaces.",
    },
    {
      number: "3",
      title: "Manage Bookings",
      description: "Track reservations, confirm payments, and communicate with travelers.",
    },
    {
      number: "4",
      title: "Host Amazing Experiences",
      description: "Lead your events and create unforgettable memories for your guests.",
    },
  ]

  const testimonials = [
    {
      quote:
        "Kenya Trails has transformed how I run my hiking tours. I've seen a 40% increase in bookings since joining the platform.",
      author: "David Kimani",
      role: "Mountain Guide, Nairobi",
    },
    {
      quote:
        "The booking management system saves me hours of administrative work. I can focus on creating amazing safari experiences instead.",
      author: "Sarah Omondi",
      role: "Safari Operator, Maasai Mara",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="relative py-20 md:py-32 overflow-hidden rounded-3xl my-8">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/placeholder.svg?height=800&width=1600"
            alt="Organizing Events"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Become an <span className="text-green-400">Event Organizer</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
            Share your expertise and passion for Kenya's landscapes by organizing and hosting your own travel events.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-lg"
              onClick={handleCreateEvent}
              disabled={loading}
            >
              {loading ? "Loading..." : "Create Your First Event"}
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-green-800 text-lg"
            >
              <Link href="#how-it-works">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Organize with Kenya Trails?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join our community of passionate guides and event organizers to share your love for Kenya's natural beauty.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-4">{benefit.icon}</div>
                <CardTitle className="text-xl">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-gray-600">
                <p>{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-gray-50 rounded-xl">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Getting started as an organizer is simple. Follow these steps to begin hosting your own events.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Powerful Tools for Organizers</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our platform provides everything you need to create, manage, and grow your travel events.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-green-600" />
                Event Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                  <span>Create detailed event listings with itineraries</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                  <span>Set custom pricing and deposit options</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                  <span>Upload multiple photos to showcase your event</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                  <span>Specify requirements and what's included</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-600" />
                Booking Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                  <span>Track bookings and available spaces</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                  <span>Manage partial and full payments</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                  <span>View traveler details and requirements</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                  <span>Send updates and notifications to attendees</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                Business Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                  <span>Analytics to track performance and revenue</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                  <span>Featured placement for popular events</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                  <span>Collect reviews to build your reputation</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                  <span>Repeat booking incentives for customers</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-green-50 rounded-xl">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Organizers Say</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hear from guides and event organizers who are already using Kenya Trails.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="pt-6">
                  <div className="mb-4 text-green-600">
                    <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                  </div>
                  <p className="text-gray-700 mb-6 italic">{testimonial.quote}</p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <Card className="bg-green-600 text-white border-none">
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Share Your Expertise?</h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto">
                Start organizing your own travel and hiking events today and join our community of passionate guides.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-green-700 hover:bg-gray-100"
                  onClick={handleCreateEvent}
                >
                  Create Your First Event
                </Button>
                {!user && (
                  <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-green-700">
                    <Link href="/signup?userType=organizer">Sign Up as Organizer</Link>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get answers to common questions about organizing events on Kenya Trails.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How much does it cost to list an event?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                It's free to create and list your events on Kenya Trails. We charge a small commission (10%) only when
                you receive a booking.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How do I receive payments?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Payments are processed through our platform and transferred to your preferred payment method (M-Pesa or
                bank account) within 48 hours of the booking.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What if I need to cancel an event?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                You can cancel an event up to 7 days before the start date. Cancellations closer to the event date may
                affect your organizer rating.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Do I need special qualifications?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                While not always required, we recommend having relevant certifications for your activity type. For
                certain activities like mountain climbing, proper certification is mandatory.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
