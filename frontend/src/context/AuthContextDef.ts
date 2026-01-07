import { createContext } from 'react';
import type { LoginData, RegisterData } from '../types';

// Auth context type definition
export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  login: (data: LoginData, remember?: boolean) => Promise<void>;
  register: (data: RegisterData, remember?: boolean) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

// Create and export the context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
