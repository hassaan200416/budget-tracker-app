// User profile page: read-only overview and an editable "My account" tab.
// Supports avatar upload/removal (base64), optional profile fields, and
// uses context to keep header/user state in sync after updates.
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Header from "../components/Header";
import ConfirmLogoutModal from "../components/ConfirmLogoutModal";
import { useAuth } from "../context/AuthContext";
import { notificationsAPI, userAPI } from "../services/api";
import { Button } from "@/components/ui/button";

// Image compression utility function
const compressImage = (
  dataUrl: string,
  maxWidth: number,
  maxHeight: number
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Calculate new dimensions
      let { width, height } = img;
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.8)); // Compress to JPEG with 80% quality
      } else {
        resolve(dataUrl); // Fallback to original if canvas context fails
      }
    };
    img.onerror = () => resolve(dataUrl); // Fallback to original if image loading fails
    img.src = dataUrl;
  });
};

// Minimal notification shape to satisfy Header props
interface Notification {
  id: string;
  message: string;
  type: "add" | "edit" | "delete";
  createdAt: number;
  timestamp: string;
  isRead: boolean;
}

// Form data interface for React Hook Form
interface ProfileFormData {
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
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      budgetLimit: 0,
      jobTitle: "",
      phoneNumber: "",
      streetAddress: "",
      city: "",
      state: "",
      zipCode: "",
      completeAddress: "",
      dateOfBirth: "",
      education: "",
      gender: "",
    },
  });

  // Watch form values for display purposes
  const watchedValues = watch();

  // Active tab: profile (read-only) or account (editable)
  const [activeTab, setActiveTab] = useState<"profile" | "account">("profile");
  // Refs to measure tab text widths and positions
  const profileLabelRef = useRef<HTMLSpanElement | null>(null);
  const accountLabelRef = useRef<HTMLSpanElement | null>(null);
  const separatorRef = useRef<HTMLDivElement | null>(null);
  const [sliderLeft, setSliderLeft] = useState(0);
  const [sliderWidth, setSliderWidth] = useState(0);

  // Image upload states
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Calculate slider position/width from the selected label
  const updateSliderFromSelection = () => {
    const container = separatorRef.current;
    const selected =
      activeTab === "profile"
        ? profileLabelRef.current
        : accountLabelRef.current;
    if (!container || !selected) return;
    const containerRect = container.getBoundingClientRect();
    const selectedRect = selected.getBoundingClientRect();
    const left = selectedRect.left - containerRect.left;
    const width = selectedRect.width;
    setSliderLeft(left);
    setSliderWidth(width);
  };

  useLayoutEffect(() => {
    updateSliderFromSelection();
  }, [activeTab]);

  useEffect(() => {
    const onResize = () => updateSliderFromSelection();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Logout confirmation modal
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Notifications shown in Header
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Success message state
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Derived display address for read-only section
  const displayAddress =
    watchedValues.completeAddress ||
    [watchedValues.streetAddress, watchedValues.city, watchedValues.state]
      .filter(Boolean)
      .join(", ");

  // Fetch notifications for header badge/dropdown
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await notificationsAPI.getAll();
        setNotifications(data);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        setNotifications([]);
      }
    };
    loadNotifications();
  }, []);

  // Clear notifications if server restarts
  useEffect(() => {
    const handleServerRestart = () => setNotifications([]);
    window.addEventListener("serverRestart", handleServerRestart);
    return () =>
      window.removeEventListener("serverRestart", handleServerRestart);
  }, []);

  // Mark a single notification read
  const handleNotificationClick = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
  };

  // Mark all as read
  const handleMarkAllNotificationsAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  // Trigger logout confirmation
  const handleLogout = () => setShowLogoutConfirm(true);

  // Confirm logout and navigate to login
  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    setTimeout(() => navigate("/login"), 0);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  // Ensure we fetch fresh profile data when visiting this page (only once)
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await userAPI.getProfile();

        // Hydrate form fields with the freshest data
        reset({
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          email: profile.email || "",
          budgetLimit: profile.budgetLimit || 0,
          jobTitle: profile.jobTitle || "",
          phoneNumber: profile.phoneNumber || "",
          streetAddress: profile.streetAddress || "",
          city: profile.city || "",
          state: profile.state || "",
          zipCode: profile.zipCode || "",
          completeAddress: profile.completeAddress || "",
          dateOfBirth: profile.dateOfBirth || "",
          education: profile.education || "",
          gender: profile.gender || "",
        });
      } catch (e) {
        console.error("Failed to load profile", e);
      }
    };

    loadProfile();
  }, []); // Empty dependency array - only run once

  // Reset form when user data changes (only when user actually changes)
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        budgetLimit: user.budgetLimit || 0,
        jobTitle: user.jobTitle || "",
        phoneNumber: user.phoneNumber || "",
        streetAddress: user.streetAddress || "",
        city: user.city || "",
        state: user.state || "",
        zipCode: user.zipCode || "",
        completeAddress: user.completeAddress || "",
        dateOfBirth: user.dateOfBirth || "",
        education: user.education || "",
        gender: user.gender || "",
      });
    }
  }, [user?.id, reset]); // Only depend on user ID and reset function

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const payload = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
        budgetLimit: Number(data.budgetLimit) || 0,
        jobTitle: data.jobTitle.trim() || undefined,
        phoneNumber: data.phoneNumber.trim() || undefined,
        streetAddress: data.streetAddress.trim() || undefined,
        city: data.city.trim() || undefined,
        state: data.state.trim() || undefined,
        zipCode: data.zipCode.trim() || undefined,
        completeAddress: data.completeAddress.trim() || undefined,
        dateOfBirth: data.dateOfBirth.trim() || undefined,
        education: data.education.trim() || undefined,
        gender: data.gender.trim() || undefined,
      };

      const updated = await userAPI.updateProfile(payload);

      updateUser({
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        budgetLimit: updated.budgetLimit,
        // Also reflect optional fields
        ...(updated.jobTitle ? { jobTitle: updated.jobTitle } : {}),
        ...(updated.phoneNumber ? { phoneNumber: updated.phoneNumber } : {}),
        ...(updated.streetAddress
          ? { streetAddress: updated.streetAddress }
          : {}),
        ...(updated.city ? { city: updated.city } : {}),
        ...(updated.state ? { state: updated.state } : {}),
        ...(updated.zipCode ? { zipCode: updated.zipCode } : {}),
        ...(updated.completeAddress
          ? { completeAddress: updated.completeAddress }
          : {}),
        ...(updated.dateOfBirth ? { dateOfBirth: updated.dateOfBirth } : {}),
        ...(updated.education ? { education: updated.education } : {}),
        ...(updated.gender ? { gender: updated.gender } : {}),
      });

      // Show success message
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);

      // Create success notification
      try {
        await notificationsAPI.create({
          message: "Profile updated successfully!",
          type: "edit",
          userId: user.id,
        });

        // Refresh notifications to show the new one
        const updatedNotifications = await notificationsAPI.getAll();
        setNotifications(updatedNotifications);
      } catch (error) {
        console.error("Failed to create notification:", error);
        // Don't let notification errors break the profile update
      }

      setActiveTab("profile");
    } catch (e) {
      console.error("Failed to update profile", e);
    }
  };

  return (
    <div className="flex h-screen bg-white font-poppins">
      {/* No sidebar on Profile page */}

      {/* Main area with header and page content */}
      <div className="flex-1 flex flex-col">
        <Header
          user={{
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            profileImageUrl: user.profileImageUrl,
          }}
          onLogout={handleLogout}
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
          onMarkAllAsRead={handleMarkAllNotificationsAsRead}
          toggleExpanded={() => {}}
          sidebarExpanded={false}
          hasSidebar={false}
        />

        {/* Content area - full width layout */}
        <div
          className="p-8 flex-1 relative overflow-y-auto"
          style={{
            backgroundColor: "#eff6ff",
            marginTop: "4rem",
            marginLeft: "0",
            transition: "margin-left 0.3s ease",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <h1 className="text-2xl font-semibold text-gray-800">Profile</h1>
            </div>
            <div className="flex items-center space-x-6">
              <button
                className={`text-sm font-medium transition-all ${
                  activeTab === "profile"
                    ? "text-purple-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => setActiveTab("profile")}
              >
                <span ref={profileLabelRef}>Profile</span>
              </button>
              <button
                className={`text-sm font-medium transition-all ${
                  activeTab === "account"
                    ? "text-purple-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => setActiveTab("account")}
              >
                <span ref={accountLabelRef}>My account</span>
              </button>
            </div>
          </div>

          {/* Separator line extending all the way to the left */}
          <div className="relative w-full mb-6" ref={separatorRef}>
            <div className="w-full border-t border-gray-200"></div>
            {/* Purple slider indicator positioned beneath the selected option */}
            <div
              className="absolute top-0 h-0.5 bg-purple-600 transition-all duration-300"
              style={{ left: `${sliderLeft}px`, width: `${sliderWidth}px` }}
            />
          </div>

          {/* Success message */}
          {showSuccessMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-green-800 font-medium">
                  Profile updated successfully!
                </p>
              </div>
            </div>
          )}

          {/* Two-column layout: Left card (avatar & contact), Right content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left card - fixed height */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-1 h-fit">
              <div className="flex flex-col items-center text-center">
                <div className="relative group">
                  {user.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt="Profile"
                      className={`h-20 w-20 rounded-full object-cover cursor-pointer ${
                        isUploadingImage ? "opacity-50" : ""
                      }`}
                    />
                  ) : (
                    <div
                      className={`h-20 w-20 rounded-full bg-purple-600 text-white flex items-center justify-center text-2xl font-bold cursor-pointer hover:bg-purple-700 transition-colors ${
                        isUploadingImage ? "opacity-50" : ""
                      }`}
                    >
                      {user.firstName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Loading overlay */}
                  {isUploadingImage && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    </div>
                  )}
                  {activeTab === "account" && (
                    <>
                      <div
                        className="absolute inset-0 hidden group-hover:flex items-center justify-center cursor-pointer"
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = "image/*";
                          input.onchange = async (e) => {
                            const file = (e.target as HTMLInputElement)
                              .files?.[0];
                            if (file) {
                              // Validate file size (max 5MB)
                              const maxSize = 5 * 1024 * 1024; // 5MB
                              if (file.size > maxSize) {
                                setImageError(
                                  "Image size must be less than 5MB"
                                );
                                setTimeout(() => setImageError(null), 3000);
                                return;
                              }

                              // Validate file type
                              if (!file.type.startsWith("image/")) {
                                setImageError(
                                  "Please select a valid image file"
                                );
                                setTimeout(() => setImageError(null), 3000);
                                return;
                              }

                              setIsUploadingImage(true);
                              setImageError(null);

                              try {
                                const reader = new FileReader();
                                reader.onload = async () => {
                                  const dataUrl = reader.result as string;

                                  // Compress image if it's too large
                                  const compressedDataUrl = await compressImage(
                                    dataUrl,
                                    800,
                                    800
                                  );

                                  const updated = await userAPI.updateProfile({
                                    profileImageUrl: compressedDataUrl,
                                  });
                                  updateUser({
                                    profileImageUrl: updated.profileImageUrl,
                                  });
                                  setIsUploadingImage(false);
                                };
                                reader.onerror = () => {
                                  setImageError("Failed to read image file");
                                  setIsUploadingImage(false);
                                  setTimeout(() => setImageError(null), 3000);
                                };
                                reader.readAsDataURL(file);
                              } catch (err) {
                                console.error(
                                  "Failed to update profile image",
                                  err
                                );
                                setImageError("Failed to upload image");
                                setIsUploadingImage(false);
                                setTimeout(() => setImageError(null), 3000);
                              }
                            }
                          };
                          input.click();
                        }}
                      >
                        <div className="bg-white bg-opacity-90 rounded-full px-2 py-1 text-xs text-gray-700 font-medium hover:bg-opacity-100 transition-all">
                          {isUploadingImage ? "Uploading..." : "Edit | Update"}
                        </div>
                      </div>
                      {user.profileImageUrl && (
                        <div
                          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 hidden group-hover:flex cursor-pointer"
                          onClick={async () => {
                            if (isUploadingImage) return; // Prevent multiple clicks

                            setIsUploadingImage(true);
                            setImageError(null);

                            try {
                              await userAPI.updateProfile({
                                profileImageUrl: null,
                              });
                              updateUser({
                                profileImageUrl: undefined,
                              });
                            } catch (err) {
                              console.error(
                                "Failed to delete profile image",
                                err
                              );
                              setImageError("Failed to delete image");
                              setTimeout(() => setImageError(null), 3000);
                            } finally {
                              setIsUploadingImage(false);
                            }
                          }}
                        >
                          <div className="!bg-red-500 hover:!bg-red-600 !text-white rounded-full px-2 py-1 text-xs font-medium transition-colors border border-red-600">
                            {isUploadingImage ? "Deleting..." : "Delete"}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <h3 className="mt-3 font-semibold text-gray-800 text-lg">
                  {user.firstName} {user.lastName}
                </h3>

                {/* Image upload error display */}
                {imageError && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-xs">{imageError}</p>
                  </div>
                )}

                <p className="text-sm text-gray-500">
                  {watchedValues.jobTitle || "—"}
                </p>

                {/* Divider */}
                <div className="w-full border-t border-gray-200 my-4"></div>

                <div className="w-full space-y-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <span className="text-gray-800">
                      {watchedValues.phoneNumber || "Not provided"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-gray-800">{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="text-gray-800">
                      {[watchedValues.city, watchedValues.state]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                    <span className="text-gray-800">
                      {watchedValues.completeAddress ||
                        watchedValues.streetAddress ||
                        "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right content: Tabs */}
            <div className="lg:col-span-3 space-y-6">
              {activeTab === "profile" ? (
                <>
                  {/* About Me */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div
                      className="px-4 py-3 border-b border-gray-200"
                      style={{ backgroundColor: "#f3f4f6" }}
                    >
                      <h2 className="text-lg font-bold text-gray-500">
                        About Me
                      </h2>
                    </div>
                    <div className="p-4 text-gray-600 text-sm">
                      <p>
                        Passionate budget tracker user focused on staying under
                        budget and tracking expenses efficiently.
                      </p>
                    </div>
                  </div>
                  {/* Personal Details */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div
                      className="px-4 py-3 border-b border-gray-200"
                      style={{ backgroundColor: "#f3f4f6" }}
                    >
                      <h2 className="text-lg font-bold text-gray-500">
                        Personal Details
                      </h2>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                      <div>
                        <div className="text-gray-400">Full Name</div>
                        <div className="font-semibold">
                          {user.firstName} {user.lastName}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Phone Number</div>
                        <div className="font-semibold">
                          {watchedValues.phoneNumber || "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Gender</div>
                        <div className="font-semibold">
                          {watchedValues.gender || "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Zip Code</div>
                        <div className="font-semibold">
                          {watchedValues.zipCode || "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Email</div>
                        <div className="font-semibold">{user.email}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Date of Birth</div>
                        <div className="font-semibold">
                          {watchedValues.dateOfBirth || "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Education</div>
                        <div className="font-semibold">
                          {watchedValues.education || "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Budget Limit</div>
                        <div className="font-semibold">
                          {user.budgetLimit.toLocaleString()} PKR
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <div className="text-gray-400">Address</div>
                        <div className="font-semibold">
                          {displayAddress || "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="bg-white rounded-lg shadow-sm border border-gray-200"
                >
                  <div
                    className="px-4 py-3 border-b border-gray-200"
                    style={{ backgroundColor: "#f3f4f6" }}
                  >
                    <h2 className="text-lg font-bold text-black">My Account</h2>
                  </div>
                  <div className="p-6 space-y-6">
                    {/* Name & Job Section */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Name & Job
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-2">
                            First Name
                          </label>
                          <input
                            {...register("firstName", {
                              required: "First name is required",
                            })}
                            className={`w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                              errors.firstName
                                ? "border-red-500 focus:ring-red-500"
                                : "border-gray-200 focus:ring-purple-500"
                            }`}
                          />
                          {errors.firstName && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.firstName.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-2">
                            Last Name
                          </label>
                          <input
                            {...register("lastName", {
                              required: "Last name is required",
                            })}
                            className={`w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                              errors.lastName
                                ? "border-red-500 focus:ring-red-500"
                                : "border-gray-200 focus:ring-purple-500"
                            }`}
                          />
                          {errors.lastName && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.lastName.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-2">
                            Job Title
                          </label>
                          <input
                            {...register("jobTitle")}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Address Section */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Address
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-2">
                            Street Address
                          </label>
                          <input
                            {...register("streetAddress")}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-2">
                            City
                          </label>
                          <input
                            {...register("city", {
                              required: "City is required",
                            })}
                            className={`w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                              errors.city
                                ? "border-red-500 focus:ring-red-500"
                                : "border-gray-200 focus:ring-purple-500"
                            }`}
                          />
                          {errors.city && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.city.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-2">
                            State
                          </label>
                          <input
                            {...register("state", {
                              required: "State is required",
                            })}
                            className={`w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                              errors.state
                                ? "border-red-500 focus:ring-red-500"
                                : "border-gray-200 focus:ring-purple-500"
                            }`}
                          />
                          {errors.state && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.state.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-2">
                            Zip Code
                          </label>
                          <input
                            {...register("zipCode", {
                              required: "Zip code is required",
                            })}
                            className={`w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                              errors.zipCode
                                ? "border-red-500 focus:ring-red-500"
                                : "border-gray-200 focus:ring-purple-500"
                            }`}
                          />
                          {errors.zipCode && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.zipCode.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-2">
                          Complete Address
                        </label>
                        <input
                          {...register("completeAddress")}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    {/* Contact Info Section */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Contact info
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-2">
                            Phone Number
                          </label>
                          <input
                            {...register("phoneNumber")}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            {...register("email", {
                              required: "Email is required",
                              pattern: {
                                value:
                                  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Invalid email address",
                              },
                            })}
                            className={`w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                              errors.email
                                ? "border-red-500 focus:ring-red-500"
                                : "border-gray-200 focus:ring-purple-500"
                            }`}
                          />
                          {errors.email && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.email.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bio Section */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Bio
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-2">
                            Date of Birth
                          </label>
                          <input
                            type="date"
                            {...register("dateOfBirth")}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-2">
                            Education
                          </label>
                          <input
                            {...register("education")}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-2">
                            Gender
                          </label>
                          <input
                            {...register("gender")}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Financial Information Section */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Financial Information
                      </h3>
                      <div>
                        <label className="block text-xs text-gray-500 mb-2">
                          Budget Limit (PKR)
                        </label>
                        <input
                          type="number"
                          {...register("budgetLimit", {
                            valueAsNumber: true,
                            min: {
                              value: 0,
                              message: "Budget must be positive",
                            },
                          })}
                          className={`w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                            errors.budgetLimit
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-200 focus:ring-purple-500"
                          }`}
                        />
                        {errors.budgetLimit && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.budgetLimit.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg flex items-center"
                      >
                        {isSubmitting && (
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        )}
                        {isSubmitting ? "Saving..." : "Update"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          reset({
                            firstName: user.firstName || "",
                            lastName: user.lastName || "",
                            email: user.email || "",
                            budgetLimit: user.budgetLimit || 0,
                            jobTitle: user.jobTitle || "",
                            phoneNumber: user.phoneNumber || "",
                            streetAddress: user.streetAddress || "",
                            city: user.city || "",
                            state: user.state || "",
                            zipCode: user.zipCode || "",
                            completeAddress: user.completeAddress || "",
                            dateOfBirth: user.dateOfBirth || "",
                            education: user.education || "",
                            gender: user.gender || "",
                          })
                        }
                        className="px-6 py-2 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {showLogoutConfirm && (
        <ConfirmLogoutModal
          onCancel={() => setShowLogoutConfirm(false)}
          onConfirm={confirmLogout}
        />
      )}
    </div>
  );
};

export default Profile;
