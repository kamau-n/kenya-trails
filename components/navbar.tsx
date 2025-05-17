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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        isScrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Map className="h-6 w-6 text-primary mr-2" />
              <span className="text-xl font-bold text-primary font-poppins">
                Kenya Trails
              </span>
            </Link>
          </div>

          {/* Centered Navigation */}
          <nav className="hidden md:flex mx-auto justify-center space-x-8">
            <Link
              href="/events"
              className={`text-sm font-medium transition-colors hover:text-primary font-poppins ${
                pathname === "/events" ? "text-primary" : "text-gray-600"
              }`}>
              Explore Events
            </Link>
            <Link
              href="/organize"
              className={`text-sm font-medium transition-colors hover:text-primary font-poppins ${
                pathname === "/organize" ? "text-primary" : "text-gray-600"
              }`}>
              Organize
            </Link>
            <Link
              href="/about"
              className={`text-sm font-medium transition-colors hover:text-primary font-poppins ${
                pathname === "/about" ? "text-primary" : "text-gray-600"
              }`}>
              About Us
            </Link>
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className={`text-sm font-medium transition-colors hover:text-primary font-poppins ${
                  pathname.startsWith("/admin")
                    ? "text-primary"
                    : "text-gray-600"
                }`}>
                Admin
              </Link>
            )}
          </nav>

          {/* User Menu & Mobile Toggle */}
          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-medium font-poppins">
                        {user.displayName || user.email}
                      </p>
                      <p className="text-xs text-gray-500 font-poppins">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span className="font-poppins">My Dashboard</span>
                    </Link>
                  </DropdownMenuItem>

                  {user.userType === "organizer" && (
                    <DropdownMenuItem asChild>
                      <Link href="/organize/create" className="cursor-pointer">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        <span className="font-poppins">Create Event</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span className="font-poppins">Admin Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span className="font-poppins">Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button asChild variant="ghost" className="hidden md:flex">
                  <Link href="/login" className="font-poppins">
                    Log in
                  </Link>
                </Button>
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link href="/signup" className="font-poppins">
                    Sign up
                  </Link>
                </Button>
              </>
            )}

            <div>
              <ThemeToggle />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 md:hidden">
                <DropdownMenuItem asChild>
                  <Link href="/events" className="font-poppins">
                    Explore Events
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/organize" className="font-poppins">
                    Organize
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/about" className="font-poppins">
                    About Us
                  </Link>
                </DropdownMenuItem>
                {user?.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="font-poppins">
                      Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {!user && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/login" className="font-poppins">
                        Log in
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/signup" className="font-poppins">
                        Sign up
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>

    // <header
    //   className={`sticky top-0 z-50 w-full transition-all duration-200 ${
    //     isScrolled ? "bg-white shadow-md" : "bg-transparent"
    //   }`}>
    //   <div className="container mx-auto px-4">
    //     <div className="flex h-16 items-center justify-between">
    //       <div className="flex items-center">
    //         <Link href="/" className="flex items-center">
    //           <Map className="h-6 w-6 text-green-600 mr-2" />
    //           <span className="text-xl font-bold text-green-600">
    //             Kenya Trails
    //           </span>
    //         </Link>
    //         <nav className="hidden md:flex ml-10 space-x-8">
    //           <Link
    //             href="/events"
    //             className={`text-sm font-medium transition-colors hover:text-green-600 ${
    //               pathname === "/events" ? "text-green-600" : "text-gray-600"
    //             }`}>
    //             Explore Events
    //           </Link>
    //           <Link
    //             href="/organize"
    //             className={`text-sm font-medium transition-colors hover:text-green-600 ${
    //               pathname === "/organize" ? "text-green-600" : "text-gray-600"
    //             }`}>
    //             Organize
    //           </Link>
    //           <Link
    //             href="/about"
    //             className={`text-sm font-medium transition-colors hover:text-green-600 ${
    //               pathname === "/about" ? "text-green-600" : "text-gray-600"
    //             }`}>
    //             About Us
    //           </Link>
    //           {user?.role === "admin" && (
    //             <Link
    //               href="/admin"
    //               className={`text-sm font-medium transition-colors hover:text-green-600 ${
    //                 pathname.startsWith("/admin")
    //                   ? "text-green-600"
    //                   : "text-gray-600"
    //               }`}>
    //               Admin
    //             </Link>
    //           )}
    //         </nav>
    //       </div>

    //       <div className="flex items-center gap-4">
    //         {user ? (
    //           <DropdownMenu>
    //             <DropdownMenuTrigger asChild>
    //               <Button
    //                 variant="ghost"
    //                 className="relative h-10 w-10 rounded-full">
    //                 <User className="h-5 w-5" />
    //               </Button>
    //             </DropdownMenuTrigger>
    //             <DropdownMenuContent align="end" className="w-56">
    //               <div className="flex items-center justify-start gap-2 p-2">
    //                 <div className="flex flex-col space-y-0.5">
    //                   <p className="text-sm font-medium">
    //                     {user.displayName || user.email}
    //                   </p>
    //                   <p className="text-xs text-gray-500">{user.email}</p>
    //                 </div>
    //               </div>
    //               <DropdownMenuSeparator />
    //               <DropdownMenuItem asChild>
    //                 <Link href="/dashboard" className="cursor-pointer">
    //                   <Calendar className="mr-2 h-4 w-4" />
    //                   <span>My Dashboard</span>
    //                 </Link>
    //               </DropdownMenuItem>

    //               {user.userType === "organizer" && (
    //                 <DropdownMenuItem asChild>
    //                   <Link href="/organize/create" className="cursor-pointer">
    //                     <PlusCircle className="mr-2 h-4 w-4" />
    //                     <span>Create Event</span>
    //                   </Link>
    //                 </DropdownMenuItem>
    //               )}
    //               {user.role === "admin" && (
    //                 <DropdownMenuItem asChild>
    //                   <Link href="/admin" className="cursor-pointer">
    //                     <Settings className="mr-2 h-4 w-4" />
    //                     <span>Admin Dashboard</span>
    //                   </Link>
    //                 </DropdownMenuItem>
    //               )}
    //               <DropdownMenuSeparator />
    //               <DropdownMenuItem
    //                 onClick={() => signOut?.()}
    //                 className="cursor-pointer">
    //                 <LogOut className="mr-2 h-4 w-4" />
    //                 <span>Log out</span>
    //               </DropdownMenuItem>
    //             </DropdownMenuContent>
    //           </DropdownMenu>
    //         ) : (
    //           <>
    //             <Button asChild variant="ghost" className="hidden md:flex">
    //               <Link href="/login">Log in</Link>
    //             </Button>
    //             <Button asChild className="bg-green-600 hover:bg-green-700">
    //               <Link href="/signup">Sign up</Link>
    //             </Button>
    //           </>
    //         )}

    //         <DropdownMenu>
    //           <DropdownMenuTrigger asChild className="md:hidden">
    //             <Button variant="ghost" size="icon">
    //               <Menu className="h-5 w-5" />
    //             </Button>
    //           </DropdownMenuTrigger>
    //           <DropdownMenuContent align="end" className="w-48 md:hidden">
    //             <DropdownMenuItem asChild>
    //               <Link href="/events">Explore Events</Link>
    //             </DropdownMenuItem>
    //             <DropdownMenuItem asChild>
    //               <Link href="/organize">Organize</Link>
    //             </DropdownMenuItem>
    //             <DropdownMenuItem asChild>
    //               <Link href="/about">About Us</Link>
    //             </DropdownMenuItem>
    //             {user?.role === "admin" && (
    //               <DropdownMenuItem asChild>
    //                 <Link href="/admin">Admin</Link>
    //               </DropdownMenuItem>
    //             )}
    //             <DropdownMenuSeparator />
    //             {!user && (
    //               <>
    //                 <DropdownMenuItem asChild>
    //                   <Link href="/login">Log in</Link>
    //                 </DropdownMenuItem>
    //                 <DropdownMenuItem asChild>
    //                   <Link href="/signup">Sign up</Link>
    //                 </DropdownMenuItem>
    //               </>
    //             )}
    //           </DropdownMenuContent>
    //         </DropdownMenu>
    //       </div>
    //     </div>
    //   </div>
    // </header>
  );
}
