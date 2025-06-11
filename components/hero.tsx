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
  MapPin,
  Heart,
} from "lucide-react";

export default function EnhancedMobileHero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef(null);

  const images = [
    {
      url: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1920&q=80",
      location: "Mount Kenya",
      description: "Epic mountain adventures await",
      tag: "HIKING",
      color: "emerald"
    },
    {
      url: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1920&q=80",
      location: "Masai Mara",
      description: "Wildlife like never before",
      tag: "SAFARI",
      color: "orange"
    },
    {
      url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&q=80",
      location: "Diani Beach",
      description: "Paradise found",
      tag: "BEACH",
      color: "blue"
    },
  ];

  // Animation on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { icon: Users, value: "2.5K+", label: "Adventurers", color: "text-pink-400" },
    { icon: Award, value: "98%", label: "Love Rate", color: "text-yellow-400" },
    { icon: Globe, value: "15+", label: "Locations", color: "text-blue-400" },
  ];

  const currentImage = images[currentImageIndex];

  return (
    <div ref={heroRef} className="relative min-h-screen overflow-hidden bg-black">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-out ${
              index === currentImageIndex
                ? "opacity-100 scale-100"
                : "opacity-0 scale-110"
            }`}>
            <div 
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${image.url})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
          </div>
        ))}
        
        {/* Floating particles for mobile */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-between px-4 py-6 sm:px-6 sm:py-8">
        
        {/* Top Section - Badge & Location */}
        <div className={`space-y-4 transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          {/* Premium Badge */}
          <div className="flex justify-center sm:justify-start">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-700 rounded-full blur-lg opacity-60 animate-pulse" />
              <div className="relative bg-gradient-to-r from-green-400 to-green-600 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 backdrop-blur-sm">
                <Star className="w-3 h-3 fill-current" />
                PREMIUM ADVENTURES
              </div>
            </div>
          </div>

          {/* Current Location Display */}
          <div className="flex items-center justify-center sm:justify-start gap-2 text-white/90">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${
              currentImage.color === 'emerald' ? 'from-emerald-500 to-green-500' :
              currentImage.color === 'orange' ? 'from-orange-500 to-red-500' :
              'from-blue-500 to-cyan-500'
            }`}>
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-medium">{currentImage.tag}</span>
              <span className="mx-2">•</span>
              <span className="text-sm opacity-80">{currentImage.location}</span>
            </div>
          </div>
        </div>

        {/* Center Section - Main Content */}
        <div className={`space-y-8 text-center transform transition-all duration-1000 delay-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        }`}>
          
          {/* Main Headline */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-[0.9] tracking-tight">
              Discover
              <br />
              <span className="bg-gradient-to-r from-pink-400 via-green-400 to-green-600 bg-clip-text text-transparent animate-pulse">
                Wild Kenya
              </span>
            </h1>
            
            {/* Dynamic subtitle */}
            <p className="text-lg sm:text-xl text-white/90 font-light max-w-md mx-auto leading-relaxed">
              {currentImage.description}
            </p>
          </div>

          {/* Enhanced Description */}
          <p className="text-base sm:text-lg text-white/80 leading-relaxed max-w-lg mx-auto px-4">
            Join our curated group adventures. Connect with amazing people, experience 
            <span className="text-pink-400 font-semibold"> breathtaking moments</span>, 
            and create stories worth sharing.
          </p>

          {/* CTA Buttons - Mobile Optimized */}
          <div className="space-y-4 px-4">
            <button className="group relative w-full sm:w-auto sm:px-12 py-4 bg-gradient-to-r from-green-400 via-green-600 to-green-700 rounded-2xl text-white font-bold text-lg overflow-hidden transform transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl shadow-pink-500/25">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-green-700 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center justify-center gap-3">
                <Play className="w-5 h-5" />
                Start Your Adventure
                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </div>
            </button>

            <button className="group w-full sm:w-auto sm:px-12 py-4 border-2 border-white/40 backdrop-blur-md rounded-2xl text-white font-semibold text-lg transition-all duration-300 hover:bg-white/10 hover:border-pink-400 active:scale-95">
              <div className="flex items-center justify-center gap-3">
                <Calendar className="w-5 h-5" />
                Create Your Event
              </div>
            </button>
          </div>
        </div>

        {/* Bottom Section - Stats & Navigation */}
        <div className={`space-y-6 transform transition-all duration-1000 delay-500 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-6 px-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="mb-2">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 border border-white/20">
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-white/70 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Image Carousel Indicators */}
          <div className="flex justify-center gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentImageIndex
                    ? "bg-gradient-to-r from-pink-400 to-purple-400 w-8"
                    : "bg-white/30 w-2 hover:bg-white/50"
                }`}
              />
            ))}
          </div>

          {/* Scroll Indicator */}
          <div className="flex flex-col items-center text-white/60 animate-bounce">
            <div className="text-xs font-medium mb-2">Swipe up to explore</div>
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-gradient-to-b from-pink-400 to-purple-400 rounded-full mt-2 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Floating Button */}
      <div className="absolute bottom-20 right-4 z-20">
        <button className="group w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95">
          <Heart className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  );
}
