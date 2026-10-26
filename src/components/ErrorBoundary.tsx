import React from 'react';

interface State {
  hasError: boolean;
}

// Last line of defence: if a page crashes unexpectedly, show a friendly
// screen with a reload button instead of a blank white page.
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FB] p-6 font-['Poppins']">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full p-8 text-center">
          <h1 className="text-xl font-extrabold text-slate-800">Something went wrong</h1>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            The app ran into an unexpected problem. Your saved data is safe. Please reload and try again.
          </p>
          <button
            type="button"
            onClick={() => window.location.assign('/')}
            className="mt-6 px-5 py-2.5 rounded-lg bg-[#0F6B63] hover:bg-[#0c5750] text-white text-sm font-semibold cursor-pointer"
          >
            Reload App
          </button>
        </div>
      </div>
    );
  }
}
