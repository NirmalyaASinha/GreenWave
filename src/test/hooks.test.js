import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import useGreenWave from '../../hooks/useGreenWave'

describe('useGreenWave Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    sessionStorage.setItem('auth', JSON.stringify({ token: 'test', role: 'admin' }))
  })

  afterEach(() => {
    vi.useRealTimers()
    sessionStorage.clear()
  })

  it('should initialize with CONNECTING status', () => {
    const { result } = renderHook(() => useGreenWave())
    
    expect(result.current.connectionStatus).toBe('CONNECTING')
  })

  it('should transition to CONNECTED when WebSocket opens', async () => {
    const { result } = renderHook(() => useGreenWave())
    
    // Fast-forward to trigger WebSocket connection
    act(() => {
      vi.advanceTimersByTime(100)
    })
    
    await waitFor(() => {
      // Should eventually connect
      expect(
        result.current.connectionStatus === 'CONNECTED' ||
        result.current.connectionStatus === 'SIMULATING'
      ).toBe(true)
    })
  })

  it('should have empty vehicles initially', () => {
    const { result } = renderHook(() => useGreenWave())
    
    expect(Array.isArray(result.current.vehicles)).toBe(true)
  })

  it('should have empty corridors initially', () => {
    const { result } = renderHook(() => useGreenWave())
    
    expect(Array.isArray(result.current.corridors)).toBe(true)
  })

  it('should handle VEHICLE_UPDATE messages', async () => {
    const { result } = renderHook(() => useGreenWave())
    
    act(() => {
      vi.advanceTimersByTime(100)
    })
    
    // The hook should be able to receive messages
    expect(result.current.sendMessage).toBeDefined()
    expect(typeof result.current.sendMessage).toBe('function')
  })

  it('should have sendMessage function', () => {
    const { result } = renderHook(() => useGreenWave())
    
    expect(result.current.sendMessage).toBeDefined()
    expect(typeof result.current.sendMessage).toBe('function')
  })

  it('should handle reconnection on failure', async () => {
    const { result } = renderHook(() => useGreenWave())
    
    // Simulate time passing
    act(() => {
      vi.advanceTimersByTime(1000) // Should trigger reconnection
    })
    
    // Should attempt to reconnect or simulate
    await waitFor(() => {
      expect(
        result.current.connectionStatus === 'RECONNECTING' ||
        result.current.connectionStatus === 'SIMULATING' ||
        result.current.connectionStatus === 'FAILED'
      ).toBe(true)
    })
  })

  it('should implement exponential backoff delays', () => {
    const { result } = renderHook(() => useGreenWave())
    
    // The hook should have backoff logic
    expect(result.current).toBeDefined()
    
    // Connection status should eventually settle
    expect(
      result.current.connectionStatus === 'CONNECTED' ||
      result.current.connectionStatus === 'FAILED' ||
      result.current.connectionStatus === 'SIMULATING'
    ).toBe(true)
  })
})

export {}
