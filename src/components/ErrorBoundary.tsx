import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-dark-primary">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-lg shadow-dark-lg max-w-md w-full">
            <div className="flex items-center justify-center w-16 h-16 bg-status-error/20 border border-status-error/30 rounded-full mx-auto mb-4">
              <svg className="w-8 h-8 text-status-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white text-center mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-zinc-300 text-center mb-6">
              We encountered an unexpected error. Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-accent-blue text-white py-2 px-4 rounded-lg hover:bg-accent-blue/80 transition-colors-shadow duration-200"
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 p-4 bg-zinc-800 border border-zinc-700 rounded-lg">
                <summary className="cursor-pointer text-sm text-zinc-300 font-medium">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 text-xs text-status-error overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;