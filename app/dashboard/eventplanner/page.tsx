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
        // Fetch user's bookings
        // const bookingsQuery = query(
        //   collection(db, "bookings"),
        //   where("userId", "==", user?.uid),
        //   orderBy("bookingDate", "desc")
        // );

        // const bookingsSnapshot = await getDocs(bookingsQuery);
        // const bookingsData = bookingsSnapshot.docs.map((doc) => ({
        //   id: doc.id,
        //   ...doc.data(),
        //   bookingDate: doc.data().bookingDate?.toDate() || new Date(),
        // }));

        // console.log("this is the booking data", bookingsData);

        // setBookings(bookingsData);

        // If user is an organizer, fetch their events and payments

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

        console.log(eventsData);

        setEvents(eventsData);

        // Fetch payments for promoted events
        const paymentsQuery = query(
          collection(db, "payments"),
          where("organizerId", "==", user.uid)
          // where("status", "==", "completed")
        );

        const paymentsSnapshot = await getDocs(paymentsQuery);
        const paymentsData = paymentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));

        setPayments(paymentsData);
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
    .reduce((sum, p) => sum + p.amount, 0);
  const totalBookings = bookings?.length || 0;
  const totalEvents = events?.length || 0;
  const pendingPayments = payments.filter((p) => p.status === "pending").length;

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-blue-600">
                {totalBookings}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Events</p>
              <p className="text-2xl font-bold text-purple-600">
                {totalEvents}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-orange-600">
                {pendingPayments}
              </p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Recent Events</h3>
          <div className="space-y-3">
            {events?.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-gray-600">
                    {/* {event?.date}  */}• {event?.location}
                  </p>
                </div>
                {/* <span
                  className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                    event?.status
                  )}`}>
                  {event?.status}
                </span> */}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
          <div className="space-y-3">
            {bookings?.slice(0, 3).map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{booking.userName}</p>
                  <p className="text-sm text-gray-600">{booking.eventTitle}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {formatCurrency(booking.totalAmount)}
                  </p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                      booking.status
                    )}`}>
                    {booking.status}
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
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Profile Information</h2>
        {!isEditingProfile ? (
          <button
            onClick={() => setIsEditingProfile(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Edit className="h-4 w-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleProfileSave}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Save className="h-4 w-4" />
              Save
            </button>
            <button
              onClick={handleProfileCancel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display Name
          </label>
          {isEditingProfile ? (
            <input
              type="text"
              value={user.displayName}
              onChange={(e) =>
                setUser((prev) => ({ ...prev, displayName: e.target.value }))
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <p className="p-3 bg-gray-50 rounded-lg">{user?.displayName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <p className="p-3 bg-gray-50 rounded-lg">{user?.email}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <p className="p-3 bg-gray-50 rounded-lg">
              {user?.organizer.organization}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          {isEditingProfile ? (
            <input
              type="text"
              value={editedProfile.phoneNumber}
              onChange={(e) =>
                setEditedProfile((prev) => ({
                  ...prev,
                  phoneNumber: e.target.value,
                }))
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <p className="p-3 bg-gray-50 rounded-lg">
              {user?.organizer.phoneNumber}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <p className="p-3 bg-gray-50 rounded-lg">
              {user?.organizer.website}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Experience
          </label>
          {isEditingProfile ? (
            <input
              type="text"
              value={editedProfile.experience}
              onChange={(e) =>
                setEditedProfile((prev) => ({
                  ...prev,
                  experience: e.target.value,
                }))
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <p className="p-3 bg-gray-50 rounded-lg">
              {user?.organizer.experience}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          {isEditingProfile ? (
            <textarea
              value={editedProfile.bio}
              onChange={(e) =>
                setEditedProfile((prev) => ({ ...prev, bio: e.target.value }))
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
          ) : (
            <p className="p-3 bg-gray-50 rounded-lg">{user?.organizer.bio}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          ) : (
            <p className="p-3 bg-gray-50 rounded-lg">
              {user?.organizer.certifications}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 pt-6 border-t">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Member Since
            </label>
            <p className="p-3 bg-gray-50 rounded-lg">
              {formatDate(user?.createdAt)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Onboarding Completed
            </label>
            <p className="p-3 bg-gray-50 rounded-lg">
              {user?.organizer.onboardingCompleted ? (
                <span className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Completed
                </span>
              ) : (
                <span className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-4 w-4" />
                  Pending
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEvents = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Events</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Create Event
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registered
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events?.map((event) => (
                <tr key={event.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {event.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(event.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {event.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {event.totaSpaces}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {event.availableSpaces}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                        event.status
                      )}`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(event.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-800">
                        <Eye className="h-4 w-4" />
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

  const renderBookings = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Bookings</h2>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tickets
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
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
              {bookings?.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">
                        {booking.userName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.userName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.eventTitle}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(booking.bookingDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.numberOfPeople}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(booking.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                        booking?.status
                      )}`}>
                      {booking?.status}
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

  const renderPayments = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Payments</h2>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
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
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {payment.transactionId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(payment.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {payment.method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                        payment.status
                      )}`}>
                      {payment.status}
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
