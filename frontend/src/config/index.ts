/**
 * Application Configuration
 *
 * This module provides a centralized, type-safe configuration system for the application.
 * All environment variables are accessed directly via import.meta.env for better compatibility
 * with deployment platforms like Vercel, Netlify, etc.
 *
 * Environment Variables (all must be prefixed with VITE_):
 * - VITE_API_URL: Backend API base URL (defaults to '/api' for Vite proxy in dev)
 * - VITE_APP_NAME: Application name
 * - VITE_APP_VERSION: Application version
 * - VITE_ENABLE_ANALYTICS: Enable analytics tracking
 * - VITE_ENABLE_DEBUG: Enable debug mode
 * - VITE_LOG_LEVEL: Logging level (debug, info, warn, error)
 *
 * @module config
 */

// ============================================================================
// Configuration Object
// ============================================================================

/**
 * Application configuration
 * All configuration values should be accessed through this object
 *
 * Example usage:
 * ```typescript
 * import config from '@/config';
 * const apiUrl = config.api.baseUrl;
 * ```
 */
export const config = {
  /**
   * Application metadata
   */
  app: {
    name: import.meta.env.VITE_APP_NAME || 'E-Library',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    description: import.meta.env.VITE_APP_DESCRIPTION || 'Digital Library Management System',
  },

  /**
   * API configuration
   */
  api: {
    /**
     * Base URL for API requests
     *
     * Development: Defaults to '/api' to use Vite proxy
     * Production: Set via VITE_API_URL environment variable
     *
     * Examples:
     * - Local dev: '/api' (proxied to localhost:3001)
     * - Production: 'https://api.elibrary.com'
     * - Staging: 'https://staging-api.elibrary.com'
     */
    baseUrl: import.meta.env.VITE_API_URL || '/api',

    /**
     * Request timeout in milliseconds
     */
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,

    /**
     * Retry configuration
     */
    retry: {
      maxRetries: Number(import.meta.env.VITE_API_MAX_RETRIES) || 3,
      retryDelay: Number(import.meta.env.VITE_API_RETRY_DELAY) || 1000,
    },
  },

  /**
   * Authentication configuration
   */
  auth: {
    /**
     * Local storage key for authentication token
     */
    tokenKey: import.meta.env.VITE_AUTH_TOKEN_KEY || 'elibrary_access_token',

    /**
     * Token refresh interval in milliseconds
     */
    tokenCheckInterval: Number(import.meta.env.VITE_AUTH_TOKEN_CHECK_INTERVAL) || 60000,

    /**
     * Token expiration buffer in seconds
     */
    tokenExpirationBuffer: Number(import.meta.env.VITE_AUTH_TOKEN_BUFFER) || 60,
  },

  /**
   * Feature flags
   */
  features: {
    /**
     * Enable analytics tracking
     */
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',

    /**
     * Enable service worker for offline support
     */
    serviceWorker: import.meta.env.VITE_ENABLE_SERVICE_WORKER === 'true',

    /**
     * Enable debug mode
     * Defaults to true in development, false in production
     */
    debug: import.meta.env.VITE_ENABLE_DEBUG === 'true' || import.meta.env.DEV,
  },

  /**
   * Logging configuration
   */
  logging: {
    /**
     * Log level: 'debug' | 'info' | 'warn' | 'error'
     */
    level: (import.meta.env.VITE_LOG_LEVEL || (import.meta.env.DEV ? 'debug' : 'warn')) as
      | 'debug'
      | 'info'
      | 'warn'
      | 'error',

    /**
     * Enable console logging
     */
    enabled: import.meta.env.VITE_ENABLE_LOGGING !== 'false',
  },

  /**
   * Upload configuration
   */
  upload: {
    /**
     * Maximum file size in bytes (default: 10MB)
     */
    maxFileSize: Number(import.meta.env.VITE_MAX_FILE_SIZE) || 10 * 1024 * 1024,

    /**
     * Maximum cover image size in bytes (default: 5MB)
     */
    maxCoverSize: Number(import.meta.env.VITE_MAX_COVER_SIZE) || 5 * 1024 * 1024,

    /**
     * Accepted file types for books
     */
    acceptedBookTypes: ['application/pdf'],

    /**
     * Accepted file types for cover images
     */
    acceptedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
  },

  /**
   * Pagination configuration
   */
  pagination: {
    /**
     * Default page size
     */
    defaultPageSize: Number(import.meta.env.VITE_PAGINATION_PAGE_SIZE) || 10,

    /**
     * Available page size options
     */
    pageSizeOptions: [10, 20, 50, 100],
  },

  /**
   * Environment information
   */
  env: {
    /**
     * Is development environment
     */
    isDev: import.meta.env.DEV,

    /**
     * Is production environment
     */
    isProd: import.meta.env.PROD,

    /**
     * Current mode
     */
    mode: import.meta.env.MODE,
  },
} as const;

// ============================================================================
// Configuration Validation
// ============================================================================

/**
 * Validate required configuration values
 * This should be called at app startup
 */
export function validateConfig(): void {
  const errors: string[] = [];

  // Validate API configuration
  if (!config.api.baseUrl) {
    errors.push('API base URL is not configured');
  }

  // Validate timeout values
  if (config.api.timeout <= 0) {
    errors.push('API timeout must be greater than 0');
  }

  // Validate retry configuration
  if (config.api.retry.maxRetries < 0) {
    errors.push('Max retries must be non-negative');
  }

  // Log configuration in development
  if (config.env.isDev) {
    // eslint-disable-next-line no-console
    console.group('🔧 Configuration');
    // eslint-disable-next-line no-console
    console.log('Environment:', config.env.mode);
    // eslint-disable-next-line no-console
    console.log('API URL:', config.api.baseUrl);
    // eslint-disable-next-line no-console
    console.log('Debug Mode:', config.features.debug);
    // eslint-disable-next-line no-console
    console.log('Log Level:', config.logging.level);
    // eslint-disable-next-line no-console
    console.groupEnd();
  }

  // Throw error if validation fails
  if (errors.length > 0) {
    throw new Error(
      `Configuration validation failed:\n${errors.map((e) => `  - ${e}`).join('\n')}`
    );
  }
}

// ============================================================================
// Exports
// ============================================================================

/**
 * Export configuration as default
 *
 * Usage:
 * ```typescript
 * import config from '@/config';
 * console.log(config.api.baseUrl);
 * ```
 */
export default config;
