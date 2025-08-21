/**
 * Authentication context
 *
 * Provides login/signup/logout, current user, token, and a helper to update
 * user fields locally after profile changes. Persists token based on
 * remember-me selection and refreshes profile on startup.
 */
import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { authAPI, userAPI } from "../services/api";

// User data structure for authentication and profile
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  budgetLimit: number;
  role: string;
  profileImageUrl?: string;
  jobTitle?: string;
  phoneNumber?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  completeAddress?: string;
  dateOfBirth?: string;
  education?: string;
  gender?: string;
}

// All the functions and data that will be available throughout the app
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  logoutCounter: number; // Forces re-render when logging out

  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;

  signup: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    budgetLimit: number;
  }) => Promise<void>;

  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

// Create the context that will hold our authentication data
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use authentication data in any component
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Main authentication provider that wraps the entire app
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // State to store user information and authentication status
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [logoutCounter, setLogoutCounter] = useState(0);

  // Check if user is already logged in when app starts
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if server has restarted (to handle backend changes)
        const currentServerStartTime = localStorage.getItem("serverStartTime");
        const storedServerStartTime = localStorage.getItem(
          "storedServerStartTime"
        );

        // If server restarted, clear all user data and force logout
        if (
          currentServerStartTime &&
          storedServerStartTime &&
          currentServerStartTime !== storedServerStartTime
        ) {
          console.log(
            "Server restart detected, logging out user and clearing notifications"
          );

          // Clear stored authentication token and flags
          localStorage.removeItem("token");
          localStorage.removeItem("rememberMe");
          localStorage.removeItem("storedServerStartTime");
          sessionStorage.removeItem("token");

          // Clear notification data
          localStorage.removeItem("notifications");
          sessionStorage.removeItem("notifications");

          // Notify other components about server restart
          window.dispatchEvent(new CustomEvent("serverRestart"));

          // Reset authentication state
          setToken(null);
          setUser(null);
          setIsLoading(false);
          return;
        }

        // Try to get stored authentication token only
        let storedToken =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        const rememberMe = localStorage.getItem("rememberMe") === "true";

        if (storedToken) {
          setToken(storedToken);

          // Ensure token is in the intended storage for this session
          if (!rememberMe && localStorage.getItem("token")) {
            sessionStorage.setItem("token", storedToken);
            localStorage.removeItem("token");
          }

          // Fetch fresh profile from the API to avoid stale local storage data
          try {
            const profile = await userAPI.getProfile();
            const hydratedUser: User = {
              id: profile._id,
              firstName: profile.firstName,
              lastName: profile.lastName,
              email: profile.email,
              budgetLimit: profile.budgetLimit,
              role: profile.role,
              profileImageUrl: profile.profileImageUrl,
              jobTitle: profile.jobTitle,
              phoneNumber: profile.phoneNumber,
              streetAddress: profile.streetAddress,
              city: profile.city,
              state: profile.state,
              zipCode: profile.zipCode,
              completeAddress: profile.completeAddress,
              dateOfBirth: profile.dateOfBirth,
              education: profile.education,
              gender: profile.gender,
            };
            setUser(hydratedUser);
          } catch (error) {
            console.error("Failed to fetch profile:", error);
          }
        } else {
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("rememberMe");
        sessionStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    checkAuth();

    return () => clearTimeout(timeoutId);
  }, []);

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean = false
  ) => {
    try {
      const response = await authAPI.login({ email, password });

      if (rememberMe) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("rememberMe", "true");
      } else {
        sessionStorage.setItem("token", response.token);
        localStorage.removeItem("rememberMe");
      }

      setToken(response.token);

      // Fetch full profile after login to ensure we have the latest data
      const profile = await userAPI.getProfile();
      const userData: User = {
        id: profile._id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        budgetLimit: profile.budgetLimit,
        role: profile.role,
        profileImageUrl: profile.profileImageUrl,
        jobTitle: profile.jobTitle,
        phoneNumber: profile.phoneNumber,
        streetAddress: profile.streetAddress,
        city: profile.city,
        state: profile.state,
        zipCode: profile.zipCode,
        completeAddress: profile.completeAddress,
        dateOfBirth: profile.dateOfBirth,
        education: profile.education,
        gender: profile.gender,
      };
      setUser(userData);

      const serverStartTime = Date.now().toString();
      localStorage.setItem("serverStartTime", serverStartTime);
      localStorage.setItem("storedServerStartTime", serverStartTime);
    } catch (error) {
      throw error;
    }
  };

  const signup = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    budgetLimit: number;
  }) => {
    try {
      const response = await authAPI.signup(userData);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rememberMe");
    localStorage.removeItem("serverStartTime");
    localStorage.removeItem("storedServerStartTime");
    sessionStorage.removeItem("token");

    setToken(null);
    setUser(null);
    setIsLoading(false);

    setLogoutCounter((prev) => prev + 1);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    logoutCounter,
    login,
    signup,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
