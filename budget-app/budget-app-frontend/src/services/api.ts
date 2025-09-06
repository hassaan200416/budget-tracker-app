// HTTP client utilities and typed API surface for the frontend.
// Centralizes base URL, token injection, and error handling.
// Keep endpoints thin: return JSON the UI already expects.
// Base URL for the backend API - prefer explicit env override, then infer
const API_BASE_URL = (() => {
  // Always prefer env var so local frontend can point to ngrok/tunnel
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL as string;
  }

  // Fallbacks by hostname
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }

  // Final fallback to a default public tunnel (update as needed)
  return 'https://26c682d74b00.ngrok-free.app/api';
})();
// Helper: retrieve JWT from either localStorage (remember me) or sessionStorage
const getAuthToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Generic helper that injects Authorization header and raises rich errors
// so callers can display meaningful messages.
const makeAuthRequest = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // Bypass ngrok free-tier browser interstitial page
      'ngrok-skip-browser-warning': 'true',
      // Add Bearer token if available
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${url}`, config);

  // Handle HTTP errors and throw descriptive error messages
  if (!response.ok) {
    // If token is invalid/expired, clear it to force re-login
    if (response.status === 401) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Authentication API endpoints (don't use makeAuthRequest since they're public)
export const authAPI = {
  // Create a new user account
  signup: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    budgetLimit: number;
  }) => {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Signup failed');
    }

    return response.json();
  },

  // Authenticate existing user
  login: async (credentials: { email: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }
    
    return response.json();
  },
};

// Expense management API endpoints (all require authentication)
export const entriesAPI = {
  // Get paginated expenses for the current user with search and filtering
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    dateFilter?: string;
    sortBy?: string;
  }) => {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.dateFilter) queryParams.append('dateFilter', params.dateFilter);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/entries?${queryString}` : '/entries';
    
    return makeAuthRequest(url);
  },

  // Get budget analysis data for charts
  getBudgetAnalysis: async (range: string = 'last-12-months') => {
    return makeAuthRequest(`/entries/analysis?range=${range}`);
  },

  // Create a new expense
  create: async (entryData: { title: string; price: number; date: string }) => {
    return makeAuthRequest('/entries', {
      method: 'POST',
      body: JSON.stringify(entryData),
    });
  },

  // Update an existing expense
  update: async (id: string, entryData: { title: string; price: number; date: string }) => {
    return makeAuthRequest(`/entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(entryData),
    });
  },

  // Delete an expense
  delete: async (id: string) => {
    return makeAuthRequest(`/entries/${id}`, {
      method: 'DELETE',
    });
  },
};

// Notification system API endpoints (all require authentication)
export const notificationsAPI = {
  // Get all notifications for the current user
  getAll: async () => {
    return makeAuthRequest('/notifications');
  },

  // Create a new notification
  create: async (notificationData: {
    message: string;
    type: 'add' | 'edit' | 'delete' | 'update';
    userId: string;
  }) => {
    return makeAuthRequest('/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    return makeAuthRequest('/notifications/mark-all-read', {
      method: 'PUT',
    });
  },
};

export const userAPI = {
  getProfile: async () => {
    return makeAuthRequest('/profile');
  },
  updateProfile: async (payload: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    budgetLimit: number;
    jobTitle: string;
    phoneNumber: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    completeAddress: string;
    dateOfBirth: string;
    education: string;
    gender: string;
    profileImageUrl: string | null;
  }>) => {
    return makeAuthRequest('/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
};
