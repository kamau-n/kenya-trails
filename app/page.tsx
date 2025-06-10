import { Button } from "@/components/ui/button";
import Link from "next/link";
import FeaturedEvents from "@/components/featured-events";
import HowItWorks from "@/components/how-it-works";
import Hero from "@/components/hero";

export default function Home() {
  return (
    <div className=" mx-auto md:px-12 px-4">
      <Hero />
      <FeaturedEvents />
      <HowItWorks />

      <section className="py-16 bg-green-50 rounded-xl my-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="md:text-3xl text-2xl font-bold mb-6">
            Ready to explore Kenya's beautiful landscapes?
          </h2>
          <p className="md:text-lg text-sm mb-8">
            Join our community of adventure seekers and event organizers.
            Discover new places, meet new people, and create unforgettable
            memories.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-green-600 hover:bg-green-700">
              <Link href="/events">Discover Events</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50">
              <Link href="/organize">Organize an Event</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
