"use client";

import { useState } from "react";
import { Shield, Users, Map, ChevronRight } from "lucide-react";

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
      description:
        "Born in Nairobi with over 15 years of experience guiding across Kenya's diverse landscapes.",
    },
    {
      name: "David Omondi",
      role: "Wildlife Expert",
      description:
        "Former park ranger with unparalleled knowledge of Kenya's ecosystems and wildlife conservation.",
    },
    {
      name: "Leila Ndegwa",
      role: "Community Coordinator",
      description:
        "Works with local communities to ensure responsible tourism that benefits local economies.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-green-600 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              Our Passion for{" "}
              <span className="text-green-200">Kenya's Wonders</span>
            </h1>
            <p className="text-lg md:text-xl text-green-100 mb-8">
              Founded in 2015 by a team of Kenyan conservationists and adventure
              enthusiasts, we've guided thousands of travelers through the
              breathtaking landscapes we call home.
            </p>
            <button className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center mx-auto">
              Join an Adventure
              <ChevronRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      {/* <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white p-4 md:p-6 rounded-xl shadow-sm text-center">
              <p className="text-2xl md:text-3xl font-bold text-green-600">
                {stat.number}
              </p>
              <p className="text-gray-600 text-sm md:text-base font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div> */}

      {/* Tabbed Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b overflow-x-auto">
            <button
              className={`flex-1 py-3 px-4 text-sm md:text-base font-medium whitespace-nowrap ${
                activeTab === "story"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("story")}>
              Our Story
            </button>
            <button
              className={`flex-1 py-3 px-4 text-sm md:text-base font-medium whitespace-nowrap ${
                activeTab === "mission"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("mission")}>
              Mission & Values
            </button>
            <button
              className={`flex-1 py-3 px-4 text-sm md:text-base font-medium whitespace-nowrap ${
                activeTab === "team"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("team")}>
              Our Team
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4 md:p-8">
            {activeTab === "story" && (
              <div className="space-y-6">
                <div className="text-center md:text-left">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                    From Local Explorers to Adventure Specialists
                  </h2>
                  <div className="space-y-4 text-gray-600">
                    <p>
                      Our journey began when three friends with a shared passion
                      for Kenya's natural beauty decided to showcase their
                      homeland to the world in a sustainable, authentic way.
                    </p>
                    <p>
                      What started as weekend hiking trips with small groups of
                      international travelers quickly grew into a full service
                      adventure company. Today, we operate across all of Kenya's
                      major national parks and natural wonders.
                    </p>
                    <p>
                      Our deep local knowledge, commitment to conservation, and
                      passion for creating meaningful connections between people
                      and nature sets us apart from traditional tourism
                      operators.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "mission" && (
              <div className="space-y-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center">
                  Our Guiding Principles
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 p-6 rounded-xl text-center">
                    <Map className="h-10 w-10 text-green-600 mb-4 mx-auto" />
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      Authentic Experiences
                    </h3>
                    <p className="text-gray-600 text-sm">
                      We create journeys that go beyond typical tourist routes,
                      offering genuine connections with Kenya's landscapes,
                      wildlife, and cultures.
                    </p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-xl text-center">
                    <Shield className="h-10 w-10 text-green-600 mb-4 mx-auto" />
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      Sustainable Tourism
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Every adventure supports conservation efforts and local
                      communities, ensuring the places we love will thrive for
                      generations to come.
                    </p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-xl text-center">
                    <Users className="h-10 w-10 text-green-600 mb-4 mx-auto" />
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      Community Connection
                    </h3>
                    <p className="text-gray-600 text-sm">
                      We believe that shared experiences in nature create
                      meaningful bonds between travelers and foster a global
                      community of conservation advocates.
                    </p>
                  </div>
                </div>
                <div className="bg-green-50 border-l-4 border-green-600 p-4 md:p-6 rounded-r-xl">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    Our Promise
                  </h3>
                  <p className="text-gray-700 text-sm md:text-base">
                    For every adventure booked, we contribute 5% of proceeds to
                    local conservation initiatives and community development
                    projects across Kenya. To date, we've helped protect over
                    5,000 acres of critical wildlife habitat.
                  </p>
                </div>
              </div>
            )}

            {/* {activeTab === "team" && (
              <div className="space-y-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center">
                  Meet Our Adventure Leaders
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {teamMembers.map((member, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-xl p-6 text-center">
                      <div className="w-20 h-20 bg-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <span className="text-white font-bold text-xl">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {member.name}
                      </h3>
                      <p className="text-green-600 font-medium mb-3 text-sm">
                        {member.role}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {member.description}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <p className="text-gray-600 mb-4 text-sm md:text-base">
                    Our full team includes 15+ certified guides, conservation
                    specialists, and hospitality experts.
                  </p>
                </div>
              </div>
            )} */}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="bg-green-600 rounded-xl p-6 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready for Your Kenyan Adventure?
          </h2>
          <p className="text-green-100 mb-6 max-w-2xl mx-auto">
            Browse our upcoming group expeditions or contact us to create a
            custom adventure for your friends, family, or organization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors">
              View Upcoming Trips
            </button>
            <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors">
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
