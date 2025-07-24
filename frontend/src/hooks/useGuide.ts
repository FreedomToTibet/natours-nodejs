import { useQuery } from '@tanstack/react-query';
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
