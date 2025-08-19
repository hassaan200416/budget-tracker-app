import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { authAPI, userAPI } from "../services/api";

// User data structure for authentication
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  budgetLimit: number;
  role: string;
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

          // Clear all stored authentication data
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("rememberMe");
          localStorage.removeItem("storedServerStartTime");
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");

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

        // Try to get stored authentication data
        let storedToken =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        let storedUser =
          localStorage.getItem("user") || sessionStorage.getItem("user");
        const rememberMe = localStorage.getItem("rememberMe") === "true";

        if (storedToken && storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setToken(storedToken);

            if (!rememberMe && localStorage.getItem("token")) {
              sessionStorage.setItem("token", storedToken);
              sessionStorage.setItem("user", storedUser);
              localStorage.removeItem("token");
              localStorage.removeItem("user");
            }
          } catch (error) {
            console.error("Failed to parse stored user data:", error);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("rememberMe");
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
            setToken(null);
            setUser(null);
          }
        } else {
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("rememberMe");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
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

      if (response.user) {
        const userData: User = {
          id: response.user._id,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          email: response.user.email,
          budgetLimit: response.user.budgetLimit,
          role: response.user.role,
        };
        setUser(userData);

        if (rememberMe) {
          localStorage.setItem("user", JSON.stringify(userData));
        } else {
          sessionStorage.setItem("user", JSON.stringify(userData));
        }
      }

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
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");
    localStorage.removeItem("serverStartTime");
    localStorage.removeItem("storedServerStartTime");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setToken(null);
    setUser(null);
    setIsLoading(false);

    setLogoutCounter((prev) => prev + 1);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);

      if (localStorage.getItem("rememberMe") === "true") {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
      }
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
