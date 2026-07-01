export interface Movie {
  id: string;
  title: string;
  price: number;
  seats: number;
  totalSeats: number;
  showTime: string; // stored as string (e.g. "02-07-2026 07:00 PM")
  genre?: string;
  duration?: string;
  rating?: string;
  posterUrl?: string;
}

export interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  movieTitle: string;
  seatsBooked: number;
  amountPaid: number;
  paymentMethod: 'Cash' | 'Credit Card' | 'Online Wallet';
  showTime: string;
  bookedAt: string;
  referenceNumber: string; // 11-digit number
  seats?: number[];
}

export type Role = 'customer' | 'admin';

export interface RippleData {
  id: number;
  x: number;
  y: number;
  size: number;
}
