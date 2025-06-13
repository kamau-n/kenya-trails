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
  Camera,
} from "lucide-react";

export default function EnhancedHero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const heroRef = useRef(null);

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

  const stats = [
    { icon: Users, value: "2,500+", label: "Happy Travelers" },
    { icon: Award, value: "98%", label: "Satisfaction Rate" },
    { icon: Globe, value: "15+", label: "Destinations" },
  ];

  // Check if mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    setIsLoaded(true);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Enhanced image carousel with smoother transitions
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Mouse parallax effect (disabled on mobile for better performance)
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (heroRef.current && !isMobile) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMousePosition({ x: (x - 0.5) * 0.5, y: (y - 0.5) * 0.5 });
      }
    };

    const heroElement = heroRef.current;
    if (heroElement) {
      heroElement.addEventListener("mousemove", handleMouseMove);
      return () =>
        heroElement.removeEventListener("mousemove", handleMouseMove);
    }
  }, [isMobile]);

  const handleExploreClick = () => {
    console.log("Navigate to events");
  };

  const handleCreateClick = () => {
    console.log("Navigate to organize");
  };

  return (
    <div
      ref={heroRef}
      className="relative mt-2   flex items-center rounded-2xl overflow-hidden bg-black shadow-2xl">
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
              transform: isMobile
                ? "none"
                : `translate(${mousePosition.x * 10}px, ${
                    mousePosition.y * 10
                  }px)`,
            }}>
            <img
              src={image.url}
              alt={image.location}
              className="w-full h-full object-cover"
              loading={index === 0 ? "eager" : "lazy"}
            />
            <div
              className={`absolute inset-0 bg-gradient-to-br ${image.gradient}`}></div>
          </div>
        ))}

        {/* Enhanced overlay with better mobile optimization */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

        {/* Animated particles (fewer on mobile) */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(isMobile ? 8 : 20)].map((_, i) => (
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
      <div className="relative z-10 px-4 sm:px-6 md:px-8 lg:px-12 w-full">
        <div className="w-7/8 mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column - Main Content */}
            <div
              className={`space-y-6 md:space-y-8 text-center lg:text-left transition-all duration-1000 ${
                isLoaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}>
              {/* Floating Badge */}
              <div className="flex justify-center p-2 lg:justify-start">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 rounded-full text-emerald-300 text-sm font-medium">
                  <Star className="w-4 h-4 fill-current" />
                  <span>Kenya's #1 Adventure Platform</span>
                </div>
              </div>

              {/* Main Headline */}
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-5xl md:text-5xl lg:text-6xl font-black text-white leading-[0.9]">
                  Discover
                  <span className="block bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent animate-pulse">
                    Wild Kenya
                  </span>
                </h1>

                {/* Dynamic location display */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start text-emerald-300 text-lg md:text-xl font-medium gap-2">
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2 animate-bounce" />
                    <span className="transition-all duration-500">
                      {images[currentImageIndex].location}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="mx-3 text-gray-400 hidden sm:inline">
                      •
                    </span>
                    <span className="text-gray-300 text-base md:text-lg">
                      {images[currentImageIndex].description}
                    </span>
                  </div>
                </div>
              </div>

              {/* Enhanced Description */}
              <p className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Join our guided group adventures to Kenya's most breathtaking
                destinations. Connect with fellow travelers, experience
                authentic wildlife encounters, and create{" "}
                <span className="text-emerald-400 font-semibold">
                  unforgettable memories
                </span>
                .
              </p>

              {/* CTA Buttons - Improved Mobile Layout */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={handleExploreClick}
                  className="group relative px-6 md:px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl text-white font-semibold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/25 active:scale-95 touch-manipulation">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center gap-2">
                    <Play className="w-5 h-5" />
                    Explore Adventures
                    <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </div>
                </button>

                <button
                  onClick={handleCreateClick}
                  className="px-6 md:px-8 py-4 border-2 border-white/30 backdrop-blur-sm rounded-xl text-white font-semibold text-lg transition-all duration-300 hover:bg-white/10 hover:border-emerald-400 active:scale-95 touch-manipulation">
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Create Your Event
                  </div>
                </button>
              </div>

              {/* Stats Section - Better Mobile Layout */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/20">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className={`text-center transition-all duration-700 ${
                      isLoaded
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                    }`}
                    style={{ transitionDelay: `${index * 200}ms` }}>
                    <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 rounded-full mb-2">
                      <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
                    </div>
                    <div className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
                      {stat.value}
                    </div>
                    <div className="text-xs md:text-sm text-gray-400">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Feature Cards (Hidden on small screens) */}
            <div className="hidden lg:flex flex-col space-y-6">
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`relative p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 transition-all duration-500 cursor-pointer ${
                    index === currentImageIndex
                      ? "scale-105 bg-white/20 border-emerald-400/50"
                      : "hover:bg-white/15"
                  }`}
                  onClick={() => setCurrentImageIndex(index)}>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden">
                      <img
                        src={image.url}
                        alt={image.location}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg">
                        {image.location}
                      </h3>
                      <p className="text-gray-300 text-sm">
                        {image.description}
                      </p>
                    </div>
                    <Camera className="w-5 h-5 text-emerald-400" />
                  </div>

                  {index === currentImageIndex && (
                    <div className="absolute inset-0 bg-emerald-400/10 rounded-2xl animate-pulse"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Image Navigation Dots */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 touch-manipulation ${
                index === currentImageIndex
                  ? "bg-emerald-400 scale-125"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
