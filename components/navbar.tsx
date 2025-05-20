"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  User,
  LogOut,
  PlusCircle,
  Calendar,
  Map,
  Settings,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { ThemeToggle } from "@/app/theme-toggle";

export default function Navbar() {
  const auth = useAuth();
  const user = auth?.user;
  const signOut = auth?.signOut;

  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when path changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md"
          : "bg-transparent"
      }`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center group">
              <div className="relative">
                <Map className="h-7 w-7 text-primary transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute -inset-1 rounded-full bg-primary/10 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
              </div>
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent font-poppins">
                Kenya Trails
              </span>
            </Link>
          </div>

          {/* Centered Navigation */}
          <nav className="hidden md:flex mx-auto justify-center space-x-8">
            {[
              { href: "/events", label: "Explore Events" },
              { href: "/organize", label: "Organize" },
              { href: "/about", label: "About Us" },
              ...(user?.role === "admin"
                ? [{ href: "/admin", label: "Admin" }]
                : []),
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-1 py-2 text-sm font-medium transition-colors hover:text-primary font-poppins group ${
                  pathname === item.href ||
                  (item.href === "/admin" && pathname.startsWith("/admin"))
                    ? "text-primary"
                    : "text-gray-600 dark:text-gray-300"
                }`}>
                {item.label}
                <span
                  className={`absolute left-0 right-0 bottom-0 h-0.5 bg-primary transform origin-left transition-transform duration-300 ${
                    pathname === item.href ||
                    (item.href === "/admin" && pathname.startsWith("/admin"))
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            ))}
          </nav>

          {/* User Menu & Mobile Toggle */}
          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 overflow-hidden rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || user.email}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 p-2 rounded-xl">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || user.email}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-medium font-poppins">
                        {user.displayName || user.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-poppins">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <div className="py-1">
                    <DropdownMenuItem asChild>
                      <Link
                        href="/dashboard"
                        className="cursor-pointer rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center p-2">
                        <Calendar className="mr-2 h-4 w-4 text-primary" />
                        <span className="font-poppins">My Dashboard</span>
                      </Link>
                    </DropdownMenuItem>

                    {user.userType === "organizer" && (
                      <DropdownMenuItem asChild>
                        <Link
                          href="/organize/create"
                          className="cursor-pointer rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center p-2">
                          <PlusCircle className="mr-2 h-4 w-4 text-primary" />
                          <span className="font-poppins">Create Event</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link
                          href="/admin"
                          className="cursor-pointer rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center p-2">
                          <Settings className="mr-2 h-4 w-4 text-primary" />
                          <span className="font-poppins">Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <div className="py-1">
                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="cursor-pointer rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center p-2">
                      <LogOut className="mr-2 h-4 w-4 text-red-500" />
                      <span className="font-poppins text-red-500">Log out</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  className="hidden md:flex hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Link href="/login" className="font-poppins">
                    Log in
                  </Link>
                </Button>
                <Button
                  asChild
                  className="hidden md:flex bg-primary hover:bg-primary/90 shadow-sm hover:shadow transition-all">
                  <Link href="/signup" className="font-poppins">
                    Sign up
                  </Link>
                </Button>
              </>
            )}

            <div className="border-l border-gray-200 dark:border-gray-700 pl-4 ml-2">
              <ThemeToggle />
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden hover:bg-gray-100 dark:hover:bg-gray-800">
              <Menu
                className={`h-5 w-5 transition-transform duration-300 ${
                  isMobileOpen ? "rotate-90" : ""
                }`}
              />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileOpen
            ? "max-h-96 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
            : "max-h-0"
        }`}>
        <div className="container mx-auto px-4 py-3 space-y-4">
          <nav className="flex flex-col space-y-3">
            {[
              { href: "/events", label: "Explore Events" },
              { href: "/organize", label: "Organize" },
              { href: "/about", label: "About Us" },
              ...(user?.role === "admin"
                ? [{ href: "/admin", label: "Admin" }]
                : []),
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-2 py-2 rounded-md text-sm font-medium transition-colors font-poppins ${
                  pathname === item.href ||
                  (item.href === "/admin" && pathname.startsWith("/admin"))
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}>
                {item.label}
              </Link>
            ))}
          </nav>

          {!user && (
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
              <Button asChild variant="outline" className="w-full">
                <Link href="/login" className="font-poppins">
                  Log in
                </Link>
              </Button>
              <Button asChild className="w-full bg-primary hover:bg-primary/90">
                <Link href="/signup" className="font-poppins">
                  Sign up
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
