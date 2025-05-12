"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function About() {
  return (
    <div className="relative py-20 md:py-32 overflow-hidden rounded-3xl my-8">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/bg.jpeg"
          alt="Kenya Landscape"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">About Us</h1>
        <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-6">
          We are passionate adventurers committed to helping you explore the
          most breathtaking destinations across Kenya. Whether you're hiking Mt.
          Kenya, exploring the Maasai Mara, or organizing your own group trip,
          we’re here to make your experience seamless, memorable, and safe.
        </p>
        <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-10">
          Our mission is to connect explorers with trusted guides and fellow
          travelers for unforgettable group adventures in nature.
        </p>
        <Button
          asChild
          size="lg"
          className="bg-green-600 hover:bg-green-700 text-lg">
          <Link href="/events">Discover Adventures</Link>
        </Button>
      </div>
    </div>
  );
}
