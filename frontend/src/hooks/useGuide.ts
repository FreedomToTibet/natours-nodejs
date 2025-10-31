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

// Hook for getting guide availability
export const useMyAvailability = () => {
  return useQuery({
    queryKey: ['myAvailability'],
    queryFn: () => guideService.getMyAvailability(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for updating availability status
export const useUpdateAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { available: boolean; availabilityNote?: string }) =>
      guideService.updateAvailability(data),
    onSuccess: () => {
      toast.success('Availability status updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['myAvailability'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to update availability');
    },
  });
};

// Hook for adding unavailable date
export const useAddUnavailableDate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { startDate: string; endDate: string; reason?: string }) =>
      guideService.addUnavailableDate(data),
    onSuccess: () => {
      toast.success('Unavailable date added successfully!');
      queryClient.invalidateQueries({ queryKey: ['myAvailability'] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to add unavailable date');
    },
  });
};

// Hook for removing unavailable date
export const useRemoveUnavailableDate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dateId: string) => guideService.removeUnavailableDate(dateId),
    onSuccess: () => {
      toast.success('Unavailable date removed successfully!');
      queryClient.invalidateQueries({ queryKey: ['myAvailability'] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to remove unavailable date');
    },
  });
};
