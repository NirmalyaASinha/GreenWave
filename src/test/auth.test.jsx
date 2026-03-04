"""
Frontend Authentication Tests
Vitest + React Testing Library tests for auth features
"""
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Login from '../../pages/Login'

// Wrapper component with router
const LoginWithRouter = () => (
  <BrowserRouter>
    <Login />
  </BrowserRouter>
)

describe('Login Page', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('should render login form', () => {
    render(<LoginWithRouter />)
    
    expect(screen.getByText(/greenwave/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('should display demo credentials', () => {
    render(<LoginWithRouter />)
    
    expect(screen.getByText(/admin/)).toBeInTheDocument()
    expect(screen.getByText(/dispatch/)).toBeInTheDocument()
    expect(screen.getByText(/viewer/)).toBeInTheDocument()
  })

  it('should reject wrong credentials', async () => {
    render(<LoginWithRouter />)
    
    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const loginBtn = screen.getByRole('button', { name: /login/i })
    
    await userEvent.type(usernameInput, 'admin')
    await userEvent.type(passwordInput, 'wrongpassword')
    fireEvent.click(loginBtn)
    
    await waitFor(() => {
      expect(screen.getByText(/invalid/i)).toBeInTheDocument()
    })
  })

  it('should accept admin credentials', async () => {
    render(<LoginWithRouter />)
    
    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const loginBtn = screen.getByRole('button', { name: /login/i })
    
    await userEvent.type(usernameInput, 'admin')
    await userEvent.type(passwordInput, 'admin123')
    fireEvent.click(loginBtn)
    
    // Should store in sessionStorage
    await waitFor(() => {
      expect(sessionStorage.getItem('auth')).toBeTruthy()
    })
  })

  it('should accept dispatch credentials', async () => {
    render(<LoginWithRouter />)
    
    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const loginBtn = screen.getByRole('button', { name: /login/i })
    
    await userEvent.type(usernameInput, 'dispatch')
    await userEvent.type(passwordInput, 'dispatch123')
    fireEvent.click(loginBtn)
    
    await waitFor(() => {
      const auth = JSON.parse(sessionStorage.getItem('auth'))
      expect(auth.role).toBe('dispatch')
    })
  })

  it('should accept viewer credentials', async () => {
    render(<LoginWithRouter />)
    
    await userEvent.type(screen.getByLabelText(/username/i), 'viewer')
    await userEvent.type(screen.getByLabelText(/password/i), 'viewer123')
    fireEvent.click(screen.getByRole('button', { name: /login/i }))
    
    await waitFor(() => {
      const auth = JSON.parse(sessionStorage.getItem('auth'))
      expect(auth.role).toBe('viewer')
    })
  })
})

export {}
