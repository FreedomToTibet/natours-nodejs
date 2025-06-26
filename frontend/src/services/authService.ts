import { api } from './api';

export interface User {
  _id: string;
  name: string;
  email: string;
  photo: string;
  role: 'user' | 'guide' | 'lead-guide' | 'admin';
  active: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface UpdateUserData {
  name: string;
  email: string;
  photo?: File;
}

export interface UpdatePasswordData {
  passwordCurrent: string;
  password: string;
  passwordConfirm: string;
}

export interface AuthResponse {
  status: string;
  token: string;
  data: {
    user: User;
  };
}

export const authService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/users/login', credentials);
    
    // Store token in localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  },

  // Signup user
  async signup(userData: SignupData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/users/signup', userData);
    
    // Store token in localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  },

  // Logout user
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user from localStorage
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  // Check if user is admin
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  },

  // Get auth token
  getToken(): string | null {
    return localStorage.getItem('token');
  },

  // Update user data
  async updateUserData(userData: UpdateUserData): Promise<AuthResponse> {
    const formData = new FormData();
    formData.append('name', userData.name);
    formData.append('email', userData.email);
    
    if (userData.photo) {
      formData.append('photo', userData.photo);
    }

    const response = await api.patch<AuthResponse>('/users/updateMe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Update user in localStorage
    if (response.data.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }

    return response.data;
  },

  // Update password
  async updatePassword(passwordData: UpdatePasswordData): Promise<AuthResponse> {
    const response = await api.patch<AuthResponse>('/users/updateMyPassword', passwordData);

    // Update token in localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }

    return response.data;
  },
};
