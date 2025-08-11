import React, { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import {
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import logo from "../assets/images/logo.png"; // Confirm file name/path
import separatorLine from "../assets/images/separator-line.png"; // Confirm file name/path
import illustration from "../assets/images/signup-illustration.png"; // Confirm file name/path (or use login-illustration.png if same)

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
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignUpForm>();

  const password = watch("password");
  const confirmPassword = watch("confirmPassword"); // Used in validate function below

  // Explicitly use confirmPassword to satisfy TypeScript (no-op for now)
  // Intent: This value is used in the confirmPassword validation to match with password
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ = confirmPassword;

  const onSubmit: SubmitHandler<SignUpForm> = (data) => {
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    // Dummy sign-up logic: redirect to dashboard if all fields are valid
    setError("");
    navigate("/dashboard");
  };

  return (
    <div className="flex h-screen bg-white font-poppins">
      {/* Left: Form Section */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16">
        <div className="max-w-md w-full mx-auto">
          <div className="flex items-center mb-8">
            <img src={logo} alt="Budget Tracker Logo" className="h-8 w-auto" />
            <span className="ml-2 text-xl font-bold text-gray-900">
              Budget Tracker
            </span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign Up</h2>
          <p className="text-sm text-gray-600 mb-8">Welcome to our community</p>
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
                  className="w-full px-4 py-3 border border-blue-100 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  className="w-full px-4 py-3 border border-blue-100 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                className="w-full px-4 py-3 border border-blue-100 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                className="w-full px-4 py-3 border border-blue-100 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                className="w-full px-4 py-3 border border-blue-100 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                className="w-full px-4 py-3 border border-blue-100 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
              style={{ backgroundColor: "#6D28D9" }} // Fallback to ensure visibility
            >
              SIGN UP
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
          alt="SignUp Illustration"
          className="max-h-[calc(100%-4rem)] w-auto"
        />
      </div>
    </div>
  );
};

export default SignUp;
