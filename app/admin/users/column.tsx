"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  Edit,
  Trash2,
  UserCog,
  Eye,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

export type User = {
  id: string;
  email: string;
  displayName: string;
  role: string;
  userType?: string;
  status: string;
  createdAt?: any;
  organizer?: {
    bio?: string;
    certifications?: string;
    experience?: string;
    onboardingCompleted?: boolean;
    onboardingDate?: any;
    organization?: string;
    phoneNumber?: string;
    website?: string;
  };
  organizerProfile?: {
    bio?: string;
    conversionDate?: any;
    experience?: string;
    organization?: string;
    phoneNumber?: string;
    website?: string;
  };
};

const UserActionsCell = ({ user }: { user: User }) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [editForm, setEditForm] = useState({
    displayName: user.displayName || "",
    email: user.email || "",
  });

  const [selectedRole, setSelectedRole] = useState(user.role);
  const [selectedUserType, setSelectedUserType] = useState(
    user.userType || "user"
  );

  const handleEdit = async () => {
    setLoading(true);
    try {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        displayName: editForm.displayName,
        email: editForm.email,
        updatedAt: serverTimestamp(),
      });
      toast.success("User updated successfully");
      setEditDialogOpen(false);
      window.location.reload(); // Refresh to show changes
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async () => {
    setLoading(true);
    try {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        role: selectedRole,
        userType: selectedUserType,
        updatedAt: serverTimestamp(),
      });
      toast.success("User role updated successfully");
      setRoleDialogOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update user role");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    setLoading(true);
    try {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        status: "deactivated",
        deactivationDate: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success("User deactivated successfully");
      setDeactivateDialogOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Error deactivating user:", error);
      toast.error("Failed to deactivate user");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(user.id)}
            className="cursor-pointer">
            Copy user ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setViewDialogOpen(true)}
            className="cursor-pointer">
            <Eye className="mr-2 h-4 w-4" />
            View details
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setEditDialogOpen(true)}
            className="cursor-pointer">
            <Edit className="mr-2 h-4 w-4" />
            Edit user
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setRoleDialogOpen(true)}
            className="cursor-pointer">
            <UserCog className="mr-2 h-4 w-4" />
            Change role
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeactivateDialogOpen(true)}
            className="cursor-pointer text-red-600 focus:text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Deactivate user
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src="" />
                <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-xl">{user.displayName}</div>
                <div className="text-sm text-muted-foreground">
                  {user.email}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Role</Label>
                <Badge
                  variant={user.role === "admin" ? "destructive" : "outline"}
                  className="mt-1">
                  {user.role}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium">User Type</Label>
                <Badge variant="secondary" className="mt-1">
                  {user.userType || "user"}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <Badge
                  variant={
                    user.status === "active"
                      ? "default"
                      : user.status === "deactivated"
                      ? "destructive"
                      : "secondary"
                  }
                  className="mt-1">
                  {user.status}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium">Member Since</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {user.createdAt
                    ? new Date(user.createdAt.toDate()).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>

            {user.userType === "organizer" &&
              (user.organizer || user.organizerProfile) && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">
                    Organizer Information
                  </h3>
                  <div className="space-y-4">
                    {user.organizerProfile && (
                      <>
                        <div>
                          <Label className="text-sm font-medium">
                            Organization
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {user.organizerProfile.organization ||
                              "Not specified"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">
                            Phone Number
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {user.organizerProfile.phoneNumber ||
                              "Not specified"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">
                            Experience
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {user.organizerProfile.experience ||
                              "Not specified"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Bio</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {user.organizerProfile.bio || "Not specified"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Website</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {user.organizerProfile.website || "Not specified"}
                          </p>
                        </div>
                      </>
                    )}
                    {user.organizer && (
                      <>
                        <div>
                          <Label className="text-sm font-medium">
                            Onboarding Status
                          </Label>
                          <Badge
                            variant={
                              user.organizer.onboardingCompleted
                                ? "default"
                                : "secondary"
                            }
                            className="mt-1">
                            {user.organizer.onboardingCompleted
                              ? "Completed"
                              : "Pending"}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">
                            Certifications
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {user.organizer.certifications || "Not specified"}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information. Changes will be saved immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={editForm.displayName}
                onChange={(e) =>
                  setEditForm({ ...editForm, displayName: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Change Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the user's role and user type. This will affect their
              permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="role">Business Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="userType">User Type</Label>
              <Select
                value={selectedUserType}
                onValueChange={setSelectedUserType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Regular User</SelectItem>
                  <SelectItem value="organizer">Organizer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRoleDialogOpen(false)}
              disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleRoleChange} disabled={loading}>
              {loading ? "Updating..." : "Update Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Dialog */}
      <Dialog
        open={deactivateDialogOpen}
        onOpenChange={setDeactivateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate User</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate this user? This will set their
              account status to deactivated and record the deactivation date.
              The user will no longer be able to access the system.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Warning</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    User <strong>{user.displayName}</strong> ({user.email}) will
                    be deactivated. This action can be reversed by changing
                    their status back to active.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeactivateDialogOpen(false)}
              disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeactivate}
              disabled={loading}>
              {loading ? "Deactivating..." : "Deactivate User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "displayName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-gray-100">
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const user = row.original;
      const getInitials = (name: string) => {
        return name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
      };

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" />
            <AvatarFallback className="text-xs">
              {getInitials(user.displayName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.displayName}</div>
            <div className="text-sm text-muted-foreground">
              ID: {user.id.slice(0, 8)}...
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-gray-100">
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const email = row.getValue("email") as string;
      return <div className="text-sm">{email}</div>;
    },
  },
  {
    accessorKey: "role",
    header: "Business Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <Badge
          variant={
            role === "admin"
              ? "destructive"
              : role === "moderator"
              ? "default"
              : "outline"
          }
          className="capitalize">
          {role}
        </Badge>
      );
    },
  },
  {
    accessorKey: "userType",
    header: "User Type",
    cell: ({ row }) => {
      const userType = (row.getValue("userType") as string) || "user";
      return (
        <Badge
          variant={userType === "organizer" ? "secondary" : "outline"}
          className="capitalize">
          {userType}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={
            status === "active"
              ? "default"
              : status === "deactivated"
              ? "destructive"
              : status === "suspended"
              ? "destructive"
              : "secondary"
          }
          className="capitalize">
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-gray-100">
          Joined
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as any;
      if (!createdAt) return <span className="text-muted-foreground">N/A</span>;

      const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString()}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const user = row.original;
      return <UserActionsCell user={user} />;
    },
  },
];
