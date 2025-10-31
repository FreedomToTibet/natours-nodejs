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

export interface GuideAvailability {
  available: boolean;
  availabilityNote?: string;
  unavailableDates: UnavailableDate[];
}

export interface UnavailableDate {
  _id: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface UpdateAvailabilityData {
  available: boolean;
  availabilityNote?: string;
}

export interface AddUnavailableDateData {
  startDate: string;
  endDate: string;
  reason?: string;
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

  // Get guide availability
  async getMyAvailability(): Promise<{ status: string; data: GuideAvailability }> {
    const response = await api.get<{ status: string; data: GuideAvailability }>('/users/my-availability');
    return response.data;
  },

  // Update availability status
  async updateAvailability(data: UpdateAvailabilityData): Promise<{ status: string; data: { user: any } }> {
    const response = await api.patch<{ status: string; data: { user: any } }>('/users/update-availability', data);
    return response.data;
  },

  // Add unavailable date range
  async addUnavailableDate(data: AddUnavailableDateData): Promise<{ status: string; data: { unavailableDates: UnavailableDate[] } }> {
    const response = await api.post<{ status: string; data: { unavailableDates: UnavailableDate[] } }>('/users/unavailable-dates', data);
    return response.data;
  },

  // Remove unavailable date range
  async removeUnavailableDate(dateId: string): Promise<{ status: string; data: { unavailableDates: UnavailableDate[] } }> {
    const response = await api.delete<{ status: string; data: { unavailableDates: UnavailableDate[] } }>(`/users/unavailable-dates/${dateId}`);
    return response.data;
  },
};
