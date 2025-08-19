// src/components/ExpenseTable.tsx
import React from "react";
import editIcon from "../assets/images/hamburger-edit.png";
import deleteIcon from "../assets/images/hamburger-delete.png";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Structure for expense data displayed in the table
interface Expense {
  id: string;
  title: string;
  price: number;
  date: string;
  user: string;
}

// Props that the component receives from its parent
interface ExpenseTableProps {
  expenses: Expense[]; // Array of expenses to display
  budgetLimit: number; // User's total budget limit
  onEdit: (exp: Expense) => void; // Function called when edit button is clicked
  onDelete: (exp: Expense) => void; // Function called when delete button is clicked
}

const ExpenseTable: React.FC<ExpenseTableProps> = ({
  expenses,
  budgetLimit,
  onEdit,
  onDelete,
}) => {
  return (
    <Table>
      {/* Table header with column names */}
      <TableHeader>
        <TableRow>
          <TableHead className="font-bold w-1/5">Expense</TableHead>
          <TableHead className="font-bold w-1/3">Total Expenditure</TableHead>
          <TableHead className="font-bold w-1/6">Price(PKR)</TableHead>
          <TableHead className="font-bold w-1/6">Date</TableHead>
          <TableHead className="font-bold w-1/6">User</TableHead>
          <TableHead className="font-bold w-24">Actions</TableHead>
        </TableRow>
      </TableHeader>

      {/* Table body with expense data */}
      <TableBody>
        {expenses.map((exp) => (
          <TableRow key={exp.id}>
            <TableCell>{exp.title}</TableCell>

            {/* Visual progress bar showing expense percentage of budget */}
            <TableCell>
              <div className="flex items-center space-x-3">
                {/* Background bar for the progress indicator */}
                <div className="w-40 bg-blue-100 rounded-full h-2">
                  {/* Purple progress bar - width calculated as percentage of budget */}
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        100,
                        (exp.price / budgetLimit) * 100
                      )}%`,
                    }}
                  ></div>
                </div>

                {/* Percentage text showing expense relative to budget */}
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  {((exp.price / budgetLimit) * 100).toFixed(0)}%
                </span>
              </div>
            </TableCell>

            {/* Display price with proper formatting */}
            <TableCell>{exp.price.toLocaleString()}</TableCell>
            <TableCell>{exp.date}</TableCell>
            <TableCell>{exp.user}</TableCell>

            {/* Action buttons for edit and delete */}
            <TableCell>
              <div className="flex space-x-2">
                {/* Edit button - calls onEdit function when clicked */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(exp)}
                  className="h-8 w-8 p-0 hover:bg-purple-100"
                >
                  <img src={editIcon} alt="Edit" className="h-4 w-4" />
                </Button>

                {/* Delete button - calls onDelete function when clicked */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(exp)}
                  className="h-8 w-8 p-0 hover:bg-red-100"
                >
                  <img src={deleteIcon} alt="Delete" className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ExpenseTable;
