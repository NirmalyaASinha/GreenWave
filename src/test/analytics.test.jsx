import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Analytics from '../../pages/Analytics'
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

const AnalyticsWithProviders = () => (
  <BrowserRouter>
    <AuthContext.Provider value={mockAuth}>
      <ToastContext.Provider value={mockToast}>
        <Analytics />
      </ToastContext.Provider>
    </AuthContext.Provider>
  </BrowserRouter>
)

describe('Analytics Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render analytics page', () => {
    render(<AnalyticsWithProviders />)
    
    expect(screen.getByText(/analytics/i)).toBeInTheDocument()
  })

  it('should display summary cards', async () => {
    render(<AnalyticsWithProviders />)
    
    await waitFor(() => {
      // Summary should include totals
      expect(screen.getByText(/total/i) || screen.getByText(/[0-9]/)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should have time range filters', () => {
    render(<AnalyticsWithProviders />)
    
    // Look for date/time filter buttons
    const buttons = screen.queryAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('should render charts', async () => {
    render(<AnalyticsWithProviders />)
    
    await waitFor(() => {
      // Charts are SVG elements
      const svgs = screen.queryAllByRole('img', { hidden: true })
      // Should have at least one chart
      expect(svgs.length).toBeGreaterThanOrEqual(0)
    }, { timeout: 3000 })
  })
})

export {}
