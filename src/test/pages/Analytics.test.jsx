import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Analytics from '../../pages/Analytics'

describe('Analytics Page', () => {
  it('should render analytics page heading', () => {
    render(<Analytics />)

    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument()
  })

  it('should have time range filters', () => {
    render(<Analytics />)

    expect(screen.getByText('Today')).toBeInTheDocument()
    expect(screen.getByText('Week')).toBeInTheDocument()
    expect(screen.getByText('Month')).toBeInTheDocument()
  })

  it('should display summary section with 3 cards', () => {
    render(<Analytics />)

    const summaryCards = document.querySelectorAll('.summary-card')
    expect(summaryCards).toHaveLength(3)
  })

  it('should show corridor activations summary', () => {
    render(<Analytics />)

    expect(screen.getByText('Total Corridors Activated')).toBeInTheDocument()
  })

  it('should show time saved summary', () => {
    render(<Analytics />)

    expect(screen.getByText('Hours of Time Saved')).toBeInTheDocument()
  })

  it('should show lives impacted summary', () => {
    render(<Analytics />)

    expect(screen.getByText('Lives Potentially Impacted')).toBeInTheDocument()
  })

  it('should display 4 charts', () => {
    render(<Analytics />)

    const chartCards = document.querySelectorAll('.chart-card')
    expect(chartCards).toHaveLength(4)
  })

  it('should have corridor activations chart', () => {
    render(<Analytics />)

    expect(screen.getByText('Corridor Activations (Hourly)')).toBeInTheDocument()
  })

  it('should have ETA saved chart', () => {
    render(<Analytics />)

    expect(screen.getByText('Average ETA Saved (Minutes)')).toBeInTheDocument()
  })

  it('should have vehicle type breakdown chart', () => {
    render(<Analytics />)

    expect(screen.getByText('Breakdown by Vehicle Type')).toBeInTheDocument()
  })

  it('should have response time trend chart', () => {
    render(<Analytics />)

    expect(screen.getByText('Response Time Trend (Days)')).toBeInTheDocument()
  })

  it('should have time range filter buttons', () => {
    render(<Analytics />)

    const filterBtns = document.querySelectorAll('.filter-btn')
    expect(filterBtns.length).toBe(3)
  })
})
