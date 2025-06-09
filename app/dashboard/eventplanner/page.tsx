"use client";
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  MapPin,
  CreditCard,
  TrendingUp,
  FileText,
  Upload,
  Download,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  DollarSign,
  Award,
  Building,
  Mail,
  Phone,
  Globe,
  Shield,
  Settings,
  Star,
  Calendar as CalendarIcon,
  Filter,
  Search,
} from "lucide-react";

const EventManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("30");

  // Mock data - in real app, this would come from your backend
  const organizerProfile = {
    name: "Sarah Johnson",
    email: "sarah@eventsco.com",
    phone: "+254 712 345 678",
    company: "Premier Events Co.",
    website: "www.premierevents.co.ke",
    bio: "Professional event organizer with 8+ years of experience in corporate and social events across Kenya.",
    experience: "8 years",
    specialties: [
      "Corporate Events",
      "Weddings",
      "Conferences",
      "Team Building",
    ],
    rating: 4.8,
    totalEvents: 156,
    completedEvents: 142,
    verificationStatus: "verified",
    joinDate: "2018-03-15",
  };

  const dashboardStats = {
    totalRevenue: 2450000,
    totalBookings: 89,
    activeEvents: 12,
    completedEvents: 142,
    upcomingEvents: 8,
    totalAttendees: 5670,
    averageRating: 4.8,
    pendingPayments: 145000,
  };

  const recentEvents = [
    {
      id: "1",
      title: "Annual Tech Conference 2024",
      date: "2024-07-15",
      location: "KICC, Nairobi",
      status: "upcoming",
      attendees: 450,
      revenue: 675000,
      bookings: 45,
      availableSpaces: 50,
    },
    {
      id: "2",
      title: "Corporate Team Building Retreat",
      date: "2024-06-20",
      location: "Lake Naivasha Resort",
      status: "completed",
      attendees: 120,
      revenue: 240000,
      bookings: 12,
      availableSpaces: 0,
    },
    {
      id: "3",
      title: "Wedding Reception - Patel & Smith",
      date: "2024-06-10",
      location: "Safari Park Hotel",
      status: "completed",
      attendees: 200,
      revenue: 450000,
      bookings: 20,
      availableSpaces: 0,
    },
    {
      id: "4",
      title: "Music Festival - Summer Vibes",
      date: "2024-08-01",
      location: "Uhuru Gardens",
      status: "upcoming",
      attendees: 800,
      revenue: 1200000,
      bookings: 80,
      availableSpaces: 200,
    },
  ];

  const recentBookings = [
    {
      id: "BK001",
      eventTitle: "Annual Tech Conference 2024",
      customerName: "John Doe",
      customerEmail: "john@email.com",
      bookingDate: "2024-06-01",
      attendees: 5,
      amount: 15000,
      status: "confirmed",
      paymentStatus: "paid",
    },
    {
      id: "BK002",
      eventTitle: "Music Festival - Summer Vibes",
      customerName: "Jane Smith",
      customerEmail: "jane@email.com",
      bookingDate: "2024-06-02",
      attendees: 2,
      amount: 3000,
      status: "pending",
      paymentStatus: "partial",
    },
    {
      id: "BK003",
      eventTitle: "Corporate Team Building Retreat",
      customerName: "Mike Johnson",
      customerEmail: "mike@company.com",
      bookingDate: "2024-05-28",
      attendees: 10,
      amount: 25000,
      status: "confirmed",
      paymentStatus: "paid",
    },
  ];

  const complianceDocuments = [
    {
      id: "1",
      name: "Business Registration Certificate",
      type: "registration",
      uploadDate: "2024-01-15",
      status: "approved",
      expiryDate: "2025-01-15",
    },
    {
      id: "2",
      name: "Tax Compliance Certificate",
      type: "tax",
      uploadDate: "2024-02-01",
      status: "approved",
      expiryDate: "2024-12-31",
    },
    {
      id: "3",
      name: "Public Liability Insurance",
      type: "insurance",
      uploadDate: "2024-03-10",
      status: "pending",
      expiryDate: "2025-03-10",
    },
    {
      id: "4",
      name: "Event License Template",
      type: "license",
      uploadDate: "2024-01-20",
      status: "approved",
      expiryDate: null,
    },
  ];

  const paymentHistory = [
    {
      id: "PAY001",
      eventTitle: "Annual Tech Conference 2024",
      amount: 15000,
      date: "2024-06-01",
      method: "M-Pesa",
      status: "completed",
      reference: "MP240601001",
    },
    {
      id: "PAY002",
      eventTitle: "Music Festival - Summer Vibes",
      amount: 1500,
      date: "2024-06-02",
      method: "Card",
      status: "completed",
      reference: "CD240602001",
    },
    {
      id: "PAY003",
      eventTitle: "Corporate Team Building Retreat",
      amount: 25000,
      date: "2024-05-28",
      method: "Bank Transfer",
      status: "completed",
      reference: "BT240528001",
    },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      upcoming: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      draft: "bg-gray-100 text-gray-800",
      confirmed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      partial: "bg-yellow-100 text-yellow-800",
      unpaid: "bg-red-100 text-red-800",
      approved: "bg-green-100 text-green-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusStyles[status] || "bg-gray-100 text-gray-800"
        }`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const StatCard = ({ title, value, icon: Icon, change, color = "blue" }) => (
    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-l-blue-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p
              className={`text-sm ${
                change > 0 ? "text-green-600" : "text-red-600"
              } flex items-center mt-1`}>
              <TrendingUp className="h-4 w-4 mr-1" />
              {change > 0 ? "+" : ""}
              {change}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(dashboardStats.totalRevenue)}
          icon={DollarSign}
          change={12.5}
          color="green"
        />
        <StatCard
          title="Total Bookings"
          value={dashboardStats.totalBookings}
          icon={Users}
          change={8.2}
          color="blue"
        />
        <StatCard
          title="Active Events"
          value={dashboardStats.activeEvents}
          icon={Calendar}
          change={-2.1}
          color="purple"
        />
        <StatCard
          title="Avg Rating"
          value={`${dashboardStats.averageRating}/5`}
          icon={Star}
          color="yellow"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Events */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Events</h3>
          <div className="space-y-3">
            {recentEvents.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{event.title}</p>
                  <p className="text-xs text-gray-600">
                    {formatDate(event.date)} • {event.location}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(event.status)}
                  <span className="text-sm font-medium">
                    {formatCurrency(event.revenue)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
          <div className="space-y-3">
            {recentBookings.slice(0, 3).map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{booking.customerName}</p>
                  <p className="text-xs text-gray-600">{booking.eventTitle}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(booking.paymentStatus)}
                  <span className="text-sm font-medium">
                    {formatCurrency(booking.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Organizer Profile</h3>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Photo & Basic Info */}
          <div className="text-center">
            <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Users className="h-12 w-12 text-gray-400" />
            </div>
            <h4 className="text-xl font-semibold">{organizerProfile.name}</h4>
            <p className="text-gray-600">{organizerProfile.company}</p>
            <div className="flex items-center justify-center mt-2">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="ml-1 text-sm font-medium">
                {organizerProfile.rating}
              </span>
              <span className="ml-1 text-sm text-gray-600">
                ({organizerProfile.totalEvents} events)
              </span>
            </div>
            {getStatusBadge(organizerProfile.verificationStatus)}
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h5 className="font-semibold text-gray-900">Contact Information</h5>
            <div className="space-y-3">
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-sm">{organizerProfile.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-sm">{organizerProfile.phone}</span>
              </div>
              <div className="flex items-center">
                <Globe className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-sm">{organizerProfile.website}</span>
              </div>
              <div className="flex items-center">
                <Building className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-sm">{organizerProfile.company}</span>
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <div className="space-y-4">
            <h5 className="font-semibold text-gray-900">
              Professional Details
            </h5>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Experience</p>
                <p className="font-medium">{organizerProfile.experience}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Specialties</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {organizerProfile.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="font-medium">
                  {formatDate(organizerProfile.joinDate)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-6 pt-6 border-t">
          <h5 className="font-semibold text-gray-900 mb-2">About</h5>
          <p className="text-gray-700">{organizerProfile.bio}</p>
        </div>
      </div>
    </div>
  );

  const renderEvents = () => (
    <div className="space-y-6">
      {/* Events Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-semibold">My Events</h3>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Create Event
            </button>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {recentEvents.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-lg shadow overflow-hidden">
            <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
              <div className="absolute top-4 right-4">
                {getStatusBadge(event.status)}
              </div>
              <div className="absolute bottom-4 left-4 text-white">
                <h4 className="font-semibold text-lg">{event.title}</h4>
                <p className="text-sm opacity-90">{formatDate(event.date)}</p>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-sm">{event.location}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Attendees</p>
                  <p className="font-semibold">{event.attendees}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="font-semibold text-green-600">
                    {formatCurrency(event.revenue)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-green-600 hover:bg-green-50 rounded">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-600">
                  {event.bookings} bookings
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBookings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">All Bookings</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Booking ID
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Customer
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Event
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Date
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Attendees
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Amount
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-xs">{booking.id}</td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium">{booking.customerName}</p>
                      <p className="text-xs text-gray-600">
                        {booking.customerEmail}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4">{booking.eventTitle}</td>
                  <td className="py-3 px-4">
                    {formatDate(booking.bookingDate)}
                  </td>
                  <td className="py-3 px-4">{booking.attendees}</td>
                  <td className="py-3 px-4 font-medium">
                    {formatCurrency(booking.amount)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      {getStatusBadge(booking.status)}
                      {getStatusBadge(booking.paymentStatus)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      {/* Report Period Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Analytics & Reports</h3>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-lg font-semibold mb-4">Revenue Trends</h4>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">
              Revenue chart would be displayed here
            </p>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h5 className="font-semibold mb-4">Event Performance</h5>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Events</span>
              <span className="font-medium">{dashboardStats.totalEvents}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="font-medium text-green-600">
                {dashboardStats.completedEvents}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Success Rate</span>
              <span className="font-medium">91%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h5 className="font-semibold mb-4">Financial Summary</h5>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Revenue</span>
              <span className="font-medium">
                {formatCurrency(dashboardStats.totalRevenue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Pending Payments</span>
              <span className="font-medium text-yellow-600">
                {formatCurrency(dashboardStats.pendingPayments)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Avg per Event</span>
              <span className="font-medium">
                {formatCurrency(
                  dashboardStats.totalRevenue / dashboardStats.totalEvents
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h5 className="font-semibold mb-4">Customer Metrics</h5>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Attendees</span>
              <span className="font-medium">
                {dashboardStats.totalAttendees.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Avg Rating</span>
              <span className="font-medium text-yellow-600">
                {dashboardStats.averageRating}/5
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Repeat Customers</span>
              <span className="font-medium">68%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-lg font-semibold mb-4">Export Reports</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Revenue Report (PDF)
          </button>
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Bookings Report (Excel)
          </button>
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Customer Report (CSV)
          </button>
        </div>
      </div>
    </div>
  );

  //   const renderPayments = () => (
  // <div className="space-y-6">
  //   {/* Payment Summary */}
  //   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  //     <div className="bg-white rounded-lg shadow p-6">
  //       <div className="flex items-center justify-between">
  //         <div>
  //           <p className="text-sm text-gray-600">Total Collected</p>
  //           <p className="text-2xl font-bold text-green-600">{formatCurrency(2305000)}</p>
  //         </div
};

export default EventManagerDashboard;
