import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import SignUp from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Analysis from "./pages/Analysis";
import Profile from "./pages/Profile";

// ProtectedRoute: Wraps components that require user authentication
// If user is not logged in, redirects to login page
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { token, user, isLoading } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="mb-4">Loading...</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Reload if stuck
        </button>
      </div>
    );
  }

  // Redirect to login if no token or user data
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, show the protected content
  return <>{children}</>;
};

// PublicRoute: Wraps components that should only be visible to non-authenticated users
// If user is already logged in, redirects to dashboard
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user, isLoading, logoutCounter } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="mb-4">Loading...</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Reload if stuck
        </button>
      </div>
    );
  }

  // Redirect to dashboard if user is already logged in
  if (token && user) {
    return <Navigate to="/dashboard" replace />;
  }

  // User is not authenticated, show the public content
  return <>{children}</>;
};

// Main routing component that defines all application routes
const AppRoutes: React.FC = () => {
  const { logoutCounter } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public routes - only accessible when not logged in */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login key={logoutCounter} />
            </PublicRoute>
          }
        />

        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          }
        />

        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />

        {/* Protected routes - require authentication */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analysis"
          element={
            <ProtectedRoute>
              <Analysis />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;
