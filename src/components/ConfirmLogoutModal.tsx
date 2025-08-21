// Confirm logout dialog: prompts before clearing auth and navigating away.
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface ConfirmLogoutModalProps {
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmLogoutModal: React.FC<ConfirmLogoutModalProps> = ({
  onCancel,
  onConfirm,
}) => {
  return (
    <AlertDialog
      open={true}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to logout? You will need to sign in again to
            access your account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex justify-between">
          <AlertDialogCancel onClick={onCancel} className="flex-1 mr-2">
            Cancel
          </AlertDialogCancel>
          <Button
            onClick={() => {
              onConfirm();
            }}
            className="flex-1"
          >
            Logout
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmLogoutModal;
