"use client";
import { useAuth } from "@/components/auth-provider";
import { redirect } from "next/navigation";
import Sidebar from "./components/sidebar";

export default function AdminLayout({ children }) {
  const { user } = useAuth();

  // Check if user is admin
  if (!user || user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex ">
        <div className="p-4">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="w-full p-4">
          <main className="p-4 overflow-auto">{children}</main>
        </div>
        {/* <div className="md:px-12 mx-auto px-4 py-8">{children}</div> */}
      </div>
    </div>
  );
}
