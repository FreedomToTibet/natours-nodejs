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
      queryClient.invalidateQueries({ queryKey: ['my-guide-tours'] });
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
      queryClient.invalidateQueries({ queryKey: ['my-guide-tours'] });
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
      queryClient.invalidateQueries({ queryKey: ['my-guide-tours'] });
      toast.success('Tour deleted successfully!');
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to delete tour');
    },
  });
};
