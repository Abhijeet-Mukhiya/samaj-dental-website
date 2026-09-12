import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in UI rendering tree:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen grid place-items-center bg-slate-950 p-4 text-white">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-rose-500/10 text-rose-500 mb-6">
              <ShieldAlert size={36} />
            </div>

            <h1 className="text-xl font-black text-white">Temporary Application Notice</h1>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              We encountered an unexpected display issue while processing this view. No medical or appointment records were affected.
            </p>

            {this.state.error && (
              <div className="mt-4 p-3 rounded-xl bg-slate-950 text-left border border-slate-800 text-[11px] text-rose-400 font-mono overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 font-black px-4 py-3 text-sm text-white transition focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <RefreshCw size={16} /> Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
