import { api } from './api';
import type { User } from './authService';
import type { Tour } from './tourService';
import type { Booking } from './bookingService';

export const adminService = {
  // Users
  async getUsers(): Promise<User[]> {
    const res = await api.get('/users');
    return res.data?.data?.data || res.data?.data?.users || [];
  },
  async updateUserRole(userId: string, role: User['role']): Promise<void> {
    await api.patch(`/users/${userId}`, { role });
  },

  // Tours
  async getTours(): Promise<Tour[]> {
    const res = await api.get('/tours');
    return res.data?.data?.data || [];
  },
  async reassignLeadGuide(tourId: string, email: string): Promise<void> {
    await api.post(`/tours/${tourId}/reassign-lead-guide`, { email });
  },

  // Reviews
  async getAllReviews(): Promise<any[]> {
    const res = await api.get('/reviews');
    const reviews = res.data?.data?.data || [];
    
    // Populate tours for reviews if missing
    if (reviews.length > 0 && reviews.some(r => !r.tour?.name)) {
      const toursMap = new Map();
      try {
        // Get all tours for lookup
        const toursRes = await api.get('/tours');
        const tours = toursRes.data?.data?.data || [];
        tours.forEach(tour => {
          toursMap.set(tour._id, tour);
        });
        
        // Enrich reviews with tour data
        return reviews.map(review => {
          if (review.tour && typeof review.tour === 'string') {
            const tourId = review.tour;
            const tourData = toursMap.get(tourId);
            if (tourData) {
              review.tour = tourData;
            }
          }
          return review;
        });
      } catch (err) {
        console.error('Error enriching reviews with tour data:', err);
      }
    }
    
    return reviews;
  },
  async deleteReview(reviewId: string): Promise<void> {
    await api.delete(`/reviews/${reviewId}`);
  },

  // Bookings
  async getAllBookings(): Promise<Booking[]> {
    const res = await api.get('/bookings');
    return res.data?.data?.bookings || [];
  },
  async deleteBooking(bookingId: string): Promise<void> {
    await api.delete(`/bookings/admin/${bookingId}`);
  }
};
