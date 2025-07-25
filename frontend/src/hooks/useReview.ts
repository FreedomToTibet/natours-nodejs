import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService, type CreateReviewData } from '../services';

// Get user reviews hook
export const useUserReviews = () => {
  return useQuery({
    queryKey: ['userReviews'],
    queryFn: reviewService.getUserReviews,
  });
};

// Create review hook
export const useCreateReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ tourId, reviewData }: { tourId: string; reviewData: CreateReviewData }) =>
      reviewService.createReview(tourId, reviewData),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['userReviews'] });
      queryClient.invalidateQueries({ queryKey: ['userBookings'] });
      queryClient.invalidateQueries({ queryKey: ['tours'] });
    },
  });
};

// Update review hook
export const useUpdateReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ reviewId, reviewData }: { reviewId: string; reviewData: Partial<CreateReviewData> }) =>
      reviewService.updateReview(reviewId, reviewData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userReviews'] });
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      // Also invalidate the specific tour's user review query
      queryClient.invalidateQueries({ queryKey: ['userReview'] });
    },
  });
};

// Delete review hook
export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (reviewId: string) => reviewService.deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userReviews'] });
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      // Also invalidate the specific tour's user review query
      queryClient.invalidateQueries({ queryKey: ['userReview'] });
    },
  });
};

// Check if user has reviewed a specific tour
export const useUserReviewForTour = (tourId: string) => {
  return useQuery({
    queryKey: ['userReview', tourId],
    queryFn: () => reviewService.getUserReviewForTour(tourId),
    enabled: !!tourId,
  });
};
