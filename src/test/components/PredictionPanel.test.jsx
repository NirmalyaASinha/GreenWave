import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PredictionPanel from '../../components/PredictionPanel'

describe('PredictionPanel', () => {
  it('should render risk predictions title', () => {
    render(<PredictionPanel />)

    expect(screen.getByText('Risk Predictions')).toBeInTheDocument()
    expect(screen.getByText('Next 3 high-risk intersections')).toBeInTheDocument()
  })

  it('should display 3 prediction cards', () => {
    render(<PredictionPanel />)

    const cards = document.querySelectorAll('.prediction-card')
    expect(cards).toHaveLength(3)
  })

  it('should show prediction names', () => {
    render(<PredictionPanel />)

    expect(screen.getByText('CG Road x Ashram')).toBeInTheDocument()
    expect(screen.getByText('S.G. Road x Drive-in')).toBeInTheDocument()
    expect(screen.getByText('Mahal Road x Ring')).toBeInTheDocument()
  })

  it('should display risk scores with percentages', () => {
    render(<PredictionPanel />)

    expect(screen.getByText('85%')).toBeInTheDocument()
    expect(screen.getByText('72%')).toBeInTheDocument()
    expect(screen.getByText('58%')).toBeInTheDocument()
  })

  it('should show pre-clear badge when risk > 75%', () => {
    render(<PredictionPanel />)

    const badges = screen.getAllByText(/Pre-clear Recommended/)
    expect(badges.length).toBeGreaterThan(0)
  })

  it('should display risk bars', () => {
    render(<PredictionPanel />)

    const riskBars = document.querySelectorAll('.risk-bar')
    expect(riskBars.length).toBeGreaterThan(0)
  })

  it('should display time windows', () => {
    render(<PredictionPanel />)

    expect(screen.getByText(/Time window: /)).toBeInTheDocument()
  })

  it('should display sparkline charts', () => {
    render(<PredictionPanel />)

    const sparklines = document.querySelectorAll('.sparkline-container')
    expect(sparklines.length).toBe(3)
  })
})
