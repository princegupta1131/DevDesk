import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

/**
 * Production-grade Error Boundary to catch React render errors.
 * 
 * Prevents white screen of death and provides graceful fallback UI.
 * In production, logs errors to console for monitoring integration.
 * 
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * ```
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(_error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error details for debugging
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        this.setState({
            error,
            errorInfo,
        });

        // TODO: Send to error monitoring service (Sentry, Rollbar, etc.)
        // if (import.meta.env.PROD) {
        //   logErrorToService(error, errorInfo);
        // }
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback(this.state.error!, this.handleReset);
            }

            // Default fallback UI
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
                    <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-red-100">
                        {/* Error Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>
                        </div>

                        {/* Error Message */}
                        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                            Oops! Something went wrong
                        </h2>
                        <p className="text-gray-600 text-center mb-6">
                            The application encountered an unexpected error. Don't worry, your data is safe.
                        </p>

                        {/* Error Details (Dev Only) */}
                        {import.meta.env.DEV && this.state.error && (
                            <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-200">
                                <p className="text-xs font-mono text-red-900 break-words">
                                    {this.state.error.toString()}
                                </p>
                                {this.state.errorInfo && (
                                    <details className="mt-2">
                                        <summary className="text-xs text-red-700 cursor-pointer hover:text-red-900">
                                            Stack Trace
                                        </summary>
                                        <pre className="mt-2 text-[10px] text-red-800 overflow-auto max-h-32">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={this.handleReset}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Try Again
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                            >
                                <Home className="w-4 h-4" />
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

export default ErrorBoundary;
