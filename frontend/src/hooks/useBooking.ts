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
