/**
 * Safe logging utility that only logs in development
 * Prevents sensitive information leaks in production
 */

const isDev = import.meta.env.DEV;

export const logger = {
    /**
     * Log error messages - only in development
     */
    error: (...args: unknown[]): void => {
        if (isDev) {
            console.error(...args);
        }
    },

    /**
     * Log warning messages - only in development
     */
    warn: (...args: unknown[]): void => {
        if (isDev) {
            console.warn(...args);
        }
    },

    /**
     * Log info messages - only in development
     */
    info: (...args: unknown[]): void => {
        if (isDev) {
            console.log(...args);
        }
    },

    /**
     * Log debug messages - only in development
     */
    debug: (...args: unknown[]): void => {
        if (isDev) {
            console.debug(...args);
        }
    },
};

/**
 * Track errors to external service (Sentry, etc.)
 * Only in production
 */
export const trackError = (error: Error, context?: Record<string, unknown>): void => {
    if (!isDev) {
        // In production, you would send to error tracking service
        // Example: Sentry.captureException(error, { extra: context });

        // For now, we silently fail
        // When you integrate Sentry/similar:
        // import * as Sentry from '@sentry/browser';
        // Sentry.captureException(error, { extra: context });
    } else {
        // In development, log to console
        console.error('Error tracked:', error, context);
    }
};
