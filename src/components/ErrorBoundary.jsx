import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Unhandled error in FitTrack AI:', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg px-6 text-center text-text">
        <p className="text-lg font-bold">Something went wrong</p>
        <p className="max-w-xs text-sm text-text-secondary">
          FitTrack AI hit an unexpected error. Your logged data is safe — try reloading the page.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Reload
        </button>
      </div>
    )
  }
}
