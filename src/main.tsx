import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import RecoveryScreen from './components/RecoveryScreen.tsx'
import './styles/global.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('The application root element is missing.')
}

const root = createRoot(rootElement)

// Keep initialization inside the import promise so a failed download or module
// initialization has a recovery screen, too. The boundary handles render failures.
void import('./components/App.tsx').then(
  ({ default: App }) => {
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>,
    )
  },
  (error: unknown) => {
    console.error('Unable to open the experience.', error)
    root.render(<RecoveryScreen />)
  },
)
