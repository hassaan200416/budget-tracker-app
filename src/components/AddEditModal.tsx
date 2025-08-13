// src/components/AddEditModal.tsx
import React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
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

interface FormData {
  title: string;
  price: number;
  date: string;
}

interface AddEditModalProps {
  mode: "add" | "edit";
  initialData: Expense | null;
  onSubmit: (data: FormData) => void;
  onClose: () => void;
}

const AddEditModal: React.FC<AddEditModalProps> = ({
  mode,
  initialData,
  onSubmit,
  onClose,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    defaultValues: initialData
      ? {
          title: initialData.title,
          price: initialData.price,
          date: initialData.date,
        }
      : undefined,
  });

  const submit: SubmitHandler<FormData> = (data) => onSubmit(data);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add Expense" : "Edit Expense"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)}>
          <input
            {...register("title", { required: true })}
            placeholder="Title"
            className="border border-gray-200 rounded p-2 mb-4 w-full focus:outline-none focus:border-purple-500"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mb-2">Title is required</p>
          )}
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="number"
                {...register("price", { required: true, min: 0 })}
                placeholder="Price(PKR)"
                className="border border-gray-200 rounded p-2 mb-4 w-full focus:outline-none focus:border-purple-500"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mb-2">
                  Price is required and must be positive
                </p>
              )}
            </div>
            <div className="flex-1">
              <input
                type="date"
                {...register("date", { required: true })}
                className="border border-gray-200 rounded p-2 mb-4 w-full focus:outline-none focus:border-purple-500"
              />
              {errors.date && (
                <p className="text-red-500 text-sm mb-2">Date is required</p>
              )}
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className={`px-4 py-2 rounded-md ${
                isValid
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {mode === "add" ? "Add" : "Save Changes"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditModal;
