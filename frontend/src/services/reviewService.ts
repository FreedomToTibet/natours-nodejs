import { api } from './api';

export interface UserReview {
  _id: string;
  review: string;
  rating: number;
  createdAt: string;
  tour: {
    _id: string;
    name: string;
    slug: string;
    imageCover: string;
    duration: number;
    difficulty: string;
    price: number;
  };
  user: {
    _id: string;
    name: string;
    photo: string;
  };
}

export interface CreateReviewData {
  review: string;
  rating: number;
}

export const reviewService = {
  // Get all reviews by current user
  getUserReviews: async (): Promise<UserReview[]> => {
    const { data } = await api.get('/reviews/my-reviews');
    return data.data.reviews;
  },

  // Get all reviews (for guides, lead-guides, and admins)
  getAllReviews: async (): Promise<UserReview[]> => {
    try {
      console.log('Fetching all reviews...');
      const { data } = await api.get('/reviews');
      console.log('Reviews API response:', data);
      return data.data.data;
    } catch (error) {
      console.error('Error fetching all reviews:', error);
      throw error;
    }
  },

  // Create a review for a specific tour
  createReview: async (tourId: string, reviewData: CreateReviewData): Promise<UserReview> => {
    const { data } = await api.post(`/reviews/tour/${tourId}`, reviewData);
    return data.data.data;
  },

  // Update a review
  updateReview: async (reviewId: string, reviewData: Partial<CreateReviewData>): Promise<UserReview> => {
    const { data } = await api.patch(`/reviews/${reviewId}`, reviewData);
    return data.data.data;
  },

  // Delete a review
  deleteReview: async (reviewId: string): Promise<void> => {
    await api.delete(`/reviews/${reviewId}`);
  },

  // Check if user has reviewed a specific tour
  getUserReviewForTour: async (tourId: string): Promise<UserReview | null> => {
    try {
      const { data } = await api.get(`/reviews/my-reviews`);
      const reviews = data.data.reviews;
      return reviews.find((review: UserReview) => review.tour._id === tourId) || null;
    } catch {
      return null;
    }
  },
};
