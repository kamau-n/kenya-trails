export type accountDetails = {
  bankName: string;
  accountNumber: string;
  accountName: string;
};
export type events = {
  toDate: Date;
  title: string;
  location: string;
  fromDate: Date;
  availableSpaces: number;
  totaSpaces: number;
  date: Date;
  price: number;
  totalSpaces: number;
  id: string;
  imageUrl: string;
  paymentManagement: string;
  organizerId: string;
  accountDetails: accountDetails;
  collectionBalance: number;
  category: string;
  duration: string;
  isPromoted: boolean;
};

export type FirebaseUser = {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  providerId: string;
  disabled?: boolean;
  metadata?: {
    creationTime: string;
    lastSignInTime: string;
  };
  customClaims?: Record<string, any>; // e.g., { role: "admin" }
  tokensValidAfterTime?: string;
};

export type booking = {
  id: string;
  eventId: string;
  eventTitle: string;
  paymentStatus: string;
  amountPaid: number;
  totalAmount: number;
  bookingDate: Date;
  amountDue: number;
  numberOfPeople: number;
  userName: string;
};

export type payments = {
  amount: number;
  reference: string;
  status: string;
  createdAt: Date;
  eventTitle: string;
  id: string;
};
