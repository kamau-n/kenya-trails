"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import {
  Search,
  Edit,
  Trash2,
  Download,
  Plus,
  Calendar,
  MapPin,
  Users,
  MoreVertical,
  Filter,
  Eye,
  AlertCircle,
} from "lucide-react";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const eventsSnapshot = await getDocs(collection(db, "events"));
      const eventsData = eventsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date(),
      }));
      setEvents(eventsData);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "events", eventId));
        fetchEvents();
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    }
  };

  const downloadEvents = () => {
    const headers = [
      "Title",
      "Location",
      "Date",
      "Price",
      "Available Spaces",
      "Total Spaces",
      "Status",
    ];
    const csvData = events.map((event) => [
      event.title,
      event.location,
      new Date(event.date).toLocaleDateString(),
      event.price,
      event.availableSpaces,
      event.totalSpaces,
      new Date(event.date) > new Date() ? "Upcoming" : "Past",
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `events-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch = 
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === "all" ||
      (filterStatus === "upcoming" && new Date(event.date) > new Date()) ||
      (filterStatus === "past" && new Date(event.date) <= new Date());
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getEventStatus = (date) => {
    const now = new Date();
    const eventDate = new Date(date);
    
    if (eventDate > now) {
      const diffTime = eventDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return { text: "Tomorrow", color: "bg-orange-100 text-orange-800" };
      if (diffDays <= 7) return { text: `In ${diffDays} days`, color: "bg-blue-100 text-blue-800" };
      return { text: "Upcoming", color: "bg-green-100 text-green-800" };
    }
    return { text: "Past", color: "bg-gray-100 text-gray-800" };
  };

  const getSpaceStatus = (available, total) => {
    const percentage = (available / total) * 100;
    if (percentage > 50) return "bg-green-100 text-green-800";
    if (percentage > 20) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  // Statistics
  const stats = {
    total: events.length,
    upcoming: events.filter(event => new Date(event.date) > new Date()).length,
    past: events.filter(event => new Date(event.date) <= new Date()).length,
    totalSpaces: events.reduce((sum, event) => sum + (event.totalSpaces || 0), 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
          <p className="text-gray-600 mt-1">Manage and track all your events</p>
        </div>
        <Button
          onClick={() => router.push("/admin/events/create")}
          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Event
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-green-600">{stats.upcoming}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Past Events</p>
                <p className="text-2xl font-bold text-gray-600">{stats.past}</p>
              </div>
              <Calendar className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Capacity</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalSpaces}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-lg font-semibold">All Events</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative min-w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by title or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                    All Events
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("upcoming")}>
                    Upcoming Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("past")}>
                    Past Events
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Export */}
              <Button
                onClick={downloadEvents}
                variant="outline"
                className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterStatus !== "all" 
                  ? "Try adjusting your search or filter criteria" 
                  : "Get started by creating your first event"}
              </p>
              {!searchTerm && filterStatus === "all" && (
                <Button
                  onClick={() => router.push("/admin/events/create")}
                  className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Event
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Event Details</TableHead>
                    <TableHead className="font-semibold">Date & Location</TableHead>
                    <TableHead className="font-semibold">Pricing</TableHead>
                    <TableHead className="font-semibold">Capacity</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => {
                    const status = getEventStatus(event.date);
                    return (
                      <TableRow key={event.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <div className="font-semibold text-gray-900">{event.title}</div>
                            {event.description && (
                              <div className="text-sm text-gray-500 mt-1 max-w-xs truncate">
                                {event.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-gray-900">
                              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                              {formatDate(event.date)}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                              {event.location}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="font-semibold text-gray-900">
                            KSh {event.price?.toLocaleString() || 0}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-gray-900">
                              {event.availableSpaces} / {event.totalSpaces}
                            </div>
                            <Badge
                              className={`text-xs ${getSpaceStatus(
                                event.availableSpaces,
                                event.totalSpaces
                              )}`}>
                              {Math.round((event.availableSpaces / event.totalSpaces) * 100)}% available
                            </Badge>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge className={`${status.color} font-medium`}>
                            {status.text}
                          </Badge>
                        </TableCell>
                        
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => router.push(`/admin/events/${event.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => router.push(`/admin/events/${event.id}/edit`)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Event
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteEvent(event.id)}
                                className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Event
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { db } from "@/lib/firebase";
// import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
// import { Search, Edit, Trash2, Download } from "lucide-react";

// export default function EventsPage() {
//   const [events, setEvents] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     fetchEvents();
//   }, []);

//   const fetchEvents = async () => {
//     try {
//       const eventsSnapshot = await getDocs(collection(db, "events"));
//       const eventsData = eventsSnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//         date: doc.data().date?.toDate() || new Date(),
//       }));
//       setEvents(eventsData);
//     } catch (error) {
//       console.error("Error fetching events:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteEvent = async (eventId) => {
//     if (confirm("Are you sure you want to delete this event?")) {
//       try {
//         await deleteDoc(doc(db, "events", eventId));
//         fetchEvents();
//       } catch (error) {
//         console.error("Error deleting event:", error);
//       }
//     }
//   };

//   const downloadEvents = () => {
//     // Convert events to CSV format
//     const headers = [
//       "Title",
//       "Location",
//       "Date",
//       "Price",
//       "Available Spaces",
//       "Total Spaces",
//       "Status",
//     ];
//     const csvData = events.map((event) => [
//       event.title,
//       event.location,
//       new Date(event.date).toLocaleDateString(),
//       event.price,
//       event.availableSpaces,
//       event.totalSpaces,
//       new Date(event.date) > new Date() ? "Upcoming" : "Past",
//     ]);

//     // Create CSV content
//     const csvContent = [
//       headers.join(","),
//       ...csvData.map((row) => row.join(",")),
//     ].join("\n");

//     // Create and download the file
//     const blob = new Blob([csvContent], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `events-${new Date().toISOString().split("T")[0]}.csv`;
//     document.body.appendChild(a);
//     a.click();
//     window.URL.revokeObjectURL(url);
//     document.body.removeChild(a);
//   };

//   const filteredEvents = events.filter(
//     (event) =>
//       event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       event.location?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const formatDate = (date) => {
//     return new Date(date).toLocaleDateString("en-US", {
//       day: "numeric",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   return (
//     <div>
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">Events</h1>
//         <div className="flex gap-4">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//             <Input
//               placeholder="Search events..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="pl-10"
//             />
//           </div>
//           <Button
//             onClick={downloadEvents}
//             variant="outline"
//             className="flex items-center gap-2">
//             <Download className="h-4 w-4" />
//             Export Events
//           </Button>
//         </div>
//       </div>

//       <div className="bg-white rounded-lg border">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Title</TableHead>
//               <TableHead>Location</TableHead>
//               <TableHead>Date</TableHead>
//               <TableHead>Price</TableHead>
//               <TableHead>Spaces</TableHead>
//               <TableHead>Status</TableHead>
//               <TableHead className="text-right">Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {filteredEvents.map((event) => (
//               <TableRow key={event.id}>
//                 <TableCell>{event.title}</TableCell>
//                 <TableCell>{event.location}</TableCell>
//                 <TableCell>{formatDate(event.date)}</TableCell>
//                 <TableCell>KSh {event.price?.toLocaleString()}</TableCell>
//                 <TableCell>
//                   {event.availableSpaces} / {event.totalSpaces}
//                 </TableCell>
//                 <TableCell>
//                   <Badge
//                     className={
//                       new Date(event.date) > new Date()
//                         ? "bg-green-600"
//                         : "bg-gray-600"
//                     }>
//                     {new Date(event.date) > new Date() ? "Upcoming" : "Past"}
//                   </Badge>
//                 </TableCell>
//                 <TableCell className="text-right">
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     onClick={() => router.push(`/events/${event.id}/edit`)}>
//                     <Edit className="h-4 w-4" />
//                   </Button>
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     onClick={() => handleDeleteEvent(event.id)}>
//                     <Trash2 className="h-4 w-4" />
//                   </Button>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   );
// }
