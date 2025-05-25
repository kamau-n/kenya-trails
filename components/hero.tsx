import { useState, useEffect, useRef } from "react";
import { ChevronRight, Map, Users, Calendar, Star, Play, Award, Globe } from "lucide-react";

export default function EnhancedHero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  const images = [
    {
      url: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1920&q=80",
      location: "Mount Kenya",
      description: "Hike through alpine landscapes",
      gradient: "from-emerald-900/90 via-black/70 to-transparent"
    },
    {
      url: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1920&q=80",
      location: "Masai Mara",
      description: "Witness the great migration",
      gradient: "from-orange-900/90 via-black/70 to-transparent"
    },
    {
      url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&q=80",
      location: "Diani Beach",
      description: "Relax on pristine white sands",
      gradient: "from-blue-900/90 via-black/70 to-transparent"
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
      heroElement.addEventListener('mousemove', handleMouseMove);
      return () => heroElement.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  const stats = [
    { icon: Users, value: "2,500+", label: "Happy Travelers" },
    { icon: Award, value: "98%", label: "Satisfaction Rate" },
    { icon: Globe, value: "15+", label: "Destinations" }
  ];

  return (
    <div 
      ref={heroRef}
      className="relative min-h-screen flex items-center overflow-hidden bg-black"
    >
      {/* Dynamic Background with Parallax */}
      <div className="absolute inset-0 z-0">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentImageIndex 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-105'
            }`}
            style={{
              transform: `translate(${mousePosition.x * 10}px, ${mousePosition.y * 10}px)`
            }}
          >
            <img
              src={image.url}
              alt={image.location}
              className="w-full h-full object-cover"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${image.gradient}`}></div>
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
                animationDuration: `${2 + Math.random() * 2}s`
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
                <div className="relative bg-emerald-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                  <Star className="w-4 h-4 fill-current" />
                  Limited Adventure Spots
                </div>
              </div>
            </div>

            {/* Main Headline with Text Animation */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-black text-white leading-tight">
                Discover
                <span className="block bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent animate-pulse">
                  Wild Kenya
                </span>
              </h1>
              
              {/* Dynamic location display */}
              <div className="flex items-center text-emerald-300 text-xl font-medium">
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
            <p className="text-xl text-gray-200 leading-relaxed max-w-xl">
              Join our guided group adventures to Kenya's most breathtaking destinations. 
              Connect with fellow travelers, experience authentic wildlife encounters, 
              and create <span className="text-emerald-400 font-semibold">unforgettable memories</span>.
            </p>

            {/* CTA Buttons with Hover Effects */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="group relative px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl text-white font-semibold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/25">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" />
                  Explore Adventures
                  <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
              
              <button className="group px-8 py-4 border-2 border-white/30 backdrop-blur-sm rounded-xl text-white font-semibold text-lg transition-all duration-300 hover:bg-white/10 hover:border-emerald-400">
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
                  <div className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Interactive Feature Cards */}
          <div className="space-y-6 lg:pl-8">
            <div className="space-y-4">
              {[
                { icon: Calendar, title: "Weekly Scheduled Tours", desc: "Consistent adventures every week", color: "from-blue-500 to-purple-600" },
                { icon: Map, title: "Expert Local Guides", desc: "Authentic cultural experiences", color: "from-emerald-500 to-teal-600" },
                { icon: Users, title: "Small Group Experiences", desc: "Intimate and personalized journeys", color: "from-orange-500 to-red-600" }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="group relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-500 hover:scale-105 cursor-pointer"
                  style={{
                    transform: `translateY(${mousePosition.y * 5 * (index + 1)}px)`
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-emerald-300 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-gray-300 text-sm">
                        {feature.desc}
                      </p>
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
                      ? 'bg-emerald-400 w-8' 
                      : 'bg-white/30 hover:bg-white/50'
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



// "use client";
// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import Link from "next/link";
// import { ChevronRight, Map, Users, Calendar } from "lucide-react";

// export default function Hero() {
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [isVisible, setIsVisible] = useState(true);

//   const images = [
//     {
//       url: "/bg.jpg",
//       location: "Mount Kenya",
//       description: "Hike through alpine landscapes",
//     },
//     {
//       url: "/masai_mara.jpg",
//       location: "Masai Mara",
//       description: "Witness the great migration",
//     },
//     {
//       url: "/diani-beach.avif",
//       location: "Diani Beach",
//       description: "Relax on pristine white sands",
//     },
//   ];

//   // Image carousel effect
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setIsVisible(false);
//       setTimeout(() => {
//         setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
//         setIsVisible(true);
//       }, 500);
//     }, 5000);

//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="relative py-12 md:py-16 lg:py-24 overflow-hidden rounded-lg my-4 ">
//       {/* Background Image with fade effect */}
//       <div className="absolute inset-0 z-0 ">
//         <img
//           src={images[currentImageIndex].url}
//           alt={images[currentImageIndex].location}
//           className="w-full h-full object-cover"
//         />
//         <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
//       </div>

//       {/* Content */}
//       <div className="relative z-10 container mx-auto px-4 flex flex-col items-start text-left md:max-w-7xl">
//         <div className="inline-block bg-green-600 text-white px-4 py-1 rounded-full md:text-sm text-xs font-medium mb-4 animate-pulse">
//           Limited spots available
//         </div>

//         <h1 className="text-xl md:text-4xl lg:text-5xl font-bold text-white mb-4 transition-all">
//           Discover Kenya's <span className="text-green-400">Wild</span> Beauty
//         </h1>

//         <div className="flex items-center text-green-300 mb-2">
//           <span className="text-sm md:text-xl font-medium">
//             {images[currentImageIndex].location}
//           </span>
//           <span className="mx-2">•</span>
//           <span className="text-gray-300 tex-xm text-base">
//             {images[currentImageIndex].description}
//           </span>
//         </div>

//         <p className="text-sm md:text-xl text-gray-200 mb-8 max-w-2xl">
//           Join guided group adventures to Kenya's most breathtaking
//           destinations. Connect with fellow travelers, experience authentic
//           wildlife encounters, and create memories that last a lifetime.
//         </p>

//         <div className="flex flex-row gap-6 sm:gap-4 mb-10">
//           <Button
//             asChild
//             size="lg"
//             className="bg-green-600 hover:bg-green-700 text-sm sm:text-base md:text-lg font-medium px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-6 flex items-center gap-2 flex-1 justify-center">
//             <Link href="/events">
//               <span className="hidden sm:inline">Explore Adventures</span>
//               <span className="sm:hidden">Explore</span>
//               <ChevronRight className="ml-1 h-4 w-4 sm:h-5 sm:w-5" />
//             </Link>
//           </Button>
//           <Button
//             asChild
//             size="lg"
//             variant="outline"
//             className="border-white text-black hover:bg-white hover:text-green-800 text-sm sm:text-base md:text-lg font-medium px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-6 flex-1 justify-center">
//             <Link href="/organize">
//               <span className="hidden sm:inline">Organize Your Trip</span>
//               <span className="sm:hidden">Organize</span>
//             </Link>
//           </Button>
//         </div>

//         {/* Feature highlights */}
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
//           <div className="flex items-center bg-white bg-opacity-10 backdrop-blur-sm p-3 rounded-lg">
//             <Calendar className="text-green-400 mr-3 h-6 w-6" />
//             <span className="text-white text-sm">Scheduled Weekly Tours</span>
//           </div>
//           <div className="flex items-center bg-white bg-opacity-10 backdrop-blur-sm p-3 rounded-lg">
//             <Map className="text-green-400 mr-3 h-6 w-6" />
//             <span className="text-white text-sm">Expert Local Guides</span>
//           </div>
//           <div className="flex items-center bg-white bg-opacity-10 backdrop-blur-sm p-3 rounded-lg">
//             <Users className="text-green-400 mr-3 h-6 w-6" />
//             <span className="text-white text-sm">Small Group Experiences</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
