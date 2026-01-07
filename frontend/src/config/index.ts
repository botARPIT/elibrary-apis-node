/**
 * Application Configuration
 *
 * This module provides a centralized, type-safe configuration system for the application.
 * All environment variables and runtime configuration should be accessed through this module.
 *
 * Environment Variables:
 * - VITE_API_URL: Backend API base URL (optional, defaults to proxy in dev)
 * - VITE_APP_NAME: Application name
 * - VITE_APP_VERSION: Application version
 * - VITE_ENABLE_ANALYTICS: Enable analytics tracking
 * - VITE_LOG_LEVEL: Logging level (debug, info, warn, error)
 *
 * @module config
 */

// ============================================================================
// Environment Variable Helpers
// ============================================================================

/**
 * Safely get an environment variable with type safety
 */
function getEnvVar(key: string, defaultValue?: string): string {
  const value = import.meta.env[key];
  if (value === undefined && defaultValue === undefined) {
    console.warn(`Environment variable ${key} is not defined and has no default value`);
    return '';
  }
  return value ?? defaultValue ?? '';
}

/**
 * Get a required environment variable or throw an error
 */
function getRequiredEnvVar(key: string): string {
  const value = import.meta.env[key];
  if (value === undefined || value === '') {
    throw new Error(`Required environment variable ${key} is not defined`);
  }
  return value;
}

/**
 * Get a boolean environment variable
 */
function getBooleanEnvVar(key: string, defaultValue = false): boolean {
  const value = import.meta.env[key];
  if (value === undefined) {
    return defaultValue;
  }
  return value === 'true' || value === '1' || value === 'yes';
}

/**
 * Get a number environment variable
 */
function getNumberEnvVar(key: string, defaultValue: number): number {
  const value = import.meta.env[key];
  if (value === undefined) {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

// ============================================================================
// Configuration Object
// ============================================================================

/**
 * Application configuration
 * All configuration values should be accessed through this object
 */
export const config = {
  /**
   * Application metadata
   */
  app: {
    name: getEnvVar('VITE_APP_NAME', 'E-Library'),
    version: getEnvVar('VITE_APP_VERSION', '1.0.0'),
    description: getEnvVar('VITE_APP_DESCRIPTION', 'Digital Library Management System'),
  },

  /**
   * API configuration
   */
  api: {
    /**
     * Base URL for API requests
     * In development, defaults to '/api' to use Vite proxy
     * In production, should be set via VITE_API_URL environment variable
     */
    baseUrl: getEnvVar('VITE_API_URL', '/api'),

    /**
     * Request timeout in milliseconds
     */
    timeout: getNumberEnvVar('VITE_API_TIMEOUT', 30000),

    /**
     * Retry configuration
     */
    retry: {
      maxRetries: getNumberEnvVar('VITE_API_MAX_RETRIES', 3),
      retryDelay: getNumberEnvVar('VITE_API_RETRY_DELAY', 1000),
    },
  },

  /**
   * Authentication configuration
   */
  auth: {
    /**
     * Local storage key for authentication token
     */
    tokenKey: getEnvVar('VITE_AUTH_TOKEN_KEY', 'elibrary_access_token'),

    /**
     * Token refresh interval in milliseconds
     */
    tokenCheckInterval: getNumberEnvVar('VITE_AUTH_TOKEN_CHECK_INTERVAL', 60000),

    /**
     * Token expiration buffer in seconds
     */
    tokenExpirationBuffer: getNumberEnvVar('VITE_AUTH_TOKEN_BUFFER', 60),
  },

  /**
   * Feature flags
   */
  features: {
    /**
     * Enable analytics tracking
     */
    analytics: getBooleanEnvVar('VITE_ENABLE_ANALYTICS', false),

    /**
     * Enable service worker for offline support
     */
    serviceWorker: getBooleanEnvVar('VITE_ENABLE_SERVICE_WORKER', false),

    /**
     * Enable debug mode
     */
    debug: getBooleanEnvVar('VITE_ENABLE_DEBUG', import.meta.env.DEV),
  },

  /**
   * Logging configuration
   */
  logging: {
    /**
     * Log level: 'debug' | 'info' | 'warn' | 'error'
     */
    level: getEnvVar('VITE_LOG_LEVEL', import.meta.env.DEV ? 'debug' : 'warn') as
      | 'debug'
      | 'info'
      | 'warn'
      | 'error',

    /**
     * Enable console logging
     */
    enabled: getBooleanEnvVar('VITE_ENABLE_LOGGING', true),
  },

  /**
   * Upload configuration
   */
  upload: {
    /**
     * Maximum file size in bytes (default: 10MB)
     */
    maxFileSize: getNumberEnvVar('VITE_MAX_FILE_SIZE', 10 * 1024 * 1024),

    /**
     * Maximum cover image size in bytes (default: 5MB)
     */
    maxCoverSize: getNumberEnvVar('VITE_MAX_COVER_SIZE', 5 * 1024 * 1024),

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
    defaultPageSize: getNumberEnvVar('VITE_PAGINATION_PAGE_SIZE', 10),

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

  // Log warnings for development
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
 */
export default config;

/**
 * Type-safe access to environment variables
 */
export const env = {
  get: getEnvVar,
  getRequired: getRequiredEnvVar,
  getBoolean: getBooleanEnvVar,
  getNumber: getNumberEnvVar,
};
