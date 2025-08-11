import React, { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import {
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import logo from "../assets/images/logo.png"; // Updated path
import illustration from "../assets/images/login-illustration.png"; // Updated path
import separatorLine from "../assets/images/separator-line.png"; // Updated path

type LoginForm = {
  email: string;
  password: string;
  rememberMe: boolean;
};

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit: SubmitHandler<LoginForm> = (data) => {
    if (data.email === "test@gmail.com" && data.password === "password123") {
      setError("");
      navigate("/dashboard");
    } else {
      setError("Invalid email or password");
    }
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back!
          </h2>
          <p className="text-sm text-gray-600 mb-8">
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
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  {...register("rememberMe")}
                />
                <label
                  htmlFor="rememberMe"
                  className="ml-2 text-sm text-gray-600"
                >
                  Remember me
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
              className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
              style={{ backgroundColor: "#6D28D9" }} // Fallback to ensure visibility
            >
              LOG IN
            </button>
            {error && (
              <p className="mt-2 text-sm text-red-500 text-center">{error}</p>
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

      {/* Middle: Separator Line Image */}
      <div className="flex items-center justify-center w-px">
        <img src={separatorLine} alt="Separator Line" className="h-3/4" />
      </div>

      {/* Right: Illustration Section */}
      <div className="flex-1 flex items-center justify-center px-8">
        <img
          src={illustration}
          alt="Login Illustration"
          className="max-h-[calc(100%-4rem)] w-auto"
        />
      </div>
    </div>
  );
};

export default Login;
