import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Home, RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component to catch and handle React errors gracefully
 * Prevents the entire app from crashing due to component errors
 */
class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Log error to console in development
        console.error('Error Boundary caught an error:', error, errorInfo);
        
        this.setState({ errorInfo });
        
        // In production, you would send this to an error tracking service like Sentry
        // Example: Sentry.captureException(error, { extra: errorInfo });
    }

    handleReload = (): void => {
        window.location.reload();
    };

    handleGoHome = (): void => {
        window.location.href = '/';
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div
                    style={{
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem',
                        background: 'var(--color-background)',
                    }}
                >
                    <div
                        style={{
                            maxWidth: '500px',
                            textAlign: 'center',
                        }}
                    >
                        <div
                            style={{
                                width: '5rem',
                                height: '5rem',
                                margin: '0 auto 1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(239, 68, 68, 0.1)',
                                borderRadius: '50%',
                            }}
                        >
                            <AlertTriangle size={40} color="var(--color-error-500)" />
                        </div>

                        <h1
                            style={{
                                fontSize: '1.875rem',
                                fontWeight: 700,
                                marginBottom: '1rem',
                                color: 'var(--color-text-primary)',
                            }}
                        >
                            Something went wrong
                        </h1>

                        <p
                            style={{
                                color: 'var(--color-text-muted)',
                                marginBottom: '2rem',
                                lineHeight: 1.6,
                            }}
                        >
                            We're sorry, but something unexpected happened. Please try refreshing
                            the page or go back to the home page.
                        </p>

                        {/* Only show error details in development */}
                        {import.meta.env.DEV && this.state.error && (
                            <details
                                style={{
                                    textAlign: 'left',
                                    marginBottom: '2rem',
                                    padding: '1rem',
                                    background: 'var(--color-surface)',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid var(--color-border)',
                                }}
                            >
                                <summary
                                    style={{
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        marginBottom: '0.5rem',
                                    }}
                                >
                                    Error Details (Development Only)
                                </summary>
                                <pre
                                    style={{
                                        fontSize: '0.75rem',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                        color: 'var(--color-error-500)',
                                    }}
                                >
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}

                        <div
                            style={{
                                display: 'flex',
                                gap: '1rem',
                                justifyContent: 'center',
                                flexWrap: 'wrap',
                            }}
                        >
                            <button
                                onClick={this.handleReload}
                                className="btn btn-primary"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                }}
                            >
                                <RefreshCw size={18} />
                                Refresh Page
                            </button>
                            <button
                                onClick={this.handleGoHome}
                                className="btn btn-outline"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                }}
                            >
                                <Home size={18} />
                                Go Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export { ErrorBoundary };
