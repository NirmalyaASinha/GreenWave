import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import { ToastProvider } from '../../contexts/ToastContext'
import { ConnectionProvider } from '../../contexts/ConnectionContext'
import Dashboard from '../../pages/Dashboard'

const renderWithProviders = (component) => {
  return render(
    <Router>
      <AuthProvider>
        <ConnectionProvider>
          <ToastProvider>
            {component}
          </ToastProvider>
        </ConnectionProvider>
      </AuthProvider>
    </Router>
  )
}

describe('Dashboard Component', () => {
  it('should render 4 stat cards', () => {
    renderWithProviders(<Dashboard />)

    const cards = document.querySelectorAll('.stat-card')
    expect(cards).toHaveLength(4)
  })

  it('should render stat card titles correctly', () => {
    renderWithProviders(<Dashboard />)

    expect(screen.getByText('Active Ambulances')).toBeInTheDocument()
    expect(screen.getByText('Fire Trucks')).toBeInTheDocument()
    expect(screen.getByText('Avg Time Saved')).toBeInTheDocument()
    expect(screen.getByText('Alerts Today')).toBeInTheDocument()
  })

  it('should display stat values', () => {
    renderWithProviders(<Dashboard />)

    const statValues = document.querySelectorAll('.stat-value')
    expect(statValues.length).toBeGreaterThan(0)
  })

  it('should render main heading', () => {
    renderWithProviders(<Dashboard />)

    expect(screen.getByText('GreenWave Dashboard')).toBeInTheDocument()
  })

  it('should have proper structure with dashboard container', () => {
    renderWithProviders(<Dashboard />)

    const container = document.querySelector('.dashboard-container')
    expect(container).toBeInTheDocument()
  })

  it('should have stats grid section', () => {
    renderWithProviders(<Dashboard />)

    const statsGrid = document.querySelector('.stats-grid')
    expect(statsGrid).toBeInTheDocument()
  })

  it('should display stat icons', () => {
    renderWithProviders(<Dashboard />)

    const icons = document.querySelectorAll('.stat-icon')
    expect(icons.length).toBe(4)

    const iconContent = Array.from(icons).map(i => i.textContent)
    expect(iconContent).toContain('🚑')
    expect(iconContent).toContain('🚒')
    expect(iconContent).toContain('⏱️')
    expect(iconContent).toContain('⚠️')
  })

  it('should render prediction panel', () => {
    renderWithProviders(<Dashboard />)

    expect(screen.getByText('Risk Predictions')).toBeInTheDocument()
  })

  it('should render hardware status section', () => {
    renderWithProviders(<Dashboard />)

    expect(screen.getByText('System Hardware Status')).toBeInTheDocument()
  })
})
