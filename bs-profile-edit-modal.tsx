"use client"

import { useState } from "react"
import { X, Plus, Trash } from "lucide-react"

const BsProfileEditModal = ({ profile, onClose, onUpdate, userRole, handleEdit }) => {
  console.log("this is my profile", profile)

  // Initialize state for arrays and objects
  const [categories, setCategories] = useState(profile.categories || [])
  const [newCategory, setNewCategory] = useState("")

  const [locations, setLocations] = useState(profile.locations || [])
  const [socialMedia, setSocialMedia] = useState(profile.social_media || {})

  // Working hours state
  const [workingHours, setWorkingHours] = useState(
    profile.working_hours || {
      monday: "",
      tuesday: "",
      wednesday: "",
      thursday: "",
      friday: "",
      saturday: "",
      sunday: "",
    },
  )

  // Handle category addition
  const handleAddCategory = () => {
    if (newCategory.trim() !== "") {
      setCategories([...categories, newCategory.trim()])
      setNewCategory("")
    }
  }

  // Handle category removal
  const handleRemoveCategory = (index) => {
    setCategories(categories.filter((_, i) => i !== index))
  }

  // Handle location addition
  const handleAddLocation = () => {
    const newLocation = {
      id: `loc${Date.now()}`,
      name: "",
      address: "",
      phone: "",
      is_primary: locations.length === 0, // First location is primary by default
    }
    setLocations([...locations, newLocation])
  }

  // Handle location removal
  const handleRemoveLocation = (id) => {
    setLocations(locations.filter((loc) => loc.id !== id))
  }

  // Handle location field change
  const handleLocationChange = (id, field, value) => {
    setLocations(locations.map((loc) => (loc.id === id ? { ...loc, [field]: value } : loc)))
  }

  // Handle working hours change
  const handleHoursChange = (day, value) => {
    setWorkingHours({
      ...workingHours,
      [day]: value,
    })
  }

  // Handle social media change
  const handleSocialMediaChange = (platform, value) => {
    setSocialMedia({
      ...socialMedia,
      [platform]: value,
    })
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)

    // Build contact object
    const contact = {
      phone: formData.get("contact_phone") || "",
      email: formData.get("contact_email") || "",
      website: formData.get("contact_website") || "",
    }

    // Create updated profile with all fields
    const updatedProfile = {
      // Original fields
      id: profile.id,
      business_name: formData.get("name"),
      business_url: formData.get("url"),
      created_at: profile.created_at,
      subscription_status: formData.get("status"),
      user_id: profile.user_id,

      // New fields
      description: formData.get("description"),
      logo_url: formData.get("logo_url"),
      categories: categories,
      founded_year: formData.get("founded_year") ? Number.parseInt(formData.get("founded_year")) : null,
      team_size: formData.get("team_size") ? Number.parseInt(formData.get("team_size")) : null,
      contact: contact,
      locations: locations,
      working_hours: workingHours,
      social_media: socialMedia,
    }

    console.log("profile to update", updatedProfile)
    onUpdate(updatedProfile)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto py-10">
      <div className="bg-white rounded-xl p-6 max-w-3xl w-full mx-4 my-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Edit Business Profile</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto pr-2">
          {/* Basic Information Section */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3 pb-2 border-b">Basic Information</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  defaultValue={profile.business_name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                  Business URL*
                </label>
                <input
                  type="text"
                  id="url"
                  name="url"
                  defaultValue={profile.business_url}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700 mb-1">
                Logo URL
              </label>
              <input
                type="text"
                id="logo_url"
                name="logo_url"
                defaultValue={profile.logo_url || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Business Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                defaultValue={profile.description || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="founded_year" className="block text-sm font-medium text-gray-700 mb-1">
                  Founded Year
                </label>
                <input
                  type="number"
                  id="founded_year"
                  name="founded_year"
                  min="1900"
                  max={new Date().getFullYear()}
                  defaultValue={profile.founded_year || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="team_size" className="block text-sm font-medium text-gray-700 mb-1">
                  Team Size
                </label>
                <input
                  type="number"
                  id="team_size"
                  name="team_size"
                  min="1"
                  defaultValue={profile.team_size || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Subscription Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={profile.subscription_status || "pending"}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Categories */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {categories.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    <span>{category}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(index)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Add a category"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3 pb-2 border-b">Contact Information</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="contact_phone"
                  name="contact_phone"
                  defaultValue={profile.contact?.phone || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="contact_email"
                  name="contact_email"
                  defaultValue={profile.contact?.email || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="contact_website" className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                id="contact_website"
                name="contact_website"
                defaultValue={profile.contact?.website || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Locations Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3 pb-2 border-b">
              <h4 className="text-md font-medium text-gray-900">Locations</h4>
              <button
                type="button"
                onClick={handleAddLocation}
                className="text-sm flex items-center text-blue-600 hover:text-blue-800"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Location
              </button>
            </div>

            {locations.length === 0 ? (
              <p className="text-gray-500 text-sm italic mb-4">No locations added yet.</p>
            ) : (
              <div className="space-y-4 mb-4">
                {locations.map((location) => (
                  <div key={location.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <h5 className="text-sm font-medium">Location Details</h5>
                      <button
                        type="button"
                        onClick={() => handleRemoveLocation(location.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Location Name</label>
                        <input
                          type="text"
                          value={location.name || ""}
                          onChange={(e) => handleLocationChange(location.id, "name", e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={location.phone || ""}
                          onChange={(e) => handleLocationChange(location.id, "phone", e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        value={location.address || ""}
                        onChange={(e) => handleLocationChange(location.id, "address", e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`primary_${location.id}`}
                        checked={location.is_primary || false}
                        onChange={(e) => {
                          // If checked, uncheck all other locations
                          if (e.target.checked) {
                            setLocations(
                              locations.map((loc) => ({
                                ...loc,
                                is_primary: loc.id === location.id,
                              })),
                            )
                          } else {
                            handleLocationChange(location.id, "is_primary", false)
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`primary_${location.id}`} className="ml-2 block text-xs text-gray-700">
                        Primary Location
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Working Hours Section */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3 pb-2 border-b">Business Hours</h4>

            <div className="space-y-3">
              {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
                <div key={day} className="grid grid-cols-3 gap-2 items-center">
                  <label className="text-sm font-medium text-gray-700 capitalize">{day}</label>
                  <input
                    type="text"
                    value={workingHours[day] || ""}
                    onChange={(e) => handleHoursChange(day, e.target.value)}
                    placeholder="e.g. 9:00 AM - 5:00 PM"
                    className="col-span-2 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Social Media Section */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3 pb-2 border-b">Social Media</h4>

            <div className="space-y-3">
              {["facebook", "instagram", "twitter", "linkedin", "youtube"].map((platform) => (
                <div key={platform} className="grid grid-cols-3 gap-2 items-center">
                  <label className="text-sm font-medium text-gray-700 capitalize">{platform}</label>
                  <input
                    type="url"
                    value={socialMedia[platform] || ""}
                    onChange={(e) => handleSocialMediaChange(platform, e.target.value)}
                    placeholder={`https://${platform}.com/yourbusiness`}
                    className="col-span-2 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* System Information (Read-only) */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3 pb-2 border-b">System Information</h4>

            <div className="mb-4">
              <label htmlFor="user_id" className="block text-sm font-medium text-gray-700 mb-1">
                Owner ID (Read-only)
              </label>
              <input
                type="text"
                id="user_id"
                name="user_id"
                defaultValue={profile.user_id || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                disabled
              />
            </div>

            {profile.created_at && (
              <div className="mb-4">
                <label htmlFor="created_at" className="block text-sm font-medium text-gray-700 mb-1">
                  Created At (Read-only)
                </label>
                <input
                  type="text"
                  id="created_at"
                  name="created_at"
                  defaultValue={new Date(profile.created_at.seconds * 1000).toLocaleString()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  disabled
                />
              </div>
            )}
          </div>

          <div className="flex space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BsProfileEditModal
