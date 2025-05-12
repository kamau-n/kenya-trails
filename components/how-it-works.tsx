import { Search, Calendar, CreditCard, Users } from "lucide-react"

export default function HowItWorks() {
  const steps = [
    {
      icon: <Search className="h-10 w-10 text-green-600" />,
      title: "Discover Events",
      description: "Browse through a variety of hiking and travel events across Kenya.",
    },
    {
      icon: <Calendar className="h-10 w-10 text-green-600" />,
      title: "Book Your Spot",
      description: "Reserve your place in upcoming adventures with just a few clicks.",
    },
    {
      icon: <CreditCard className="h-10 w-10 text-green-600" />,
      title: "Secure Payment",
      description: "Pay the full amount or a deposit to confirm your booking.",
    },
    {
      icon: <Users className="h-10 w-10 text-green-600" />,
      title: "Join the Adventure",
      description: "Meet fellow travelers and enjoy unforgettable experiences.",
    },
  ]

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Kenya Trails makes it easy to discover and join group adventures or create your own events.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="bg-green-50 p-4 rounded-full mb-4">{step.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
