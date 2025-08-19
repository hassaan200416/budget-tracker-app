import React from "react";
import addIcon from "../assets/images/add.png";
import editIcon from "../assets/images/edit.png";
import deleteIcon from "../assets/images/delete.png";

interface Notification {
  id: string;
  message: string;
  type: "add" | "edit" | "delete";
  createdAt: number | string;
  timestamp: string;
  isRead: boolean;
}

interface NotificationDropdownProps {
  notifications: Notification[];
  onNotificationClick?: (notificationId: string) => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  onNotificationClick,
}) => {
  const [, forceUpdate] = React.useState({});

  React.useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate({});
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "add":
        return addIcon;
      case "edit":
        return editIcon;
      case "delete":
        return deleteIcon;
      default:
        return addIcon;
    }
  };

  const getTimeAgo = (createdAt: number | string): string => {
    const createdAtTimestamp =
      typeof createdAt === "string" ? new Date(createdAt).getTime() : createdAt;

    const now = Date.now();
    const diffInMs = now - createdAtTimestamp;

    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    } else {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg border border-gray-200 max-h-80 overflow-y-auto z-50">
      <div className="max-h-64 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No notifications
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors ${
                !notification.isRead ? "bg-blue-50" : ""
              }`}
              onClick={() => onNotificationClick?.(notification.id)}
            >
              <div className="w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                <img
                  src={getIcon(notification.type)}
                  alt={notification.type}
                  className="h-7 w-7"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 leading-relaxed">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {getTimeAgo(notification.createdAt)}
                </p>
              </div>

              {!notification.isRead && (
                <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0"></div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
