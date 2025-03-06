
import React from 'react';
import { useToast } from "./use-toast";

// Create a context to access toast functionality
const NotificationContext = React.createContext(null);

// Provider component that wraps your app
export const NotificationProvider = ({ children }) => {
  const { toast } = useToast();

  const showNotification = ({ type, message }) => {
    const toastTypes = {
      success: {
        title: "Success",
        variant: "success",
        duration: 3000,
      },
      error: {
        title: "Error",
        variant: "destructive",
        duration: 5000,
      },
      warning: {
        title: "Warning",
        variant: "warning",
        duration: 4000,
      },
    };

    const { title, variant, duration } = toastTypes[type] || toastTypes.success;

    toast({
      title,
      description: message,
      variant,
      duration,
    });
  };

  return (
    <NotificationContext.Provider value={showNotification}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notifications
export const useNotification = () => {
  const context = React.useContext(NotificationContext);
  if (context === null) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};