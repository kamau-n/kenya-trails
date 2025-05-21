"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  TrendingUp,
  Activity,
  Calendar,
  Package,
  DollarSign,
  Users,
  ArrowUpRight,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaystackBalanceResponse } from "../api/paystack/balance/route";

export default function AdminDashboard() {
  const pathname = usePathname();
  const [balances, setBalances] = useState<PaystackBalanceResponse[]>([]);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    activeEvents: 0,
    totalPackages: 0,
    totalRevenue: 0,
    totalBookings: 0,
    totalWithdrawals: 0,
    totalEarned: 0,
  });

  const COLORS = ["#4ade80", "#f87171", "#60a5fa", "#f59e0b"];
  const CHART_COLORS = {
    revenue: "#4ade80",
    profit: "#60a5fa",
    withdrawals: "#f87171",
    users: "#8b5cf6",
  };

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
        const withdrawalsSnapshot = await getDocs(
          collection(db, "withdrawals")
        );

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

        const totalWithdrawals = withdrawalsSnapshot.docs.reduce((sum, doc) => {
          const payment = doc.data();
          return payment.status === "completed"
            ? sum + (Number(payment.netAmount) || 0)
            : sum;
        }, 0);

        setStats({
          totalUsers: usersSnapshot.size,
          totalEvents: eventsSnapshot.size,
          activeEvents,
          totalPackages: packagesSnapshot.size,
          totalRevenue,
          totalBookings: bookingsSnapshot.size,
          totalWithdrawals: totalWithdrawals,
          totalEarned: totalRevenue - totalWithdrawals,
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

  useEffect(() => {
    async function fetchBalances() {
      try {
        const res = await fetch("/api/paystack/balance");
        const data = await res.json();

        console.log("this is the response from paystack", data);
        if (data.status) {
          setBalances(data.data); // 'data' contains the array of banks
        }
      } catch (e) {
        console.error("Failed to fetch balances:", e);
      } finally {
        // setLoadingBanks(false);
      }
    }

    fetchBalances();
  }, []);

  const statsData = [
    { name: "Users", value: stats.totalUsers, color: "#8b5cf6" },
    { name: "Events", value: stats.totalEvents, color: "#3b82f6" },
    { name: "Active Events", value: stats.activeEvents, color: "#10b981" },
    { name: "Promotions", value: stats.totalPackages, color: "#f59e0b" },
  ];

  const pieColors = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b"];

  const financeData = [
    { name: "Total Revenue", value: stats.totalRevenue, color: "#4ade80" },
    {
      name: "Net Profit",
      value: stats.totalRevenue - stats.totalWithdrawals,
      color: "#60a5fa",
    },
    {
      name: "Total Withdrawals",
      value: stats.totalWithdrawals,
      color: "#f87171",
    },
  ];

  const StatCard = ({ title, value, description, icon, trend, color }) => (
    <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium text-gray-700">
            {title}
          </CardTitle>
          <div className={`p-2 rounded-lg bg-opacity-20 ${color}`}>{icon}</div>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-end">
          <div className="text-3xl font-bold">{value}</div>
          {trend && (
            <div
              className={`flex items-center text-sm ${
                trend > 0 ? "text-green-500" : "text-red-500"
              }`}>
              {trend > 0 ? "+" : ""}
              {trend}%
              <ArrowUpRight
                className={`ml-1 h-4 w-4 ${
                  trend < 0 ? "transform rotate-90" : ""
                }`}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const ChartCard = ({ title, children, icon }) => (
    <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <CardTitle className="text-lg font-medium text-gray-700">
          {title}
        </CardTitle>
        <div className="p-2 rounded-lg bg-gray-100">{icon}</div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );

  const getCustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border shadow-md rounded-md">
          <p className="font-medium">{`${
            payload[0].name
          }: ${payload[0].value.toLocaleString()}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 border-r bg-white shadow-sm">
        <Sidebar />
      </aside>

      {/* Sidebar Trigger (mobile) */}
      <div className="md:hidden p-2 fixed bg-white top-2 left-2 z-50 shadow-md rounded-md">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            {/* <Button variant="outline" size="icon" className="rounded-md">
              <Menu />
            </Button> */}
            <Sidebar />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 pt-16 md:pt-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            Dashboard Overview
          </h1>
          <p className="text-gray-500">
            Welcome back! Here's what's happening with your platform.
          </p>
        </div>

        <Tabs
          defaultValue="overview"
          className="mb-8"
          onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="finance">Finance</TabsTrigger>
            <TabsTrigger value="users">Users & Events</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="Users"
                value={stats.totalUsers.toLocaleString()}
                description="Active accounts"
                icon={<Users className="h-5 w-5 text-purple-500" />}
                trend={7.2}
                color="bg-purple-100"
              />
              <StatCard
                title="Events"
                value={stats.totalEvents.toLocaleString()}
                description="Published events"
                icon={<Calendar className="h-5 w-5 text-blue-500" />}
                trend={4.1}
                color="bg-blue-100"
              />
              <StatCard
                title="Bookings"
                value={stats.totalBookings.toLocaleString()}
                description="Confirmed bookings"
                icon={<Package className="h-5 w-5 text-green-500" />}
                trend={12.5}
                color="bg-green-100"
              />
              <StatCard
                title="Revenue"
                value={`KSh ${stats.totalRevenue.toLocaleString()}`}
                description="Platform earnings"
                icon={<DollarSign className="h-5 w-5 text-yellow-500" />}
                trend={5.8}
                color="bg-yellow-100"
              />
            </div>

            {/* Main Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <ChartCard
                title="Revenue Overview"
                icon={<TrendingUp className="h-5 w-5 text-gray-500" />}>
                {loadingUserData ? (
                  <div className="flex justify-center items-center h-72">
                    <p>Loading data...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient
                          id="colorRevenue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1">
                          <stop
                            offset="5%"
                            stopColor={CHART_COLORS.revenue}
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor={CHART_COLORS.revenue}
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <Tooltip content={getCustomTooltip} />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke={CHART_COLORS.revenue}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              <ChartCard
                title="User Growth"
                icon={<Activity className="h-5 w-5 text-gray-500" />}>
                {loadingUserData ? (
                  <div className="flex justify-center items-center h-72">
                    <p>Loading data...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={userData}>
                      <defs>
                        <linearGradient
                          id="colorUsers"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1">
                          <stop
                            offset="5%"
                            stopColor={CHART_COLORS.users}
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor={CHART_COLORS.users}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip content={getCustomTooltip} />
                      <Line
                        type="monotone"
                        dataKey="users"
                        stroke={CHART_COLORS.users}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        fill="url(#colorUsers)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ChartCard
                title="Platform Distribution"
                icon={<PieChartIcon className="h-5 w-5 text-gray-500" />}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      label>
                      {statsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={getCustomTooltip} />
                    <Legend
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      formatter={(value, entry, index) => (
                        <span className="text-gray-700">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard
                title="Metrics Overview"
                icon={<BarChart3 className="h-5 w-5 text-gray-500" />}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statsData} barGap={8} barSize={36}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f0f0f0"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                    />
                    <YAxis tick={{ fontSize: 12 }} axisLine={false} />
                    <Tooltip content={getCustomTooltip} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {statsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </TabsContent>

          <TabsContent value="finance">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="Total Revenue"
                value={`KSh ${stats.totalRevenue.toLocaleString()}`}
                description="All platform earnings"
                icon={<DollarSign className="h-5 w-5 text-green-500" />}
                trend={5.8}
                color="bg-green-100"
              />

              <StatCard
                title="Account Balance"
                value={`KSh ${
                  balances
                    ?.reduce((total, item) => total + item.balance, 0)
                    .toLocaleString("en-KE", { minimumFractionDigits: 2 }) ||
                  "0.00"
                }`}
                description="All account balances"
                icon={<DollarSign className="h-5 w-5 text-green-500" />}
                trend={5.8}
                color="bg-green-100"
              />
              <StatCard
                title="Net Profit"
                value={`KSh ${(
                  stats.totalRevenue - stats.totalWithdrawals
                ).toLocaleString()}`}
                description="After withdrawals"
                icon={<TrendingUp className="h-5 w-5 text-blue-500" />}
                trend={3.2}
                color="bg-blue-100"
              />
              <StatCard
                title="Total Withdrawals"
                value={`KSh ${stats.totalWithdrawals.toLocaleString()}`}
                description="Completed payouts"
                icon={<Activity className="h-5 w-5 text-red-500" />}
                trend={-2.4}
                color="bg-red-100"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ChartCard
                title="Revenue Breakdown"
                icon={<PieChartIcon className="h-5 w-5 text-gray-500" />}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={financeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      label>
                      {financeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={getCustomTooltip} />
                    <Legend
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      formatter={(value, entry, index) => (
                        <span className="text-gray-700">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard
                title="Monthly Revenue"
                icon={<TrendingUp className="h-5 w-5 text-gray-500" />}>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient
                        id="colorMonthlyRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1">
                        <stop
                          offset="5%"
                          stopColor={CHART_COLORS.revenue}
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor={CHART_COLORS.revenue}
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <Tooltip content={getCustomTooltip} />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke={CHART_COLORS.revenue}
                      fillOpacity={1}
                      fill="url(#colorMonthlyRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="Total Users"
                value={stats.totalUsers.toLocaleString()}
                description="Active accounts"
                icon={<Users className="h-5 w-5 text-purple-500" />}
                trend={7.2}
                color="bg-purple-100"
              />
              <StatCard
                title="Total Events"
                value={stats.totalEvents.toLocaleString()}
                description="All events"
                icon={<Calendar className="h-5 w-5 text-blue-500" />}
                trend={4.1}
                color="bg-blue-100"
              />
              <StatCard
                title="Active Events"
                value={stats.activeEvents.toLocaleString()}
                description="Upcoming events"
                icon={<Calendar className="h-5 w-5 text-green-500" />}
                trend={9.3}
                color="bg-green-100"
              />
              <StatCard
                title="Promotions"
                value={stats.totalPackages.toLocaleString()}
                description="Active packages"
                icon={<Package className="h-5 w-5 text-yellow-500" />}
                trend={2.8}
                color="bg-yellow-100"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ChartCard
                title="User Growth"
                icon={<Activity className="h-5 w-5 text-gray-500" />}>
                {loadingUserData ? (
                  <div className="flex justify-center items-center h-72">
                    <p>Loading data...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={userData}>
                      <defs>
                        <linearGradient
                          id="colorUsers2"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1">
                          <stop
                            offset="5%"
                            stopColor={CHART_COLORS.users}
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor={CHART_COLORS.users}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip content={getCustomTooltip} />
                      <Line
                        type="monotone"
                        dataKey="users"
                        stroke={CHART_COLORS.users}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        fill="url(#colorUsers2)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              <ChartCard
                title="Event Distribution"
                icon={<PieChartIcon className="h-5 w-5 text-gray-500" />}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "Total Events",
                          value: stats.totalEvents,
                          color: "#3b82f6",
                        },
                        {
                          name: "Active Events",
                          value: stats.activeEvents,
                          color: "#10b981",
                        },
                        {
                          name: "Promotions",
                          value: stats.totalPackages,
                          color: "#f59e0b",
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      label>
                      {[
                        {
                          name: "Total Events",
                          value: stats.totalEvents,
                          color: "#3b82f6",
                        },
                        {
                          name: "Active Events",
                          value: stats.activeEvents,
                          color: "#10b981",
                        },
                        {
                          name: "Promotions",
                          value: stats.totalPackages,
                          color: "#f59e0b",
                        },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={getCustomTooltip} />
                    <Legend
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      formatter={(value, entry, index) => (
                        <span className="text-gray-700">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
