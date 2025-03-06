// components/ConfirmationDialog.jsx
import React from 'react';
import ReactDOM from 'react-dom'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./dialog";
import { Button } from "./button";

const ConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm",
  cancelText = "Cancel" 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">{message}</div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button onClick={onConfirm}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Helper function to show the dialog
export const showConfirmationDialog = ({ title, message }) => {
  return new Promise((resolve) => {
    // Create a div to mount the dialog
    const mountPoint = document.createElement('div');
    document.body.appendChild(mountPoint);

    const cleanup = () => {
      document.body.removeChild(mountPoint);
    };

    const handleClose = () => {
      cleanup();
      resolve(false);
    };

    const handleConfirm = () => {
      cleanup();
      resolve(true);
    };

    // Render the dialog
    const dialog = (
      <ConfirmationDialog
        isOpen={true}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={title}
        message={message}
      />
    );

    ReactDOM.render(dialog, mountPoint);
  });
};