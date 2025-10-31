import { api } from './api';
import type { Tour, Guide } from './tourService';
import type { User } from './authService';

export interface TourParticipant {
  _id: string;
  user: User;
  tour: Tour;
  price: number;
  paid: boolean;
  createdAt: string;
  checkedIn: boolean;
  checkedInAt?: string;
  checkedInBy?: {
    _id: string;
    name: string;
  };
}

export interface GuideTour extends Omit<Tour, 'guides'> {
  guides: Guide[];
}

export const guideService = {
  // Get tours where current user is a guide
  async getMyGuideTours(): Promise<{ status: string; results: number; data: { tours: GuideTour[] } }> {
    const response = await api.get<{ status: string; results: number; data: { tours: GuideTour[] } }>('/tours/my-guide-tours');
    return response.data;
  },

  // Get participants for a specific tour
  async getTourParticipants(tourId: string): Promise<{ status: string; results: number; data: { participants: TourParticipant[] } }> {
    const response = await api.get<{ status: string; results: number; data: { participants: TourParticipant[] } }>(`/bookings/tour-participants/${tourId}`);
    return response.data;
  },

  // Check-in a participant
  async checkInParticipant(tourId: string, bookingId: string): Promise<{ status: string; data: { booking: TourParticipant } }> {
    const response = await api.patch<{ status: string; data: { booking: TourParticipant } }>(`/bookings/tour/${tourId}/checkin/${bookingId}`);
    return response.data;
  },

  // Check-out a participant (undo check-in)
  async checkOutParticipant(tourId: string, bookingId: string): Promise<{ status: string; data: { booking: TourParticipant } }> {
    const response = await api.patch<{ status: string; data: { booking: TourParticipant } }>(`/bookings/tour/${tourId}/checkout/${bookingId}`);
    return response.data;
  },
};
