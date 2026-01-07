import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type {
  AuthResponse,
  LoginData,
  RegisterData,
  BooksResponse,
  BookResponse,
  CreateBookResponse,
  ApiError,
} from '../types';
import { sanitizeErrorMessage } from '../utils/validation';
import { logger } from '../utils/logger';
import config from '../config';

// ============================================================================
// Configuration
// ============================================================================

const API_BASE_URL = config.api.baseUrl;
const TOKEN_KEY = config.auth.tokenKey;
const REQUEST_TIMEOUT = config.api.timeout;

// ============================================================================
// Token Management
// ============================================================================

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
    logger.error('Failed to remove token:', error);
  }
};

// ============================================================================
// Axios Instance Configuration
// ============================================================================

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// Request Interceptor - Add Auth Token
// ============================================================================

apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData (browser will set it with boundary)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================================
// Response Interceptor - Handle Errors
// ============================================================================

apiClient.interceptors.response.use(
  (response) => {
    // Success response - return data directly
    return response;
  },
  (error: AxiosError) => {
    // Handle different error scenarios
    const apiError: ApiError = {
      message: 'An error occurred',
      status: 0,
    };

    if (error.response) {
      // Server responded with error status
      apiError.status = error.response.status;

      // Extract error message from response and ALWAYS sanitize
      const errorData = error.response.data as { message?: string };
      const rawMessage = errorData?.message || error.message || 'An error occurred';
      apiError.message = sanitizeErrorMessage(new Error(rawMessage));

      // Handle 401 Unauthorized - token expired
      if (error.response.status === 401) {
        removeToken();
        apiError.message = 'Your session has expired. Please log in again.';

        // Optionally redirect to login
        // window.location.href = '/login';
      }
    } else if (error.request) {
      // Request made but no response received
      apiError.message = 'Unable to connect to the server. Please check your internet connection.';
      apiError.status = 0;
    } else if (error.code === 'ECONNABORTED') {
      // Request timeout
      apiError.message = 'Request timed out. Please try again.';
      apiError.status = 408;
    } else {
      // Something else happened
      apiError.message = error.message || 'An unexpected error occurred';
    }

    // Sanitize error message for security
    apiError.message = sanitizeErrorMessage(new Error(apiError.message));

    return Promise.reject(apiError);
  }
);

// ============================================================================
// Auth API
// ============================================================================

export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/users/register', data);
    return response.data;
  },

  /**
   * Login user
   */
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/users/login', data);
    return response.data;
  },
};

// ============================================================================
// Books API
// ============================================================================

export const booksApi = {
  /**
   * Get all books with pagination
   */
  getAll: async (page: number = 1, authorId?: string): Promise<BooksResponse> => {
    // Validate page number
    const validPage = Math.max(1, Math.floor(page));

    const params: Record<string, string> = {
      page: validPage.toString(),
    };

    if (authorId) {
      params.author = authorId;
    }

    const response = await apiClient.get<BooksResponse>('/books', { params });
    return response.data;
  },

  /**
   * Get a single book by ID
   */
  getById: async (bookId: string): Promise<BookResponse> => {
    // Validate bookId format (basic MongoDB ObjectId check)
    if (!/^[a-fA-F0-9]{24}$/.test(bookId)) {
      throw {
        message: 'Invalid book ID format',
        status: 400,
      } as ApiError;
    }

    const response = await apiClient.get<BookResponse>(`/books/id/${bookId}`);
    return response.data;
  },

  /**
   * Create a new book (upload)
   */
  create: async (formData: FormData): Promise<CreateBookResponse> => {
    const response = await apiClient.post<CreateBookResponse>('/books/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      // Track upload progress if needed
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.debug(`Upload progress: ${percentCompleted}%`);
        }
      },
    });
    return response.data;
  },

  /**
   * Update an existing book
   */
  update: async (bookId: string, formData: FormData): Promise<BookResponse> => {
    // Validate bookId format
    if (!/^[a-fA-F0-9]{24}$/.test(bookId)) {
      throw {
        message: 'Invalid book ID format',
        status: 400,
      } as ApiError;
    }

    const response = await apiClient.patch<BookResponse>(`/books/update/${bookId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Delete a book
   */
  delete: async (bookId: string): Promise<void> => {
    // Validate bookId format
    if (!/^[a-fA-F0-9]{24}$/.test(bookId)) {
      throw {
        message: 'Invalid book ID format',
        status: 400,
      } as ApiError;
    }

    await apiClient.delete(`/books/${bookId}`);
  },
};

// ============================================================================
// Export axios instance for advanced usage
// ============================================================================

export default apiClient;
