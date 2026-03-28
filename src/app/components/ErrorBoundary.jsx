import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
    console.error('ErrorBoundary caught error:', error, info); // helpful for logs
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 py-10 px-4">
          <div className="mx-auto max-w-3xl bg-white p-6 rounded-lg shadow ring-1 ring-red-200">
            <h2 className="text-xl font-bold text-red-600">Something went wrong</h2>
            <p className="mt-2 text-sm text-gray-700">Please check the console for details.</p>
            {this.state.error ? (
              <pre className="mt-3 p-3 bg-gray-100 rounded text-xs text-red-900 overflow-x-auto">{this.state.error.toString()}</pre>
            ) : null}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
