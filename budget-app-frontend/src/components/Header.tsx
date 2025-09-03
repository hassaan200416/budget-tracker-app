// src/components/Header.tsx
// Global top bar: brand, notifications, and user menu.
// Consumes notifications for the bell and accepts a minimal user shape for avatar.
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BellIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import profileIcon from "../assets/images/hamburger-profile.png";
import logoutIcon from "../assets/images/hamburger-logout.png";
import menuIcon from "../assets/images/hamburger-menu.png";
import logo from "../assets/images/logo.png";

import NotificationDropdown from "./NotificationDropdown";

interface Notification {
  id: string;
  message: string;
  type: "add" | "edit" | "delete";
  createdAt: number;
  timestamp: string;
  isRead: boolean;
}

interface HeaderProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl?: string;
  };
  onLogout: () => void;
  notifications: Notification[];
  onNotificationClick?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  toggleExpanded: () => void;
  sidebarExpanded: boolean;
  hasSidebar?: boolean; // when false, header spans full width and hides menu button
}

const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  notifications,
  onNotificationClick,
  onMarkAllAsRead,
  toggleExpanded,
  sidebarExpanded,
  hasSidebar = true,
}) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  // Close notifications when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".notification-container")) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBellClick = () => {
    // Mark all notifications as read when bell is clicked
    if (notifications.some((n) => !n.isRead) && onMarkAllAsRead) {
      onMarkAllAsRead();
    }
    setShowNotifications(!showNotifications);
  };

  const headerLeft = hasSidebar ? (sidebarExpanded ? "18rem" : "6rem") : "0";

  return (
    <div
      className="fixed top-0 right-0 bg-white px-6 py-4 flex items-center justify-between border-b border-gray-200 z-40"
      style={{
        left: headerLeft,
        transition: "left 0.3s ease",
      }}
    >
      <div className="flex items-center space-x-3">
        {hasSidebar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleExpanded}
            className="h-6 w-6 p-0 hover:bg-transparent focus:bg-transparent"
          >
            <img src={menuIcon} alt="Menu" className="h-6 w-6" />
          </Button>
        )}
        {!hasSidebar && (
          <>
            <img src={logo} alt="Budget Tracker" className="h-6 w-auto" />
            <span className="text-xl font-semibold text-gray-900 hidden sm:inline">
              Budget Tracker
            </span>
          </>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative notification-container">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBellClick}
            className="h-6 w-6 p-0 text-gray-600 hover:text-gray-800"
          >
            <BellIcon className="h-6 w-6" />
          </Button>
          {/* Notification indicator - positioned outside button for better visibility */}
          {notifications.some((n) => !n.isRead) && (
            <span
              className="absolute -top-1 -right-1 h-4 w-4 rounded-full z-20 border-2 border-white shadow-lg animate-pulse"
              style={{
                backgroundColor: "#dc2626",
                minWidth: "16px",
                minHeight: "16px",
              }}
            />
          )}
          {showNotifications && (
            <NotificationDropdown
              notifications={notifications}
              onNotificationClick={onNotificationClick}
            />
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full p-0 hover:bg-transparent"
            >
              {user.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt="Avatar"
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-semibold">
                  {user.firstName.charAt(0).toUpperCase()}
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <div className="flex items-center p-3 border-b border-gray-200">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-600 text-white text-sm font-semibold mr-3">
                {user.firstName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <DropdownMenuItem
              className="flex items-center px-4 py-2 text-sm text-gray-700 cursor-pointer"
              onClick={() => navigate("/profile")}
            >
              <img src={profileIcon} alt="Profile" className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center px-4 py-2 text-sm text-gray-700 cursor-pointer"
              onClick={onLogout}
            >
              <img src={logoutIcon} alt="Logout" className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Header;
