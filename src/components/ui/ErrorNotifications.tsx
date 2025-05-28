import React, { useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { useNotifications } from './NotificationProvider';
import { AppError } from '../../types';

/**
 * Error Notifications component that displays app errors as notifications
 */
export function ErrorNotifications() {
  const { errors, clearError } = useAppStore();
  const { addNotification } = useNotifications();

  // Convert errors to notifications
  useEffect(() => {
    if (errors.length > 0) {
      errors.forEach((error: AppError) => {
        // Create notification from error
        addNotification({
          type: 'error',
          title: error.title || 'Error Occurred',
          message: error.message,
          duration: error.persistent ? 0 : 8000,
          persistent: error.persistent || false
        });

        // Clear non-persistent errors after showing notification
        if (!error.persistent) {
          clearError(error.id);
        }
      });
    }
  }, [errors, addNotification, clearError]);

  return null; // This component doesn't render anything directly
}