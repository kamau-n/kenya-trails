"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Users,
  Calendar,
  Package,
  DollarSign,
  User2Icon,
} from "lucide-react";
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
import Sidebar from "./components/sidebar";

export default function AdminDashboard() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    activeEvents: 0,
    totalPackages: 0,
    totalRevenue: 0,
    totalBookings: 0,
  });

  const [userData, setUserData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loadingUserData, setLoadingUserData] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const eventsSnapshot = await getDocs(collection(db, "events"));
        const packagesSnapshot = await getDocs(collection(db, "promotions"));
        const paymentsSnapshot = await getDocs(collection(db, "payments"));
        const bookingsSnapshot = await getDocs(collection(db, "bookings"));

        const activeEvents = eventsSnapshot.docs.filter((doc) => {
          const date = doc.data().date?.seconds;
          return date && new Date(date * 1000) > new Date();
        }).length;

        const totalRevenue = paymentsSnapshot.docs.reduce((sum, doc) => {
          const payment = doc.data();
          return payment.status === "completed"
            ? sum + (Number(payment.amount) || 0)
            : sum;
        }, 0);

        setStats({
          totalUsers: usersSnapshot.size,
          totalEvents: eventsSnapshot.size,
          activeEvents,
          totalPackages: packagesSnapshot.size,
          totalRevenue,
          totalBookings: bookingsSnapshot.size,
        });

        // Fetch revenue data
        const revenueByMonth = {};
        paymentsSnapshot.docs.forEach((doc) => {
          const payment = doc.data();
          if (payment.status === "completed" && payment.createdAt) {
            const date = new Date(payment.createdAt.seconds * 1000);
            const monthYear = date.toLocaleString("default", {
              month: "short",
              year: "numeric",
            });
            revenueByMonth[monthYear] =
              (revenueByMonth[monthYear] || 0) + (Number(payment.amount) || 0);
          }
        });

        const formattedRevenueData = Object.entries(revenueByMonth)
          .map(([date, amount]) => ({ date, amount }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        setRevenueData(formattedRevenueData);
      } catch (e) {
        console.error("Error fetching stats:", e);
      }
    };

    const fetchUserData = async () => {
      try {
        const q = query(collection(db, "users"), orderBy("createdAt"));
        const snapshot = await getDocs(q);
        const data = {};

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

        setUserData(formatted);
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

  // const SidebarLinks = () => (
  //   <div className="flex flex-col  gap-4 p-4">
  //     <h5 className="text-xl font-bold mb-8">Admin Dashboard</h5>
  //     <div className="mr-2">
  //       <User2Icon />
  //       <h5>Admin User</h5>
  //     </div>

  //     <Link href="/admin/users">
  //       <Button
  //         variant={pathname === "/admin/users" ? "secondary" : "ghost"}
  //         className="w-full justify-start">
  //         <Users className="mr-2 h-8 w-8" /> Users
  //       </Button>
  //     </Link>
  //     <Link href="/admin/events">
  //       <Button
  //         variant={pathname === "/admin/events" ? "secondary" : "ghost"}
  //         className="w-full justify-start">
  //         <Calendar className="mr-2 h-8 w-8" /> Events
  //       </Button>
  //     </Link>
  //     <Link href="/admin/promotions">
  //       <Button
  //         variant={pathname === "/admin/promotions" ? "secondary" : "ghost"}
  //         className="w-full justify-start">
  //         <Package className="mr-2 h-8 w-8" /> Promotions
  //       </Button>
  //     </Link>
  //     <Link href="/admin/payments">
  //       <Button
  //         variant={pathname === "/admin/payments" ? "secondary" : "ghost"}
  //         className="w-full justify-start">
  //         <DollarSign className="mr-2 h-8 w-8" /> Payments
  //       </Button>
  //     </Link>
  //   </div>
  // );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64  border-r bg-white/55">
        <Sidebar />
      </aside>

      {/* Sidebar Trigger (mobile) */}
      <div className="md:hidden p-2 fixed bg-slate-50 top-2 left-2 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 pt-16 md:pt-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
            <CardHeader>
              <CardTitle className="text-lg">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalUsers}</div>
              <p className="text-purple-100">Active accounts</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardHeader>
              <CardTitle className="text-lg">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalEvents}</div>
              <p className="text-green-100">Published events</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
            <CardHeader>
              <CardTitle className="text-lg">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalBookings}</div>
              <p className="text-blue-100">Confirmed bookings</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white">
            <CardHeader>
              <CardTitle className="text-lg">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                KSh {stats.totalRevenue.toLocaleString()}
              </div>
              <p className="text-yellow-100">Platform earnings</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
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
              <CardTitle>Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statsData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label>
                    {statsData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={pieColors[index % pieColors.length]}
                      />
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
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
