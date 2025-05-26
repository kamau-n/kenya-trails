"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChevronRight,
  Map,
  Users,
  Calendar,
  Star,
  Play,
  Award,
  Globe,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function EnhancedHero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  const router = useRouter();

  const images = [
    {
      url: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1920&q=80",
      location: "Mount Kenya",
      description: "Hike through alpine landscapes",
      gradient: "from-emerald-900/90 via-black/70 to-transparent",
    },
    {
      url: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1920&q=80",
      location: "Masai Mara",
      description: "Witness the great migration",
      gradient: "from-orange-900/90 via-black/70 to-transparent",
    },
    {
      url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&q=80",
      location: "Diani Beach",
      description: "Relax on pristine white sands",
      gradient: "from-blue-900/90 via-black/70 to-transparent",
    },
  ];

  // Enhanced image carousel with smoother transitions
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMousePosition({ x: x - 0.5, y: y - 0.5 });
      }
    };

    const heroElement = heroRef.current;
    if (heroElement) {
      heroElement.addEventListener("mousemove", handleMouseMove);
      return () =>
        heroElement.removeEventListener("mousemove", handleMouseMove);
    }
  }, []);

  const stats = [
    { icon: Users, value: "2,500+", label: "Happy Travelers" },
    { icon: Award, value: "98%", label: "Satisfaction Rate" },
    { icon: Globe, value: "15+", label: "Destinations" },
  ];

  return (
    <div
      ref={heroRef}
      className="relative mt-8 py-3  flex items-center rounded overflow-hidden bg-black">
      {/* Dynamic Background with Parallax */}
      <div className="absolute inset-0 z-0">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentImageIndex
                ? "opacity-100 scale-100"
                : "opacity-0 scale-105"
            }`}
            style={{
              transform: `translate(${mousePosition.x * 10}px, ${
                mousePosition.y * 10
              }px)`,
            }}>
            <img
              src={image.url}
              alt={image.location}
              className="w-full h-full object-cover"
            />
            <div
              className={`absolute inset-0 bg-gradient-to-r ${image.gradient}`}></div>
          </div>
        ))}

        {/* Animated overlay particles */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            {/* Badge with glow effect */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500 rounded-full blur-md opacity-50 animate-pulse"></div>
                {/* <div className="relative bg-emerald-600 text-white px-6 py-2 rounded-full md:text-sm text-xs font-semibold flex items-center gap-2">
                  <Star className="w-4 h-4 fill-current" />
                  Limited Adventure Spots
                </div> */}
              </div>
            </div>

            {/* Main Headline with Text Animation */}
            <div className="space-y-4">
              <h1 className="md:text-5xl text-3xl lg:text-6xl font-black text-white leading-tight">
                Discover
                <span className="block bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent animate-pulse">
                  Wild Kenya
                </span>
              </h1>

              {/* Dynamic location display */}
              <div className="flex items-center text-emerald-300 md:text-xl text-sm font-medium">
                <Map className="w-5 h-5 mr-2" />
                <span className="transition-all duration-500">
                  {images[currentImageIndex].location}
                </span>
                <span className="mx-3 text-gray-400">•</span>
                <span className="text-gray-300">
                  {images[currentImageIndex].description}
                </span>
              </div>
            </div>

            {/* Enhanced Description */}
            <p className="md:text-xl text-sm text-gray-200 leading-relaxed max-w-xl">
              Join our guided group adventures to Kenya's most breathtaking
              destinations. Connect with fellow travelers, experience authentic
              wildlife encounters, and create{" "}
              <span className="text-emerald-400 font-semibold">
                unforgettable memories
              </span>
              .
            </p>

            {/* CTA Buttons with Hover Effects */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push("/events")}
                className="group relative md:px-8 px-4 md:py-4 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl text-white font-semibold md:text-lg text-sm overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/25">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" />
                  Explore Adventures
                  <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </div>
              </button>

              <button
                onClick={() => router.push("/organize")}
                className="group md:px-8 px-4 py-4 border-2 border-white/30 backdrop-blur-sm rounded-xl text-white font-semibold text-sm md:text-lg transition-all duration-300 hover:bg-white/10 hover:border-emerald-400">
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Plan Your Journey
                </div>
              </button>
            </div>

            {/* Stats with Animation */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/20">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group cursor-pointer">
                  <div className="mb-2">
                    <stat.icon className="w-6 h-6 text-emerald-400 mx-auto group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="md:text-2xl text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Interactive Feature Cards */}
          <div className="space-y-6 lg:pl-8">
            <div className="space-y-4">
              {[
                {
                  icon: Calendar,
                  title: "Weekly Scheduled Tours",
                  desc: "Consistent adventures every week",
                  color: "from-blue-500 to-purple-600",
                },
                {
                  icon: Map,
                  title: "Expert Local Guides",
                  desc: "Authentic cultural experiences",
                  color: "from-emerald-500 to-teal-600",
                },
                {
                  icon: Users,
                  title: "Small Group Experiences",
                  desc: "Intimate and personalized journeys",
                  color: "from-orange-500 to-red-600",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="group md:block hidden relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-500 hover:scale-105 cursor-pointer"
                  style={{
                    transform: `translateY(${
                      mousePosition.y * 5 * (index + 1)
                    }px)`,
                  }}>
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-emerald-300 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-gray-300 text-sm">{feature.desc}</p>
                    </div>
                  </div>

                  {/* Subtle glow effect on hover */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:via-emerald-500/10 group-hover:to-emerald-500/5 transition-all duration-500"></div>
                </div>
              ))}
            </div>

            {/* Image carousel indicators */}
            <div className="flex justify-center gap-3 pt-6">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentImageIndex
                      ? "bg-emerald-400 w-8"
                      : "bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Subtle scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 animate-bounce">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-2 bg-white/60 rounded-full mt-2 animate-pulse"></div>
          </div>
          <span className="text-xs">Scroll to explore</span>
        </div>
      </div>
    </div>
  );
}
