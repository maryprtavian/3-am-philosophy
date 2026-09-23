import { Component } from 'react'
import type { ReactNode } from 'react'
import RecoveryScreen from './RecoveryScreen.tsx'

export default class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true }
  }

  render(): ReactNode {
    return this.state.failed ? <RecoveryScreen /> : this.props.children
  }
}
