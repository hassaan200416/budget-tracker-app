import React from "react";
import { Dialog } from "@headlessui/react";

interface ConfirmLogoutModalProps {
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmLogoutModal: React.FC<ConfirmLogoutModalProps> = ({
  onCancel,
  onConfirm,
}) => {
  return (
    <Dialog
      open={true}
      onClose={onCancel}
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
      <Dialog.Panel className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <Dialog.Title className="text-lg font-semibold mb-4">
          Confirm Logout
        </Dialog.Title>
        <p className="mb-6 text-sm text-gray-700">
          Are you sure you want to logout?
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
          >
            Yes
          </button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};

export default ConfirmLogoutModal;
