export type ItineraryItem = {
  day: string;
  title: string;
  description: string;
};

export type event = {
  id: string;
  title: string;
  description: string;
  location: string;
  meetingPoint: string;
  date: Date;
  endDate: Date;
  price: number;
  depositAmount: number;
  totalSpaces: number;
  availableSpaces: number;
  category: string;
  difficulty: string;
  duration: string;
  included: string[];
  notIncluded: string[];
  itinerary: ItineraryItem[];
  requirements: string[];
  imageUrl: string;
  images: string[];
  paymentMethods: string[];
  paymentDeadline: Date;
  organizerId: string;
  organizerName: string;
};
