/**
 * Application Constants
 * 
 * This module contains all constant values used throughout the application.
 * These values should not be configurable at runtime.
 * 
 * @module constants
 */

// ============================================================================
// API Constants
// ============================================================================

/**
 * API endpoint paths
 */
export const API_ENDPOINTS = {
    // Authentication
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        VERIFY: '/auth/verify',
    },

    // Books
    BOOKS: {
        LIST: '/books',
        CREATE: '/books',
        GET: (id: string) => `/books/${id}`,
        UPDATE: (id: string) => `/books/${id}`,
        DELETE: (id: string) => `/books/${id}`,
        DOWNLOAD: (id: string) => `/books/${id}/download`,
    },

    // Users
    USERS: {
        PROFILE: '/users/profile',
        UPDATE: '/users/profile',
        BOOKS: (id: string) => `/users/${id}/books`,
    },
} as const;

/**
 * HTTP methods
 */
export const HTTP_METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    PATCH: 'PATCH',
    DELETE: 'DELETE',
} as const;

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
} as const;

// ============================================================================
// Storage Keys
// ============================================================================

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'elibrary_access_token',
    REFRESH_TOKEN: 'elibrary_refresh_token',
    USER_PREFERENCES: 'elibrary_user_preferences',
    THEME: 'elibrary_theme',
    LANGUAGE: 'elibrary_language',
    RECENT_SEARCHES: 'elibrary_recent_searches',
} as const;

// ============================================================================
// Route Paths
// ============================================================================

/**
 * Application route paths
 */
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    BROWSE: '/browse',
    MY_BOOKS: '/my-books',
    UPLOAD: '/upload',
    BOOK_DETAIL: (id: string) => `/books/${id}`,
    EDIT_BOOK: (id: string) => `/books/${id}/edit`,
    NOT_FOUND: '/404',
} as const;

/**
 * Public routes (no authentication required)
 */
export const PUBLIC_ROUTES = [
    ROUTES.HOME,
    ROUTES.LOGIN,
    ROUTES.REGISTER,
    ROUTES.BROWSE,
] as const;

/**
 * Protected routes (authentication required)
 */
export const PROTECTED_ROUTES = [
    ROUTES.MY_BOOKS,
    ROUTES.UPLOAD,
] as const;

// ============================================================================
// Book Constants
// ============================================================================

/**
 * Book genres
 */
export const BOOK_GENRES = {
    MYTHOLOGICAL: 'Mythological',
    STORY: 'Story',
    SCIENCE: 'Science',
    HISTORY: 'History',
    FICTION: 'Fiction',
    SELF_HELP: 'Self-Help',
    BIOGRAPHY: 'Biography',
    NOVEL: 'Novel',
    POETRY: 'Poetry',
    DRAMA: 'Drama',
    OTHER: 'Other',
} as const;

/**
 * Array of book genres for display
 */
export const BOOK_GENRE_OPTIONS = Object.values(BOOK_GENRES);

/**
 * File upload constants
 */
export const UPLOAD = {
    /**
     * Maximum file size in bytes (10MB)
     */
    MAX_BOOK_FILE_SIZE: 10 * 1024 * 1024,

    /**
     * Maximum cover image size in bytes (5MB)
     */
    MAX_COVER_IMAGE_SIZE: 5 * 1024 * 1024,

    /**
     * Accepted MIME types for book files
     */
    ACCEPTED_BOOK_TYPES: ['application/pdf'],

    /**
     * Accepted MIME types for cover images
     */
    ACCEPTED_IMAGE_TYPES: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
    ],

    /**
     * File extensions for books
     */
    BOOK_EXTENSIONS: ['.pdf'],

    /**
     * File extensions for images
     */
    IMAGE_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
} as const;

// ============================================================================
// Validation Constants
// ============================================================================

/**
 * Validation rules
 */
export const VALIDATION = {
    /**
     * Email validation regex
     */
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

    /**
     * Password requirements
     */
    PASSWORD: {
        MIN_LENGTH: 8,
        MAX_LENGTH: 128,
        REQUIRE_UPPERCASE: true,
        REQUIRE_LOWERCASE: true,
        REQUIRE_NUMBER: true,
        REQUIRE_SPECIAL: false,
    },

    /**
     * Name requirements
     */
    NAME: {
        MIN_LENGTH: 2,
        MAX_LENGTH: 100,
    },

    /**
     * Book title requirements
     */
    BOOK_TITLE: {
        MIN_LENGTH: 1,
        MAX_LENGTH: 200,
    },
} as const;

// ============================================================================
// UI Constants
// ============================================================================

/**
 * Theme values
 */
export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system',
} as const;

/**
 * Animation durations in milliseconds
 */
export const ANIMATION = {
    FAST: 150,
    BASE: 250,
    SLOW: 350,
    BOUNCE: 500,
} as const;

/**
 * Debounce delays in milliseconds
 */
export const DEBOUNCE = {
    SEARCH: 300,
    INPUT: 500,
    RESIZE: 150,
    SCROLL: 100,
} as const;

/**
 * Toast notification durations in milliseconds
 */
export const TOAST = {
    SHORT: 2000,
    NORMAL: 3000,
    LONG: 5000,
} as const;

/**
 * Pagination constants
 */
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

/**
 * Breakpoints for responsive design (in pixels)
 */
export const BREAKPOINTS = {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536,
} as const;

// ============================================================================
// Error Messages
// ============================================================================

/**
 * Common error messages
 */
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    SERVER_ERROR: 'Server error. Please try again later.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    UPLOAD_ERROR: 'Failed to upload file. Please try again.',
    LOGIN_REQUIRED: 'Please login to continue.',
    INVALID_CREDENTIALS: 'Invalid email or password.',
    SESSION_EXPIRED: 'Your session has expired. Please login again.',
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: 'Login successful!',
    REGISTER_SUCCESS: 'Registration successful!',
    UPLOAD_SUCCESS: 'Book uploaded successfully!',
    UPDATE_SUCCESS: 'Book updated successfully!',
    DELETE_SUCCESS: 'Book deleted successfully!',
    LOGOUT_SUCCESS: 'Logged out successfully!',
} as const;

// ============================================================================
// Date and Time
// ============================================================================

/**
 * Date format strings
 */
export const DATE_FORMATS = {
    SHORT_DATE: 'MMM d, yyyy',
    LONG_DATE: 'MMMM d, yyyy',
    DATE_TIME: 'MMM d, yyyy h:mm a',
    ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
} as const;

/**
 * Relative time thresholds in milliseconds
 */
export const TIME = {
    SECOND: 1000,
    MINUTE: 60 * 1000,
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000,
    WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;

// ============================================================================
// Regex Patterns
// ============================================================================

/**
 * Common regex patterns
 */
export const REGEX = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    URL: /^https?:\/\/.+/,
    PHONE: /^\+?[1-9]\d{1,14}$/,
    ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
    ALPHA: /^[a-zA-Z]+$/,
    NUMERIC: /^[0-9]+$/,
} as const;

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if a value is a valid book genre
 */
export function isBookGenre(value: unknown): value is (typeof BOOK_GENRES)[keyof typeof BOOK_GENRES] {
    return typeof value === 'string' && Object.values(BOOK_GENRES).includes(value as any);
}

/**
 * Check if a value is a valid theme
 */
export function isTheme(value: unknown): value is (typeof THEMES)[keyof typeof THEMES] {
    return typeof value === 'string' && Object.values(THEMES).includes(value as any);
}

// ============================================================================
// Exports
// ============================================================================

export default {
    API_ENDPOINTS,
    HTTP_METHODS,
    HTTP_STATUS,
    STORAGE_KEYS,
    ROUTES,
    PUBLIC_ROUTES,
    PROTECTED_ROUTES,
    BOOK_GENRES,
    BOOK_GENRE_OPTIONS,
    UPLOAD,
    VALIDATION,
    THEMES,
    ANIMATION,
    DEBOUNCE,
    TOAST,
    PAGINATION,
    BREAKPOINTS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    DATE_FORMATS,
    TIME,
    REGEX,
};
