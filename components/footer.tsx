import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail, Map } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Map className="h-6 w-6 text-green-500 mr-2" />
              <span className="text-xl font-bold text-white">Kenya Trails</span>
            </div>
            <p className="mb-4">
              Connecting adventure seekers with the best travel and hiking
              experiences across Kenya.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="mailto:info@kenyatrails.com"
                className="text-gray-400 hover:text-white">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/events" className="hover:text-white">
                  All Events
                </Link>
              </li>
              <li>
                <Link
                  href="/events?category=hiking"
                  className="hover:text-white">
                  Hiking
                </Link>
              </li>
              <li>
                <Link
                  href="/events?category=camping"
                  className="hover:text-white">
                  Camping
                </Link>
              </li>
              <li>
                <Link
                  href="/events?category=safari"
                  className="hover:text-white">
                  Safari
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Organize</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/organize" className="hover:text-white">
                  Become an Organizer
                </Link>
              </li>
              <li>
                <Link href="/organize/create" className="hover:text-white">
                  Create Event
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-white">
                  Resources
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="hover:text-white">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/policies" className="hover:text-white">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
          <p>
            &copy; {new Date().getFullYear()} Kenya Trails. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
