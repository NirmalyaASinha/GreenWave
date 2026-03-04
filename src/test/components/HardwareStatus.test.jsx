import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import HardwareStatus from '../../components/HardwareStatus'

describe('HardwareStatus', () => {
  it('should render hardware status title', () => {
    render(<HardwareStatus />)

    expect(screen.getByText('System Hardware Status')).toBeInTheDocument()
  })

  it('should display all hardware components', () => {
    render(<HardwareStatus />)

    expect(screen.getByText('Neo-6M GPS')).toBeInTheDocument()
    expect(screen.getByText('ESP8266 WiFi')).toBeInTheDocument()
    expect(screen.getByText('Arduino Signals')).toBeInTheDocument()
    expect(screen.getByText('SIM800L GSM')).toBeInTheDocument()
    expect(screen.getByText('Raspberry Pi')).toBeInTheDocument()
  })

  it('should show status dots for each component', () => {
    render(<HardwareStatus />)

    const statusDots = document.querySelectorAll('.status-dot')
    expect(statusDots.length).toBeGreaterThanOrEqual(5)
  })

  it('should display last ping information', () => {
    render(<HardwareStatus />)

    const pingLabels = screen.getAllByText(/Last ping/)
    expect(pingLabels.length).toBeGreaterThan(0)
  })

  it('should show online status for all components initially', () => {
    render(<HardwareStatus />)

    const onlineItems = document.querySelectorAll('.status-online')
    expect(onlineItems.length).toBeGreaterThan(0)
  })

  it('should display hardware details', () => {
    render(<HardwareStatus />)

    expect(screen.getByText(/Timestamp:/)).toBeInTheDocument()
    expect(screen.getByText(/Signal:/)).toBeInTheDocument()
    expect(screen.getByText(/Carrier:/)).toBeInTheDocument()
  })

  it('should have clickable hardware items', () => {
    render(<HardwareStatus />)

    const hardwareItems = document.querySelectorAll('.hardware-item')
    expect(hardwareItems.length).toBeGreaterThan(0)

    hardwareItems.forEach(item => {
      expect(item.style.cursor).not.toBe('default')
    })
  })
})
