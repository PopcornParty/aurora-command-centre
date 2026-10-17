import { Component, ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error?: Error }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100dvh', background: '#08090B', color: '#F5F5F6',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24, textAlign: 'center', fontFamily: 'Inter, system-ui, sans-serif'
        }}>
          <div>
            <h1 style={{ fontSize: 20, marginBottom: 8 }}>AURORA encountered an error</h1>
            <p style={{ color: '#A2A5AD', marginBottom: 16, fontSize: 14 }}>
              {this.state.error?.message || 'Something went wrong loading the dashboard.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#D9273E', color: 'white', border: 'none',
                padding: '10px 18px', borderRadius: 8, cursor: 'pointer'
              }}
            >
              Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
