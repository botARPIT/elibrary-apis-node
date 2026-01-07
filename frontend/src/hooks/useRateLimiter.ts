import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook for debouncing function calls
 * Useful for rate-limiting form submissions and API calls
 */
export function useDebounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

/**
 * Custom hook for rate limiting submissions
 * Prevents rapid form submissions with cooldown period
 */
export function useRateLimiter(cooldownMs: number = 2000) {
  const [isLimited, setIsLimited] = useState(false);
  const lastSubmitRef = useRef<number>(0);

  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    if (now - lastSubmitRef.current < cooldownMs) {
      return false;
    }
    lastSubmitRef.current = now;
    setIsLimited(true);
    setTimeout(() => setIsLimited(false), cooldownMs);
    return true;
  }, [cooldownMs]);

  const resetLimit = useCallback(() => {
    setIsLimited(false);
    lastSubmitRef.current = 0;
  }, []);

  return { isLimited, checkRateLimit, resetLimit };
}

/**
 * Custom hook for tracking submission state with rate limiting
 */
export function useSubmitHandler<T>(
  submitFn: () => Promise<T>,
  options: {
    onSuccess?: (result: T) => void;
    onError?: (error: Error) => void;
    cooldownMs?: number;
  } = {}
) {
  const { onSuccess, onError, cooldownMs = 2000 } = options;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isLimited, checkRateLimit } = useRateLimiter(cooldownMs);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting || isLimited) {
      return;
    }

    if (!checkRateLimit()) {
      setError('Please wait before submitting again');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await submitFn();
      onSuccess?.(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsSubmitting(false);
    }
  }, [submitFn, onSuccess, onError, isSubmitting, isLimited, checkRateLimit]);

  const clearError = useCallback(() => setError(null), []);

  return { isSubmitting, error, handleSubmit, clearError, isLimited };
}
