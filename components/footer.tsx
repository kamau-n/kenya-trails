import Link from "next/link";
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Map,
  Phone,
  MapPin,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative  mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center mb-6">
              <div className="relative">
                <Map className="h-8 w-8 text-green-400 mr-3" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <span className="text-2xl font-bold text-white">
                Kenya Trails
              </span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed max-w-sm">
              Connecting adventure seekers with unforgettable travel and hiking
              experiences across the beautiful landscapes of Kenya.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-gray-400">
                <Phone className="h-4 w-4 mr-3 text-green-400 flex-shrink-0" />
                <span>+254 700 123 456</span>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <MapPin className="h-4 w-4 mr-3 text-green-400 flex-shrink-0" />
                <span>Nairobi, Kenya</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-green-500 transition-all duration-300 transform hover:scale-110"
                aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-green-500 transition-all duration-300 transform hover:scale-110"
                aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-green-500 transition-all duration-300 transform hover:scale-110"
                aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="mailto:info@kenyatrails.com"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-green-500 transition-all duration-300 transform hover:scale-110"
                aria-label="Email">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Explore Section */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white relative">
              Explore
              <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-green-400"></div>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/events"
                  className="text-gray-400 hover:text-green-400 transition-colors duration-200 flex items-center group">
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mr-3 group-hover:bg-green-400 transition-colors duration-200"></span>
                  All Events
                </Link>
              </li>
              <li>
                <Link
                  href="/events?category=hiking"
                  className="text-gray-400 hover:text-green-400 transition-colors duration-200 flex items-center group">
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mr-3 group-hover:bg-green-400 transition-colors duration-200"></span>
                  Hiking
                </Link>
              </li>
              <li>
                <Link
                  href="/events?category=camping"
                  className="text-gray-400 hover:text-green-400 transition-colors duration-200 flex items-center group">
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mr-3 group-hover:bg-green-400 transition-colors duration-200"></span>
                  Camping
                </Link>
              </li>
              <li>
                <Link
                  href="/events?category=safari"
                  className="text-gray-400 hover:text-green-400 transition-colors duration-200 flex items-center group">
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mr-3 group-hover:bg-green-400 transition-colors duration-200"></span>
                  Safari
                </Link>
              </li>
            </ul>
          </div>

          {/* Organize Section */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white relative">
              Organize
              <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-green-400"></div>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/organize"
                  className="text-gray-400 hover:text-green-400 transition-colors duration-200 flex items-center group">
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mr-3 group-hover:bg-green-400 transition-colors duration-200"></span>
                  Become an Organizer
                </Link>
              </li>
              <li>
                <Link
                  href="/organize/create"
                  className="text-gray-400 hover:text-green-400 transition-colors duration-200 flex items-center group">
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mr-3 group-hover:bg-green-400 transition-colors duration-200"></span>
                  Create Event
                </Link>
              </li>
              <li>
                <Link
                  href="/resources"
                  className="text-gray-400 hover:text-green-400 transition-colors duration-200 flex items-center group">
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mr-3 group-hover:bg-green-400 transition-colors duration-200"></span>
                  Resources
                </Link>
              </li>
              <li>
                <Link
                  href="/faqs"
                  className="text-gray-400 hover:text-green-400 transition-colors duration-200 flex items-center group">
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mr-3 group-hover:bg-green-400 transition-colors duration-200"></span>
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Section */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white relative">
              Company
              <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-green-400"></div>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-gray-400 hover:text-green-400 transition-colors duration-200 flex items-center group">
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mr-3 group-hover:bg-green-400 transition-colors duration-200"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-400 hover:text-green-400 transition-colors duration-200 flex items-center group">
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mr-3 group-hover:bg-green-400 transition-colors duration-200"></span>
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-400 hover:text-green-400 transition-colors duration-200 flex items-center group">
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mr-3 group-hover:bg-green-400 transition-colors duration-200"></span>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/policies"
                  className="text-gray-400 hover:text-green-400 transition-colors duration-200 flex items-center group">
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mr-3 group-hover:bg-green-400 transition-colors duration-200"></span>
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h4 className="text-lg font-semibold text-white mb-2">
                Stay Updated
              </h4>
              <p className="text-gray-400 text-sm">
                Get the latest adventure updates and exclusive offers.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 w-full sm:w-64"
              />
              <button className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-900 whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-gray-700">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <p className="text-center sm:text-left">
              &copy; {new Date().getFullYear()} Kenya Trails. All rights
              reserved.
            </p>
            <div className="flex items-center space-x-6">
              <Link
                href="/sitemap"
                className="hover:text-green-400 transition-colors duration-200">
                Sitemap
              </Link>
              <Link
                href="/cookies"
                className="hover:text-green-400 transition-colors duration-200">
                Cookies
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Made in Kenya</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
