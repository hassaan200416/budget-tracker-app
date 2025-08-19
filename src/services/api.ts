// Base URL for the backend API
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get authentication token from storage
const getAuthToken = (): string | null => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Generic function to make authenticated API requests
// Automatically adds the JWT token to the Authorization header
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
  // Get all expenses for the current user
  getAll: async () => {
    return makeAuthRequest('/entries');
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

  // Mark a specific notification as read
  markAsRead: async (id: string) => {
    return makeAuthRequest(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    return makeAuthRequest('/notifications/mark-all-read', {
      method: 'PUT',
    });
  },

  // Get the count of unread notifications
  getUnreadCount: async () => {
    return makeAuthRequest('/notifications/unread-count');
  },
};

export const userAPI = {
  getProfile: async () => {
    return makeAuthRequest('/profile');
  },
};
