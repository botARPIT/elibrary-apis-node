import { useState, useEffect, useCallback, useRef, useContext, type ReactNode } from 'react';
import { authApi, getToken, setToken, removeToken } from '../services/api';
import { isTokenExpired, getUserIdFromToken, getTokenTimeRemaining } from '../utils/token';
import { sanitizeErrorMessage } from '../utils/validation';
import { AuthContext, type AuthContextType } from './AuthContextDef';
import type { LoginData, RegisterData, ApiError } from '../types';

// Token refresh interval - check every minute
const TOKEN_CHECK_INTERVAL = 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const tokenCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Check token validity and handle expiration
    const checkTokenValidity = useCallback(() => {
        const token = getToken();
        
        if (!token) {
            setIsAuthenticated(false);
            setUserId(null);
            return false;
        }

        // Check if token is expired
        if (isTokenExpired(token)) {
            console.warn('Token expired, logging out');
            removeToken();
            setIsAuthenticated(false);
            setUserId(null);
            return false;
        }

        // Token is valid
        const extractedUserId = getUserIdFromToken(token);
        setUserId(extractedUserId);
        setIsAuthenticated(true);

        // Log remaining time in development
        if (import.meta.env.DEV) {
            const remaining = getTokenTimeRemaining(token);
            const minutes = Math.floor(remaining / 60000);
            console.debug(`Token valid, expires in ${minutes} minutes`);
        }

        return true;
    }, []);

    // Set up token expiration checking
    useEffect(() => {
        // Initial check
        checkTokenValidity();
        setIsLoading(false);

        // Set up periodic checking
        tokenCheckIntervalRef.current = setInterval(() => {
            checkTokenValidity();
        }, TOKEN_CHECK_INTERVAL);

        return () => {
            if (tokenCheckIntervalRef.current) {
                clearInterval(tokenCheckIntervalRef.current);
            }
        };
    }, [checkTokenValidity]);

    // Handle storage events (logout from other tabs)
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'elibrary_access_token') {
                checkTokenValidity();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [checkTokenValidity]);

    const login = useCallback(async (data: LoginData, remember: boolean = false) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await authApi.login(data);
            setToken(response.accessToken, remember);
            setIsAuthenticated(true);
            
            // Extract user ID from token (for UX purposes only)
            const extractedUserId = getUserIdFromToken(response.accessToken);
            setUserId(extractedUserId);
        } catch (err) {
            const apiError = err as ApiError;
            const message = sanitizeErrorMessage(new Error(apiError.message));
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const register = useCallback(async (data: RegisterData, remember: boolean = false) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await authApi.register(data);
            setToken(response.accessToken, remember);
            setIsAuthenticated(true);
            setUserId(response.id || null);
        } catch (err) {
            const apiError = err as ApiError;
            const message = sanitizeErrorMessage(new Error(apiError.message));
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        removeToken();
        setIsAuthenticated(false);
        setUserId(null);
        setError(null);
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                isLoading,
                userId,
                login,
                register,
                logout,
                error,
                clearError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
// Custom hook to use auth context
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
