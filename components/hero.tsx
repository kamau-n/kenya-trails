"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronRight, Map, Users, Calendar } from "lucide-react";

export default function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const images = [
    {
      url: "/bg.jpg",
      location: "Mount Kenya",
      description: "Hike through alpine landscapes",
    },
    {
      url: "/masai_mara.jpg",
      location: "Masai Mara",
      description: "Witness the great migration",
    },
    {
      url: "/diani-beach.avif",
      location: "Diani Beach",
      description: "Relax on pristine white sands",
    },
  ];

  // Image carousel effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        setIsVisible(true);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative py-16 md:py-24 lg:py-32 overflow-hidden rounded-lg my-4 transition-all duration-1000">
      {/* Background Image with fade effect */}
      <div
        className="absolute inset-0 z-0 transition-opacity duration-1000"
        style={{ opacity: isVisible ? 1 : 0 }}>
        <img
          src={images[currentImageIndex].url}
          alt={images[currentImageIndex].location}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 flex flex-col items-start text-left md:max-w-4xl">
        <div className="inline-block bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium mb-4 animate-pulse">
          Limited spots available
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 transition-all">
          Discover Kenya's <span className="text-green-400">Wild</span> Beauty
        </h1>

        <div className="flex items-center text-green-300 mb-2">
          <span className="text-lg md:text-xl font-medium">
            {images[currentImageIndex].location}
          </span>
          <span className="mx-2">•</span>
          <span className="text-gray-300 text-base">
            {images[currentImageIndex].description}
          </span>
        </div>

        <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl">
          Join guided group adventures to Kenya's most breathtaking
          destinations. Connect with fellow travelers, experience authentic
          wildlife encounters, and create memories that last a lifetime.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <Button
            asChild
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-lg font-medium px-8 py-6 flex items-center gap-2">
            <Link href="/events">
              Explore Adventures
              <ChevronRight className="ml-1 h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white text-black hover:bg-white hover:text-green-800 text-lg font-medium px-8 py-6">
            <Link href="/organize">Organize Your Trip</Link>
          </Button>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
          <div className="flex items-center bg-white bg-opacity-10 backdrop-blur-sm p-3 rounded-lg">
            <Calendar className="text-green-400 mr-3 h-6 w-6" />
            <span className="text-white text-sm">Scheduled Weekly Tours</span>
          </div>
          <div className="flex items-center bg-white bg-opacity-10 backdrop-blur-sm p-3 rounded-lg">
            <Map className="text-green-400 mr-3 h-6 w-6" />
            <span className="text-white text-sm">Expert Local Guides</span>
          </div>
          <div className="flex items-center bg-white bg-opacity-10 backdrop-blur-sm p-3 rounded-lg">
            <Users className="text-green-400 mr-3 h-6 w-6" />
            <span className="text-white text-sm">Small Group Experiences</span>
          </div>
        </div>
      </div>
    </div>
  );
}
