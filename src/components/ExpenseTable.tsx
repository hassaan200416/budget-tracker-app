// src/components/ExpenseTable.tsx
import React from "react";
import editIcon from "../assets/images/hamburger-edit.png";
import deleteIcon from "../assets/images/hamburger-delete.png";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Define Expense interface here or import if defined in types/index.ts
interface Expense {
  id: string;
  title: string;
  price: number;
  date: string;
  user: string;
}

interface ExpenseTableProps {
  expenses: Expense[];
  budgetLimit: number;
  onEdit: (exp: Expense) => void;
  onDelete: (exp: Expense) => void;
}

const ExpenseTable: React.FC<ExpenseTableProps> = ({
  expenses,
  budgetLimit,
  onEdit,
  onDelete,
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Expense</TableHead>
          <TableHead>Total Expenditure</TableHead>
          <TableHead>Price(PKR)</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((exp) => {
          const percentage = Math.min(100, (exp.price / budgetLimit) * 100);
          return (
            <TableRow key={exp.id}>
              <TableCell>{exp.title}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2 w-48">
                  <Progress value={percentage} className="h-2" />
                  <span className="text-sm text-gray-600">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              </TableCell>
              <TableCell>{exp.price.toLocaleString()}</TableCell>
              <TableCell>{exp.date}</TableCell>
              <TableCell>{exp.user}</TableCell>
              <TableCell className="flex space-x-3">
                <img
                  src={editIcon}
                  alt="Edit"
                  className="h-5 cursor-pointer"
                  onClick={() => onEdit(exp)}
                />
                <img
                  src={deleteIcon}
                  alt="Delete"
                  className="h-5 cursor-pointer"
                  onClick={() => onDelete(exp)}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default ExpenseTable;
