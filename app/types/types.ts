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

type ChargeSuccessWebhook = {
  event: "charge.success";
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: {
      bookingId: string;
      eventId: string;
      userId: string;
      referrer: string;
    };
    fees_breakdown: any | null;
    log: any | null;
    fees: number;
    fees_split: any | null;
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: string | null;
      account_name: string | null;
      receiver_bank_account_number: string | null;
      receiver_bank: string | null;
    };
    customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      customer_code: string;
      phone: string;
      metadata: any | null;
      risk_action: string;
      international_format_phone: string | null;
    };
    plan: Record<string, any>;
    subaccount: Record<string, any>;
    split: Record<string, any>;
    order_id: string | null;
    paidAt: string;
    requested_amount: number;
    pos_transaction_data: any | null;
    source: {
      type: string;
      source: string;
      entry_point: string;
      identifier: string | null;
    };
  };
};

// example response

// {
//   event: 'charge.success',
//   data: {
//     id: 5009300974,
//     domain: 'test',
//     status: 'success',
//     reference: 'LsR5MMBqLIeMzAodG3tH',
//     amount: 150000,
//     message: null,
//     gateway_response: 'Approved',
//     paid_at: '2025-05-29T07:00:40.000Z',
//     created_at: '2025-05-29T07:00:28.000Z',
//     channel: 'mobile_money',
//     currency: 'KES',
//     ip_address: '102.219.208.122',
//     metadata: {
//       bookingId: 'Uz8estc3rvSomCPrhLat',
//       eventId: 'RqupJnazhWHycGWHnGWj',
//       userId: '37ZJF1pfnyQ8fYqOdbsm5hhHHSR2',
//       referrer: 'https://kenyatrails.co.ke/dashboard'
//     },
//     fees_breakdown: null,
//     log: null,
//     fees: 2250,
//     fees_split: null,
//     authorization: {
//       authorization_code: 'AUTH_1kz6a14wyz',
//       bin: '071XXX',
//       last4: 'X000',
//       exp_month: '12',
//       exp_year: '9999',
//       channel: 'mobile_money',
//       card_type: '',
//       bank: 'M-PESA',
//       country_code: 'KE',
//       brand: 'M-pesa',
//       reusable: false,
//       signature: null,
//       account_name: null,
//       receiver_bank_account_number: null,
//       receiver_bank: null
//     },
//     customer: {
//       id: 277062341,
//       first_name: '',
//       last_name: '',
//       email: 'nafape5762@daupload.com',
//       customer_code: 'CUS_q05zd2z3tzmzblw',
//       phone: '',
//       metadata: null,
//       risk_action: 'default',
//       international_format_phone: null
//     },
//     plan: {},
//     subaccount: {},
//     split: {},
//     order_id: null,
//     paidAt: '2025-05-29T07:00:40.000Z',
//     requested_amount: 150000,
//     pos_transaction_data: null,
//     source: {
//       type: 'web',
//       source: 'checkout',
//       entry_point: 'request_inline',
//       identifier: null
//     }
//   }
// }
