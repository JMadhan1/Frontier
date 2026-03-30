/**
 * Frontier Trade Hub - Toast Notification Hook
 * 
 * Custom hook for managing toast notifications
 */

import { useState, useCallback } from 'react';
import { ToastNotification } from '@/types';

/**
 * Hook for managing toast notifications
 */
export function useToast() {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  /**
   * Add a new toast notification
   */
  const addToast = useCallback((toast: Omit<ToastNotification, 'id'>): string => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastNotification = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  /**
   * Remove a toast by ID
   */
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  /**
   * Clear all toasts
   */
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  /**
   * Convenience methods for different toast types
   */
  const toast = {
    success: (title: string, message?: string) => 
      addToast({ type: 'success', title, message }),
    error: (title: string, message?: string) => 
      addToast({ type: 'error', title, message }),
    info: (title: string, message?: string) => 
      addToast({ type: 'info', title, message }),
    warning: (title: string, message?: string) => 
      addToast({ type: 'warning', title, message }),
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    toast,
  };
}

export default useToast;