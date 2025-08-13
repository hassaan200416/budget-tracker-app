// src/components/NotificationDropdown.tsx
import React from "react";
import addIcon from "../assets/images/add.png";
import editIcon from "../assets/images/edit.png";
import deleteIcon from "../assets/images/delete.png";

interface NotificationDropdownProps {
  notifications: string[];
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
}) => {
  return (
    <div className="absolute right-0 mt-2 w-80 bg-white shadow-md rounded-md border border-gray-200 max-h-80 overflow-y-auto">
      {notifications.map((notif, index) => {
        const isAdd = notif.toLowerCase().includes("added");
        const isEdit = notif.toLowerCase().includes("edited");
        const icon = isAdd ? addIcon : isEdit ? editIcon : deleteIcon;
        const dotColor = isAdd
          ? "bg-green-500"
          : isEdit
          ? "bg-blue-500"
          : "bg-red-500";
        return (
          <div
            key={index}
            className="flex items-center px-4 py-3 border-b border-gray-200 last:border-b-0"
          >
            <img src={icon} alt="type" className="h-4 w-4 mr-3" />
            <div className={`w-2 h-2 rounded-full mr-2 ${dotColor}`} />
            <p className="text-sm text-gray-700">{notif}</p>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationDropdown;
