// User profile page: read-only overview and an editable "My account" tab.
// Supports avatar upload/removal (base64), optional profile fields, and
// uses context to keep header/user state in sync after updates.
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import ConfirmLogoutModal from "../components/ConfirmLogoutModal";
import { useAuth } from "../context/AuthContext";
import { notificationsAPI, userAPI } from "../services/api";
import { Button } from "@/components/ui/button";

// Minimal notification shape to satisfy Header props
interface Notification {
  id: string;
  message: string;
  type: "add" | "edit" | "delete";
  createdAt: number;
  timestamp: string;
  isRead: boolean;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();

  // Active tab: profile (read-only) or account (editable)
  const [activeTab, setActiveTab] = useState<"profile" | "account">("profile");
  // Refs to measure tab text widths and positions
  const profileLabelRef = useRef<HTMLSpanElement | null>(null);
  const accountLabelRef = useRef<HTMLSpanElement | null>(null);
  const separatorRef = useRef<HTMLDivElement | null>(null);
  const [sliderLeft, setSliderLeft] = useState(0);
  const [sliderWidth, setSliderWidth] = useState(0);

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

  // Form state for My account
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [budget, setBudget] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  // Optional fields
  const [jobTitle, setJobTitle] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [completeAddress, setCompleteAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [education, setEducation] = useState("");
  const [gender, setGender] = useState("");

  // Logout confirmation modal
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Notifications shown in Header
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Derived display address for read-only section
  const displayAddress =
    completeAddress ||
    [streetAddress, city, stateVal].filter(Boolean).join(", ");

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

  // Prefill form from user when mounted
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
      setBudget(user.budgetLimit);
      // hydrate optional fields
      setJobTitle(user.jobTitle || "");
      setPhoneNumber(user.phoneNumber || "");
      setStreetAddress(user.streetAddress || "");
      setCity(user.city || "");
      setStateVal(user.state || "");
      setZipCode(user.zipCode || "");
      setCompleteAddress(user.completeAddress || "");
      setDateOfBirth(user.dateOfBirth || "");
      setEducation(user.education || "");
      setGender(user.gender || "");
    }
  }, [user]);

  // Ensure we fetch fresh profile data when visiting this page
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await userAPI.getProfile();
        // Update context user for global consistency
        updateUser({
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          budgetLimit: profile.budgetLimit,
          ...(profile.profileImageUrl
            ? { profileImageUrl: profile.profileImageUrl }
            : {}),
          ...(profile.jobTitle ? { jobTitle: profile.jobTitle } : {}),
          ...(profile.phoneNumber ? { phoneNumber: profile.phoneNumber } : {}),
          ...(profile.streetAddress
            ? { streetAddress: profile.streetAddress }
            : {}),
          ...(profile.city ? { city: profile.city } : {}),
          ...(profile.state ? { state: profile.state } : {}),
          ...(profile.zipCode ? { zipCode: profile.zipCode } : {}),
          ...(profile.completeAddress
            ? { completeAddress: profile.completeAddress }
            : {}),
          ...(profile.dateOfBirth ? { dateOfBirth: profile.dateOfBirth } : {}),
          ...(profile.education ? { education: profile.education } : {}),
          ...(profile.gender ? { gender: profile.gender } : {}),
        });

        // Hydrate form fields with the freshest data
        setFirstName(profile.firstName || "");
        setLastName(profile.lastName || "");
        setEmail(profile.email || "");
        setBudget(profile.budgetLimit || 0);
        setJobTitle(profile.jobTitle || "");
        setPhoneNumber(profile.phoneNumber || "");
        setStreetAddress(profile.streetAddress || "");
        setCity(profile.city || "");
        setStateVal(profile.state || "");
        setZipCode(profile.zipCode || "");
        setCompleteAddress(profile.completeAddress || "");
        setDateOfBirth(profile.dateOfBirth || "");
        setEducation(profile.education || "");
        setGender(profile.gender || "");
      } catch (e) {
        console.error("Failed to load profile", e);
      }
    };

    loadProfile();
  }, []);

  const resetForm = () => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
      setBudget(user.budgetLimit);
      setJobTitle(user.jobTitle || "");
      setPhoneNumber(user.phoneNumber || "");
      setStreetAddress(user.streetAddress || "");
      setCity(user.city || "");
      setStateVal(user.state || "");
      setZipCode(user.zipCode || "");
      setCompleteAddress(user.completeAddress || "");
      setDateOfBirth(user.dateOfBirth || "");
      setEducation(user.education || "");
      setGender(user.gender || "");
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        budgetLimit: Number(budget) || 0,
        jobTitle: jobTitle.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        streetAddress: streetAddress.trim() || undefined,
        city: city.trim() || undefined,
        state: stateVal.trim() || undefined,
        zipCode: zipCode.trim() || undefined,
        completeAddress: completeAddress.trim() || undefined,
        dateOfBirth: dateOfBirth.trim() || undefined,
        education: education.trim() || undefined,
        gender: gender.trim() || undefined,
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
      setActiveTab("profile");
    } catch (e) {
      console.error("Failed to update profile", e);
    } finally {
      setSaving(false);
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
                      className="h-20 w-20 rounded-full object-cover cursor-pointer"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-purple-600 text-white flex items-center justify-center text-2xl font-bold cursor-pointer hover:bg-purple-700 transition-colors">
                      {user.firstName.charAt(0).toUpperCase()}
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
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement)
                              .files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = async () => {
                                const dataUrl = reader.result as string;
                                try {
                                  const updated = await userAPI.updateProfile({
                                    profileImageUrl: dataUrl,
                                  });
                                  updateUser({
                                    profileImageUrl: updated.profileImageUrl,
                                  });
                                } catch (err) {
                                  console.error(
                                    "Failed to update profile image",
                                    err
                                  );
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          };
                          input.click();
                        }}
                      >
                        <div className="bg-white bg-opacity-90 rounded-full px-2 py-1 text-xs text-gray-700 font-medium hover:bg-opacity-100 transition-all">
                          Edit | Update
                        </div>
                      </div>
                      {user.profileImageUrl && (
                        <div
                          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 hidden group-hover:flex cursor-pointer"
                          onClick={async () => {
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
                            }
                          }}
                        >
                          <div className="!bg-red-500 hover:!bg-red-600 !text-white rounded-full px-2 py-1 text-xs font-medium transition-colors border border-red-600">
                            Delete
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <h3 className="mt-3 font-semibold text-gray-800 text-lg">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-gray-500">{jobTitle || "—"}</p>

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
                      {phoneNumber || "Not provided"}
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
                      {[city, stateVal].filter(Boolean).join(", ") || "—"}
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
                      {completeAddress || streetAddress || "—"}
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
                          {phoneNumber || "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Gender</div>
                        <div className="font-semibold">{gender || "—"}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Zip Code</div>
                        <div className="font-semibold">{zipCode || "—"}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Email</div>
                        <div className="font-semibold">{user.email}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Date of Birth</div>
                        <div className="font-semibold">
                          {dateOfBirth || "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Education</div>
                        <div className="font-semibold">{education || "—"}</div>
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
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
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
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-2">
                            Last Name
                          </label>
                          <input
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-2">
                            Job Title
                          </label>
                          <input
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
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
                            value={streetAddress}
                            onChange={(e) => setStreetAddress(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-2">
                            City
                          </label>
                          <input
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-2">
                            State
                          </label>
                          <input
                            value={stateVal}
                            onChange={(e) => setStateVal(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-2">
                            Zip Code
                          </label>
                          <input
                            value={zipCode}
                            onChange={(e) => setZipCode(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-2">
                          Complete Address
                        </label>
                        <input
                          value={completeAddress}
                          onChange={(e) => setCompleteAddress(e.target.value)}
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
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          />
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
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-2">
                            Education
                          </label>
                          <input
                            value={education}
                            onChange={(e) => setEducation(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-2">
                            Gender
                          </label>
                          <input
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
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
                          value={budget}
                          onChange={(e) => setBudget(Number(e.target.value))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
                      >
                        {saving ? "Saving..." : "Update"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={resetForm}
                        className="px-6 py-2 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
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
