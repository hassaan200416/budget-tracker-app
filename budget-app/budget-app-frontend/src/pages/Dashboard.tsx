// src/pages/Dashboard.tsx
// Main app screen: lists expenses with pagination, filtering, and CRUD.
// Fetches notifications for the header and shows toasts for user feedback.
import React, { useState, useEffect, useCallback } from "react";
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

  // Pagination and Filtering State
  const [sortBy, setSortBy] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
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

  // Fetch expenses and notifications in parallel for better performance
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch expenses and notifications in parallel using Promise.all
        const [expensesResponse, notificationsData] = await Promise.all([
          entriesAPI.getAll({
            page: currentPage,
            limit: itemsPerPage,
            search: searchTerm,
            dateFilter: dateFilter?.toISOString().split("T")[0],
            sortBy: sortBy,
          }),
          notificationsAPI.getAll(),
        ]);

        setExpenses(expensesResponse.entries);
        setTotalPages(expensesResponse.pagination.totalPages);
        setTotalItems(expensesResponse.pagination.totalEntries);
        setNotifications(notificationsData);
      } catch (error: any) {
        console.error("Failed to fetch data:", error);
        setExpenses([]);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentPage, itemsPerPage, searchTerm, dateFilter, sortBy]); // Removed user.budgetLimit from dependencies

  // Debounced search to prevent excessive API calls
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (searchValue: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setSearchTerm(searchValue);
          setCurrentPage(1); // Reset to first page when searching
        }, 300); // Wait 300ms after user stops typing
      };
    })(),
    []
  );

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

      // Refresh current page data to show the new expense
      const response = await entriesAPI.getAll({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        dateFilter: dateFilter?.toISOString().split("T")[0],
        sortBy: sortBy,
      });

      setExpenses(response.entries);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.totalEntries);

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

        // Refresh current page data to show the updated expense
        const response = await entriesAPI.getAll({
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
          dateFilter: dateFilter?.toISOString().split("T")[0],
          sortBy: sortBy,
        });

        setExpenses(response.entries);
        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.totalEntries);

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

        // Refresh current page data to show the updated list
        const response = await entriesAPI.getAll({
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
          dateFilter: dateFilter?.toISOString().split("T")[0],
          sortBy: sortBy,
        });

        setExpenses(response.entries);
        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.totalEntries);

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

  // Handle filter changes - reset to first page when filters change
  const handleFilterChange = (type: "search" | "date" | "sort", value: any) => {
    setCurrentPage(1); // Reset to first page when filters change

    switch (type) {
      case "search":
        setSearchTerm(value);
        break;
      case "date":
        setDateFilter(value);
        break;
      case "sort":
        setSortBy(value);
        break;
    }
  };

  // Debounced search to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Trigger search after delay
      if (searchTerm !== "") {
        setCurrentPage(1); // Reset to first page for new search
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Separate effect for search term changes
  useEffect(() => {
    if (searchTerm !== "") {
      const fetchSearchResults = async () => {
        try {
          setLoading(true);

          const response = await entriesAPI.getAll({
            page: 1, // Always start from first page for search
            limit: itemsPerPage,
            search: searchTerm,
            dateFilter: dateFilter?.toISOString().split("T")[0],
            sortBy: sortBy,
          });

          setExpenses(response.entries);
          setTotalPages(response.pagination.totalPages);
          setTotalItems(response.pagination.totalEntries);
        } catch (error) {
          console.error("Failed to fetch search results:", error);
          setExpenses([]);
          setTotalPages(1);
          setTotalItems(0);
        } finally {
          setLoading(false);
        }
      };

      fetchSearchResults();
    }
  }, [searchTerm, dateFilter, sortBy, itemsPerPage]);

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  // No more client-side filtering - everything is handled by the backend

  return (
    <div className="flex h-screen bg-white font-poppins">
      <Sidebar expanded={sidebarExpanded} onLogout={handleLogout} />
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
          {/* Loading overlay for initial load */}
          {loading && expenses.length === 0 && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="flex flex-col items-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <p className="text-gray-600">Loading expenses...</p>
              </div>
            </div>
          )}
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
                onSortChange={(value) => handleFilterChange("sort", value)}
                dateFilter={dateFilter}
                onDateChange={(value) => handleFilterChange("date", value)}
                searchTerm={searchTerm}
                onSearchChange={debouncedSearch}
              />
            </div>
            {expenses.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                {searchTerm
                  ? `No expenses found for "${searchTerm}"`
                  : "No expenses found"}
              </p>
            ) : (
              <ExpenseTable
                expenses={expenses}
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
                Showing {expenses.length} / {totalItems}
              </p>
              <div className="flex items-center space-x-1">
                {/* Previous Page Button */}
                <Button
                  size="sm"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
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
                    onClick={() => handlePageChange(i + 1)}
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
                    handlePageChange(Math.min(totalPages, currentPage + 1))
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
