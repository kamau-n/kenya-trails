"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DataTable } from "../components/data-table";
import { Users, UserPlus, Filter, Download } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { columns } from "./column";
import { Skeleton } from "@/components/ui/skeleton";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [userTypeFilter, setUserTypeFilter] = useState("all");

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    deactivated: 0,
    organizers: 0,
    admins: 0,
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersQuery = query(
          collection(db, "users"),
          orderBy("createdAt", "desc")
        );
        const usersSnapshot = await getDocs(usersQuery);
        const usersData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUsers(usersData);
        setFilteredUsers(usersData);

        // Calculate stats
        const total = usersData.length;
        const active = usersData.filter(
          (user) => user.status === "active"
        ).length;
        const deactivated = usersData.filter(
          (user) => user.status === "deactivated"
        ).length;
        const organizers = usersData.filter(
          (user) => user.userType === "organizer"
        ).length;
        const admins = usersData.filter((user) => user.role === "admin").length;

        setStats({ total, active, deactivated, organizers, admins });
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // User type filter
    if (userTypeFilter !== "all") {
      filtered = filtered.filter(
        (user) => (user.userType || "user") === userTypeFilter
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, statusFilter, roleFilter, userTypeFilter]);

  const exportToCSV = () => {
    const csvContent = [
      ["ID", "Name", "Email", "Role", "User Type", "Status", "Created At"],
      ...filteredUsers.map((user) => [
        user.id,
        user.displayName || "",
        user.email || "",
        user.role || "",
        user.userType || "user",
        user.status || "",
        user.createdAt ? new Date(user.createdAt.toDate()).toISOString() : "",
      ]),
    ];

    const csvString = csvContent
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 space-y-8">
        {/* Stats Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Card Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <Skeleton className="h-10 w-80" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
              <Skeleton className="h-96 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Users Management
          </h1>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and permissions across your platform
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="mr-2 h-4 w-4" />
          Invite User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.total}
            </div>
            <p className="text-xs text-muted-foreground">
              All registered users
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active accounts
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deactivated</CardTitle>
            <div className="h-2 w-2 bg-red-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.deactivated}
            </div>
            <p className="text-xs text-muted-foreground">
              Deactivated accounts
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizers</CardTitle>
            <Badge variant="secondary" className="text-xs">
              ORG
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.organizers}
            </div>
            <p className="text-xs text-muted-foreground">Event organizers</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Administrators
            </CardTitle>
            <Badge variant="destructive" className="text-xs">
              ADMIN
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.admins}
            </div>
            <p className="text-xs text-muted-foreground">
              System administrators
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Users Table */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-gray-800">
                User Directory
              </CardTitle>
              <CardDescription className="text-gray-600">
                Showing {filteredUsers.length} of {stats.total} users
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={exportToCSV}
              className="border-blue-200 text-blue-700 hover:bg-blue-50">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Filters and Search */}
          <div className="space-y-4 mb-6">
            {/* Search Bar */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1 max-w-md">
                <Input
                  placeholder="Search by name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-4 pr-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Filter Controls */}
              <div className="flex gap-2 items-center">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="deactivated">Deactivated</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={userTypeFilter}
                  onValueChange={setUserTypeFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="User Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="user">Regular User</SelectItem>
                    <SelectItem value="organizer">Organizer</SelectItem>
                  </SelectContent>
                </Select>

                {/* Clear Filters Button */}
                {(searchTerm ||
                  statusFilter !== "all" ||
                  roleFilter !== "all" ||
                  userTypeFilter !== "all") && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setRoleFilter("all");
                      setUserTypeFilter("all");
                    }}
                    className="text-gray-500 hover:text-gray-700">
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Active Filters Display */}
            {(searchTerm ||
              statusFilter !== "all" ||
              roleFilter !== "all" ||
              userTypeFilter !== "all") && (
              <div className="flex flex-wrap gap-2 items-center text-sm">
                <span className="text-gray-500">Active filters:</span>
                {searchTerm && (
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200">
                    Search: "{searchTerm}"
                  </Badge>
                )}
                {statusFilter !== "all" && (
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200">
                    Status: {statusFilter}
                  </Badge>
                )}
                {roleFilter !== "all" && (
                  <Badge
                    variant="outline"
                    className="bg-purple-50 text-purple-700 border-purple-200">
                    Role: {roleFilter}
                  </Badge>
                )}
                {userTypeFilter !== "all" && (
                  <Badge
                    variant="outline"
                    className="bg-orange-50 text-orange-700 border-orange-200">
                    Type: {userTypeFilter}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Data Table */}
          <div className="border rounded-lg overflow-hidden">
            <DataTable
              columns={columns}
              data={filteredUsers}
              searchKey="email"
              className="border-0"
            />
          </div>

          {/* Empty State */}
          {filteredUsers.length === 0 && !loading && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No users found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ||
                statusFilter !== "all" ||
                roleFilter !== "all" ||
                userTypeFilter !== "all"
                  ? "Try adjusting your search criteria or filters."
                  : "No users have been added to the system yet."}
              </p>
              {(searchTerm ||
                statusFilter !== "all" ||
                roleFilter !== "all" ||
                userTypeFilter !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setRoleFilter("all");
                    setUserTypeFilter("all");
                  }}>
                  Clear all filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions Footer */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>Quick Actions:</span>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
              Bulk Import Users
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-green-600 hover:text-green-800 hover:bg-green-50">
              Send Welcome Emails
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-purple-600 hover:text-purple-800 hover:bg-purple-50">
              Generate Report
            </Button>
          </div>
          <div className="text-right">
            <p>Last updated: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
