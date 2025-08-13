// src/components/Header.tsx
import React, { useState } from "react";
import { Menu } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import { BellIcon } from "@heroicons/react/24/outline";
import profileIcon from "../assets/images/hamburger-profile.png";
import logoutIcon from "../assets/images/hamburger-logout.png";
import menuIcon from "../assets/images/hamburger-menu.png";
import NotificationDropdown from "./NotificationDropdown";

interface HeaderProps {
  user: { name: string; email: string };
  onLogout: () => void;
  notifications: string[];
  hasUnread?: boolean;
  onNotificationsOpened?: () => void;
  toggleExpanded: () => void;
}

const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  notifications,
  hasUnread,
  onNotificationsOpened,
  toggleExpanded,
}) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-200">
      <div className="flex items-center">
        <img
          src={menuIcon}
          alt="Menu"
          className="h-6 w-6 cursor-pointer"
          onClick={toggleExpanded}
        />
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <BellIcon
            className="h-6 w-6 cursor-pointer text-gray-600"
            onClick={() => {
              const next = !showNotifications;
              setShowNotifications(next);
              if (next && onNotificationsOpened) onNotificationsOpened();
            }}
          />
          {hasUnread && notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full" />
          )}
          {showNotifications && (
            <NotificationDropdown notifications={notifications} />
          )}
        </div>
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-600 text-white text-lg font-medium">
            {user.name.charAt(0).toUpperCase()}
          </Menu.Button>
          <Menu.Items className="absolute right-0 mt-2 w-56 bg-white shadow-md rounded-md border border-gray-200">
            <div className="flex items-center p-3 border-b border-gray-200">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-600 text-white text-lg font-medium mr-3">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                    active ? "bg-gray-100" : ""
                  }`}
                  onClick={() => navigate("/profile")}
                >
                  <span className="inline-flex items-center">
                    <img
                      src={profileIcon}
                      alt="Profile"
                      className="h-4 w-4 mr-2"
                    />
                    Profile
                  </span>
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                    active ? "bg-gray-100" : ""
                  }`}
                  onClick={onLogout}
                >
                  <span className="inline-flex items-center">
                    <img
                      src={logoutIcon}
                      alt="Logout"
                      className="h-4 w-4 mr-2"
                    />
                    Logout
                  </span>
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Menu>
      </div>
    </div>
  );
};

export default Header;
