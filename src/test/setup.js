import '@testing-library/jest-dom'
import { afterEach, vi, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// ─────────────────────────────────────────────────────────────
// LIFECYCLE
// ─────────────────────────────────────────────────────────────

beforeEach(() => {
  // Reset modules before each test
  vi.resetModules()
  // Clear sessionStorage
  sessionStorage.clear()
  // Clear all mocks
  vi.clearAllMocks()
})

// Cleanup after every test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// ─────────────────────────────────────────────────────────────
// WEBSOCKET MOCK
// ─────────────────────────────────────────────────────────────

class WebSocketMock {
  constructor(url) {
    this.url = url
    this.readyState = WebSocket.OPEN
    this.onopen = null
    this.onclose = null
    this.onerror = null
    this.onmessage = null
    this.listeners = {}
    
    // Auto-trigger onopen after construction
    setTimeout(() => {
      if (this.onopen) this.onopen()
    }, 0)
  }

  send(data) {
    // Simulate receive on send (echo)
    if (this.onmessage) {
      this.onmessage({ data: JSON.stringify(JSON.parse(data)) })
    }
  }

  close() {
    this.readyState = WebSocket.CLOSED
    if (this.onclose) this.onclose()
  }

  addEventListener(event, handler) {
    if (!this.listeners[event]) this.listeners[event] = []
    this.listeners[event].push(handler)
  }

  removeEventListener(event, handler) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(h => h !== handler)
    }
  }

  dispatchEvent(event) {
    const handlers = this.listeners[event.type] || []
    handlers.forEach(h => h(event))
  }
}

// Add WebSocket constants
WebSocketMock.CONNECTING = 0
WebSocketMock.OPEN = 1
WebSocketMock.CLOSING = 2
WebSocketMock.CLOSED = 3

global.WebSocket = WebSocketMock

// ─────────────────────────────────────────────────────────────
// WINDOW MOCKS
// ─────────────────────────────────────────────────────────────

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock

// Mock Notification API
global.Notification = class {
  constructor(title, options) {
    this.title = title
    this.options = options
  }

  static permission = 'granted'
  static requestPermission = vi.fn(() => Promise.resolve('granted'))

  close = vi.fn()
  onclick = null
  onshow = null
  onerror = null
  onclose = null
}

// ─────────────────────────────────────────────────────────────
// FETCH MOCK
// ─────────────────────────────────────────────────────────────

const originalFetch = global.fetch

global.fetch = vi.fn((url, options) => {
  // Mock specific endpoints
  if (url.includes('/health')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        status: 'healthy',
        database: 'connected',
        websocket_clients: 1
      })
    })
  }

  if (url.includes('/analytics/summary')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        total_corridors: 5,
        total_time_saved_minutes: 47,
        average_response_time_minutes: 8.5,
        estimated_lives_impacted: 3,
        by_vehicle_type: { Ambulance: 3, Fire_Truck: 2 }
      })
    })
  }

  if (url.includes('/gps/vehicles')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve([
        {
          vehicle_id: 'AMB-001',
          vehicle_type: 'Ambulance',
          latitude: 23.1815,
          longitude: 72.5371,
          speed_kmh: 75,
          is_emergency: true,
          last_updated: new Date().toISOString()
        }
      ])
    })
  }

  if (url.includes('/hardware/status')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        gps: { status: 'online', last_ping_seconds: 2, signal_strength: 85 },
        esp8266: { status: 'online', last_ping_seconds: 3, signal_strength: 92 },
        arduino: { status: 'online', last_ping_seconds: 1, cpu_percent: 12.5 },
        sim800l: { status: 'online', last_ping_seconds: 5, signal_strength: 55 },
        raspberry_pi: { status: 'online', cpu_percent: 45.2, memory_percent: 58.4, temperature_celsius: 42.5 }
      })
    })
  }

  // Default response
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
})

// ─────────────────────────────────────────────────────────────
// TEST DATA FACTORIES
// ─────────────────────────────────────────────────────────────

export const createVehicle = (overrides = {}) => ({
  vehicle_id: 'AMB-001',
  vehicle_type: 'Ambulance',
  latitude: 23.1815,
  longitude: 72.5371,
  speed_kmh: 50,
  heading: 45,
  is_emergency: false,
  last_updated: new Date().toISOString(),
  ...overrides,
})

export const createCorridor = (overrides = {}) => ({
  id: 1,
  vehicle_id: 'AMB-001',
  vehicle_type: 'Ambulance',
  activated_at: new Date().toISOString(),
  eta_minutes: 5,
  status: 'ACTIVE',
  intersections: 12,
  ...overrides,
})

export const createIncident = (overrides = {}) => ({
  id: 1,
  vehicle_id: 'AMB-001',
  vehicle_type: 'Ambulance',
  threat_type: 'EMERGENCY_DETECTION',
  corridor_id: 1,
  sms_sent: true,
  resolved: false,
  created_at: new Date().toISOString(),
  ...overrides,
})

export const createHardwareStatus = (overrides = {}) => ({
  gps: { status: 'online', last_ping_seconds: 2, signal_strength: 85 },
  esp8266: { status: 'online', last_ping_seconds: 3, signal_strength: 92 },
  arduino: { status: 'online', last_ping_seconds: 1, cpu_percent: 12.5 },
  sim800l: { status: 'online', last_ping_seconds: 5, signal_strength: 55 },
  raspberry_pi: { status: 'online', cpu_percent: 45.2, memory_percent: 58.4, temperature_celsius: 42.5 },
  ...overrides,
})

