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
};
