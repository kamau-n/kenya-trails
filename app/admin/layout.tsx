"use client";
import { useAuth } from "@/components/auth-provider";
import { redirect } from "next/navigation";

export default function AdminLayout({ children }) {
  const { user } = useAuth();

  // Check if user is admin
  if (!user || user.role !== "admin") {
    redirect("/");
  }

  return <div className="container mx-auto px-4 py-8">{children}</div>;
}
