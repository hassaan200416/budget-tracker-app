// src/components/Sidebar.tsx
// Left navigation with compact/expanded modes and active route highlighting.
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "../assets/images/logo.png";
import analysisIcon from "../assets/images/hamburger-analysis.png";
import expensesIcon from "../assets/images/hamburger-expenses.png";
import logoutIcon from "../assets/images/hamburger-logout.png";

interface SidebarProps {
  expanded: boolean;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ expanded, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isAnalysisActive = location.pathname.startsWith("/analysis");
  const isExpensesActive = location.pathname.startsWith("/dashboard");

  const baseBtn =
    "flex items-center px-4 py-3 rounded-md justify-start transition-colors";
  const activeClasses = "bg-purple-600 text-white hover:bg-purple-700";
  const inactiveClasses =
    "text-gray-700 hover:bg-accent hover:text-accent-foreground";

  return (
    <div
      className={`fixed left-0 top-0 h-full transition-all duration-300 ${
        expanded ? "w-72" : "w-24"
      } p-4 flex flex-col border-r border-gray-200 z-50`}
      style={{ backgroundColor: "#f3f4f6" }}
    >
      <div className="flex items-center mb-4">
        <img src={logo} alt="Logo" className="h-8 w-10" />
        {expanded && (
          <span className="ml-6 text-xl font-bold text-gray-800">
            Budget Tracker
          </span>
        )}
      </div>
      <div className="border-b border-gray-200 mb-6 -mx-4"></div>
      <div className="flex flex-col space-y-2">
        <Button
          variant="ghost"
          className={`${baseBtn} ${
            isAnalysisActive ? activeClasses : inactiveClasses
          }`}
          onClick={() => navigate("/analysis")}
        >
          <img
            src={analysisIcon}
            alt="Analysis"
            className="h-6 w-6 shrink-0 object-contain"
          />
          {expanded && <span className="ml-3">Analysis</span>}
        </Button>
        <Button
          variant="ghost"
          className={`${baseBtn} ${
            isExpensesActive ? activeClasses : inactiveClasses
          }`}
          onClick={() => navigate("/dashboard")}
        >
          {/* Scale up to compensate for transparent padding in the PNG */}
          <img
            src={expensesIcon}
            alt="Expenses"
            className="h-6 w-6 shrink-0 object-contain origin-center scale-[2.3]"
          />
          {expanded && <span className="ml-3">Expenses</span>}
        </Button>
        <Button
          variant="ghost"
          className={`${baseBtn} ${inactiveClasses}`}
          onClick={onLogout}
        >
          <img
            src={logoutIcon}
            alt="Logout"
            className="h-6 w-6 shrink-0 object-contain"
          />
          {expanded && <span className="ml-3">Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
