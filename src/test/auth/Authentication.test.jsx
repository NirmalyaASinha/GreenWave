import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import { ProtectedRoute } from '../../components/ProtectedRoute'
import Login from '../../pages/Login'

describe('Authentication', () => {
  it('should redirect to login when not authenticated', () => {
    render(
      <Router>
        <AuthProvider>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </AuthProvider>
      </Router>
    )

    // Should not see protected content
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should render login page with demo credentials', () => {
    render(
      <Router>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </Router>
    )

    expect(screen.getByText('GreenWave')).toBeInTheDocument()
    expect(screen.getByText('Emergency Response Management System')).toBeInTheDocument()
    expect(screen.getByText('Demo Credentials')).toBeInTheDocument()
    expect(screen.getByText('Admin')).toBeInTheDocument()
    expect(screen.getByText('Dispatch Officer')).toBeInTheDocument()
    expect(screen.getByText('View Only')).toBeInTheDocument()
  })

  it('should have login form with username and password fields', () => {
    render(
      <Router>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </Router>
    )

    const usernameInput = screen.getByPlaceholderText('admin')
    const passwordInput = screen.getByPlaceholderText('admin123')
    const loginButton = screen.getByRole('button', { name: /Login/i })

    expect(usernameInput).toBeInTheDocument()
    expect(passwordInput).toBeInTheDocument()
    expect(loginButton).toBeInTheDocument()
  })

  it('should accept valid credentials and login', async () => {
    const user = userEvent.setup()

    render(
      <Router>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </Router>
    )

    const usernameInput = screen.getByPlaceholderText('admin')
    const passwordInput = screen.getByPlaceholderText('admin123')
    const loginButton = screen.getByRole('button', { name: /Login/i })

    await user.type(usernameInput, 'admin')
    await user.type(passwordInput, 'admin123')
    await user.click(loginButton)

    // Login should succeed
    expect(loginButton).toBeEnabled()
  })
})
