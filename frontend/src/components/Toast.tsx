import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number; // Auto-dismiss duration in ms
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const colors = {
  success: 'var(--color-success-500)',
  error: 'var(--color-error-500)',
  info: 'var(--color-primary-500)',
};

const ariaRoles = {
  success: 'status',
  error: 'alert',
  info: 'status',
} as const;

export function Toast({ message, type = 'info', isVisible, onClose, duration = 5000 }: ToastProps) {
  const Icon = icons[type];

  // Auto-dismiss
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`toast toast-${type}`}
          role={ariaRoles[type]}
          aria-live={type === 'error' ? 'assertive' : 'polite'}
          aria-atomic="true"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <Icon size={20} style={{ color: colors[type] }} aria-hidden="true" />
          <span style={{ flex: 1, marginRight: 'var(--space-4)' }}>{message}</span>
          <button
            onClick={onClose}
            className="btn-icon btn-ghost"
            style={{ width: '1.5rem', height: '1.5rem' }}
            aria-label="Dismiss notification"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
