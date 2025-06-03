"use client"

import React, { useState, useEffect } from "react";
import { Home, Search, ArrowLeft, Zap, Star, Globe } from "lucide-react";

export default function NotFoundPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isFloating, setIsFloating] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Floating animation
    const interval = setInterval(() => {
      setIsFloating((prev) => !prev);
    }, 3000);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(interval);
    };
  }, []);

  const floatingElements = Array.from({ length: 6 }, (_, i) => (
    <div
      key={i}
      className={`absolute w-2 h-2 bg-green-400 rounded-full opacity-20 transition-all duration-[3000ms] ease-in-out ${
        isFloating ? "translate-y-[-20px]" : "translate-y-[20px]"
      }`}
      style={{
        left: `${15 + i * 15}%`,
        top: `${20 + (i % 2) * 30}%`,
        animationDelay: `${i * 500}ms`,
      }}
    />
  ));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background elements */}
      {floatingElements}

      {/* Glowing orb that follows mouse */}
      <div
        className="fixed w-96 h-96 bg-green-400 rounded-full opacity-5 blur-3xl pointer-events-none transition-all duration-300 ease-out"
        style={{
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
      />

      <div className="max-w-2xl mx-auto text-center relative z-10">
        {/* Main 404 display */}
        <div className="relative mb-8">
          <h1 className="text-[12rem] md:text-[16rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-green-300 to-emerald-400 leading-none tracking-tighter animate-pulse">
            404
          </h1>

          {/* Glowing effect behind 404 */}
          <div className="absolute inset-0 text-[12rem] md:text-[16rem] font-black text-green-400 opacity-10 blur-2xl animate-pulse">
            404
          </div>
        </div>

        {/* Error message with typewriter effect */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 animate-fadeInUp">
            Oops! Page Not Found
          </h2>
          <p className="text-lg text-slate-300 mb-2 animate-fadeInUp animation-delay-200">
            The page you're looking for seems to have vanished into the digital
            void.
          </p>
          <p className="text-slate-400 animate-fadeInUp animation-delay-400">
            Don't worry, even the best explorers sometimes take wrong turns.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <button
            onClick={() => window.history.back()}
            className="group flex items-center gap-3 bg-green-400 hover:bg-green-500 text-slate-900 font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-400/25 animate-fadeInUp animation-delay-600">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            Go Back
          </button>

          <button
            onClick={() => (window.location.href = "/")}
            className="group flex items-center gap-3 bg-slate-800 hover:bg-slate-700 text-white border-2 border-green-400 font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-400/25 animate-fadeInUp animation-delay-700">
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            Home Page
          </button>
        </div>

        {/* Search suggestion */}
        <div className="mb-12 animate-fadeInUp animation-delay-800">
          <p className="text-slate-400 mb-4">
            Or try searching for what you need:
          </p>
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search our site..."
              className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-6 py-4 pl-12 text-white placeholder-slate-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all duration-300"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-fadeInUp animation-delay-1000">
          {[
            { icon: Globe, title: "Explore", desc: "Browse our content" },
            { icon: Zap, title: "Features", desc: "See what's new" },
            { icon: Star, title: "Popular", desc: "Trending pages" },
          ].map((item, index) => (
            <div
              key={index}
              className="group p-6 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-green-400 hover:bg-slate-800/80 transition-all duration-300 cursor-pointer hover:scale-105">
              <item.icon className="w-8 h-8 text-green-400 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-white font-semibold mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Fun fact */}
        <div className="mt-16 p-6 bg-gradient-to-r from-green-400/10 to-emerald-400/10 border border-green-400/20 rounded-xl animate-fadeInUp animation-delay-1200">
          <p className="text-green-400 font-medium mb-2">💡 Did you know?</p>
          <p className="text-slate-300 text-sm">
            The first 404 error was at CERN in 1992. The room where the central
            database was located was called "Room 404".
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
        }

        .animation-delay-600 {
          animation-delay: 0.6s;
          opacity: 0;
        }

        .animation-delay-700 {
          animation-delay: 0.7s;
          opacity: 0;
        }

        .animation-delay-800 {
          animation-delay: 0.8s;
          opacity: 0;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
          opacity: 0;
        }

        .animation-delay-1200 {
          animation-delay: 1.2s;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
