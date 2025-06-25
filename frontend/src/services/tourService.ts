import api from './api';

export interface Location {
  type: string;
  coordinates: [number, number];
  address?: string;
  description: string;
  day: number;
  _id?: string;
}

export interface Guide {
  _id: string;
  name: string;
  email: string;
  photo: string;
  role: 'guide' | 'lead-guide';
}

export interface Review {
  _id: string;
  review: string;
  rating: number;
  createdAt: string;
  user: {
    _id: string;
    name: string;
    photo: string;
  };
  tour: string;
}

export interface Tour {
  _id: string;
  name: string;
  slug: string;
  duration: number;
  maxGroupSize: number;
  difficulty: 'easy' | 'medium' | 'difficult';
  ratingsAverage: number;
  ratingsQuantity: number;
  price: number;
  priceDiscount?: number;
  summary: string;
  description: string;
  imageCover: string;
  images: string[];
  startDates: string[];
  startLocation: Location;
  locations: Location[];
  guides?: Guide[];
  reviews?: Review[];
  createdAt?: string;
  id: string;
}

export interface ToursResponse {
  status: string;
  results: number;
  data: {
    data: Tour[];
  };
}

export interface TourResponse {
  status: string;
  data: {
    tour: Tour;
  };
}

// Get all tours
export const getAllTours = async (): Promise<Tour[]> => {
  try {
    console.log('Making API call to:', '/tours');
    const response = await api.get('/tours');
    console.log('API response:', response.data);
    
    // Based on actual API response: { status, results, data: { data: [...] } }
    const tours = response.data?.data?.data;
    if (!tours || !Array.isArray(tours)) {
      console.error('Invalid API response structure:', response.data);
      throw new Error('Invalid API response structure');
    }
    
    return tours;
  } catch (error: unknown) {
    console.error('Error fetching tours:', error);
    
    // Check if it's an axios error
    if (error instanceof Error) {
      // Check for specific error types
      if (error.message?.includes('Network Error') || error.message?.includes('ECONNREFUSED')) {
        throw new Error('Cannot connect to backend server. Please check if the server is running on port 8000.');
      }
      
      // Check if it's a CORS error
      if (error.message?.includes('CORS')) {
        throw new Error('CORS error: Backend server is not allowing requests from this origin.');
      }
      
      // For any other error, throw with the original message
      throw new Error(`Failed to fetch tours: ${error.message}`);
    }
    
    // For any other error, throw a generic message
    throw new Error('Failed to fetch tours: Unknown error');
  }
};

// Get single tour by ID
export const getTour = async (id: string): Promise<Tour> => {
  try {
    const response = await api.get(`/tours/${id}`);
    return response.data.data.tour;
  } catch (error: unknown) {
    console.error('Error fetching tour:', error);
    throw new Error('Failed to fetch tour');
  }
};

// Get tour by slug
export const getTourBySlug = async (slug: string): Promise<Tour> => {
  try {
    // First, get all tours to find the one with matching slug
    const allToursResponse = await api.get('/tours');
    const allTours = allToursResponse.data?.data?.data;
    
    if (!allTours || !Array.isArray(allTours)) {
      throw new Error('Invalid API response structure');
    }
    
    const tourWithSlug = allTours.find(t => t.slug === slug);
    
    if (!tourWithSlug) {
      throw new Error(`Tour with slug "${slug}" not found`);
    }
    
    // Now fetch the individual tour by ID to get populated data (including reviews)
    try {
      const singleTourResponse = await api.get(`/tours/${tourWithSlug._id}`);
      const tourData = singleTourResponse.data?.data?.data;
      
      if (tourData) {
        return tourData;
      }
    } catch (error) {
      console.warn('Failed to fetch detailed tour data, falling back to basic data:', error);
    }
    
    // Fallback to the tour data from getAllTours if individual fetch fails
    return tourWithSlug;
  } catch (error: unknown) {
    console.error('Error fetching tour by slug:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch tour: ${error.message}`);
    }
    throw new Error('Failed to fetch tour: Unknown error');
  }
};
