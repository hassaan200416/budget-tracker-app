import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ConfirmLogoutModal from "../components/ConfirmLogoutModal";
import { useAuth } from "../context/AuthContext";
import { notificationsAPI } from "../services/api";

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
  const { user, logout } = useAuth();

  // Sidebar open/closed state
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // Logout confirmation modal
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Notifications shown in Header
  const [notifications, setNotifications] = useState<Notification[]>([]);

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

  return (
    <div className="flex h-screen bg-white font-poppins">
      {/* Sidebar navigation */}
      <Sidebar expanded={sidebarExpanded} onLogout={handleLogout} />

      {/* Main area with header and page content */}
      <div className="flex-1 flex flex-col">
        <Header
          user={{
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          }}
          onLogout={handleLogout}
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
          onMarkAllAsRead={handleMarkAllNotificationsAsRead}
          toggleExpanded={() => setSidebarExpanded(!sidebarExpanded)}
          sidebarExpanded={sidebarExpanded}
        />

        {/* Content area */}
        <div
          className="p-8 flex-1 relative overflow-y-auto"
          style={{
            backgroundColor: "#eff6ff",
            marginTop: "4rem",
            marginLeft: sidebarExpanded ? "18rem" : "6rem",
            transition: "margin-left 0.3s ease",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-gray-800">Profile</h1>
          </div>
          <div className="border-b border-gray-300 mb-6" />

          {/* White card container */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div
              className="flex justify-between items-center px-4 py-3 border-b border-gray-200"
              style={{ backgroundColor: "#f3f4f6" }}
            >
              <h2 className="text-lg font-bold text-black">User Profile</h2>
            </div>
            <div className="p-6 text-gray-600">
              <p>User profile details will go here.</p>
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
