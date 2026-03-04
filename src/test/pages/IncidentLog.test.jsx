import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import IncidentLog from '../../pages/IncidentLog'

describe('IncidentLog Component', () => {
  it('should render the incident log heading', () => {
    render(<IncidentLog />)

    expect(screen.getByText('Incident Log')).toBeInTheDocument()
  })

  it('should render correct number of incident rows', () => {
    render(<IncidentLog />)

    // The component has 5 incidents in the initial state
    const rows = document.querySelectorAll('tbody tr')
    expect(rows).toHaveLength(5)
  })

  it('should display all incident IDs', () => {
    render(<IncidentLog />)

    expect(screen.getByText('INC-001')).toBeInTheDocument()
    expect(screen.getByText('INC-002')).toBeInTheDocument()
    expect(screen.getByText('INC-003')).toBeInTheDocument()
    expect(screen.getByText('INC-004')).toBeInTheDocument()
    expect(screen.getByText('INC-005')).toBeInTheDocument()
  })

  it('should display incident types', () => {
    render(<IncidentLog />)

    expect(screen.getAllByText('Medical Emergency')).toHaveLength(2)
    expect(screen.getAllByText('Fire')).toHaveLength(2)
    expect(screen.getByText('Traffic Accident')).toBeInTheDocument()
  })

  it('should display severity badges', () => {
    render(<IncidentLog />)

    const badges = document.querySelectorAll('.severity-badge')
    expect(badges.length).toBeGreaterThan(0)
  })

  it('should display all severity levels', () => {
    render(<IncidentLog />)

    // Check for text content of severity badges
    expect(screen.getByText('CRITICAL')).toBeInTheDocument()
    expect(screen.getAllByText('HIGH')).toHaveLength(1)
    expect(screen.getAllByText('MEDIUM')).toHaveLength(2)
    expect(screen.getByText('LOW')).toBeInTheDocument()
  })

  it('should display vehicle assignments', () => {
    render(<IncidentLog />)

    expect(screen.getByText('A-101')).toBeInTheDocument()
    expect(screen.getByText('F-202')).toBeInTheDocument()
    expect(screen.getByText('A-102')).toBeInTheDocument()
    expect(screen.getByText('A-103')).toBeInTheDocument()
    expect(screen.getByText('F-201')).toBeInTheDocument()
  })

  it('should display incident statuses', () => {
    render(<IncidentLog />)

    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getAllByText('En-Route')).toHaveLength(2)
    expect(screen.getAllByText('Resolved')).toHaveLength(2)
  })

  it('should have search input', () => {
    render(<IncidentLog />)

    const searchInput = screen.getByPlaceholderText('Search incidents...')
    expect(searchInput).toBeInTheDocument()
  })

  it('should have filter select for severity', () => {
    render(<IncidentLog />)

    const filterSelect = document.querySelector('.filter-select')
    expect(filterSelect).toBeInTheDocument()
  })

  it('should have filter options for all severities', () => {
    render(<IncidentLog />)

    const options = screen.getAllByRole('option')
    const optionValues = options.map(o => o.value)

    expect(optionValues).toContain('')
    expect(optionValues).toContain('critical')
    expect(optionValues).toContain('high')
    expect(optionValues).toContain('medium')
    expect(optionValues).toContain('low')
  })

  it('should display incident table with proper structure', () => {
    render(<IncidentLog />)

    const table = document.querySelector('table')
    expect(table).toBeInTheDocument()

    const headers = screen.getAllByRole('columnheader')
    const headerTexts = headers.map(h => h.textContent)
    expect(headerTexts).toContain('ID')
    expect(headerTexts).toContain('Timestamp')
    expect(headerTexts).toContain('Type')
    expect(headerTexts).toContain('Severity')
    expect(headerTexts).toContain('Location')
    expect(headerTexts).toContain('Vehicle')
    expect(headerTexts).toContain('Status')
  })

  it('should display incident descriptions', () => {
    render(<IncidentLog />)

    expect(screen.getByText('Patient with chest pain, ambulance en-route')).toBeInTheDocument()
    expect(screen.getByText('Building fire reported, multiple fire trucks dispatched')).toBeInTheDocument()
  })

  it('should display incident locations', () => {
    render(<IncidentLog />)

    expect(screen.getByText('CG Road, Ahmedabad')).toBeInTheDocument()
    expect(screen.getByText('Drive-in Road, Ahmedabad')).toBeInTheDocument()
    expect(screen.getByText('S.G. Road, Ahmedabad')).toBeInTheDocument()
    expect(screen.getByText('Ashram Road, Ahmedabad')).toBeInTheDocument()
    expect(screen.getByText('Mahal Road, Ahmedabad')).toBeInTheDocument()
  })

  it('should have log controls section', () => {
    render(<IncidentLog />)

    const logControls = document.querySelector('.log-controls')
    expect(logControls).toBeInTheDocument()
  })

  it('should have incidents table wrapper', () => {
    render(<IncidentLog />)

    const wrapper = document.querySelector('.incidents-table-wrapper')
    expect(wrapper).toBeInTheDocument()
  })

  it('should apply severity class to table rows', () => {
    render(<IncidentLog />)

    const rows = document.querySelectorAll('tbody tr')
    
    // Check that rows have severity classes
    const hasSeverityClass = Array.from(rows).some(row => 
      row.className.includes('severity-')
    )
    expect(hasSeverityClass).toBe(true)
  })
})
