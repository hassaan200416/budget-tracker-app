// src/pages/Dashboard.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ExpenseTable from "../components/ExpenseTable";
import AddEditModal from "../components/AddEditModal";
import DeleteModal from "../components/DeleteModal";
import ConfirmLogoutModal from "../components/ConfirmLogoutModal";
import { Separator } from "@/components/ui/separator";

interface Expense {
  id: string;
  title: string;
  price: number;
  date: string;
  user: string; // From backend user
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]); // Mock data, later fetch
  const [modalOpen, setModalOpen] = useState<"add" | "edit" | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [sortBy, setSortBy] = useState("price-high-low");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Mock user data from login (later from backend)
  const user = {
    name: "Ali Hassan",
    email: "ali.hassan@example.com",
    budgetLimit: 100000,
  }; // Example

  useEffect(() => {
    // Fetch expenses from backend here later
    // For now, mock
    setExpenses([
      {
        id: "1",
        title: "Prestigious Clientele Segment",
        price: 25000,
        date: "22 Jan 2022",
        user: "guy-hawkins",
      },
      // Add more mock data as in screenshots
    ]);
  }, []);

  const addNotification = (message: string) => {
    setNotifications((prev) => [message, ...prev]);
    setHasUnread(true);
  };

  const handleAdd = (data: { title: string; price: number; date: string }) => {
    const currentTotal = expenses.reduce((sum, exp) => sum + exp.price, 0);
    if (currentTotal + Number(data.price) > user.budgetLimit) {
      toast.error("Budget limit exceeded");
      addNotification(`Budget limit exceeded while adding ${data.title}`);
      setModalOpen(null);
      return;
    }
    const newExpense: Expense = {
      id: Date.now().toString(),
      ...data,
      user: user.name.toLowerCase().replace(" ", "-"),
    };
    setExpenses([...expenses, newExpense]);
    toast.success("Expense added successfully!");
    addNotification(`${data.title} added successfully.`);
    setModalOpen(null);
  };

  const handleEdit = (data: { title: string; price: number; date: string }) => {
    if (selectedExpense) {
      const currentTotal = expenses.reduce((sum, exp) => sum + exp.price, 0);
      const adjustedTotal =
        currentTotal - selectedExpense.price + Number(data.price);
      if (adjustedTotal > user.budgetLimit) {
        toast.error("Budget limit exceeded");
        addNotification(`Budget limit exceeded while editing ${data.title}`);
        setModalOpen(null);
        return;
      }
      setExpenses(
        expenses.map((exp) =>
          exp.id === selectedExpense.id ? { ...exp, ...data } : exp
        )
      );
      toast.success("Expense edited successfully!");
      addNotification(`${data.title} edited successfully.`);
      setModalOpen(null);
    }
  };

  const handleDelete = () => {
    if (selectedExpense) {
      setExpenses(expenses.filter((exp) => exp.id !== selectedExpense.id));
      toast.error("Expense deleted successfully!");
      addNotification(`${selectedExpense.title} removed successfully.`);
      setDeleteModalOpen(false);
    }
  };

  const handleLogout = () => setShowLogoutConfirm(true);
  const confirmLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Filtering and sorting logic
  const filteredExpenses = expenses
    .filter((exp) => exp.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((exp) => !dateFilter || exp.date === dateFilter)
    .sort((a, b) => {
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
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const totalItems = filteredExpenses.length;

  return (
    <div className="flex h-screen bg-white font-poppins">
      <Sidebar
        expanded={sidebarExpanded}
        toggleExpanded={() => setSidebarExpanded(!sidebarExpanded)}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col">
        <Header
          user={user}
          onLogout={handleLogout}
          notifications={notifications}
          hasUnread={hasUnread}
          onNotificationsOpened={() => setHasUnread(false)}
          toggleExpanded={() => setSidebarExpanded(!sidebarExpanded)}
        />
        <div className="p-8 flex-1" style={{ backgroundColor: "#eff6ff" }}>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-gray-800">Expenses</h1>
            <button
              onClick={() => setModalOpen("add")}
              className="bg-purple-600 text-white px-5 py-2 rounded-md hover:bg-purple-700"
            >
              Add Expense
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="all">Sort by All</option>
                <option value="price-high-low">Price Highest to Lowest</option>
                <option value="price-low-high">Price Lowest to Highest</option>
                <option value="date-new-old">Date Newest to Oldest</option>
                <option value="date-old-new">Date Oldest to Newest</option>
              </select>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
              />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-200 rounded-md px-3 py-2 text-sm w-64 focus:outline-none focus:border-purple-500"
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
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 text-sm rounded-md ${
                      currentPage === i + 1
                        ? "bg-purple-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
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
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Dashboard;
