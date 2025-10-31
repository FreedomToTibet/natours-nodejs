import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { tourService } from '../services';

// Hook for creating a new tour
export const useCreateTour = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (tourData: FormData) => tourService.createTour(tourData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      queryClient.invalidateQueries({ queryKey: ['myGuideTours'] });
      toast.success('Tour created successfully!');
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to create tour');
    },
  });
};

// Hook for updating a tour
export const useUpdateTour = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => 
      tourService.updateTour(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      queryClient.invalidateQueries({ queryKey: ['tour', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['myGuideTours'] });
      toast.success('Tour updated successfully!');
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to update tour');
    },
  });
};

// Hook for deleting a tour
export const useDeleteTour = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => tourService.deleteTour(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      queryClient.invalidateQueries({ queryKey: ['myGuideTours'] });
      toast.success('Tour deleted successfully!');
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to delete tour');
    },
  });
};

// Hook for updating tour capacity
export const useUpdateTourCapacity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, maxGroupSize }: { id: string; maxGroupSize: number }) => 
      tourService.updateTourCapacity(id, maxGroupSize),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      queryClient.invalidateQueries({ queryKey: ['tour', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['myGuideTours'] });
      toast.success('Tour capacity updated successfully!');
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to update tour capacity');
    },
  });
};

// Hook for assigning guide to tour
export const useAssignGuideToTour = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, email }: { id: string; email: string }) => 
      tourService.assignGuideToTour(id, email),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      queryClient.invalidateQueries({ queryKey: ['tour', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['myGuideTours'] });
      toast.success('Guide assigned successfully!');
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to assign guide');
    },
  });
};

// Hook for unassigning guide from tour
export const useUnassignGuideFromTour = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, guideId }: { id: string; guideId: string }) => 
      tourService.unassignGuideFromTour(id, guideId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      queryClient.invalidateQueries({ queryKey: ['tour', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['myGuideTours'] });
      toast.success('Guide unassigned successfully!');
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to unassign guide');
    },
  });
};
