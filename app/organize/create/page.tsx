"use client"

import Link from "next/link"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CalendarIcon, Plus, Trash2, Upload } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { db, storage } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CreateEventPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    meetingPoint: "",
    date: null,
    endDate: null,
    price: "",
    depositAmount: "",
    totalSpaces: "",
    category: "",
    difficulty: "Moderate",
    duration: "",
    included: [""],
    notIncluded: [""],
    requirements: [""],
    paymentMethods: [],
    paymentDeadline: null,
  })

  const [images, setImages] = useState([])
  const [itinerary, setItinerary] = useState([{ day: "Day 1", title: "", description: "" }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value ? Number.parseInt(value) : "" }))
  }

  const handleDateChange = (name, date) => {
    setFormData((prev) => ({ ...prev, [name]: date }))
  }

  const handleArrayChange = (name, index, value) => {
    setFormData((prev) => {
      const newArray = [...prev[name]]
      newArray[index] = value
      return { ...prev, [name]: newArray }
    })
  }

  const addArrayItem = (name) => {
    setFormData((prev) => ({
      ...prev,
      [name]: [...prev[name], ""],
    }))
  }

  const removeArrayItem = (name, index) => {
    setFormData((prev) => {
      const newArray = [...prev[name]]
      newArray.splice(index, 1)
      return { ...prev, [name]: newArray }
    })
  }

  const handleItineraryChange = (index, field, value) => {
    const newItinerary = [...itinerary]
    newItinerary[index] = { ...newItinerary[index], [field]: value }
    setItinerary(newItinerary)
  }

  const addItineraryDay = () => {
    setItinerary([...itinerary, { day: `Day ${itinerary.length + 1}`, title: "", description: "" }])
  }

  const removeItineraryDay = (index) => {
    const newItinerary = [...itinerary]
    newItinerary.splice(index, 1)
    // Update day numbers
    newItinerary.forEach((item, i) => {
      item.day = `Day ${i + 1}`
    })
    setItinerary(newItinerary)
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      setImages((prev) => [...prev, ...files])
    }
  }

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handlePaymentMethodChange = (method) => {
    setFormData((prev) => {
      const methods = [...prev.paymentMethods]
      if (methods.includes(method)) {
        return { ...prev, paymentMethods: methods.filter((m) => m !== method) }
      } else {
        return { ...prev, paymentMethods: [...methods, method] }
      }
    })
  }

  const validateForm = () => {
    if (!formData.title) return "Event title is required"
    if (!formData.description) return "Event description is required"
    if (!formData.location) return "Location is required"
    if (!formData.date) return "Event date is required"
    if (!formData.price) return "Price is required"
    if (!formData.totalSpaces) return "Total spaces is required"
    if (!formData.category) return "Category is required"
    if (formData.paymentMethods.length === 0) return "At least one payment method is required"
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError("")

    try {
      // Upload images
      const imageUrls = []

      if (images.length > 0) {
        for (const image of images) {
          const storageRef = ref(storage, `events/${Date.now()}_${image.name}`)
          await uploadBytes(storageRef, image)
          const url = await getDownloadURL(storageRef)
          imageUrls.push(url)
        }
      }

      // Create event document
      const eventData = {
        ...formData,
        price: Number(formData.price),
        depositAmount: formData.depositAmount ? Number(formData.depositAmount) : 0,
        totalSpaces: Number(formData.totalSpaces),
        availableSpaces: Number(formData.totalSpaces),
        itinerary,
        images: imageUrls,
        imageUrl: imageUrls.length > 0 ? imageUrls[0] : null,
        createdAt: serverTimestamp(),
        organizerId: user.uid,
        organizerName: user.displayName || user.email,
      }

      await addDoc(collection(db, "events"), eventData)

      setSuccess(true)
      setTimeout(() => {
        router.push("/organize/events")
      }, 2000)
    } catch (error) {
      console.error("Error creating event:", error)
      setError("Failed to create event. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-8">You need to be logged in to create events.</p>
        <Button asChild>
          <Link href="/login?redirect=/organize/create">Log In</Link>
        </Button>
      </div>
    )
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">Event Created Successfully!</h1>
        <p className="mb-8">Your event has been created and is now live.</p>
        <div className="flex justify-center gap-4">
          <Button asChild>
            <Link href="/organize/events">Manage Your Events</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/events">View All Events</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Create a New Event</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title*</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Mt. Kenya Hiking Adventure"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category*</Label>
              <Select
                name="category"
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hiking">Hiking</SelectItem>
                  <SelectItem value="Safari">Safari</SelectItem>
                  <SelectItem value="Beach">Beach</SelectItem>
                  <SelectItem value="Camping">Camping</SelectItem>
                  <SelectItem value="Cycling">Cycling</SelectItem>
                  <SelectItem value="Cultural">Cultural</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Label htmlFor="description">Description*</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your event in detail..."
              rows={5}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location*</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Mt. Kenya National Park"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meetingPoint">Meeting Point*</Label>
              <Input
                id="meetingPoint"
                name="meetingPoint"
                value={formData.meetingPoint}
                onChange={handleChange}
                placeholder="e.g. Naro Moru River Lodge, 7:00 AM"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div className="space-y-2">
              <Label>Start Date*</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => handleDateChange("date", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? format(formData.endDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => handleDateChange("endDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration*</Label>
              <Input
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g. 3 days"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select
                name="difficulty"
                value={formData.difficulty}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, difficulty: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="Challenging">Challenging</SelectItem>
                  <SelectItem value="Difficult">Difficult</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (KSh)*</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g. 15000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="depositAmount">Minimum Deposit (KSh)</Label>
              <Input
                id="depositAmount"
                name="depositAmount"
                type="number"
                value={formData.depositAmount}
                onChange={handleChange}
                placeholder="e.g. 5000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="totalSpaces">Total Spaces*</Label>
              <Input
                id="totalSpaces"
                name="totalSpaces"
                type="number"
                value={formData.totalSpaces}
                onChange={handleNumberChange}
                placeholder="e.g. 20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.paymentDeadline ? format(formData.paymentDeadline, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.paymentDeadline}
                    onSelect={(date) => handleDateChange("paymentDeadline", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Label>Payment Methods*</Label>
            <div className="flex flex-wrap gap-4">
              {["M-Pesa", "Bank Transfer", "Cash", "Credit Card"].map((method) => (
                <div key={method} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`payment-${method}`}
                    checked={formData.paymentMethods.includes(method)}
                    onChange={() => handlePaymentMethodChange(method)}
                    className="mr-2"
                  />
                  <Label htmlFor={`payment-${method}`}>{method}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Itinerary */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Itinerary</h2>

          {itinerary.map((day, index) => (
            <div key={index} className="mb-6 p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">{day.day}</h3>
                {itinerary.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeItineraryDay(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor={`itinerary-${index}-title`}>Title</Label>
                  <Input
                    id={`itinerary-${index}-title`}
                    value={day.title}
                    onChange={(e) => handleItineraryChange(index, "title", e.target.value)}
                    placeholder="e.g. Nairobi to Mt. Kenya"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`itinerary-${index}-description`}>Description</Label>
                <Textarea
                  id={`itinerary-${index}-description`}
                  value={day.description}
                  onChange={(e) => handleItineraryChange(index, "description", e.target.value)}
                  placeholder="Describe the activities for this day..."
                  rows={3}
                />
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addItineraryDay} className="w-full">
            <Plus className="h-4 w-4 mr-2" /> Add Day
          </Button>
        </div>

        {/* Inclusions and Requirements */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">What's Included</h2>

              {formData.included.map((item, index) => (
                <div key={index} className="flex items-center mb-2">
                  <Input
                    value={item}
                    onChange={(e) => handleArrayChange("included", index, e.target.value)}
                    placeholder="e.g. Professional guide"
                    className="mr-2"
                  />
                  {formData.included.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeArrayItem("included", index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem("included")}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Item
              </Button>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">What's Not Included</h2>

              {formData.notIncluded.map((item, index) => (
                <div key={index} className="flex items-center mb-2">
                  <Input
                    value={item}
                    onChange={(e) => handleArrayChange("notIncluded", index, e.target.value)}
                    placeholder="e.g. Personal hiking gear"
                    className="mr-2"
                  />
                  {formData.notIncluded.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeArrayItem("notIncluded", index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem("notIncluded")}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Item
              </Button>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Requirements</h2>

            {formData.requirements.map((item, index) => (
              <div key={index} className="flex items-center mb-2">
                <Input
                  value={item}
                  onChange={(e) => handleArrayChange("requirements", index, e.target.value)}
                  placeholder="e.g. Moderate fitness level"
                  className="mr-2"
                />
                {formData.requirements.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeArrayItem("requirements", index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayItem("requirements")}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Requirement
            </Button>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Event Images</h2>

          <div className="mb-4">
            <Label htmlFor="images" className="block mb-2">
              Upload Images
            </Label>
            <div className="flex items-center">
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
              <Label
                htmlFor="images"
                className="cursor-pointer flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Upload className="h-4 w-4 mr-2" />
                Select Images
              </Label>
              <span className="ml-4 text-sm text-gray-500">
                {images.length} {images.length === 1 ? "image" : "images"} selected
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">The first image will be used as the event cover image.</p>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(image) || "/placeholder.svg"}
                    alt={`Preview ${index}`}
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0"
                    onClick={() => removeImage(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={loading}>
            {loading ? "Creating Event..." : "Create Event"}
          </Button>
        </div>
      </form>
    </div>
  )
}
