import { useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { useNotifications } from './NotificationProvider';
import { AppError } from '../../types';

/**
 * Error Notifications component that displays app errors as notifications
 */
export function ErrorNotifications() {
  const { errors, removeError } = useAppStore();
  const { addNotification } = useNotifications();

  // Convert errors to notifications
  useEffect(() => {
    if (errors.length > 0) {
      errors.forEach((error: AppError) => {
        // Create notification from error
        addNotification({
          type: 'error',
          title: `${error.type.charAt(0).toUpperCase() + error.type.slice(1)} Error`,
          message: error.message,
          duration: 8000,
          persistent: false
        });

        // Clear the error after showing notification
        removeError(error.id);
      });
    }
  }, [errors, addNotification, removeError]);

  return null; // This component doesn't render anything directly
}