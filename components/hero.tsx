import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Hero() {
  return (
    <div className="relative py-20 md:py-32 overflow-hidden rounded-3xl my-8">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/placeholder.svg?height=800&width=1600"
          alt="Kenya Landscape"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Explore Kenya's <span className="text-green-400">Breathtaking</span> Landscapes
        </h1>
        <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
          Join group adventures to Kenya's most beautiful destinations. Book your spot or organize your own trip.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-lg">
            <Link href="/events">Find Adventures</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-green-800 text-lg"
          >
            <Link href="/organize">Create Your Event</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
