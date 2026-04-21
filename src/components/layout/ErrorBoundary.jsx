import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('PadelPro Error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-base flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <div className="text-8xl font-bold text-danger/20 font-display mb-6 select-none">!</div>
            <h2 className="text-3xl font-bold font-display mb-4">Something went wrong</h2>
            <p className="text-text-secondary mb-2 text-sm font-mono bg-bg-elevated px-4 py-2 rounded-lg border border-border">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <p className="text-text-muted text-sm mt-4 mb-8">Try refreshing the page. If the problem persists, contact support.</p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-8 py-3 bg-accent-orange text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
