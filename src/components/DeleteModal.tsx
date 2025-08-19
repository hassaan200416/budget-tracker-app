// src/components/DeleteModal.tsx
import React from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

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
    <AlertDialog open={true} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Expense</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this expense? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="bg-gray-50 p-4 rounded-md space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Title:</span>
            <span>{expense.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Price(PKR):</span>
            <span>{expense.price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Date:</span>
            <span>{expense.date}</span>
          </div>
        </div>
        <AlertDialogFooter className="flex justify-between">
          <AlertDialogCancel className="flex-1 mr-2">Cancel</AlertDialogCancel>
          <Button onClick={onDelete} variant="destructive" className="flex-1">
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteModal;
