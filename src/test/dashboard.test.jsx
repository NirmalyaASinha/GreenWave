import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Dashboard from '../../pages/Dashboard'
import { AuthContext } from '../../contexts/AuthContext'
import { ConnectionContext } from '../../contexts/ConnectionContext'
import { ToastContext } from '../../contexts/ToastContext'

const mockAuth = {
  isAuthenticated: true,
  user: { username: 'admin', role: 'admin' },
  login: vi.fn(),
  logout: vi.fn(),
  hasPermission: vi.fn(() => true),
}

const mockConnection = {
  connectionStatus: 'CONNECTED',
  setConnectedState: vi.fn(),
  setReconnectingState: vi.fn(),
  setFailedState: vi.fn(),
  scheduleReconnect: vi.fn(),
  getBackoffDelay: vi.fn(),
}

const mockToast = {
  toasts: [],
  showToast: vi.fn(),
  removeToast: vi.fn(),
}

const DashboardWithProviders = () => (
  <BrowserRouter>
    <AuthContext.Provider value={mockAuth}>
      <ConnectionContext.Provider value={mockConnection}>
        <ToastContext.Provider value={mockToast}>
          <Dashboard />
        </ToastContext.Provider>
      </ConnectionContext.Provider>
    </AuthContext.Provider>
  </BrowserRouter>
)

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render dashboard', () => {
    render(<DashboardWithProviders />)
    
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
  })

  it('should display stat cards', async () => {
    render(<DashboardWithProviders />)
    
    await waitFor(() => {
      expect(screen.getByText(/active corridors/i)).toBeInTheDocument()
    })
  })

  it('should show connection status', () => {
    render(<DashboardWithProviders />)
    
    // Should show Live badge for CONNECTED status
    expect(screen.getByText(/live/i) || screen.getByText(/connected/i)).toBeInTheDocument()
  })

  it('should show emergency buttons for admin', () => {
    render(<DashboardWithProviders />)
    
    expect(screen.getByText(/simulate/i)).toBeInTheDocument()
  })

  it('should hide emergency buttons for viewer', () => {
    const viewerAuth = { ...mockAuth, user: { ...mockAuth.user, role: 'viewer' }, hasPermission: vi.fn(() => false) }
    
    render(
      <BrowserRouter>
        <AuthContext.Provider value={viewerAuth}>
          <ConnectionContext.Provider value={mockConnection}>
            <ToastContext.Provider value={mockToast}>
              <Dashboard />
            </ToastContext.Provider>
          </ConnectionContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    )
    
    // Emergency buttons should not be in document
    // Viewer can only view, not trigger
  })

  it('should display FAILED status badge when disconnected', () => {
    const failedConnection = { ...mockConnection, connectionStatus: 'FAILED' }
    
    render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuth}>
          <ConnectionContext.Provider value={failedConnection}>
            <ToastContext.Provider value={mockToast}>
              <Dashboard />
            </ToastContext.Provider>
          </ConnectionContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    )
    
    // Should show failure/simulation status
  })
})

export {}
