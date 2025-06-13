"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Plus, Trash2, Upload } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, differenceInDays } from "date-fns";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function CreateEventPage() {
  const { user } = useAuth();
  const router = useRouter();

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

    included: [""],
    notIncluded: [""],
    requirements: [""],
    paymentMethods: [],
    paymentDeadline: null,
    paymentManagement: "manual",
    accountDetails: {
      bankName: "",
      accountNumber: "",
      accountName: "",
      accountCode: "",
    },
    platformFee: 5,
  });

  const [images, setImages] = useState([]);
  const [itinerary, setItinerary] = useState([
    { day: "Day 1", title: "", description: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [banks, setBanks] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [selectedAccountCode, setSelectedCode] = useState();

  // New state for calendar popovers and single day event
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [paymentDeadlineOpen, setPaymentDeadlineOpen] = useState(false);
  const [isSingleDayEvent, setIsSingleDayEvent] = useState(false);
  const [calculatedDays, setCalculatedDays] = useState(1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value ? Number.parseInt(value) : "",
    }));
  };

  const handleDateChange = (name, date) => {
    setFormData((prev) => {
      const newFormData = { ...prev, [name]: date };

      // Auto-close the appropriate popover
      if (name === "date") {
        setStartDateOpen(false);
        // If single day event, set end date to same as start date
        if (isSingleDayEvent) {
          newFormData.endDate = date;
        }
      } else if (name === "endDate") {
        setEndDateOpen(false);
      } else if (name === "paymentDeadline") {
        setPaymentDeadlineOpen(false);
      }

      return newFormData;
    });
  };

  // Calculate days when dates change
  useEffect(() => {
    if (formData.date && formData.endDate) {
      const days = differenceInDays(formData.endDate, formData.date) + 1;
      setCalculatedDays(days > 0 ? days : 1);
      formData.duration = calculatedDays.toString;
    } else if (isSingleDayEvent) {
      setCalculatedDays(1);
      formData.duration = calculatedDays.toString;
    }
  }, [formData.date, formData.endDate, isSingleDayEvent]);

  // Handle single day event toggle
  const handleSingleDayToggle = (checked) => {
    setIsSingleDayEvent(checked);
    if (checked) {
      // Set end date to same as start date
      setFormData((prev) => ({
        ...prev,
        endDate: prev.date,
      }));
      setCalculatedDays(1);
    }
  };

  const handleArrayChange = (name, index, value) => {
    setFormData((prev) => {
      const newArray = [...prev[name]];
      newArray[index] = value;
      return { ...prev, [name]: newArray };
    });
  };

  const addArrayItem = (name) => {
    setFormData((prev) => ({
      ...prev,
      [name]: [...prev[name], ""],
    }));
  };

  const removeArrayItem = (name, index) => {
    setFormData((prev) => {
      const newArray = [...prev[name]];
      newArray.splice(index, 1);
      return { ...prev, [name]: newArray };
    });
  };

  const handleItineraryChange = (index, field, value) => {
    const newItinerary = [...itinerary];
    newItinerary[index] = { ...newItinerary[index], [field]: value };
    setItinerary(newItinerary);
  };

  const addItineraryDay = () => {
    setItinerary([
      ...itinerary,
      { day: `Day ${itinerary.length + 1}`, title: "", description: "" },
    ]);
  };

  const removeItineraryDay = (index) => {
    const newItinerary = [...itinerary];
    newItinerary.splice(index, 1);
    newItinerary.forEach((item, i) => {
      item.day = `Day ${i + 1}`;
    });
    setItinerary(newItinerary);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImages((prev) => [...prev, ...files]);
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePaymentMethodChange = (method) => {
    setFormData((prev) => {
      const methods = [...prev.paymentMethods];
      if (methods.includes(method)) {
        return { ...prev, paymentMethods: methods.filter((m) => m !== method) };
      } else {
        return { ...prev, paymentMethods: [...methods, method] };
      }
    });
  };

  const validateForm = () => {
    if (!formData.title) return "Event title is required";
    if (!formData.description) return "Event description is required";
    if (!formData.location) return "Location is required";
    if (!formData.date) return "Event date is required";
    if (!formData.price) return "Price is required";
    if (!formData.totalSpaces) return "Total spaces is required";
    if (!formData.category) return "Category is required";
    if (formData.paymentMethods.length === 0)
      return "At least one payment method is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const imageUrls = [];

      if (images.length > 0) {
        for (const image of images) {
          const storageRef = ref(storage, `events/${Date.now()}_${image.name}`);
          await uploadBytes(storageRef, image);
          const url = await getDownloadURL(storageRef);
          imageUrls.push(url);
        }
      }

      console.log(formData.accountDetails);

      const eventData = {
        ...formData,
        price: Number(formData.price),
        depositAmount: formData.depositAmount
          ? Number(formData.depositAmount)
          : 0,
        totalSpaces: Number(formData.totalSpaces),
        availableSpaces: Number(formData.totalSpaces),
        itinerary,
        duration:
          calculatedDays === 1
            ? calculatedDays + " day"
            : calculatedDays + " days",
        images: imageUrls,
        imageUrl: imageUrls.length > 0 ? imageUrls[0] : null,
        createdAt: serverTimestamp(),
        organizerId: user.uid,
        organizerName: user.displayName || user.email,
        paymentManagement: formData.paymentManagement,
        platformFee: formData.platformFee,
        accountDetails:
          formData.paymentManagement === "platform"
            ? formData.accountDetails
            : null,
        collectionBalance: 0,
        isPromoted: false,
        promotionId: null,
        promotionStartDate: null,
      };

      console.log(eventData);

      await addDoc(collection(db, "events"), eventData);

      setSuccess(true);
      setTimeout(() => {
        router.push("/organize/events");
      }, 2000);
    } catch (error) {
      console.error("Error creating event:", error);
      setError("Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="md:px-12 mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-8">You need to be logged in to create events.</p>
        <Button asChild>
          <Link href="/login?redirect=/organize/create">Log In</Link>
        </Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="md:px-12 mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">
          Event Created Successfully!
        </h1>
        <p className="mb-8">Your event has been created and is now live.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild>
            <Link href="/organize/events">Manage Your Events</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/events">View All Events</Link>
          </Button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    async function fetchBanks() {
      try {
        const res = await fetch("/api/paystack/banks?country=KE");
        const data = await res.json();

        console.log("this is the response from paystack", data);
        if (data.status) {
          setBanks(data.data);
        }
      } catch (e) {
        console.error("Failed to fetch banks:", e);
      } finally {
        setLoadingBanks(false);
      }
    }

    fetchBanks();
  }, []);

  return (
    <div className="md:px-12 mx-auto px-4 py-8">
      <h1 className="md:text-3xl text-2xl px-1 font-bold mb-8">
        Create a New Event
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Basic Information */}
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, category: value }))
                }>
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
                  <SelectItem value="Gaming">Gaming</SelectItem>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4">
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

          {/* Single Day Event Checkbox */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="singleDay"
                checked={isSingleDayEvent}
                onCheckedChange={handleSingleDayToggle}
              />
              <Label htmlFor="singleDay" className="text-sm font-medium">
                This is a single day event
              </Label>
            </div>
          </div>

          {/* Date Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="space-y-2">
              <Label>Start Date*</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">
                      {formData.date
                        ? format(formData.date, "PPP")
                        : "Pick a date"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => handleDateChange("date", date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      isSingleDayEvent
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={isSingleDayEvent}>
                    <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">
                      {formData.endDate
                        ? format(formData.endDate, "PPP")
                        : "Pick a date"}
                    </span>
                  </Button>
                </PopoverTrigger>
                {!isSingleDayEvent && (
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => handleDateChange("endDate", date)}
                      initialFocus
                      className="pointer-events-auto"
                      disabled={(date) => formData.date && date < formData.date}
                    />
                  </PopoverContent>
                )}
              </Popover>
            </div>

            {/* <div className="space-y-2">
              <Label>Number of Days</Label>
              <Input
                value={calculatedDays}
                readOnly
                className="bg-gray-100 text-gray-600"
                placeholder="Auto-calculated"
              />
            </div> */}

            <div className="space-y-2">
              <Label htmlFor="duration">Duration*</Label>
              <Input
                id="duration"
                name="duration"
                value={calculatedDays}
                onChange={handleChange}
                placeholder="e.g. 3 days"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select
                name="difficulty"
                value={formData.difficulty}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, difficulty: value }))
                }>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4">
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
              <Popover
                open={paymentDeadlineOpen}
                onOpenChange={setPaymentDeadlineOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">
                      {formData.paymentDeadline
                        ? format(formData.paymentDeadline, "PPP")
                        : "Pick a date"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.paymentDeadline}
                    onSelect={(date) =>
                      handleDateChange("paymentDeadline", date)
                    }
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Label>Payment Methods*</Label>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4">
              {["M-Pesa", "Bank Transfer", "Cash", "Credit Card"].map(
                (method) => (
                  <div key={method} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`payment-${method}`}
                      checked={formData.paymentMethods.includes(method)}
                      onChange={() => handlePaymentMethodChange(method)}
                      className="mr-2"
                    />
                    <Label htmlFor={`payment-${method}`} className="text-sm">
                      {method}
                    </Label>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* ... keep existing code (Itinerary section) */}
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Itinerary</h2>

          {itinerary.map((day, index) => (
            <div
              key={index}
              className="mb-6 p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">{day.day}</h3>
                {itinerary.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItineraryDay(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor={`itinerary-${index}-title`}>Title</Label>
                  <Input
                    id={`itinerary-${index}-title`}
                    value={day.title}
                    onChange={(e) =>
                      handleItineraryChange(index, "title", e.target.value)
                    }
                    placeholder="e.g. Nairobi to Mt. Kenya"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`itinerary-${index}-description`}>
                  Description
                </Label>
                <Textarea
                  id={`itinerary-${index}-description`}
                  value={day.description}
                  onChange={(e) =>
                    handleItineraryChange(index, "description", e.target.value)
                  }
                  placeholder="Describe the activities for this day..."
                  rows={3}
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addItineraryDay}
            className="w-full">
            <Plus className="h-4 w-4 mr-2" /> Add Day
          </Button>
        </div>

        {/* ... keep existing code (Inclusions and Requirements, Images, Payment Management sections) */}
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-4">
                What's Included
              </h2>

              {formData.included.map((item, index) => (
                <div key={index} className="flex items-center mb-2">
                  <Input
                    value={item}
                    onChange={(e) =>
                      handleArrayChange("included", index, e.target.value)
                    }
                    placeholder="e.g. Professional guide"
                    className="mr-2"
                  />
                  {formData.included.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeArrayItem("included", index)}>
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
                className="mt-2">
                <Plus className="h-4 w-4 mr-2" /> Add Item
              </Button>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-4">
                What's Not Included
              </h2>

              {formData.notIncluded.map((item, index) => (
                <div key={index} className="flex items-center mb-2">
                  <Input
                    value={item}
                    onChange={(e) =>
                      handleArrayChange("notIncluded", index, e.target.value)
                    }
                    placeholder="e.g. Personal hiking gear"
                    className="mr-2"
                  />
                  {formData.notIncluded.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeArrayItem("notIncluded", index)}>
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
                className="mt-2">
                <Plus className="h-4 w-4 mr-2" /> Add Item
              </Button>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">
              Requirements
            </h2>

            {formData.requirements.map((item, index) => (
              <div key={index} className="flex items-center mb-2">
                <Input
                  value={item}
                  onChange={(e) =>
                    handleArrayChange("requirements", index, e.target.value)
                  }
                  placeholder="e.g. Moderate fitness level"
                  className="mr-2"
                />
                {formData.requirements.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeArrayItem("requirements", index)}>
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
              className="mt-2">
              <Plus className="h-4 w-4 mr-2" /> Add Requirement
            </Button>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            Event Images
          </h2>

          <div className="mb-4">
            <Label htmlFor="images" className="block mb-2">
              Upload Images
            </Label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
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
                className="cursor-pointer flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                <Upload className="h-4 w-4 mr-2" />
                Select Images
              </Label>
              <span className="text-sm text-gray-500">
                {images.length} {images.length === 1 ? "image" : "images"}{" "}
                selected
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              The first image will be used as the event cover image.
            </p>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index}`}
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0"
                    onClick={() => removeImage(index)}>
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

        {/* Payment Management Section
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            Payment Management
          </h2>

         
        </div> */}

        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Choose Your Payment Management
            </h2>
            <p className="text-gray-600">
              Let us handle the complexity while you focus on creating amazing
              experiences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Management Option */}
            <div
              className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                formData.paymentManagement === "platform"
                  ? "border-green-500 bg-green-50 shadow-lg transform scale-105"
                  : "border-gray-200 hover:border-green-300 hover:shadow-md"
              }`}
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  paymentManagement: "platform",
                }))
              }>
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-md">
                  ⭐ RECOMMENDED
                </span>
              </div>

              <div className="flex items-start space-x-3">
                <RadioGroupItem
                  value="platform"
                  id="platform-radio"
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Full Payment Management
                    </h3>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    We handle everything payment-related so you can focus on
                    what you do best - creating unforgettable experiences.
                  </p>

                  {/* Benefits List */}
                  <div className="space-y-2 mb-4">
                    {[
                      "🔒 Secure payment processing with fraud protection",
                      "💳 Accept all major payment methods (M-Pesa, Cards, Bank)",
                      "📊 Real-time payment tracking and analytics",
                      "🤖 Automated payment reminders and follow-ups",
                      "💰 Instant settlement to your account",
                      "📱 Mobile-optimized checkout experience",
                      "⚡ Automatic receipt generation and delivery",
                      "🛡️ Full refund and dispute management",
                      "📈 Detailed financial reporting and insights",
                    ].map((benefit, index) => (
                      <div
                        key={index}
                        className="flex items-start text-sm text-gray-700">
                        <span className="mr-2 mt-0.5">
                          {benefit.split(" ")[0]}
                        </span>
                        <span>
                          {benefit.substring(benefit.indexOf(" ") + 1)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-green-100 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-green-800">
                        Platform Fee:
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        Only 6%
                      </span>
                    </div>
                    <p className="text-xs text-green-700">
                      That's just KSh 900 on a KSh 15,000 booking - a small
                      price for complete peace of mind!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                formData.paymentManagement === "manual"
                  ? "border-blue-500 bg-blue-50 shadow-lg"
                  : "border-gray-200 hover:border-blue-300 hover:shadow-md"
              }`}
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  paymentManagement: "manual",
                }))
              }>
              <div className="flex items-start space-x-3">
                <RadioGroupItem
                  value="manual"
                  id="manual-radio"
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Self-Managed Payments
                    </h3>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    Handle payments directly through your preferred methods
                    while still using our platform for bookings.
                  </p>

                  <div className="space-y-2 mb-4">
                    {[
                      "📋 Booking management and participant tracking",
                      "📧 Automated booking confirmations",
                      "📱 Basic participant communication tools",
                      "📊 Simple booking analytics",
                    ].map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-start text-sm text-gray-700">
                        <span className="mr-2 mt-0.5">
                          {feature.split(" ")[0]}
                        </span>
                        <span>
                          {feature.substring(feature.indexOf(" ") + 1)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* What you'll need to handle */}
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <h4 className="text-sm font-medium text-amber-800 mb-2">
                      You'll handle:
                    </h4>
                    <div className="space-y-1">
                      {[
                        "Payment collection and tracking",
                        "Receipt generation and delivery",
                        "Refund processing",
                        "Payment disputes and issues",
                        "Financial record keeping",
                      ].map((task, index) => (
                        <div
                          key={index}
                          className="flex items-center text-xs text-amber-700">
                          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mr-2"></span>
                          {task}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-100 p-3 rounded-lg mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-800">
                        Platform Fee:
                      </span>
                      <span className="text-lg font-bold text-gray-600">
                        Free
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional compelling content */}
          <div className="mt-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-green-800 mb-1">
                  Why 95% of organizers choose our payment management:
                </h4>
                <p className="text-sm text-green-700 leading-relaxed">
                  "Since switching to platform payment management, I've saved
                  10+ hours per event and increased my bookings by 40%. The
                  automated reminders alone have reduced no-shows by 60%!" -
                  Sarah K., Adventure Organizer
                </p>
              </div>
            </div>
          </div>

          {/* Account Details Section - Only shows when platform is selected */}
          {formData.paymentManagement === "platform" && (
            <div className="space-y-4 mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Setup Your Payout Account
                </h3>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                We'll transfer your earnings directly to this account within 2-3
                business days after each event.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="bankName"
                    className="text-sm font-medium text-gray-700">
                    Bank Name *
                  </Label>
                  <select
                    id="bankName"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    value={formData.accountDetails.bankName}
                    onChange={(e) => {
                      const selectedBank = banks.find(
                        (bank) => bank.name === e.target.value
                      );
                      if (selectedBank) {
                        setSelectedCode(selectedBank.code);
                        formData.accountDetails.accountCode = selectedBank.code;
                      }

                      setFormData((prev) => ({
                        ...prev,
                        accountDetails: {
                          ...prev.accountDetails,
                          bankName: e.target.value,
                        },
                      }));
                    }}
                    required>
                    <option value="">Select your bank</option>
                    {banks.map((bank) => (
                      <option key={bank.code} value={bank.name}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                  {loadingBanks && (
                    <p className="text-sm text-gray-500 mt-1">
                      Loading banks...
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="accountNumber"
                    className="text-sm font-medium text-gray-700">
                    Account Number *
                  </Label>
                  <Input
                    id="accountNumber"
                    className="p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={formData.accountDetails.accountNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        accountDetails: {
                          ...prev.accountDetails,
                          accountNumber: e.target.value,
                        },
                      }))
                    }
                    placeholder="Enter your account number"
                    required
                  />
                </div>

                <div>
                  <Label
                    htmlFor="accountName"
                    className="text-sm font-medium text-gray-700">
                    Account Name *
                  </Label>
                  <Input
                    id="accountName"
                    className="p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={formData.accountDetails.accountName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        accountDetails: {
                          ...prev.accountDetails,
                          accountName: e.target.value,
                        },
                      }))
                    }
                    placeholder="Account holder name"
                    required
                  />
                </div>

                <div>
                  <Label
                    htmlFor="accountCode"
                    className="text-sm font-medium text-gray-700">
                    Bank Code
                  </Label>
                  <Input
                    id="accountCode"
                    className="p-3 bg-gray-100 text-gray-600"
                    value={formData.accountDetails.accountCode}
                    disabled
                    placeholder="Auto-filled"
                  />
                </div>
              </div>

              <div className="bg-green-100 p-4 rounded-lg mt-4">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-800 mb-1">
                      Secure & Fast Payouts
                    </h4>
                    <p className="text-sm text-green-700">
                      Your account details are encrypted and secure. Payouts are
                      processed automatically 2-3 business days after each event
                      completion.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-green-600 hover:bg-green-700"
            disabled={loading}>
            {loading ? "Creating Event..." : "Create Event"}
          </Button>
        </div>
      </form>
    </div>
  );
}
