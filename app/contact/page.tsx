"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Contact() {
  return (
    <div className="relative py-20 md:py-32 overflow-hidden rounded-3xl my-8">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/bg.jpeg"
          alt="Contact background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-70"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-white max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">
          Get in Touch
        </h1>
        <p className="text-lg text-center text-gray-300 mb-10">
          Have a question, suggestion, or need help planning your next
          adventure? Send us a message and we’ll get back to you soon.
        </p>

        <form className="space-y-6">
          <div>
            <label htmlFor="name" className="block mb-1 font-medium">
              Your Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              className="bg-white text-black"
            />
          </div>

          <div>
            <label htmlFor="email" className="block mb-1 font-medium">
              Your Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="bg-white text-black"
            />
          </div>

          <div>
            <label htmlFor="message" className="block mb-1 font-medium">
              Message
            </label>
            <Textarea
              id="message"
              rows={5}
              placeholder="Type your message here..."
              className="bg-white text-black"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-lg">
            Send Message
          </Button>
        </form>
      </div>
    </div>
  );
}
