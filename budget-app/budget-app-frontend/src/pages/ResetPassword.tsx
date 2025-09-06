// Reset password page (mock): accepts email and simulates a reset flow.
// In a production app, this would call a backend endpoint to send an email.
import React, { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import logo from "../assets/images/logo.png"; // Confirm file name/path
import separatorLine from "../assets/images/separator-line.png"; // Confirm file name/path
import illustration from "../assets/images/reset-illustration.png"; // Confirm file name/path

type ResetPasswordForm = {
  email: string;
};

const ResetPassword: React.FC = () => {
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>();

  const onSubmit: SubmitHandler<ResetPasswordForm> = (_data) => {
    // Use data.email to simulate processing the submitted email
    // Intent: This is dummy logic; in a real app, this would trigger an email send
    setSuccess(true);
    setTimeout(() => navigate("/login"), 2000); // Simulate processing
  };

  return (
    <div className="flex h-screen bg-white font-poppins">
      {/* Left: Form Section */}
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
              Reset Password
            </h2>
            <p
              className="text-sm mb-8"
              style={{ color: "#9CA3AF" }} // Tailwind gray-400
            >
              Enter your email for a reset link
            </p>{" "}
            {/* Light grey */}
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
              <button
                type="submit"
                className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                style={{ backgroundColor: "#6D28D9" }}
              >
                Send Reset Password Link
              </button>
              {success && (
                <p className="mt-2 text-sm text-green-500 text-center">
                  Reset link sent! Redirecting...
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
                Sign up
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

export default ResetPassword;
