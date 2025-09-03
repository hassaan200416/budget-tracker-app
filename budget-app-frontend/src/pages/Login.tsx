// src/pages/Login.tsx
// Login form with remember-me that delegates auth to context.
// Uses react-hook-form for minimal, typed validation.
import React, { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Link } from "react-router-dom";
import {
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/images/logo.png";
import illustration from "../assets/images/login-illustration.png";
import separatorLine from "../assets/images/separator-line.png";

// Form data structure for login
type LoginForm = {
  email: string;
  password: string;
  rememberMe: boolean;
};

const Login: React.FC = () => {
  // UI State - controls password visibility, error messages, and loading
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Get authentication functions from context
  const { login } = useAuth();

  // React Hook Form setup for form handling and validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginForm>();

  // Reset form when component mounts or after logout
  React.useEffect(() => {
    // Clear all form data and error states
    reset();
    setError("");
    setIsLoading(false);

    // Reset the actual HTML form element
    const form = document.querySelector("form");
    if (form) {
      form.reset();
    }

    // Focus on email input for better user experience
    const emailInput = document.getElementById("email");
    if (emailInput) {
      emailInput.focus();
    }

    // Safety: ensure any leftover modal overlays are removed after redirects
    // This handles rare cases where a dialog portal overlay might persist across navigation
    const cleanupOverlays = () => {
      // Remove common overlay elements (fixed full-screen with high z-index)
      const overlays = Array.from(
        document.querySelectorAll(
          'div[class*="fixed"][class*="inset-0"][class*="z-50"]'
        )
      );
      overlays.forEach((el) => {
        // Only remove if it's an overlay element, not legitimate page content
        const hasBackdrop = (el as HTMLElement).className.includes("bg-black/");
        if (hasBackdrop) {
          el.remove();
        }
      });
      // Also ensure body interactions are enabled
      document.body.style.pointerEvents = "auto";
      document.documentElement.style.pointerEvents = "auto";
    };
    // Run immediately and on next tick to catch async portal unmounts
    cleanupOverlays();
    const raf = requestAnimationFrame(cleanupOverlays);

    // Cleanup function to ensure proper state management
    return () => {
      setError("");
      setIsLoading(false);
      cancelAnimationFrame(raf);
    };
  }, [reset]); // Reset when component mounts

  // Handle form submission - attempt to log in user
  const onSubmit: SubmitHandler<LoginForm> = async (data) => {
    try {
      setIsLoading(true);
      setError("");

      // Call login function from auth context
      await login(data.email, data.password, data.rememberMe);
      // Navigation is handled automatically by the routing system
    } catch (error: any) {
      // Display error message if login fails
      setError(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white font-poppins">
      {/* Custom CSS for checkbox styling */}
      <style>
        {`
          /* Custom checkbox styling for remember me */
          #rememberMe {
            background-color: white !important;
            border: 1px solid #d1d5db !important;
            border-radius: 4px !important;
            appearance: none !important;
            -webkit-appearance: none !important;
            -moz-appearance: none !important;
          }
          #rememberMe:checked {
            background-color: #7c3aed !important;
            border-color: #7c3aed !important;
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='white' d='M16.707 5.293a1 1 0 00-1.414-1.414L7 12.172 4.707 9.879a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l9-9z'/%3e%3c/svg%3e") !important;
            background-size: 12px 12px !important;
            background-position: center !important;
            background-repeat: no-repeat !important;
          }
        `}
      </style>

      {/* Left side: Login form */}
      <div className="flex-1 flex flex-col px-8 md:px-16">
        <div className="pt-8">
          <div className="max-w-md w-full mx-auto">
            <div className="flex items-center">
              <img
                src={logo}
                alt="Budget Tracker Logo"
                className="h-8 w-auto"
              />
              <span className="ml-2 text-3xl font-bold tracking-wide text-gray-900">
                Budget Tracker
              </span>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back!
            </h2>
            <p
              className="text-sm mb-8"
              style={{ color: "#9CA3AF" }} // Tailwind gray-400
            >
              Sign in to continue to Budget Tracker
            </p>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4 relative">
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="test@gmail.com"
                  className="w-full px-4 py-3 border border-blue-100 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
                  })}
                />
                <EnvelopeIcon className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                {errors.email && (
                  <p
                    className="mt-1 text-sm text-red-500"
                    style={{ color: "#EF4444" }}
                  >
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="mb-4 relative">
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-blue-100 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  {...register("password", {
                    required: "Password is required",
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {errors.password && (
                  <p
                    className="mt-1 text-sm text-red-500"
                    style={{ color: "#EF4444" }}
                  >
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <label
                    htmlFor="rememberMe"
                    className="inline-flex items-center cursor-pointer"
                  >
                    <input
                      id="rememberMe"
                      type="checkbox"
                      {...register("rememberMe")}
                      className="mr-2 h-4 w-4 cursor-pointer"
                    />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                </div>
                <Link
                  to="/reset-password"
                  className="text-sm text-purple-600 hover:underline"
                  style={{ color: "#6D28D9" }}
                >
                  Forgot Password?
                </Link>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#6D28D9" }} // Fallback to ensure visibility
              >
                {isLoading ? "LOGGING IN..." : "LOG IN"}
              </button>
              {error && (
                <p
                  className="mt-2 text-sm font-medium text-center"
                  style={{ color: "#EF4444" }} // Tailwind red-500 hex
                >
                  {error}
                </p>
              )}
            </form>
            <p className="mt-4 text-center text-sm text-gray-600">
              Don’t have an account?{" "}
              <Link
                to="/signup"
                className="text-purple-600 hover:underline"
                style={{ color: "#6D28D9" }}
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Middle: Separator Line Image */}
      <div className="flex items-center justify-center w-px">
        <img src={separatorLine} alt="Separator Line" className="h-3/4" />
      </div>

      {/* Right: Illustration Section */}
      <div className="flex-1 flex items-center justify-center px-8">
        <img
          src={illustration}
          alt="Login Illustration"
          className="max-h-[500px] max-w-[400px] w-auto"
        />
      </div>
    </div>
  );
};

export default Login;
