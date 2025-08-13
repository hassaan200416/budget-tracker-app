// src/components/Sidebar.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/logo.png";
import menuIcon from "../assets/images/hamburger-menu.png"; // 3 lines
import analysisIcon from "../assets/images/hamburger-analysis.png";
import expensesIcon from "../assets/images/hamburger-expenses.png";
import logoutIcon from "../assets/images/hamburger-logout.png";

interface SidebarProps {
  expanded: boolean;
  toggleExpanded: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  expanded,
  toggleExpanded,
  onLogout,
}) => {
  const navigate = useNavigate();

  return (
    <div
      className={`h-full transition-all duration-300 ${
        expanded ? "w-72" : "w-24"
      } p-4 flex flex-col border-r border-gray-200`}
      style={{ backgroundColor: "#f3f4f6" }}
    >
      <div className="flex items-center mb-10">
        <img src={logo} alt="Logo" className="h-8 w-10" />
        {expanded && (
          <span className="ml-6 text-xl font-bold text-gray-800">
            Budget Tracker
          </span>
        )}
      </div>
      <div className="flex flex-col space-y-2">
        <button
          className={`flex items-center px-4 py-3 rounded-md text-gray-700 hover:bg-gray-100`}
          onClick={() => navigate("/analysis")}
        >
          <img src={analysisIcon} alt="Analysis" className="h-5 w-5" />
          {expanded && <span className="ml-3">Analysis</span>}
        </button>
        <button
          className={`flex items-center px-4 py-3 rounded-md bg-purple-600 text-white`}
          onClick={() => navigate("/dashboard")}
        >
          <img src={expensesIcon} alt="Expenses" className="h-5 w-5" />
          {expanded && <span className="ml-3">Expenses</span>}
        </button>
        <button
          className={`flex items-center px-4 py-3 rounded-md text-gray-700 hover:bg-gray-100`}
          onClick={onLogout}
        >
          <img src={logoutIcon} alt="Logout" className="h-5 w-5" />
          {expanded && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
