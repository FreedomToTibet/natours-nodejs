import { api } from './api';
import type { User } from './authService';
import type { Tour } from './tourService';
import type { Booking } from './bookingService';

export interface AdminReview {
	_id: string;
	rating: number;
	review?: string;
	user?: { name?: string } | null;
	tour?: { name?: string } | string | null;
}

export const adminService = {
	// Users
	async getUsers(): Promise<User[]> {
		const res = await api.get('/users');
		return res.data?.data?.data || res.data?.data?.users || [];
	},
	async createUser(userData: { name: string; email: string; password: string; passwordConfirm: string; role: User['role'] }): Promise<User> {
		const res = await api.post('/users', userData);
		return res.data?.data?.user;
	},
	async updateUserRole(userId: string, role: User['role']): Promise<void> {
		await api.patch(`/users/${userId}`, { role });
	},
	async updateUser(userId: string, userData: Partial<User>): Promise<User> {
		const res = await api.patch(`/users/${userId}`, userData);
		return res.data?.data?.data;
	},
	async deleteUser(userId: string): Promise<void> {
		await api.delete(`/users/${userId}`);
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
	async getAllReviews(): Promise<AdminReview[]> {
		const res = await api.get('/reviews');
		const reviews = (res.data?.data?.data || []) as AdminReview[];

		// Populate tours for reviews if missing
		if (reviews.length > 0 && reviews.some((r: AdminReview) => {
			// Check if tour is a string or doesn't have a name property
			return typeof r.tour === 'string' || (r.tour && !('name' in r.tour));
		})) {
			const toursMap = new Map<string, Tour>();
			try {
				// Get all tours for lookup
				const toursRes = await api.get('/tours');
				const tours = toursRes.data?.data?.data || [];
				tours.forEach((tour: Tour) => {
					toursMap.set(tour._id, tour);
				});

				// Enrich reviews with tour data
				return reviews.map((review: AdminReview) => {
					const enrichedReview = {...review};
					if (review.tour && typeof review.tour === 'string') {
						const tourId = review.tour;
						const tourData = toursMap.get(tourId);
						if (tourData) {
							enrichedReview.tour = tourData;
						}
					}
					return enrichedReview;
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
