// HTTP client utilities and typed API surface for the frontend.
// Centralizes base URL, token injection, and error handling.
// Keep endpoints thin: return JSON the UI already expects.
// Base URL for the backend API
const API_BASE_URL = 'https://71a8985c69d7.ngrok-free.app';

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
      // Add Bearer token if available
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${url}`, config);

  // Handle HTTP errors and throw descriptive error messages
  if (!response.ok) {
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
      headers: { 'Content-Type': 'application/json' },
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
