import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { guideService } from '../services/guideService';

// Hook for getting guide's assigned tours
export const useMyGuideTours = () => {
  return useQuery({
    queryKey: ['myGuideTours'],
    queryFn: () => guideService.getMyGuideTours(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for getting tour participants
export const useTourParticipants = (tourId: string) => {
  return useQuery({
    queryKey: ['tourParticipants', tourId],
    queryFn: () => guideService.getTourParticipants(tourId),
    enabled: !!tourId, // Only run if tourId is provided
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for checking in a participant
export const useCheckInParticipant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tourId, bookingId }: { tourId: string; bookingId: string }) =>
      guideService.checkInParticipant(tourId, bookingId),
    onSuccess: (data, variables) => {
      toast.success('Participant checked in successfully!');
      // Invalidate and refetch the tour participants
      queryClient.invalidateQueries({ queryKey: ['tourParticipants', variables.tourId] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to check in participant');
    },
  });
};

// Hook for checking out a participant
export const useCheckOutParticipant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tourId, bookingId }: { tourId: string; bookingId: string }) =>
      guideService.checkOutParticipant(tourId, bookingId),
    onSuccess: (data, variables) => {
      toast.success('Participant checked out successfully!');
      // Invalidate and refetch the tour participants
      queryClient.invalidateQueries({ queryKey: ['tourParticipants', variables.tourId] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to check out participant');
    },
  });
};
