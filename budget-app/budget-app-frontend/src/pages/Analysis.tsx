// Expense analysis page: shows monthly/daily spend vs budget with charts.
// Reuses the header/notifications patterns from Dashboard.
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ConfirmLogoutModal from "../components/ConfirmLogoutModal";
import AnalysisFilterBar from "../components/AnalysisFilterBar";
import ExpenseChart from "../components/ExpenseChart";
import { useAuth } from "../context/AuthContext";
import { notificationsAPI, entriesAPI } from "../services/api";

// Minimal notification shape to satisfy Header props
interface Notification {
  id: string;
  message: string;
  type: "add" | "edit" | "delete";
  createdAt: number;
  timestamp: string;
  isRead: boolean;
}

// Chart data structure
interface ChartData {
  label: string;
  value: number;
  budgetLimit: number;
  exceeded: boolean;
}

// Budget analysis data structure
interface BudgetAnalysis {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    budgetLimit: number;
  };
  analysis: {
    range: string;
    months: Array<{
      year: number;
      month: number;
      monthName: string;
      totalExpenses: number;
      budgetLimit: number;
      exceeded: boolean;
      remaining: number;
    }>;
    days?: Array<{
      year: number;
      month: number;
      day: number;
      date: string;
      totalExpenses: number;
      budgetLimit: number;
      exceeded: boolean;
      remaining: number;
    }>;
    totalExpenses: number;
    totalBudget: number;
    overallExceeded: boolean;
  };
}

// Analysis page layout mirrors Dashboard: Sidebar, Header, and content area
const Analysis: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Sidebar open/closed state
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // Logout confirmation modal
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Notifications shown in Header (fetch-only; no analysis-specific changes)
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Analysis state
  const [rangeFilter, setRangeFilter] = useState("last-12-months");
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [budgetAnalysis, setBudgetAnalysis] = useState<BudgetAnalysis | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // Cache for budget analysis data to prevent unnecessary re-fetching
  const [analysisCache, setAnalysisCache] = useState<
    Record<string, BudgetAnalysis>
  >({});

  // Fetch notifications and budget analysis in parallel for better performance
  useEffect(() => {
    const loadData = async () => {
      try {
        // Check cache first
        if (analysisCache[rangeFilter]) {
          const cachedData = analysisCache[rangeFilter];
          setBudgetAnalysis(cachedData);

          // Transform cached data for chart
          const transformedData: ChartData[] = cachedData.analysis.days
            ? cachedData.analysis.days.map(
                (day: {
                  date: string;
                  totalExpenses: number;
                  budgetLimit: number;
                  exceeded: boolean;
                }) => ({
                  label: new Date(day.date).getDate().toString(),
                  value: day.totalExpenses,
                  budgetLimit: day.budgetLimit,
                  exceeded: day.exceeded,
                })
              )
            : cachedData.analysis.months.map(
                (month: {
                  monthName: string;
                  totalExpenses: number;
                  budgetLimit: number;
                  exceeded: boolean;
                }) => ({
                  label: month.monthName,
                  value: month.totalExpenses,
                  budgetLimit: month.budgetLimit,
                  exceeded: month.exceeded,
                })
              );

          setChartData(transformedData);
          setLoading(false);
          return;
        }

        // Fetch notifications and budget analysis in parallel
        const [notificationsData, budgetData] = await Promise.all([
          notificationsAPI.getAll(),
          entriesAPI.getBudgetAnalysis(rangeFilter),
        ]);

        setNotifications(notificationsData);
        setBudgetAnalysis(budgetData);

        // Cache the budget analysis data
        setAnalysisCache((prev) => ({
          ...prev,
          [rangeFilter]: budgetData,
        }));

        // Transform data for chart (optimized transformation)
        const transformedData: ChartData[] = budgetData.analysis.days
          ? budgetData.analysis.days.map(
              (day: {
                date: string;
                totalExpenses: number;
                budgetLimit: number;
                exceeded: boolean;
              }) => ({
                label: new Date(day.date).getDate().toString(),
                value: day.totalExpenses,
                budgetLimit: day.budgetLimit,
                exceeded: day.exceeded,
              })
            )
          : budgetData.analysis.months.map(
              (month: {
                monthName: string;
                totalExpenses: number;
                budgetLimit: number;
                exceeded: boolean;
              }) => ({
                label: month.monthName,
                value: month.totalExpenses,
                budgetLimit: month.budgetLimit,
                exceeded: month.exceeded,
              })
            );

        setChartData(transformedData);
        setLoading(false);
      } catch (error: any) {
        console.error("Failed to fetch data:", error);
        setNotifications([]);
        setChartData([]);
        setBudgetAnalysis(null);
        setLoading(false);
      }
    };

    loadData();
  }, [rangeFilter, analysisCache]);

  // Clear notifications if server restarts (keeps behavior consistent with Dashboard)
  useEffect(() => {
    const handleServerRestart = () => setNotifications([]);
    window.addEventListener("serverRestart", handleServerRestart);
    return () =>
      window.removeEventListener("serverRestart", handleServerRestart);
  }, []);

  // Mark a single notification read (used by header dropdown)
  const handleNotificationClick = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
  };

  // Mark all as read (updates UI and backend)
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
    // Small timeout ensures modal unmounts before navigation
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
            profileImageUrl: user.profileImageUrl,
          }}
          onLogout={handleLogout}
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
          onMarkAllAsRead={handleMarkAllNotificationsAsRead}
          toggleExpanded={() => setSidebarExpanded(!sidebarExpanded)}
          sidebarExpanded={sidebarExpanded}
        />

        {/* Content area with same styling as Dashboard */}
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
          {loading && !budgetAnalysis && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="flex flex-col items-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <p className="text-gray-600">Loading analysis data...</p>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-gray-800">Analysis</h1>
          </div>
          <div className="border-b border-gray-300 mb-6" />

          {/* White card container with chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div
              className="flex justify-between items-center px-4 py-3 border-b border-gray-200"
              style={{ backgroundColor: "#f3f4f6" }}
            >
              <h2 className="text-lg font-bold text-black">Expenses</h2>
              <AnalysisFilterBar
                rangeFilter={rangeFilter}
                onRangeChange={setRangeFilter}
              />
            </div>

            {budgetAnalysis ? (
              <>
                {/* Chart */}
                <div className="p-6">
                  {chartData.length > 0 ? (
                    <ExpenseChart data={chartData} />
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <p>No chart data available</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <p>No budget analysis data available</p>
                <p className="text-sm mt-2">
                  Please check if you have expenses in your database
                </p>
              </div>
            )}
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

export default Analysis;
