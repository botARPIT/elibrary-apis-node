import type {
    AuthResponse,
    LoginData,
    RegisterData,
    BooksResponse,
    BookResponse,
    CreateBookResponse,
    ApiError
} from '../types';
import { sanitizeErrorMessage } from '../utils/validation';

// Validate and get API URL
const getApiBaseUrl = (): string => {
    const url = import.meta.env.VITE_API_URL;
    if (url) {
        return url;
    }

    // Development fallback
    if (import.meta.env.DEV) {
        return 'http://localhost:5513/api';
    }

    // Production should always have this set
    console.error('VITE_API_URL is not configured');
    return '/api'; // Relative URL as last resort
};

const API_BASE_URL = getApiBaseUrl();

// Token management with secure storage
const TOKEN_KEY = 'elibrary_access_token';

export const getToken = (): string | null => {
    try {
        return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
};

export const setToken = (token: string, remember: boolean = false): void => {
    try {
        // Clear both storages first to prevent duplicates
        localStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(TOKEN_KEY);

        if (remember) {
            localStorage.setItem(TOKEN_KEY, token);
        } else {
            sessionStorage.setItem(TOKEN_KEY, token);
        }
    } catch (error) {
        console.error('Failed to store token:', error);
    }
};

export const removeToken = (): void => {
    try {
        localStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(TOKEN_KEY);
    } catch (error) {
        console.error('Failed to remove token:', error);
    }
};

// Request timeout configuration
const REQUEST_TIMEOUT = 30000; // 30 seconds

// API request helper with security headers and timeout
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken();

    const headers: HeadersInit = {
        ...options.headers,
    };

    // Don't set Content-Type for FormData (browser will set it with boundary)
    if (!(options.body instanceof FormData)) {
        (headers as Record<string, string>)['Content-Type'] = 'application/json';
    }

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
            credentials: 'same-origin',
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            let errorMessage = 'An error occurred';
            const errorStatus = response.status;

            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch {
                errorMessage = response.statusText || errorMessage;
            }

            // Handle specific status codes
            if (errorStatus === 401) {
                // Token might be expired or invalid
                removeToken();
                errorMessage = 'Your session has expired. Please log in again.';
            }

            const error: ApiError = {
                message: sanitizeErrorMessage(new Error(errorMessage)),
                status: errorStatus,
            };
            throw error;
        }

        // Handle 204 No Content
        if (response.status === 204) {
            return {} as T;
        }

        return response.json();
    } catch (error) {
        clearTimeout(timeoutId);

        // Handle abort/timeout
        if (error instanceof Error && error.name === 'AbortError') {
            const apiError: ApiError = {
                message: 'Request timed out. Please try again.',
                status: 408,
            };
            throw apiError;
        }

        // Handle network errors
        if (error instanceof TypeError && error.message.includes('fetch')) {
            const apiError: ApiError = {
                message: 'Unable to connect to the server. Please check your internet connection.',
                status: 0,
            };
            throw apiError;
        }

        throw error;
    }
}

// Auth API
export const authApi = {
    register: async (data: RegisterData): Promise<AuthResponse> => {
        return apiRequest<AuthResponse>('/users/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    login: async (data: LoginData): Promise<AuthResponse> => {
        return apiRequest<AuthResponse>('/users/login', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
};

// Books API
export const booksApi = {
    getAll: async (page: number = 1, authorId?: string): Promise<BooksResponse> => {
        // Validate page number
        const validPage = Math.max(1, Math.floor(page));
        const queryParams = new URLSearchParams({ page: validPage.toString() });
        if (authorId) {
            queryParams.append('author', authorId);
        }
        return apiRequest<BooksResponse>(`/books?${queryParams.toString()}`);
    },

    getById: async (bookId: string): Promise<BookResponse> => {
        // Validate bookId format (basic MongoDB ObjectId check)
        if (!/^[a-fA-F0-9]{24}$/.test(bookId)) {
            throw { message: 'Invalid book ID format', status: 400 } as ApiError;
        }
        return apiRequest<BookResponse>(`/books/id/${bookId}`);
    },

    create: async (formData: FormData): Promise<CreateBookResponse> => {
        return apiRequest<CreateBookResponse>('/books', {
            method: 'POST',
            body: formData,
        });
    },

    update: async (bookId: string, formData: FormData): Promise<BookResponse> => {
        // Validate bookId format
        if (!/^[a-fA-F0-9]{24}$/.test(bookId)) {
            throw { message: 'Invalid book ID format', status: 400 } as ApiError;
        }
        return apiRequest<BookResponse>(`/books/update/${bookId}`, {
            method: 'PATCH',
            body: formData,
        });
    },

    delete: async (bookId: string): Promise<void> => {
        // Validate bookId format
        if (!/^[a-fA-F0-9]{24}$/.test(bookId)) {
            throw { message: 'Invalid book ID format', status: 400 } as ApiError;
        }
        return apiRequest<void>(`/books/${bookId}`, {
            method: 'DELETE',
        });
    },
};
