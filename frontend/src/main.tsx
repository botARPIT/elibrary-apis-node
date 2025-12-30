import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from './components/ErrorBoundary'
import './index.css'
import App from './App.tsx'

// Validate required environment variables
const validateEnv = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  
  // In production, API URL must be set
  if (import.meta.env.PROD && !apiUrl) {
    console.error('VITE_API_URL environment variable is not set');
  }
  
  // Warn in development if using default
  if (import.meta.env.DEV && !apiUrl) {
    console.warn('VITE_API_URL not set, using default localhost:5513');
  }
};

validateEnv();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
