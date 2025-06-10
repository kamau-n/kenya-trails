"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  Send,
  User,
  Mail,
  MessageSquare,
  Loader2,
} from "lucide-react";

export default function Contact() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
    submitted: false,
    loading: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormState({ ...formState, loading: true });

    // Simulate form submission
    setTimeout(() => {
      setFormState({ ...formState, submitted: true, loading: false });
    }, 1500);
  };

  return (
    <div className="relative py-16 md:py-28 overflow-hidden rounded-3xl my-12">
      {/* Gradient Background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
        {/* Overlay pattern */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-16 h-16 bg-white bg-opacity-10 rounded-full blur-md"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-white bg-opacity-10 rounded-full blur-md"></div>
      <div className="absolute top-1/3 right-1/4 w-10 h-10 bg-white bg-opacity-10 rounded-full blur-sm"></div>

      {/* Content */}
      <div className="relative z-10 md:px-12 mx-auto px-4 text-white max-w-3xl">
        <div className="flex flex-col items-center mb-12">
          <span className="px-4 py-1 bg-white bg-opacity-20 rounded-full text-sm font-medium mb-4">
            Contact Us
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
            Let's Connect
          </h1>
          <p className="text-lg text-center text-blue-100 max-w-xl">
            Have a question or need assistance planning your next adventure?
            We're here to help you every step of the way.
          </p>
        </div>

        {formState.submitted ? (
          <div className="bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-2xl border border-white border-opacity-20 text-center flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center mb-2">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold">Message Sent!</h3>
            <p className="text-blue-100">
              Thank you for reaching out. We'll get back to you as soon as
              possible.
            </p>
            <Button
              className="mt-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white border border-white border-opacity-20"
              onClick={() =>
                setFormState({
                  name: "",
                  email: "",
                  message: "",
                  submitted: false,
                  loading: false,
                })
              }>
              Send Another Message
            </Button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-2xl border border-white border-opacity-20 space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block mb-2 font-medium text-blue-100 flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Your Name</span>
              </label>
              <Input
                id="name"
                type="text"
                value={formState.name}
                onChange={(e) =>
                  setFormState({ ...formState, name: e.target.value })
                }
                placeholder="John Doe"
                className="bg-white bg-opacity-10 border-white border-opacity-20 text-white placeholder:text-blue-200 placeholder:opacity-60 focus:border-blue-300 focus:ring focus:ring-blue-300 focus:ring-opacity-30"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block mb-2 font-medium text-blue-100 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>Your Email</span>
              </label>
              <Input
                id="email"
                type="email"
                value={formState.email}
                onChange={(e) =>
                  setFormState({ ...formState, email: e.target.value })
                }
                placeholder="you@example.com"
                className="bg-white bg-opacity-10 border-white border-opacity-20 text-white placeholder:text-blue-200 placeholder:opacity-60 focus:border-blue-300 focus:ring focus:ring-blue-300 focus:ring-opacity-30"
                required
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block mb-2 font-medium text-blue-100 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span>Message</span>
              </label>
              <Textarea
                id="message"
                rows={5}
                value={formState.message}
                onChange={(e) =>
                  setFormState({ ...formState, message: e.target.value })
                }
                placeholder="Tell us about your adventure plans or questions..."
                className="bg-white bg-opacity-10 border-white border-opacity-20 text-white placeholder:text-blue-200 placeholder:opacity-60 focus:border-blue-300 focus:ring focus:ring-blue-300 focus:ring-opacity-30"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={formState.loading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 py-6 text-lg font-medium rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl">
              {formState.loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Send Message</span>
                </>
              )}
            </Button>
          </form>
        )}

        {/* Contact Information */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white bg-opacity-10 backdrop-blur-lg p-4 rounded-xl border border-white border-opacity-20 text-center">
            <div className="w-10 h-10 bg-blue-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Mail className="w-5 h-5 text-blue-300" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Email Us</h3>
            <p className="text-blue-100">hello@adventure.com</p>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-lg p-4 rounded-xl border border-white border-opacity-20 text-center">
            <div className="w-10 h-10 bg-blue-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-blue-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-1">Call Us</h3>
            <p className="text-blue-100">(123) 456-7890</p>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-lg p-4 rounded-xl border border-white border-opacity-20 text-center">
            <div className="w-10 h-10 bg-blue-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-blue-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-1">Visit Us</h3>
            <p className="text-blue-100">123 Adventure St, Explorer City</p>
          </div>
        </div>
      </div>
    </div>
  );
}
