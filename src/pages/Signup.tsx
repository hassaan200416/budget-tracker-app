// User signup page: collects basic account details and budget limit.
// Delegates account creation to auth context; redirects to login on success.
import React, { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import {
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/images/logo.png"; // Confirm file name/path
import separatorLine from "../assets/images/separator-line.png"; // Confirm file name/path
import illustration from "../assets/images/signup-illustration.png"; // Confirm file name/path

type SignUpForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  budgetLimit: number;
};

const SignUp: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<SignUpForm>();

  const password = watch("password");

  // Reset form when component mounts (after logout)
  React.useEffect(() => {
    reset();
    setError("");
    setIsLoading(false);
  }, [reset]);

  // confirmPassword is read from watch and used directly in validation; no local alias needed

  const onSubmit: SubmitHandler<SignUpForm> = async (data) => {
    try {
      setIsLoading(true);
      setError("");
      await signup(data);
      // Redirect to login page instead of dashboard after successful signup
      navigate("/login");
    } catch (error: any) {
      setError(error.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white font-poppins">
      {/* Left: Form Section */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16">
        <div className="max-w-md w-full mx-auto">
          <div className="flex items-center mb-8">
            <img src={logo} alt="Budget Tracker Logo" className="h-8 w-auto" />
            <span className="ml-2 text-3xl font-bold tracking-wide text-gray-900">
              Budget Tracker
            </span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign Up</h2>
          <p
            className="text-sm mb-8"
            style={{ color: "#9CA3AF" }} // Tailwind gray-400
          >
            Welcome to our community
          </p>{" "}
          {/* Light grey */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4 flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="firstName" className="sr-only">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="First Name"
                  className="w-full px-4 py-3 border border-blue-100 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  {...register("firstName", {
                    required: "First Name is required",
                  })}
                />
                {errors.firstName && (
                  <p
                    className="mt-1 text-sm text-red-500"
                    style={{ color: "#EF4444" }}
                  >
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="flex-1">
                <label htmlFor="lastName" className="sr-only">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Last Name"
                  className="w-full px-4 py-3 border border-blue-100 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  {...register("lastName", {
                    required: "Last Name is required",
                  })}
                />
                {errors.lastName && (
                  <p
                    className="mt-1 text-sm text-red-500"
                    style={{ color: "#EF4444" }}
                  >
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>
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
                {...register("password", { required: "Password is required" })}
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
            <div className="mb-4 relative">
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                className="w-full px-4 py-3 border border-blue-100 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                {...register("confirmPassword", {
                  required: "Confirm Password is required",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {errors.confirmPassword && (
                <p
                  className="mt-1 text-sm text-red-500"
                  style={{ color: "#EF4444" }}
                >
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            <div className="mb-4">
              <label htmlFor="budgetLimit" className="sr-only">
                Budget Limit
              </label>
              <input
                id="budgetLimit"
                type="number"
                placeholder="Budget Limit"
                className="w-full px-4 py-3 border border-blue-100 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                {...register("budgetLimit", {
                  required: "Budget Limit is required",
                  min: { value: 0, message: "Must be a positive number" },
                })}
              />
              {errors.budgetLimit && (
                <p
                  className="mt-1 text-sm text-red-500"
                  style={{ color: "#EF4444" }}
                >
                  {errors.budgetLimit.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#6D28D9" }}
            >
              {isLoading ? "SIGNING UP..." : "SIGN UP"}
            </button>
            {error && (
              <p className="mt-2 text-sm text-red-500 text-center">{error}</p>
            )}
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-purple-600 hover:underline"
              style={{ color: "#6D28D9" }}
            >
              Log in
            </Link>
          </p>
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

export default SignUp;
