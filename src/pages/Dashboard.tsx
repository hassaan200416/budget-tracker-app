// src/pages/Dashboard.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";
import { entriesAPI, notificationsAPI } from "../services/api";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ExpenseTable from "../components/ExpenseTable";
import AddEditModal from "../components/AddEditModal";
import DeleteModal from "../components/DeleteModal";
import ConfirmLogoutModal from "../components/ConfirmLogoutModal";
import NotificationAlert from "../components/NotificationAlert";
import FilterBar from "../components/FilterBar";
import type { NotificationType } from "../components/NotificationAlert";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

// Structure for expense data
interface Expense {
  id: string;
  title: string;
  price: number;
  date: string;
  user: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // UI State - controls sidebar, modals, and display
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [modalOpen, setModalOpen] = useState<"add" | "edit" | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Data State - stores expenses, notifications, and selected items
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Notification structure for the app
  interface Notification {
    id: string;
    message: string;
    type: "add" | "edit" | "delete";
    createdAt: number;
    timestamp: string;
    isRead: boolean;
  }

  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Filtering and Pagination State
  const [sortBy, setSortBy] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Number of expenses shown per page

  // Toast notification state for user feedback
  const [notification, setNotification] = useState<{
    visible: boolean;
    type: NotificationType;
    title: string;
    message: string;
  }>({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });

  // Get current user data from authentication context
  const { user } = useAuth();

  // Show loading screen if user data isn't ready yet
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  // Load expenses and notifications when component mounts or budget changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get all expenses for the current user
        const expenses = await entriesAPI.getAll();
        setExpenses(expenses);

        // Get all notifications for the current user
        const notifications = await notificationsAPI.getAll();
        setNotifications(notifications);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        // Clear data on error to prevent showing stale information
        setExpenses([]);
        setNotifications([]);
      }
    };

    fetchData();
  }, [user.budgetLimit]); // Re-fetch when budget limit changes

  // Handle server restart events - clear notifications when backend restarts
  useEffect(() => {
    const handleServerRestart = () => {
      console.log("Server restart detected, clearing notifications");
      setNotifications([]);
    };

    window.addEventListener("serverRestart", handleServerRestart);

    return () => {
      window.removeEventListener("serverRestart", handleServerRestart);
    };
  }, []);

  const showNotification = (
    type: NotificationType,
    title: string,
    message: string
  ) => {
    setNotification({
      visible: true,
      type,
      title,
      message,
    });

    // Auto hide after 3 seconds
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  const addNotification = (
    message: string,
    type: "add" | "edit" | "delete"
  ) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      message,
      type,
      createdAt: Date.now(), // Store actual creation time
      timestamp: "", // Not used anymore, kept for compatibility
      isRead: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const handleNotificationClick = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const handleMarkAllNotificationsAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  const handleAdd = async (data: {
    title: string;
    price: number;
    date: string;
  }) => {
    try {
      console.log("Adding expense:", data);
      const newExpense = await entriesAPI.create(data);
      console.log("New expense created:", newExpense);

      setExpenses([newExpense, ...expenses]);

      showNotification(
        "success",
        "Expense Added",
        "Expense added successfully!"
      );
      addNotification(`${newExpense.title} added successfully.`, "add");

      // Ensure modal is closed
      setModalOpen(null);
    } catch (error: any) {
      console.error("Error adding expense:", error);

      if (error.message.includes("Budget limit exceeded")) {
        showNotification(
          "error",
          "Budget Limit Exceeded",
          "Budget limit exceeded while adding expense"
        );
        addNotification(
          `Budget limit exceeded while adding ${data.title}`,
          "add"
        );
      } else {
        showNotification(
          "error",
          "Error",
          error.message || "Failed to add expense"
        );
      }

      // Ensure modal is closed even on error
      setModalOpen(null);
    }
  };

  const handleEdit = async (data: {
    title: string;
    price: number;
    date: string;
  }) => {
    if (selectedExpense) {
      try {
        console.log("Updating expense:", selectedExpense.id, data);
        const updatedExpense = await entriesAPI.update(
          selectedExpense.id,
          data
        );
        console.log("Expense updated:", updatedExpense);

        setExpenses(
          expenses.map((exp) =>
            exp.id === selectedExpense.id ? updatedExpense : exp
          )
        );

        showNotification(
          "success",
          "Expense Updated",
          "Expense edited successfully!"
        );
        addNotification(`${data.title} edited successfully.`, "edit");
        setModalOpen(null);
      } catch (error: any) {
        console.error("Error updating expense:", error);

        if (error.message.includes("Budget limit exceeded")) {
          showNotification(
            "error",
            "Budget Limit Exceeded",
            "Budget limit exceeded while editing expense"
          );
          addNotification(
            `Budget limit exceeded while editing ${data.title}`,
            "edit"
          );
        } else {
          showNotification(
            "error",
            "Error",
            error.message || "Failed to update expense"
          );
        }

        setModalOpen(null);
      }
    }
  };

  const handleDelete = async () => {
    if (selectedExpense) {
      try {
        console.log("Deleting expense:", selectedExpense.id);
        await entriesAPI.delete(selectedExpense.id);
        console.log("Expense deleted successfully");

        setExpenses(expenses.filter((exp) => exp.id !== selectedExpense.id));

        showNotification(
          "error",
          "Expense Deleted",
          "Expense deleted successfully!"
        );
        addNotification(
          `${selectedExpense.title} removed successfully.`,
          "delete"
        );
        setDeleteModalOpen(false);
      } catch (error: any) {
        console.error("Error deleting expense:", error);

        showNotification(
          "error",
          "Error",
          error.message || "Failed to delete expense"
        );

        setDeleteModalOpen(false);
      }
    }
  };

  const { logout } = useAuth();
  const handleLogout = () => setShowLogoutConfirm(true);
  const confirmLogout = async () => {
    try {
      // Close the logout confirmation modal first
      setShowLogoutConfirm(false);

      // Clear any local state that might interfere
      setModalOpen(null);
      setDeleteModalOpen(false);
      setSelectedExpense(null);
      setNotifications([]);

      // Clear notifications from storage
      localStorage.removeItem("notifications");
      sessionStorage.removeItem("notifications");

      // Perform logout and navigate after modal unmounts
      logout();
      setTimeout(() => navigate("/login"), 0);
    } catch (error) {
      console.error("Logout error:", error);
      setTimeout(() => navigate("/login"), 0);
    }
  };

  // Filtering and sorting logic
  const filteredExpenses = expenses
    .filter((exp) => exp.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((exp) => {
      if (!dateFilter) return true;
      const expenseDate = new Date(exp.date);
      return expenseDate.toDateString() === dateFilter.toDateString();
    })
    .sort((a, b) => {
      if (sortBy === "all") return 0;
      if (sortBy === "price-high-low") return b.price - a.price;
      if (sortBy === "price-low-high") return a.price - b.price;
      if (sortBy === "date-new-old")
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === "date-old-new")
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      return 0;
    });

  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredExpenses.length / itemsPerPage)
  );
  const totalItems = filteredExpenses.length;

  return (
    <div className="flex h-screen bg-white font-poppins">
      <Sidebar expanded={sidebarExpanded} onLogout={handleLogout} />
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
            <h1 className="text-2xl font-semibold text-gray-800">Expenses</h1>
            <Button
              onClick={() => setModalOpen("add")}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Add Expense
            </Button>
          </div>
          <div className="border-b border-gray-300 mb-6" />

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div
              className="flex justify-between items-center px-4 py-3 border-b border-gray-200"
              style={{ backgroundColor: "#f3f4f6" }}
            >
              <h2 className="text-lg font-bold text-black">Expenses</h2>
              <FilterBar
                sortBy={sortBy}
                onSortChange={setSortBy}
                dateFilter={dateFilter}
                onDateChange={setDateFilter}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            </div>
            {paginatedExpenses.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No Result</p>
            ) : (
              <ExpenseTable
                expenses={paginatedExpenses}
                budgetLimit={user.budgetLimit}
                onEdit={(exp) => {
                  setSelectedExpense(exp);
                  setModalOpen("edit");
                }}
                onDelete={(exp) => {
                  setSelectedExpense(exp);
                  setDeleteModalOpen(true);
                }}
              />
            )}
            <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Showing {paginatedExpenses.length} / {totalItems}
              </p>
              <div className="flex items-center space-x-1">
                {/* Previous Page Button */}
                <Button
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i}
                    size="sm"
                    onClick={() => setCurrentPage(i + 1)}
                    className={
                      currentPage === i + 1
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
                    }
                  >
                    {i + 1}
                  </Button>
                ))}

                {/* Next Page Button */}
                <Button
                  size="sm"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <NotificationAlert
            type={notification.type}
            title={notification.title}
            message={notification.message}
            visible={notification.visible}
            onClose={() =>
              setNotification((prev) => ({ ...prev, visible: false }))
            }
          />
        </div>
      </div>
      {modalOpen && (
        <AddEditModal
          mode={modalOpen}
          initialData={modalOpen === "edit" ? selectedExpense : null}
          onSubmit={modalOpen === "add" ? handleAdd : handleEdit}
          onClose={() => setModalOpen(null)}
        />
      )}
      {deleteModalOpen && selectedExpense && (
        <DeleteModal
          expense={selectedExpense}
          onDelete={handleDelete}
          onClose={() => setDeleteModalOpen(false)}
        />
      )}
      {showLogoutConfirm && (
        <ConfirmLogoutModal
          onCancel={() => setShowLogoutConfirm(false)}
          onConfirm={() => {
            setShowLogoutConfirm(false);
            confirmLogout();
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
