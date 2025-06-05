import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Bell,
  Eye,
  EyeOff,
  Edit,
  Save,
  X,
  AlertTriangle,
  Download,
  Upload,
  Camera,
  Trash2,
  Key,
  Settings,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface ProfileTabProps {
  user: any;
  auth: any;
  handleDeactivateAccount: () => void;
  deactivateLoading: boolean;
}

export default function EnhancedProfileTab({
  user,
  auth,
  handleDeactivateAccount,
  deactivateLoading,
}: ProfileTabProps) {
  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    displayName: user?.displayName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    location: user?.location || "",
    dateOfBirth: user?.dateOfBirth || "",
    website: user?.website || "",
    company: user?.company || "",
    interests: user?.interests || [],
  });

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDataExportModal, setShowDataExportModal] = useState(false);
  const [showProfilePictureModal, setShowProfilePictureModal] = useState(false);

  // Form states
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    email: user?.notifications?.email ?? true,
    push: user?.notifications?.push ?? true,
    sms: user?.notifications?.sms ?? false,
    marketing: user?.notifications?.marketing ?? false,
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: user?.privacy?.profileVisibility || "public",
    showEmail: user?.privacy?.showEmail ?? false,
    showPhone: user?.privacy?.showPhone ?? false,
    allowMessaging: user?.privacy?.allowMessaging ?? true,
  });

  // Loading states
  const [saving, setSaving] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [exportingData, setExportingData] = useState(false);

  // Success/Error states
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSaveProfile = async () => {
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update user profile logic here
      console.log("Saving profile:", editedProfile);

      setSuccessMessage("Profile updated successfully!");
      setIsEditing(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage("New passwords don't match");
      return;
    }

    setUpdatingPassword(true);
    setErrorMessage("");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Password update logic here
      console.log("Updating password");

      setSuccessMessage("Password updated successfully!");
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage("Failed to update password. Please try again.");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleDataExport = async () => {
    setExportingData(true);

    try {
      // Simulate data export
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate and download data export
      const exportData = {
        profile: editedProfile,
        bookings: [], // Add user's bookings
        events: [], // Add user's events if organizer
        createdAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `profile-data-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccessMessage("Data exported successfully!");
      setShowDataExportModal(false);
    } catch (error) {
      setErrorMessage("Failed to export data. Please try again.");
    } finally {
      setExportingData(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile({
      displayName: user?.displayName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      bio: user?.bio || "",
      location: user?.location || "",
      dateOfBirth: user?.dateOfBirth || "",
      website: user?.website || "",
      company: user?.company || "",
      interests: user?.interests || [],
    });
    setIsEditing(false);
    setErrorMessage("");
  };

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Profile Information */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="md:text-2xl text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Manage your personal information and preferences
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    size="sm"
                    className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Profile Picture Section */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user?.displayName?.[0] || user?.email?.[0] || "U"}
              </div>
              <Button
                onClick={() => setShowProfilePictureModal(true)}
                size="sm"
                variant="outline"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0">
                <Camera className="h-3 w-3" />
              </Button>
            </div>
            <div>
              <h3 className="font-medium text-slate-800">Profile Picture</h3>
              <p className="text-sm text-slate-600">
                Upload a photo to personalize your account
              </p>
            </div>
          </div>

          <Separator />

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label
                htmlFor="displayName"
                className="text-slate-700 mb-1.5 block">
                Full Name
              </Label>
              <Input
                id="displayName"
                value={editedProfile.displayName}
                onChange={(e) =>
                  setEditedProfile((prev) => ({
                    ...prev,
                    displayName: e.target.value,
                  }))
                }
                disabled={!isEditing}
                className={!isEditing ? "bg-slate-50" : ""}
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-slate-700 mb-1.5 block">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={editedProfile.email}
                onChange={(e) =>
                  setEditedProfile((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                disabled={!isEditing}
                className={!isEditing ? "bg-slate-50" : ""}
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-slate-700 mb-1.5 block">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={editedProfile.phone}
                onChange={(e) =>
                  setEditedProfile((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                disabled={!isEditing}
                className={!isEditing ? "bg-slate-50" : ""}
                placeholder="+254 XXX XXX XXX"
              />
            </div>

            <div>
              <Label htmlFor="location" className="text-slate-700 mb-1.5 block">
                Location
              </Label>
              <Input
                id="location"
                value={editedProfile.location}
                onChange={(e) =>
                  setEditedProfile((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
                disabled={!isEditing}
                className={!isEditing ? "bg-slate-50" : ""}
                placeholder="City, Country"
              />
            </div>

            <div>
              <Label
                htmlFor="dateOfBirth"
                className="text-slate-700 mb-1.5 block">
                Date of Birth
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={editedProfile.dateOfBirth}
                onChange={(e) =>
                  setEditedProfile((prev) => ({
                    ...prev,
                    dateOfBirth: e.target.value,
                  }))
                }
                disabled={!isEditing}
                className={!isEditing ? "bg-slate-50" : ""}
              />
            </div>

            <div>
              <Label htmlFor="website" className="text-slate-700 mb-1.5 block">
                Website
              </Label>
              <Input
                id="website"
                type="url"
                value={editedProfile.website}
                onChange={(e) =>
                  setEditedProfile((prev) => ({
                    ...prev,
                    website: e.target.value,
                  }))
                }
                disabled={!isEditing}
                className={!isEditing ? "bg-slate-50" : ""}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bio" className="text-slate-700 mb-1.5 block">
              Bio
            </Label>
            <Textarea
              id="bio"
              value={editedProfile.bio}
              onChange={(e) =>
                setEditedProfile((prev) => ({ ...prev, bio: e.target.value }))
              }
              disabled={!isEditing}
              className={!isEditing ? "bg-slate-50" : ""}
              placeholder="Tell us about yourself..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="userType" className="text-slate-700 mb-1.5 block">
              Account Type
            </Label>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  user?.userType === "organizer" ? "default" : "secondary"
                }>
                {user?.userType === "organizer"
                  ? "Event Organizer"
                  : "Traveler"}
              </Badge>
              <span className="text-sm text-slate-500">
                {user?.userType === "organizer"
                  ? "You can create and manage events"
                  : "You can book and join events"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium capitalize">
                  {key === "email" && "Email Notifications"}
                  {key === "push" && "Push Notifications"}
                  {key === "sms" && "SMS Notifications"}
                  {key === "marketing" && "Marketing Communications"}
                </Label>
                <p className="text-xs text-slate-500">
                  {key === "email" && "Receive notifications via email"}
                  {key === "push" && "Receive browser push notifications"}
                  {key === "sms" && "Receive SMS notifications"}
                  {key === "marketing" &&
                    "Receive promotional emails and offers"}
                </p>
              </div>
              <Switch
                checked={value}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({ ...prev, [key]: checked }))
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy Settings
          </CardTitle>
          <CardDescription>
            Control your profile visibility and privacy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Profile Visibility</Label>
              <Select
                value={privacy.profileVisibility}
                onValueChange={(value) =>
                  setPrivacy((prev) => ({ ...prev, profileVisibility: value }))
                }>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="friends">Friends Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            {Object.entries(privacy)
              .filter(([key]) => key !== "profileVisibility")
              .map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium capitalize">
                      {key === "showEmail" && "Show Email Address"}
                      {key === "showPhone" && "Show Phone Number"}
                      {key === "allowMessaging" && "Allow Direct Messages"}
                    </Label>
                    <p className="text-xs text-slate-500">
                      {key === "showEmail" &&
                        "Display your email on your public profile"}
                      {key === "showPhone" &&
                        "Display your phone number on your public profile"}
                      {key === "allowMessaging" &&
                        "Allow other users to send you direct messages"}
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) =>
                      setPrivacy((prev) => ({ ...prev, [key]: checked }))
                    }
                  />
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Security Settings
          </CardTitle>
          <CardDescription>
            Manage your account security and authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => setShowPasswordModal(true)}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50">
              <Key className="mr-2 h-4 w-4" />
              Change Password
            </Button>
            <Button
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-50">
              <Shield className="mr-2 h-4 w-4" />
              Enable 2FA
            </Button>
            <Button
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50">
              <Settings className="mr-2 h-4 w-4" />
              Login History
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Export your data or manage your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => setShowDataExportModal(true)}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50">
              <Download className="mr-2 h-4 w-4" />
              Export My Data
            </Button>
            <Button
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-50">
              <Upload className="mr-2 h-4 w-4" />
              Import Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 shadow-sm">
        <CardHeader className="bg-red-50">
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-red-600">
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <h4 className="font-medium text-red-800 mb-2">Delete Account</h4>
              <p className="text-sm text-red-600 mb-4">
                Once you delete your account, there is no going back. This will
                permanently delete your profile, bookings, events, and all
                associated data.
              </p>
              <Button
                onClick={() => setShowDeleteModal(true)}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete My Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}

      {/* Password Change Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() =>
                    setShowPasswords((prev) => ({
                      ...prev,
                      current: !prev.current,
                    }))
                  }>
                  {showPasswords.current ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() =>
                    setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                  }>
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() =>
                    setShowPasswords((prev) => ({
                      ...prev,
                      confirm: !prev.confirm,
                    }))
                  }>
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPasswordModal(false)}
              disabled={updatingPassword}>
              Cancel
            </Button>
            <Button
              onClick={handlePasswordChange}
              disabled={
                updatingPassword ||
                !passwordData.currentPassword ||
                !passwordData.newPassword
              }>
              {updatingPassword ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Data Export Modal */}
      <Dialog open={showDataExportModal} onOpenChange={setShowDataExportModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Your Data</DialogTitle>
            <DialogDescription>
              Download a copy of all your data including profile, bookings, and
              events
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-600">
              This will create a JSON file containing all your personal data.
              The export may take a few moments to complete.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDataExportModal(false)}
              disabled={exportingData}>
              Cancel
            </Button>
            <Button onClick={handleDataExport} disabled={exportingData}>
              {exportingData ? "Exporting..." : "Export Data"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-800">Delete Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove all your data from our servers.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> This will permanently delete:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Your profile and personal information</li>
                  <li>All your bookings and event history</li>
                  <li>Your created events (if you're an organizer)</li>
                  <li>All associated data and preferences</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={deactivateLoading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeactivateAccount}
              disabled={deactivateLoading}>
              {deactivateLoading ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile Picture Modal */}
      <Dialog
        open={showProfilePictureModal}
        onOpenChange={setShowProfilePictureModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Profile Picture</DialogTitle>
            <DialogDescription>
              Upload a new profile picture or remove your current one
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex justify-center">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                {user?.displayName?.[0] || user?.email?.[0] || "U"}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                Upload New Picture
              </Button>
              <Button
                variant="outline"
                className="w-full text-red-600 border-red-200 hover:bg-red-50">
                <Trash2 className="mr-2 h-4 w-4" />
                Remove Picture
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowProfilePictureModal(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
