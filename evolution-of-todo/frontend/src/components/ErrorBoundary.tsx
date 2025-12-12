'use client';

import React, { ReactNode, Component, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 backdrop-blur-xl">
              <h1 className="text-2xl font-bold text-red-400 mb-2">
                ⚠️ Something went wrong
              </h1>
              <p className="text-slate-300 mb-4">
                An unexpected error occurred. Please try refreshing the page.
              </p>
              <div className="bg-slate-900/50 rounded p-3 mb-4 max-h-32 overflow-auto text-xs text-slate-400 font-mono">
                {this.state.error?.message}
              </div>
              <button
                onClick={this.resetError}
                className="w-full px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-medium transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full mt-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
              >
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
