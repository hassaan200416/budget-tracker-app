// src/components/DeleteModal.tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Define Expense interface here
interface Expense {
  id: string;
  title: string;
  price: number;
  date: string;
  user: string;
}

interface DeleteModalProps {
  expense: Expense;
  onDelete: () => void;
  onClose: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  expense,
  onDelete,
  onClose,
}) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Expense</DialogTitle>
        </DialogHeader>
        <p className="mb-2">Title: {expense.title}</p>
        <p className="mb-2">Price: {expense.price.toLocaleString()} PKR</p>
        <p className="mb-4">Date: {expense.date}</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteModal;
