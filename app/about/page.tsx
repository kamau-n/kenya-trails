"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Shield, Users, Map, Star, ChevronRight } from "lucide-react";

export default function About() {
  const [activeTab, setActiveTab] = useState("story");

  const stats = [
    { number: "300+", label: "Guided Adventures" },
    { number: "5000+", label: "Happy Explorers" },
    { number: "25+", label: "Conservation Projects" },
    { number: "12", label: "National Parks" },
  ];

  const teamMembers = [
    {
      name: "Sarah Kimani",
      role: "Founder & Lead Guide",
      image: "/team-sarah.jpg",
      description:
        "Born in Nairobi with over 15 years of experience guiding across Kenya's diverse landscapes.",
    },
    {
      name: "David Omondi",
      role: "Wildlife Expert",
      image: "/team-david.jpg",
      description:
        "Former park ranger with unparalleled knowledge of Kenya's ecosystems and wildlife conservation.",
    },
    {
      name: "Leila Ndegwa",
      role: "Community Coordinator",
      image: "/team-leila.jpg",
      description:
        "Works with local communities to ensure responsible tourism that benefits local economies.",
    },
  ];

  return (
    <div className="bg-gray-50 py-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl my-8 mx-4 md:mx-8 lg:mx-auto lg:max-w-6xl">
        <div className="absolute inset-0 z-0">
          <img
            src="/about-hero.jpg"
            alt="Kenya Landscape"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/40"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Our Passion for{" "}
              <span className="text-green-400">Kenya's Wonders</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8">
              Founded in 2015 by a team of Kenyan conservationists and adventure
              enthusiasts, we've guided thousands of travelers through the
              breathtaking landscapes we call home.
            </p>
            <div className="flex space-x-4">
              <Button
                asChild
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-lg flex items-center">
                <Link href="/events">
                  Join an Adventure
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-green-800 text-lg">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-md">
              <p className="text-3xl md:text-4xl font-bold text-green-600">
                {stat.number}
              </p>
              <p className="text-gray-600 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabbed Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b">
            <button
              className={`flex-1 py-4 px-6 text-lg font-medium ${
                activeTab === "story"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("story")}>
              Our Story
            </button>
            <button
              className={`flex-1 py-4 px-6 text-lg font-medium ${
                activeTab === "mission"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("mission")}>
              Mission & Values
            </button>
            <button
              className={`flex-1 py-4 px-6 text-lg font-medium ${
                activeTab === "team"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("team")}>
              Our Team
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-10">
            {activeTab === "story" && (
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    From Local Explorers to Adventure Specialists
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Our journey began when three friends with a shared passion
                    for Kenya's natural beauty decided to showcase their
                    homeland to the world in a sustainable, authentic way.
                  </p>
                  <p className="text-gray-600 mb-4">
                    What started as weekend hiking trips with small groups of
                    international travelers quickly grew into a full service
                    adventure company. Today, we operate across all of Kenya's
                    major national parks and natural wonders.
                  </p>
                  <p className="text-gray-600">
                    Our deep local knowledge, commitment to conservation, and
                    passion for creating meaningful connections between people
                    and nature sets us apart from traditional tourism operators.
                  </p>
                </div>
                <div className="rounded-xl overflow-hidden shadow-md">
                  <img
                    src="/about-story.jpg"
                    alt="Company Founders"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {activeTab === "mission" && (
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                  Our Guiding Principles
                </h2>
                <div className="grid md:grid-cols-3 gap-8 mb-10">
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <Map className="h-12 w-12 text-green-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Authentic Experiences
                    </h3>
                    <p className="text-gray-600">
                      We create journeys that go beyond typical tourist routes,
                      offering genuine connections with Kenya's landscapes,
                      wildlife, and cultures.
                    </p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <Shield className="h-12 w-12 text-green-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Sustainable Tourism
                    </h3>
                    <p className="text-gray-600">
                      Every adventure supports conservation efforts and local
                      communities, ensuring the places we love will thrive for
                      generations to come.
                    </p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <Users className="h-12 w-12 text-green-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Community Connection
                    </h3>
                    <p className="text-gray-600">
                      We believe that shared experiences in nature create
                      meaningful bonds between travelers and foster a global
                      community of conservation advocates.
                    </p>
                  </div>
                </div>
                <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-r-xl">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Our Promise
                  </h3>
                  <p className="text-gray-700">
                    For every adventure booked, we contribute 5% of proceeds to
                    local conservation initiatives and community development
                    projects across Kenya. To date, we've helped protect over
                    5,000 acres of critical wildlife habitat.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "team" && (
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                  Meet Our Adventure Leaders
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                  {teamMembers.map((member, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-xl overflow-hidden shadow-sm">
                      <div className="h-64 overflow-hidden">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-800">
                          {member.name}
                        </h3>
                        <p className="text-green-600 font-medium mb-3">
                          {member.role}
                        </p>
                        <p className="text-gray-600">{member.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-10">
                  <p className="text-gray-600 mb-4">
                    Our full team includes 15+ certified guides, conservation
                    specialists, and hospitality experts.
                  </p>
                  <Button
                    variant="outline"
                    className="border-green-600 text-green-700 hover:bg-green-50">
                    <Link href="/team">Meet the Full Team</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Why Explorers Choose Us
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hear from adventurers who've experienced Kenya with our guides
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 italic mb-6">
                "The Maasai Mara safari exceeded all our expectations. Our
                guide's knowledge of wildlife behavior allowed us to witness the
                river crossing up close. Truly life-changing!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gray-200 mr-4"></div>
                <div>
                  <p className="font-medium text-gray-900">Michael T.</p>
                  <p className="text-sm text-gray-500">
                    Great Migration Safari, August 2024
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="bg-green-700 rounded-3xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-8 md:p-12 flex items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Ready for Your Kenyan Adventure?
                </h2>
                <p className="text-green-100 mb-6">
                  Browse our upcoming group expeditions or contact us to create
                  a custom adventure for your friends, family, or organization.
                </p>
                <div className="flex space-x-4">
                  <Button
                    asChild
                    className="bg-white text-green-700 hover:bg-green-50 text-lg">
                    <Link href="/events">View Upcoming Trips</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-white text-white hover:bg-green-600 text-lg">
                    <Link href="/contact">Contact Us</Link>
                  </Button>
                </div>
              </div>
            </div>
            <div className="hidden md:block relative h-full min-h-[300px]">
              <img
                src="/cta-image.jpg"
                alt="Kenya Safari"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
