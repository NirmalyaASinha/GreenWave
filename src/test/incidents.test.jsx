import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import IncidentLog from '../../pages/IncidentLog'
import { AuthContext } from '../../contexts/AuthContext'
import { ToastContext } from '../../contexts/ToastContext'

const mockAuth = {
  isAuthenticated: true,
  user: { username: 'admin', role: 'admin' },
}

const mockToast = {
  toasts: [],
  showToast: vi.fn(),
}

const IncidentLogWithProviders = () => (
  <BrowserRouter>
    <AuthContext.Provider value={mockAuth}>
      <ToastContext.Provider value={mockToast}>
        <IncidentLog />
      </ToastContext.Provider>
    </AuthContext.Provider>
  </BrowserRouter>
)

describe('Incident Log Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render incident log', async () => {
    render(<IncidentLogWithProviders />)
    
    await waitFor(() => {
      expect(screen.getByText(/incident/i, { selector: 'h1,h2,span' })).toBeInTheDocument()
    })
  })

  it('should display incident table', async () => {
    render(<IncidentLogWithProviders />)
    
    await waitFor(() => {
      // Check for table headers
      expect(screen.getByText(/vehicle|threat|status/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should have filter controls', () => {
    render(<IncidentLogWithProviders />)
    
    // Look for filter buttons or selectors
    const filterElements = screen.queryAllByRole('button')
    expect(filterElements.length).toBeGreaterThan(0)
  })
})

export {}
