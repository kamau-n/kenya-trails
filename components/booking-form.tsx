"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore"

export default function BookingForm({ event, onClose, onSuccess }) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    numberOfPeople: 1,
    specialRequirements: "",
    paymentMethod: event.paymentMethods[0] || "M-Pesa",
    paymentAmount: event.depositAmount || event.price,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value ? Number.parseInt(value) : 1 }))
  }

  const handlePaymentAmountChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      paymentAmount: type === "full" ? event.price : event.depositAmount,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Validate available spaces
      if (formData.numberOfPeople > event.availableSpaces) {
        setError(`Only ${event.availableSpaces} spaces available`)
        setLoading(false)
        return
      }

      // Create booking document
      const bookingData = {
        eventId: event.id,
        eventTitle: event.title,
        userId: user.uid,
        userName: user.displayName || user.email,
        userEmail: user.email,
        numberOfPeople: formData.numberOfPeople,
        specialRequirements: formData.specialRequirements,
        paymentMethod: formData.paymentMethod,
        paymentAmount: formData.paymentAmount,
        totalAmount: event.price * formData.numberOfPeople,
        amountPaid: formData.paymentAmount,
        amountDue: event.price * formData.numberOfPeople - formData.paymentAmount,
        paymentStatus: formData.paymentAmount >= event.price * formData.numberOfPeople ? "paid" : "partial",
        bookingDate: serverTimestamp(),
        status: "confirmed",
      }

      // Add booking to database
      const bookingRef = await addDoc(collection(db, "bookings"), bookingData)

      // Update event available spaces
      await updateDoc(doc(db, "events", event.id), {
        availableSpaces: increment(-formData.numberOfPeople),
      })

      // Call success callback
      onSuccess(bookingRef.id)
    } catch (error) {
      console.error("Error creating booking:", error)
      setError("Failed to create booking. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">Book Your Spot</h2>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="numberOfPeople">Number of People</Label>
          <Input
            id="numberOfPeople"
            name="numberOfPeople"
            type="number"
            min="1"
            max={event.availableSpaces}
            value={formData.numberOfPeople}
            onChange={handleNumberChange}
            className="mt-1"
          />
          <p className="text-sm text-gray-500 mt-1">{event.availableSpaces} spaces available</p>
        </div>

        <div>
          <Label htmlFor="specialRequirements">Special Requirements</Label>
          <Textarea
            id="specialRequirements"
            name="specialRequirements"
            value={formData.specialRequirements}
            onChange={handleChange}
            placeholder="Any dietary restrictions, medical conditions, etc."
            className="mt-1"
            rows={3}
          />
        </div>

        <div>
          <Label className="mb-2 block">Payment Amount</Label>
          <RadioGroup
            value={formData.paymentAmount === event.price ? "full" : "deposit"}
            onValueChange={handlePaymentAmountChange}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="full" id="payment-full" />
              <Label htmlFor="payment-full">
                Full Payment (KSh {(event.price * formData.numberOfPeople).toLocaleString()})
              </Label>
            </div>
            {event.depositAmount > 0 && (
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="deposit" id="payment-deposit" />
                <Label htmlFor="payment-deposit">
                  Minimum Deposit (KSh {(event.depositAmount * formData.numberOfPeople).toLocaleString()})
                </Label>
              </div>
            )}
          </RadioGroup>
        </div>

        <div>
          <Label className="mb-2 block">Payment Method</Label>
          <RadioGroup
            value={formData.paymentMethod}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentMethod: value }))}
            className="flex flex-col space-y-1"
          >
            {event.paymentMethods.map((method) => (
              <div key={method} className="flex items-center space-x-2">
                <RadioGroupItem value={method} id={`payment-method-${method}`} />
                <Label htmlFor={`payment-method-${method}`}>{method}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="pt-4 flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={loading}>
            {loading ? "Processing..." : "Confirm Booking"}
          </Button>
        </div>
      </form>
    </div>
  )
}
