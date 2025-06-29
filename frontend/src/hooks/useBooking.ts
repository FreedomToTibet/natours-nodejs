import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { bookingService } from '../services';
import type { CreateBookingData } from '../services';

// Hook for creating a booking
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingData: CreateBookingData) => bookingService.createBooking(bookingData),
    onSuccess: () => {
      toast.success('Booking created successfully!');
      // Invalidate user bookings to refresh the data
      queryClient.invalidateQueries({ queryKey: ['userBookings'] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Booking failed');
    },
  });
};

// Hook for getting user bookings
export const useUserBookings = () => {
  return useQuery({
    queryKey: ['userBookings'],
    queryFn: () => bookingService.getUserBookings(),
    staleTime: 60 * 1000, // Consider data fresh for 1 minute
  });
};

// Hook for getting a specific booking
export const useBooking = (bookingId: string) => {
  return useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => bookingService.getBooking(bookingId),
    enabled: !!bookingId,
  });
};

// Hook for checking if user has booking for a tour
export const useUserBookingForTour = (tourId: string) => {
  return useQuery({
    queryKey: ['userBookingForTour', tourId],
    queryFn: () => bookingService.getUserBookingForTour(tourId),
    enabled: !!tourId,
    staleTime: 30 * 1000,
  });
};

// Hook for paying an existing booking
export const usePayBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => bookingService.payBooking(bookingId),
    onSuccess: () => {
      toast.success('Payment completed successfully!');
      queryClient.invalidateQueries({ queryKey: ['userBookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking'] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Payment failed');
    },
  });
};

// Hook for canceling a booking
export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => bookingService.cancelBooking(bookingId),
    onSuccess: () => {
      toast.success('Booking canceled successfully!');
      queryClient.invalidateQueries({ queryKey: ['userBookings'] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    },
  });
};
