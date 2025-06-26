import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services';
import type { 
  LoginCredentials, 
  SignupData, 
  UpdateUserData, 
  UpdatePasswordData 
} from '../services';

// Hook for getting current user
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => {
      // Get user from localStorage on app load
      const user = authService.getCurrentUser();
      return user;
    },
    staleTime: Infinity, // User data doesn't change often
    gcTime: Infinity, // Keep in cache indefinitely
    initialData: () => {
      // Set initial data from localStorage
      return authService.getCurrentUser();
    },
  });
};

// Hook for login
export const useLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      toast.success('Logged in successfully!');
      queryClient.setQueryData(['currentUser'], data.data.user);
      navigate('/'); // Redirect to main page instead of /me
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });
};

// Hook for signup
export const useSignup = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: SignupData) => authService.signup(userData),
    onSuccess: (data) => {
      toast.success('Account created successfully!');
      queryClient.setQueryData(['currentUser'], data.data.user);
      navigate('/'); // Redirect to main page instead of /me
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Signup failed');
    },
  });
};

// Hook for logout
export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => Promise.resolve(authService.logout()),
    onSuccess: () => {
      toast.success('Logged out successfully!');
      queryClient.setQueryData(['currentUser'], null);
      queryClient.clear(); // Clear all cached data
      navigate('/'); // Redirect to main page
    },
  });
};

// Hook for updating user data
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: UpdateUserData) => authService.updateUserData(userData),
    onSuccess: (data) => {
      toast.success('Settings updated successfully!');
      queryClient.setQueryData(['currentUser'], data.data.user);
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Update failed');
    },
  });
};

// Hook for updating password
export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: (passwordData: UpdatePasswordData) => authService.updatePassword(passwordData),
    onSuccess: () => {
      toast.success('Password updated successfully!');
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Password update failed');
    },
  });
};
