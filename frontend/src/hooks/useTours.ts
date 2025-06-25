import { useQuery } from '@tanstack/react-query';
import { getAllTours, getTourBySlug } from '../services';

// Hook to fetch all tours
export const useTours = () => {
  return useQuery({
    queryKey: ['tours'],
    queryFn: getAllTours,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};

// Hook to fetch a single tour by slug
export const useTour = (slug: string) => {
  return useQuery({
    queryKey: ['tour', slug],
    queryFn: () => getTourBySlug(slug),
    enabled: !!slug, // Only run query if slug is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
