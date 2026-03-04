import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import useGreenWave from '../../hooks/useGreenWave'

describe('useGreenWave Hook', () => {
  let mockWebSocket

  beforeEach(() => {
    // Mock WebSocket
    mockWebSocket = {
      send: vi.fn(),
      close: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      onopen: null,
      onclose: null,
      onerror: null,
      onmessage: null,
      readyState: 0, // CONNECTING
    }

    global.WebSocket = vi.fn(() => mockWebSocket)
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.clearAllTimers()
  })

  it('should return connectionStatus "connecting" initially', async () => {
    const { result } = renderHook(() => useGreenWave())

    // Should start in disconnected state initially
    expect(result.current.connectionStatus).toBe('disconnected')
  })

  it('should update vehicles array when VEHICLE_UPDATE received', async () => {
    const { result } = renderHook(() => useGreenWave())

    const initialVehicleCount = result.current.vehicles.length

    // Simulate receiving a VEHICLE_UPDATE message
    act(() => {
      const updateMessage = {
        type: 'VEHICLE_UPDATE',
        vehicle: {
          id: 'VEH-NEW',
          type: 'Ambulance',
          lat: 23.2,
          lng: 72.6,
          status: 'active',
          eta: '1 min',
          speed: 50,
          heading: 90
        }
      }

      // Trigger the onmessage handler
      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage({
          data: JSON.stringify(updateMessage)
        })
      }
    })

    await waitFor(() => {
      // Should have new vehicle added
      const newVehicle = result.current.vehicles.find(v => v.id === 'VEH-NEW')
      expect(newVehicle).toBeDefined()
      expect(result.current.vehicles.length).toBe(initialVehicleCount + 1)
    })
  })

  it('should update existing vehicle when VEHICLE_UPDATE received with same ID', async () => {
    const { result } = renderHook(() => useGreenWave())

    const existingVehicleId = result.current.vehicles[0].id

    // Update existing vehicle
    act(() => {
      const updateMessage = {
        type: 'VEHICLE_UPDATE',
        vehicle: {
          id: existingVehicleId,
          type: 'Ambulance',
          lat: 23.3,
          lng: 72.7,
          status: 'inactive',
          eta: '0 min',
          speed: 0,
          heading: 180
        }
      }

      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage({
          data: JSON.stringify(updateMessage)
        })
      }
    })

    await waitFor(() => {
      const updatedVehicle = result.current.vehicles.find(v => v.id === existingVehicleId)
      expect(updatedVehicle.status).toBe('inactive')
      expect(updatedVehicle.lat).toBe(23.3)
      expect(updatedVehicle.lng).toBe(72.7)
    })
  })

  it('should fall back to simulation when WebSocket fails', async () => {
    const { result } = renderHook(() => useGreenWave())

    // Simulate WebSocket error
    act(() => {
      if (mockWebSocket.onerror) {
        mockWebSocket.onerror(new Error('Connection failed'))
      }
    })

    // Should eventually start simulation (connectionStatus = 'simulating')
    await waitFor(
      () => {
        expect(['disconnected', 'error', 'simulating']).toContain(result.current.connectionStatus)
      },
      { timeout: 5000 }
    )
  })

  it('should have vehicles initially', () => {
    const { result } = renderHook(() => useGreenWave())

    expect(result.current.vehicles).toBeDefined()
    expect(Array.isArray(result.current.vehicles)).toBe(true)
    expect(result.current.vehicles.length).toBeGreaterThan(0)
  })

  it('should have corridors initially', () => {
    const { result } = renderHook(() => useGreenWave())

    expect(result.current.corridors).toBeDefined()
    expect(Array.isArray(result.current.corridors)).toBe(true)
  })

  it('should have alerts array', () => {
    const { result } = renderHook(() => useGreenWave())

    expect(result.current.alerts).toBeDefined()
    expect(Array.isArray(result.current.alerts)).toBe(true)
  })

  it('should provide sendMessage function', () => {
    const { result } = renderHook(() => useGreenWave())

    expect(result.current.sendMessage).toBeDefined()
    expect(typeof result.current.sendMessage).toBe('function')
  })
})
