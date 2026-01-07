import { useState, useCallback, useRef } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface UseToastReturn {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType) => void;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
}

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const hideToast = useCallback((id: string) => {
    // Clear any existing timeout
    const existingTimeout = timeoutsRef.current.get(id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      timeoutsRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = Date.now().toString();
      const toast: Toast = { id, message, type };

      setToasts((prev) => [...prev, toast]);

      // Auto-hide after 5 seconds
      const timeout = setTimeout(() => {
        hideToast(id);
      }, 5000);

      timeoutsRef.current.set(id, timeout);
    },
    [hideToast]
  );

  const clearAllToasts = useCallback(() => {
    // Clear all timeouts
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    timeoutsRef.current.clear();
    setToasts([]);
  }, []);

  return {
    toasts,
    showToast,
    hideToast,
    clearAllToasts,
  };
}
