// src/components/AddEditModal.tsx
import React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                {...register("title", { required: true })}
                placeholder="Enter expense title"
                className="w-full"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">Title is required</p>
              )}
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="price">Price (PKR)</Label>
                <Input
                  id="price"
                  type="number"
                  {...register("price", { required: true, min: 0 })}
                  placeholder="Enter amount"
                  className="w-full"
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">
                    Price is required and must be positive
                  </p>
                )}
              </div>
              <div className="flex-1">
                <Label htmlFor="date">Date</Label>
                <div className="relative">
                  <Input
                    id="date"
                    type="date"
                    {...register("date", { required: true })}
                    className="w-full [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:top-1/2 [&::-webkit-calendar-picker-indicator]:transform [&::-webkit-calendar-picker-indicator]:-translate-y-1/2"
                  />
                </div>
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">Date is required</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6 flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 mr-2"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid} className="flex-1">
              {mode === "add" ? "Add" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditModal;
