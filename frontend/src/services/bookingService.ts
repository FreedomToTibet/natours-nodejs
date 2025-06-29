import { api } from './api';

export interface Booking {
  _id: string;
  tour: {
    _id: string;
    name: string;
    slug: string;
    imageCover: string;
    duration: number;
    difficulty: string;
  };
  user: {
    _id: string;
    name: string;
    email: string;
  };
  price: number;
  createdAt: string;
  paid: boolean;
}

export interface CreateBookingData {
  tour: string;
  user: string;
  price: number;
  paid: boolean;
}

export interface BookingsResponse {
  status: string;
  results: number;
  data: {
    bookings: Booking[];
  };
}

export interface BookingResponse {
  status: string;
  data: {
    booking: Booking;
  };
}

export const bookingService = {
  // Create a new booking
  async createBooking(bookingData: CreateBookingData): Promise<BookingResponse> {
    const response = await api.post<BookingResponse>('/bookings', bookingData);
    return response.data;
  },

  // Get current user's bookings
  async getUserBookings(): Promise<Booking[]> {
    const response = await api.get<BookingsResponse>('/bookings/my-bookings');
    return response.data.data.bookings;
  },

  // Get specific booking by ID
  async getBooking(bookingId: string): Promise<Booking> {
    const response = await api.get<BookingResponse>(`/bookings/${bookingId}`);
    return response.data.data.booking;
  },

  // Pay for existing booking
  async payBooking(bookingId: string): Promise<Booking> {
    const response = await api.patch<BookingResponse>(`/bookings/${bookingId}`, { paid: true });
    return response.data.data.booking;
  },

  // Cancel booking
  async cancelBooking(bookingId: string): Promise<void> {
    await api.delete(`/bookings/${bookingId}`);
  },

  // Check if user has booking for a tour
  async getUserBookingForTour(tourId: string): Promise<Booking | null> {
    const bookings = await this.getUserBookings();
    return bookings.find(booking => booking.tour._id === tourId) || null;
  },

  // Get all bookings (admin only)
  async getAllBookings(): Promise<Booking[]> {
    const response = await api.get<BookingsResponse>('/bookings');
    return response.data.data.bookings;
  },
};
