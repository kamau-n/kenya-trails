"use client"
import {
  ShoppingBag,
  Edit,
  Calendar,
  LinkIcon,
  User,
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Users,
  Building,
} from "lucide-react"

const MyBusinessProfileTab = ({ myProfile, handleEdit }) => {
  // Format the timestamp to a readable date
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A"

    const date = new Date(timestamp.seconds * 1000)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Format working hours
  const formatHours = (hours) => {
    if (!hours) return "Closed"
    return hours
  }

  // Get social media icon
  const getSocialIcon = (platform) => {
    switch (platform.toLowerCase()) {
      case "facebook":
        return <Facebook className="w-5 h-5" />
      case "instagram":
        return <Instagram className="w-5 h-5" />
      case "twitter":
      case "x":
        return <Twitter className="w-5 h-5" />
      case "linkedin":
        return <Linkedin className="w-5 h-5" />
      case "youtube":
        return <Youtube className="w-5 h-5" />
      default:
        return <Globe className="w-5 h-5" />
    }
  }

  // Enhanced profile data (combining existing data with new fields)
  const enhancedProfile = {
    ...myProfile,
    // These would come from the database in a real implementation
    description:
      "Book Shelve is a cozy independent bookstore offering a carefully curated selection of books across all genres. We pride ourselves on our knowledgeable staff, community events, and comfortable reading spaces. Whether you're looking for the latest bestseller, a rare classic, or just a quiet place to read, Book Shelve is your literary home.",
    logo_url: "/placeholder.svg?height=200&width=200",
    categories: ["Bookstore", "Retail", "Education"],
    founded_year: 2018,
    team_size: 12,
    contact: {
      phone: "+1 (555) 123-4567",
      email: "info@bookshelve.com",
      website: "https://bookshelve.com",
    },
    locations: [
      {
        id: "loc1",
        name: "Downtown Store",
        address: "123 Main Street, Downtown, City, State 12345",
        phone: "+1 (555) 123-4567",
        is_primary: true,
      },
      {
        id: "loc2",
        name: "University Branch",
        address: "456 Campus Drive, University District, City, State 12345",
        phone: "+1 (555) 987-6543",
        is_primary: false,
      },
    ],
    working_hours: {
      monday: "9:00 AM - 8:00 PM",
      tuesday: "9:00 AM - 8:00 PM",
      wednesday: "9:00 AM - 8:00 PM",
      thursday: "9:00 AM - 8:00 PM",
      friday: "9:00 AM - 9:00 PM",
      saturday: "10:00 AM - 9:00 PM",
      sunday: "12:00 PM - 6:00 PM",
    },
    social_media: {
      facebook: "https://facebook.com/bookshelve",
      instagram: "https://instagram.com/bookshelve",
      twitter: "https://twitter.com/bookshelve",
      linkedin: "https://linkedin.com/company/bookshelve",
    },
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full max-w-4xl mx-auto">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900">My Business Profile</h3>
        </div>
      </div>

      {/* Always show "Edit My Profile" */}
      <div className="flex justify-end p-4 border-b">
        <button
          onClick={() => {
            handleEdit(enhancedProfile)
          }}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit My Profile
        </button>
      </div>

      {/* Empty State */}
      {!myProfile ? (
        <div className="p-8 text-center">
          <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No Business Profile Available.</p>
          <p className="text-gray-500 text-sm">Create your business profile to get started.</p>
        </div>
      ) : (
        // Profile Display
        <div className="overflow-x-auto p-6">
          <div className="flex flex-col gap-8">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {enhancedProfile.logo_url ? (
                <img
                  src={enhancedProfile.logo_url || "/placeholder.svg"}
                  alt={`${enhancedProfile.business_name} logo`}
                  className="w-32 h-32 rounded-lg object-cover border border-gray-200"
                />
              ) : (
                <div className="w-32 h-32 rounded-lg bg-blue-100 flex items-center justify-center border border-gray-200">
                  <ShoppingBag className="w-16 h-16 text-blue-600" />
                </div>
              )}

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{enhancedProfile.business_name}</h2>

                <div className="mt-2 flex flex-wrap gap-2">
                  {enhancedProfile.categories?.map((category, index) => (
                    <span key={index} className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {category}
                    </span>
                  ))}

                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      enhancedProfile.subscription_status === "active"
                        ? "bg-green-100 text-green-800"
                        : enhancedProfile.subscription_status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {enhancedProfile.subscription_status.charAt(0).toUpperCase() +
                      enhancedProfile.subscription_status.slice(1)}
                  </span>
                </div>

                <div className="mt-4 text-gray-700">{enhancedProfile.description}</div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Founded</p>
                  <p className="text-gray-600">{enhancedProfile.founded_year || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Team Size</p>
                  <p className="text-gray-600">{enhancedProfile.team_size || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Member Since</p>
                  <p className="text-gray-600">{formatDate(enhancedProfile.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mt-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {enhancedProfile.contact?.phone && (
                  <div className="flex items-start gap-2">
                    <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Phone</p>
                      <p className="text-gray-600">{enhancedProfile.contact.phone}</p>
                    </div>
                  </div>
                )}

                {enhancedProfile.contact?.email && (
                  <div className="flex items-start gap-2">
                    <Mail className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Email</p>
                      <p className="text-gray-600">{enhancedProfile.contact.email}</p>
                    </div>
                  </div>
                )}

                {enhancedProfile.contact?.website && (
                  <div className="flex items-start gap-2">
                    <Globe className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Website</p>
                      <a
                        href={enhancedProfile.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {enhancedProfile.contact.website}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <LinkIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Business URL</p>
                    <p className="text-gray-600">{enhancedProfile.business_url}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Locations */}
            {enhancedProfile.locations && enhancedProfile.locations.length > 0 && (
              <div className="mt-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Locations</h3>
                <div className="grid grid-cols-1 gap-4">
                  {enhancedProfile.locations.map((location) => (
                    <div key={location.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <h4 className="text-md font-medium text-gray-900">{location.name}</h4>
                        {location.is_primary && (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-start gap-2">
                        <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                        <p className="text-gray-700">{location.address}</p>
                      </div>
                      {location.phone && (
                        <div className="mt-2 flex items-start gap-2">
                          <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
                          <p className="text-gray-700">{location.phone}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Working Hours */}
            {enhancedProfile.working_hours && (
              <div className="mt-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Hours</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(enhancedProfile.working_hours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between items-center p-2 border-b border-gray-100">
                      <span className="font-medium text-gray-700 capitalize">{day}</span>
                      <span className="text-gray-600">{formatHours(hours)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social Media */}
            {enhancedProfile.social_media && Object.keys(enhancedProfile.social_media).length > 0 && (
              <div className="mt-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(enhancedProfile.social_media).map(
                    ([platform, url]) =>
                      url && (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                        >
                          <span className="text-gray-600">{getSocialIcon(platform)}</span>
                          <span className="text-gray-700 capitalize">{platform}</span>
                        </a>
                      ),
                  )}
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-md font-semibold text-gray-900 mb-2">Profile Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <User className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">User ID</p>
                    <p className="text-gray-600 truncate" title={enhancedProfile.user_id}>
                      {enhancedProfile.user_id.substring(0, 12)}...
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Profile ID</p>
                    <p className="text-gray-600 truncate" title={enhancedProfile.id}>
                      {enhancedProfile.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyBusinessProfileTab
