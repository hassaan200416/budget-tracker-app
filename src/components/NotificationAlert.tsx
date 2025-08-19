import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";

export type NotificationType = "success" | "error" | "info" | "warning";

interface NotificationAlertProps {
  type: NotificationType;
  title: string;
  message: string;
  onClose: () => void;
  visible: boolean;
}

const NotificationAlert: React.FC<NotificationAlertProps> = ({
  type,
  title,
  message,
  onClose,
  visible,
}) => {
  if (!visible) return null;

  const getIcon = () => {
    const iconClasses = "h-4 w-4";

    switch (type) {
      case "success":
        return <CheckCircle className={`${iconClasses} text-green-600`} />;
      case "error":
        return <XCircle className={`${iconClasses} text-red-600`} />;
      case "warning":
        return <AlertTriangle className={`${iconClasses} text-yellow-600`} />;
      case "info":
        return <Info className={`${iconClasses} text-blue-600`} />;
      default:
        return <Info className={`${iconClasses} text-blue-600`} />;
    }
  };

  const getAlertStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  const getCloseButtonStyles = () => {
    const baseClasses = "ml-2 rounded-full p-1 transition-colors";

    switch (type) {
      case "error":
        return `${baseClasses} hover:bg-red-100 text-red-600`;
      default:
        return `${baseClasses} hover:bg-gray-100 text-gray-500`;
    }
  };

  return (
    <div className="absolute top-0 right-4 z-50 max-w-sm animate-in slide-in-from-right duration-300">
      <Alert
        variant="notification"
        className={`border-l-4 ${getAlertStyles()}`}
        style={{
          backgroundColor:
            type === "error"
              ? "#fee2e2"
              : type === "success"
              ? "#dcfce7"
              : type === "info"
              ? "#dbeafe"
              : type === "warning"
              ? "#fef3c7"
              : "#ffffff",
          borderColor:
            type === "error"
              ? "#f87171"
              : type === "success"
              ? "#4ade80"
              : type === "info"
              ? "#60a5fa"
              : type === "warning"
              ? "#fbbf24"
              : "#e5e7eb",
          color:
            type === "error"
              ? "#dc2626"
              : type === "success"
              ? "#16a34a"
              : type === "info"
              ? "#2563eb"
              : type === "warning"
              ? "#d97706"
              : "#374151",
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-2">
            {getIcon()}
            <div>
              <AlertTitle className="text-sm font-semibold">{title}</AlertTitle>
              <AlertDescription
                className="text-sm text-gray-600"
                style={{ color: "#6b7280" }}
              >
                {message}
              </AlertDescription>
            </div>
          </div>
          <button
            onClick={onClose}
            className={getCloseButtonStyles()}
            aria-label="Close notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </Alert>
    </div>
  );
};

export default NotificationAlert;
