"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Users, Calendar, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export default function AdminDashboard() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    activeEvents: 0,
    totalPackages: 0,
  });

  const [userData, setUserData] = useState([]);
  const [loadingUserData, setLoadingUserData] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const eventsSnapshot = await getDocs(collection(db, "events"));
        const packagesSnapshot = await getDocs(collection(db, "promotions"));

        const activeEvents = eventsSnapshot.docs.filter((doc) => {
          const date = doc.data().date?.seconds;
          return date && new Date(date * 1000) > new Date();
        }).length;

        setStats({
          totalUsers: usersSnapshot.size,
          totalEvents: eventsSnapshot.size,
          activeEvents,
          totalPackages: packagesSnapshot.size,
        });
      } catch (e) {
        console.error("Error fetching stats:", e);
      }
    };

    const fetchUserData = async () => {
      try {
        const q = query(collection(db, "users"), orderBy("createdAt"));
        const snapshot = await getDocs(q);
        const data: { [key: string]: number } = {};

        snapshot.forEach((doc) => {
          const createdAt = doc.data().createdAt?.toDate();
          if (createdAt) {
            const date = createdAt.toISOString().split("T")[0];
            data[date] = (data[date] || 0) + 1;
          }
        });

        const formatted = Object.entries(data)
          .map(([date, users]) => ({ date, users }))
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );

        setUserData(formatted as any);
        setLoadingUserData(false);
      } catch (e) {
        console.error("Error fetching user data:", e);
        setLoadingUserData(false);
      }
    };

    fetchStats();
    fetchUserData();
  }, []);

  const statsData = [
    { name: "Users", value: stats.totalUsers },
    { name: "Events", value: stats.totalEvents },
    { name: "Active Events", value: stats.activeEvents },
    { name: "Promotions", value: stats.totalPackages },
  ];

  const pieColors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50"];

  const SidebarLinks = () => (
    <div className="flex flex-col gap-4 p-4">
      <Link href="/admin/users">
        <Button
          variant={pathname === "/admin/users" ? "secondary" : "ghost"}
          className="w-full justify-start">
          <Users className="mr-2 h-4 w-4" /> Users
        </Button>
      </Link>
      <Link href="/admin/events">
        <Button
          variant={pathname === "/admin/events" ? "secondary" : "ghost"}
          className="w-full justify-start">
          <Calendar className="mr-2 h-4 w-4" /> Events
        </Button>
      </Link>
      <Link href="/admin/promotions">
        <Button
          variant={pathname === "/admin/promotions" ? "secondary" : "ghost"}
          className="w-full justify-start">
          <Package className="mr-2 h-4 w-4" /> Promotions
        </Button>
      </Link>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 border-r bg-muted">
        <SidebarLinks />
      </aside>

      {/* Sidebar Trigger (mobile) */}
      <div className="md:hidden p-2 fixed top-2 left-2 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <SidebarLinks />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 pt-16 md:pt-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeEvents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Promotions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPackages}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Overview (Bar)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribution (Pie)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statsData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                    dataKey="value">
                    {statsData.map((_, i) => (
                      <Cell key={i} fill={pieColors[i % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>New Users (Line)</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingUserData ? (
                <p>Loading...</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={userData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Growth (Area)</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingUserData ? (
                <p>Loading...</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={userData}>
                    <defs>
                      <linearGradient
                        id="colorUsers"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1">
                        <stop
                          offset="5%"
                          stopColor="#8884d8"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#8884d8"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="#8884d8"
                      fill="url(#colorUsers)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
