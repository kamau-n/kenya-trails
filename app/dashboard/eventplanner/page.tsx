"use client";
import React, { useState, useEffect } from "react";
import {
  User,
  Calendar,
  Users,
  CreditCard,
  BarChart3,
  FileText,
  Settings,
  Edit,
  Save,
  X,
  Upload,
  Eye,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Search,
  MoreHorizontal,
  MapPin,
  ArrowLeft,
  Building,
  Phone,
  Award,
  Shield,
  Globe,
  Mail,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { booking, events, FirebaseUser } from "@/app/types/dashboardtypes";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { event } from "@/app/types/types";

const samplePayments = [
  {
    id: "pay1",
    bookingId: "book1",
    amount: 299,
    status: "completed",
    method: "card",
    date: "2025-06-01",
    transactionId: "txn_1234567890",
  },
  {
    id: "pay2",
    bookingId: "book2",
    amount: 598,
    status: "pending",
    method: "card",
    date: "2025-06-02",
    transactionId: "txn_0987654321",
  },
  {
    id: "pay3",
    bookingId: "book3",
    amount: 199,
    status: "completed",
    method: "paypal",
    date: "2025-06-03",
    transactionId: "txn_1122334455",
  },
];

const sampleCompliance = [
  {
    id: "doc1",
    type: "Business Registration",
    fileName: "business_registration.pdf",
    uploadDate: "2025-05-15",
    status: "approved",
    expiryDate: "2026-05-15",
  },
  {
    id: "doc2",
    type: "Tax Certificate",
    fileName: "tax_certificate.pdf",
    uploadDate: "2025-05-20",
    status: "pending",
    expiryDate: "2025-12-31",
  },
  {
    id: "doc3",
    type: "Insurance Policy",
    fileName: "insurance_policy.pdf",
    uploadDate: "2025-05-25",
    status: "expired",
    expiryDate: "2025-05-25",
  },
];

const OrganizerDashboard = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [user1, setUser] = useState();
  const [events, setEvents] = useState<events[]>();
  const [bookings, setBookings] = useState<booking[]>();
  const [payments, setPayments] = useState(samplePayments);
  const [compliance, setCompliance] = useState();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  const [selectedEvent, setSelectedEvent] = useState<event>(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const auth = useAuth();
  const user: FirebaseUser = auth?.user;
  const authLoading = auth?.loading || false;
  console.log(auth.user);
  const [editedProfile, setEditedProfile] = useState();
  const router = useRouter();

  const navItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "profile", label: "Profile", icon: User },
    { id: "events", label: "Events", icon: Calendar },
    { id: "bookings", label: "Bookings", icon: Users },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "compliance", label: "Compliance", icon: Settings },
  ];

  useEffect(() => {
    console.log("am inside the use effect");
    if (authLoading) return;
    console.log(user);
    if (!user) {
      router.push("/login");
      return;
    }

    if (user.userType !== "organizer") {
      router.push("/");
    }

    console.log("this is the user data ", user);

    const fetchUserData = async () => {
      try {
        console.log("Am fetching user data");

        if (user.userType === "organizer") {
          // 1. Fetch events organized by the user
          const eventsQuery = query(
            collection(db, "events"),
            where("organizerId", "==", user.uid),
            orderBy("date", "desc")
          );

          const eventsSnapshot = await getDocs(eventsQuery);
          const eventsData = eventsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date?.toDate() || new Date(),
          }));

          setEvents(eventsData);

          // 2. Extract event IDs
          const eventIds = eventsData.map((event) => event.id);

          // 3. Fetch bookings for those event IDs
          let bookingsData = [];
          const bookingChunks = [];

          for (let i = 0; i < eventIds.length; i += 10) {
            bookingChunks.push(eventIds.slice(i, i + 10));
          }

          for (const chunk of bookingChunks) {
            const bookingsQuery = query(
              collection(db, "bookings"),
              where("eventId", "in", chunk),
              orderBy("bookingDate", "desc")
            );

            const bookingsSnapshot = await getDocs(bookingsQuery);
            const chunkData = bookingsSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              bookingDate: doc.data().bookingDate?.toDate() || new Date(),
            }));

            bookingsData = [...bookingsData, ...chunkData];
          }

          setBookings(bookingsData);

          // 4. Fetch payments for only the fetched bookings
          const bookingIds = bookingsData.map((booking) => booking.id);
          let paymentsData = [];
          const paymentChunks = [];

          for (let i = 0; i < bookingIds.length; i += 10) {
            paymentChunks.push(bookingIds.slice(i, i + 10));
          }

          for (const chunk of paymentChunks) {
            const paymentsQuery = query(
              collection(db, "payments"),
              where("bookingId", "in", chunk),
              orderBy("createdAt", "desc")
            );

            const paymentsSnapshot = await getDocs(paymentsQuery);
            const chunkData = paymentsSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date(),
            }));

            paymentsData = [...paymentsData, ...chunkData];
          }

          console.log("these are the fetched payments", paymentsData);
          setPayments(paymentsData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [authLoading, router]);

  // fetch the user data

  const formatDate = (timestamp: any) => {
    if (timestamp?.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString();
    }
    return new Date(timestamp).toLocaleDateString();
  };

  const getStatusIcon = (status: any) => {
    switch (status) {
      case "completed":
      case "confirmed":
      case "published":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
      case "draft":
        return <Clock className="h-4 w-4" />;
      case "failed":
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: any) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusColor = (status: any) => {
    switch (status) {
      case "completed":
      case "confirmed":
      case "approved":
      case "published":
        return "text-green-600 bg-green-100";
      case "pending":
      case "draft":
        return "text-yellow-600 bg-yellow-100";
      case "failed":
      case "expired":
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const handleProfileSave = () => {
    setUser((prev) => ({
      ...prev,
      organizer: editedProfile,
    }));
    setIsEditingProfile(false);
    // Here you would typically save to Firebase
    console.log("Saving profile to Firebase...", editedProfile);
  };

  const handleProfileCancel = () => {
    setEditedProfile(user.organizer);
    setIsEditingProfile(false);
  };

  // Calculate overview stats
  const totalRevenue = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const totalBookings = bookings?.length;
  const totalEvents = events?.length;
  const pendingPayments = payments?.filter(
    (p) => p.status === "pending"
  ).length;

  const renderOverview = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500">+12.5%</span>
            <span className="text-gray-500 ml-1">from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{totalEvents}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-blue-500 mr-1" />
            <span className="text-blue-500">+3</span>
            <span className="text-gray-500 ml-1">new this month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Bookings
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {totalBookings}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-purple-500 mr-1" />
            <span className="text-purple-500">+8.2%</span>
            <span className="text-gray-500 ml-1">from last week</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Pending Payments
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {pendingPayments}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <AlertTriangle className="h-4 w-4 text-orange-500 mr-1" />
            <span className="text-orange-500">Requires attention</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {bookings?.slice(0, 5).map((booking) => (
            <div
              key={booking.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {booking.userName}
                  </p>
                  <p className="text-sm text-gray-500">
                    booked {booking.eventTitle}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">
                  {formatCurrency(booking.totalAmount)}
                </p>
                <p className="text-sm text-gray-500">
                  {booking.bookingDate.toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className=" mx-auto p-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl font-bold">
                {user?.displayName?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold">{user?.displayName}</h1>
              <p className="text-blue-100 mt-1">{user?.email}</p>
            </div>
          </div>

          {!isEditingProfile ? (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200 border border-white/30">
              <Edit className="h-5 w-5" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleProfileSave}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 shadow-lg">
                <Save className="h-5 w-5" />
                Save Changes
              </button>
              <button
                onClick={handleProfileCancel}
                className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200 border border-white/30">
                <X className="h-5 w-5" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-b-xl shadow-xl border border-gray-100">
        {/* Profile Information Section */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            Profile Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Display Name */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Display Name
              </label>
              {isEditingProfile ? (
                <input
                  type="text"
                  value={user.displayName}
                  onChange={(e) =>
                    setUser((prev) => ({
                      ...prev,
                      displayName: e.target.value,
                    }))
                  }
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="Enter your display name"
                />
              ) : (
                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <p className="text-gray-800 font-medium">
                    {user?.displayName}
                  </p>
                </div>
              )}
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Email Address
              </label>
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <p className="text-gray-800 font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Organization */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Organization
              </label>
              {isEditingProfile ? (
                <input
                  type="text"
                  value={editedProfile.organization}
                  onChange={(e) =>
                    setEditedProfile((prev) => ({
                      ...prev,
                      organization: e.target.value,
                    }))
                  }
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="Enter your organization"
                />
              ) : (
                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <p className="text-gray-800 font-medium flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-600" />
                    {user?.organizer.organization}
                  </p>
                </div>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Phone Number
              </label>
              {isEditingProfile ? (
                <input
                  type="tel"
                  value={editedProfile.phoneNumber}
                  onChange={(e) =>
                    setEditedProfile((prev) => ({
                      ...prev,
                      phoneNumber: e.target.value,
                    }))
                  }
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="Enter your phone number"
                />
              ) : (
                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <p className="text-gray-800 font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-600" />
                    {user?.organizer.phoneNumber}
                  </p>
                </div>
              )}
            </div>

            {/* Website */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Website
              </label>
              {isEditingProfile ? (
                <input
                  type="url"
                  value={editedProfile.website}
                  onChange={(e) =>
                    setEditedProfile((prev) => ({
                      ...prev,
                      website: e.target.value,
                    }))
                  }
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="https://your-website.com"
                />
              ) : (
                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <p className="text-gray-800 font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-600" />
                    {user?.organizer.website ? (
                      <a
                        href={user.organizer.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline">
                        {user.organizer.website}
                      </a>
                    ) : (
                      <span className="text-gray-500">No website provided</span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Experience */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Experience Level
              </label>
              {isEditingProfile ? (
                <select
                  value={editedProfile.experience}
                  onChange={(e) =>
                    setEditedProfile((prev) => ({
                      ...prev,
                      experience: e.target.value,
                    }))
                  }
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white">
                  <option value="">Select experience level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              ) : (
                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <p className="text-gray-800 font-medium flex items-center gap-2">
                    <Award className="h-4 w-4 text-gray-600" />
                    {user?.organizer.experience}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bio Section */}
          <div className="mt-8 space-y-3">
            <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Bio
            </label>
            {isEditingProfile ? (
              <textarea
                value={editedProfile.bio}
                onChange={(e) =>
                  setEditedProfile((prev) => ({ ...prev, bio: e.target.value }))
                }
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                rows={4}
                placeholder="Tell us about yourself..."
              />
            ) : (
              <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <p className="text-gray-800 leading-relaxed">
                  {user?.organizer.bio || "No bio provided yet."}
                </p>
              </div>
            )}
          </div>

          {/* Certifications Section */}
          <div className="mt-8 space-y-3">
            <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Certifications
            </label>
            {isEditingProfile ? (
              <textarea
                value={editedProfile.certifications}
                onChange={(e) =>
                  setEditedProfile((prev) => ({
                    ...prev,
                    certifications: e.target.value,
                  }))
                }
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                rows={3}
                placeholder="List your certifications..."
              />
            ) : (
              <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <p className="text-gray-800 leading-relaxed">
                  {user?.organizer.certifications ||
                    "No certifications listed."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Account Status Section */}
        <div className="border-t border-gray-200 bg-gray-50 p-8 rounded-b-xl">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            Account Status
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                Member Since
              </label>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    {formatDate(user?.createdAt)}
                  </p>
                  <p className="text-sm text-gray-500">Registration date</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                Onboarding Status
              </label>
              <div className="flex items-center gap-3">
                {user?.organizer.onboardingCompleted ? (
                  <>
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-green-600">
                        Completed
                      </p>
                      <p className="text-sm text-gray-500">All set up!</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <XCircle className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-orange-600">
                        Pending
                      </p>
                      <p className="text-sm text-gray-500">Setup required</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEvents = () => {
    if (selectedEvent) {
      return renderEventDetails(selectedEvent);
    }

    const filteredEvents = events?.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterStatus === "all" || event.status === filterStatus;
      return matchesSearch && matchesFilter;
    });

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Events</h2>
          <button
            onClick={() => router.push("/organize/create")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Create Event
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents?.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-48 bg-gray-200 relative">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      event?.status
                    )}`}>
                    {event?.status}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {event.title}
                  </h3>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {event?.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {event.date.toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    {event.totalSpaces - event.availableSpaces}/
                    {event.totalSpaces} registered
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-gray-900">
                    {formatCurrency(event.price)}
                  </span>
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderEventDetails = (event: any) => {
    const eventBookings = bookings?.filter(
      (booking) => booking.eventId === event.id
    );
    const eventRevenue = eventBookings
      ?.filter((booking) => booking.paymentStatus === "completed")
      .reduce((sum, booking) => sum + booking.totalAmount, 0);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedEvent(null)}
            className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
        </div>

        {/* Event Overview */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              <p className="text-gray-600 mb-4">{event.description}</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{event.date.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 mr-2" />
                  <span>{formatCurrency(event.price)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{event.totalSpaces} total capacity</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Event Statistics
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Total Bookings
                    </span>
                    <span className="font-medium">{eventBookings?.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Revenue</span>
                    <span className="font-medium">
                      {formatCurrency(eventRevenue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Registered</span>
                    <span className="font-medium">
                      {event.totalSpaces - event.availableSpaces}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Available</span>
                    <span className="font-medium">{event.availableSpaces}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    selectedEvent.paymentManagement === "platform"
                      ? router.push(
                          `/organize/events/${selectedEvent?.id}/payments`
                        )
                      : router.push(
                          `/organize/events/${selectedEvent?.id}/bookings`
                        );
                  }}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-blue-700">
                  Manage Payments
                </button>
                <button
                  onClick={() => {
                    router.push(`/events/${selectedEvent?.id}/edit`);
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Edit Event
                </button>
                <button
                  onClick={() => {
                    router.push(`/events/${selectedEvent?.id}`);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  View Public Page
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Event Bookings */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Event Bookings ({eventBookings?.length})
          </h3>

          {eventBookings?.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No bookings yet for this event</p>
            </div>
          ) : (
            <div className="space-y-4">
              {eventBookings?.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedBooking(booking)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {booking.userName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {booking?.userEmail}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Tickets</p>
                        <p className="font-medium">{booking.numberOfPeople}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="font-medium">
                          {formatCurrency(booking.totalAmount)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Status</p>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            booking.status
                          )}`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Payment</p>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            booking.paymentStatus
                          )}`}>
                          {booking.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderBookings = () => {
    if (selectedBooking) {
      return renderBookingDetails(selectedBooking);
    }

    const filteredBookings = bookings?.filter((booking) => {
      const matchesSearch =
        booking.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.eventTitle.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterStatus === "all" || booking.status === filterStatus;
      return matchesSearch && matchesFilter;
    });

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">All Bookings</h2>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Bookings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBookings?.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedBooking(booking)}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {booking.userName}
                  </h3>
                  <p className="text-sm text-gray-500">{booking.userEmail}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    booking.status
                  )}`}>
                  {booking.status}
                </span>
              </div>

              <div className="mb-4">
                <p className="font-medium text-gray-900">
                  {booking.eventTitle}
                </p>
                <p className="text-sm text-gray-500">
                  Booked on {booking.bookingDate.toLocaleDateString()}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Tickets</p>
                  <p className="font-semibold text-gray-900">
                    {booking.numberOfPeople}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(booking.totalAmount)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Payment</p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      booking.paymentStatus
                    )}`}>
                    {booking.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBookingDetails = (booking: any) => {
    const bookingPayments = payments.filter(
      (payment) => payment.bookingId === booking.id
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedBooking(null)}
            className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
        </div>

        {/* Booking Overview */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Customer Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Name
                  </label>
                  <p className="text-gray-900">{booking.userName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p className="text-gray-900">{booking.userEmail}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Booking Date
                  </label>
                  <p className="text-gray-900">
                    {booking.bookingDate.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Booking Details
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Event
                  </label>
                  <p className="text-gray-900">{booking.eventTitle}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Ticket Type
                  </label>
                  <p className="text-gray-900">{booking.ticketType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Number of Tickets
                  </label>
                  <p className="text-gray-900">{booking.numberOfPeople}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Total Amount
                  </label>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(booking.totalAmount)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      booking.status
                    )}`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Payment Information
          </h3>

          {bookingPayments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No payment records found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookingPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Transaction ID
                      </label>
                      <p className="text-sm font-mono text-gray-900">
                        {payment.reference}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Amount
                      </label>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(payment.amount)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Method
                      </label>
                      <p className="text-gray-900 capitalize">
                        {payment.channel}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Status
                      </label>
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          payment.status
                        )}`}>
                        {getStatusIcon(payment.status)}
                        <span className="ml-1">{payment.status}</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Payment Date:</span>
                      <span className="text-gray-900">{payment.date}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Processing Fee:</span>
                      <span className="text-gray-900">
                        {formatCurrency(payment.platformFee)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPayments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Payments</h2>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Pending Payments
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {pendingPayments}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Processing Fees
              </p>
              <p className="text-2xl font-bold text-gray-600">
                {formatCurrency(
                  payments.reduce((sum, p) => sum + p.processingFee, 0)
                )}
              </p>
            </div>
            <div className="p-3 bg-gray-100 rounded-full">
              <CreditCard className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Payments
        </h3>
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-2 rounded-full ${
                      payment.status === "completed"
                        ? "bg-green-100"
                        : payment.status === "pending"
                        ? "bg-yellow-100"
                        : "bg-red-100"
                    }`}>
                    {getStatusIcon(payment.status)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {payment.customerName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {payment.eventTitle}
                    </p>
                    <p className="text-xs text-gray-400 font-mono">
                      {payment.transactionId}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(payment.amount)}
                  </p>
                  <p className="text-sm text-gray-500">{payment.date}</p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      payment.status
                    )}`}>
                    {payment.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Reports</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Revenue Analytics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalRevenue * 0.4)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Last Month</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(totalRevenue * 0.3)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Event Performance</h3>
          <div className="space-y-4">
            {events?.map((event) => {
              const registrationRate = (
                (event.registered / event.availableSpaces) *
                100
              ).toFixed(1);
              const revenue = event.registered * event.price;
              return (
                <div key={event.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{event.title}</h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                        event.status
                      )}`}>
                      {event.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Registration Rate</p>
                      <p className="font-semibold">{registrationRate}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Revenue</p>
                      <p className="font-semibold">{formatCurrency(revenue)}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${registrationRate}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Export Reports</h3>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export All Data
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Events Report</h4>
            <p className="text-sm text-gray-600 mb-4">
              Detailed analysis of all your events including performance metrics
              and attendance data.
            </p>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2">
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Financial Report</h4>
            <p className="text-sm text-gray-600 mb-4">
              Complete financial overview including payments, refunds, and
              revenue analysis.
            </p>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2">
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Customer Report</h4>
            <p className="text-sm text-gray-600 mb-4">
              Comprehensive customer data including booking history and
              demographics.
            </p>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2">
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompliance = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Compliance Documents</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload Document
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">
                {compliance?.filter((doc) => doc.status === "approved").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {compliance?.filter((doc) => doc.status === "pending").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Expired</p>
              <p className="text-2xl font-bold text-red-600">
                {compliance?.filter((doc) => doc.status === "expired").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Document Requirements</h3>
          <p className="text-sm text-gray-600 mt-1">
            Please ensure all required documents are uploaded and up to date to
            maintain compliance.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Upload Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {compliance?.map((doc) => (
                <tr key={doc.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{doc.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {doc.fileName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(doc.uploadDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(doc.expiryDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                        doc.status
                      )}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-800">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="text-yellow-600 hover:text-yellow-800">
                        <Upload className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Upload New Document</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Type
            </label>
            <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Select document type</option>
              <option>Business Registration</option>
              <option>Tax Certificate</option>
              <option>Insurance Policy</option>
              <option>Professional License</option>
              <option>Health & Safety Certificate</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Date
            </label>
            <input
              type="date"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload File
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              Drag and drop your file here, or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Supported formats: PDF, JPG, PNG (Max 10MB)
            </p>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Choose File
            </button>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Upload Document
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6 w-full">
      <div className="w-5/6 mx-auto">
        {/* Navigation Tabs */}
        <div className="mb-6 flex flex-wrap gap-3">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                activeTab === id
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}>
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Active Tab Content */}
        <div>
          {activeTab === "overview" && renderOverview()}
          {activeTab === "profile" && renderProfile()}
          {activeTab === "events" && renderEvents()}
          {activeTab === "bookings" && renderBookings()}
          {activeTab === "payments" && renderPayments()}
          {activeTab === "reports" && renderReports()}
          {activeTab === "compliance" && renderCompliance()}
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
