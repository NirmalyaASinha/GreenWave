import { useState, useEffect, useRef, useCallback } from 'react'

// Simulated data for fallback when WebSocket is unavailable
const MOCK_VEHICLES = [
  {
    id: 'VEH-101',
    type: 'Ambulance',
    lat: 23.1815,
    lng: 72.5371,
    status: 'active',
    eta: '2 mins',
    speed: 45,
    heading: 90
  },
  {
    id: 'VEH-102',
    type: 'Fire Truck',
    lat: 23.1950,
    lng: 72.5410,
    status: 'active',
    eta: '1 min',
    speed: 55,
    heading: 180
  },
  {
    id: 'VEH-103',
    type: 'Ambulance',
    lat: 23.1875,
    lng: 72.5456,
    status: 'en-route',
    eta: '5 mins',
    speed: 40,
    heading: 270
  }
]

const MOCK_CORRIDORS = [
  {
    id: 'CORR-001',
    name: 'CG Road Corridor',
    status: 'active',
    route: [
      [23.1815, 72.5371],
      [23.1875, 72.5456],
      [23.1950, 72.5410]
    ],
    vehicles: ['VEH-101', 'VEH-102']
  }
]

const MOCK_ALERTS = [
  {
    id: 'ALERT-001',
    type: 'corridor_activated',
    message: 'Emergency corridor activated on CG Road',
    timestamp: new Date(),
    severity: 'high'
  }
]

// Function to simulate vehicle movement
const simulateVehicleMovement = (vehicles) => {
  return vehicles.map(vehicle => {
    const latMovement = (Math.random() - 0.5) * 0.0002
    const lngMovement = (Math.random() - 0.5) * 0.0002
    
    return {
      ...vehicle,
      lat: vehicle.lat + latMovement,
      lng: vehicle.lng + lngMovement,
      heading: (vehicle.heading + Math.random() * 10 - 5) % 360
    }
  })
}

export const useGreenWave = () => {
  const [vehicles, setVehicles] = useState(MOCK_VEHICLES)
  const [corridors, setCorridors] = useState(MOCK_CORRIDORS)
  const [alerts, setAlerts] = useState(MOCK_ALERTS)
  const [connectionStatus, setConnectionStatus] = useState('connecting')
  const [messageBuffer, setMessageBuffer] = useState([])
  
  const wsRef = useRef(null)
  const reconnectTimerRef = useRef(null)
  const simulationTimerRef = useRef(null)
  const heartbeatTimerRef = useRef(null)
  const shouldReconnectRef = useRef(true)
  const reconnectAttemptsRef = useRef(0)

  // Function to add a new alert
  const addAlert = useCallback((type, message, severity = 'info') => {
    setAlerts(prev => [
      ...prev,
      {
        id: `ALERT-${Date.now()}`,
        type,
        message,
        severity,
        timestamp: new Date()
      }
    ].slice(-10)) // Keep only last 10 alerts
  }, [])

  // Function to connect to WebSocket with exponential backoff
  const connectWebSocket = useCallback(() => {
    if (!shouldReconnectRef.current) return

    try {
      setConnectionStatus('connecting')
      const ws = new WebSocket('ws://localhost:8000/ws/dashboard')

      ws.onopen = () => {
        console.log('[GreenWave] WebSocket connected')
        setConnectionStatus('connected')
        reconnectAttemptsRef.current = 0
        wsRef.current = ws

        // Clear simulation timer when connected to WebSocket
        if (simulationTimerRef.current) {
          clearInterval(simulationTimerRef.current)
          simulationTimerRef.current = null
        }

        // Clear any pending reconnect timers
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current)
          reconnectTimerRef.current = null
        }

        addAlert('connection', '🟢 Connected to GreenWave backend', 'success')

        // Start heartbeat
        if (!heartbeatTimerRef.current) {
          heartbeatTimerRef.current = setInterval(() => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ type: 'PING' }))
            }
          }, 10000)
        }

        // Replay buffered messages
        if (messageBuffer.length > 0) {
          messageBuffer.forEach(msg => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify(msg))
            }
          })
          setMessageBuffer([])
        }
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type !== 'PONG') {
            console.log('[GreenWave] Message received:', data.type, data)
          }

          switch (data.type) {
            case 'PONG':
              break

            case 'INITIAL_STATE':
              if (data.vehicles) setVehicles(data.vehicles)
              if (data.corridors) setCorridors(data.corridors)
              if (data.alerts) setAlerts(data.alerts)
              break

            case 'VEHICLE_UPDATE':
              if (data.vehicle) {
                setVehicles(prev => {
                  const exists = prev.find(v => v.id === data.vehicle.id)
                  if (exists) {
                    return prev.map(v => v.id === data.vehicle.id ? data.vehicle : v)
                  } else {
                    return [...prev, data.vehicle]
                  }
                })
              }
              break

            case 'CORRIDOR_ACTIVATED':
              if (data.corridor) {
                setCorridors(prev => {
                  const exists = prev.find(c => c.id === data.corridor.id)
                  if (exists) {
                    return prev.map(c => c.id === data.corridor.id ? data.corridor : c)
                  } else {
                    return [...prev, data.corridor]
                  }
                })
                addAlert('corridor_activated', `Corridor activated: ${data.corridor.name}`, 'success')
              }
              break

            case 'CORRIDOR_DEACTIVATED':
              if (data.corridorId) {
                setCorridors(prev =>
                  prev.map(c =>
                    c.id === data.corridorId
                      ? { ...c, status: 'inactive' }
                      : c
                  )
                )
                addAlert('corridor_deactivated', `Corridor deactivated: ${data.corridorId}`, 'info')
              }
              break

            default:
              console.warn('[GreenWave] Unknown message type:', data.type)
          }
        } catch (error) {
          console.error('[GreenWave] Error parsing message:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('[GreenWave] WebSocket error:', error)
        setConnectionStatus('error')
      }

      ws.onclose = () => {
        console.log('[GreenWave] WebSocket disconnected')
        setConnectionStatus('disconnected')
        wsRef.current = null

        // Stop heartbeat
        if (heartbeatTimerRef.current) {
          clearInterval(heartbeatTimerRef.current)
          heartbeatTimerRef.current = null
        }

        // Start simulation when WebSocket is disconnected
        if (shouldReconnectRef.current && !simulationTimerRef.current) {
          startSimulation()
        }

        // Exponential backoff reconnection
        if (shouldReconnectRef.current) {
          const delays = [1000, 2000, 4000, 8000, 16000, 30000]
          const delay = delays[Math.min(reconnectAttemptsRef.current, delays.length - 1)]
          
          setConnectionStatus('reconnecting')
          console.log(`[GreenWave] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1})`)
          
          reconnectTimerRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++
            connectWebSocket()
          }, delay)
        }
      }

      wsRef.current = ws
    } catch (error) {
      console.error('[GreenWave] Failed to create WebSocket:', error)
      setConnectionStatus('error')

      // Start simulation when WebSocket connection fails
      if (!simulationTimerRef.current) {
        startSimulation()
      }

      // Try to reconnect with exponential backoff
      if (shouldReconnectRef.current) {
        const delays = [1000, 2000, 4000, 8000, 16000, 30000]
        const delay = delays[Math.min(reconnectAttemptsRef.current, delays.length - 1)]
        
        setConnectionStatus('reconnecting')
        reconnectTimerRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++
          connectWebSocket()
        }, delay)
      }
    }
  }, [addAlert, messageBuffer])

  // Function to start simulation
  const startSimulation = useCallback(() => {
    console.log('[GreenWave] Starting simulation mode')
    setConnectionStatus('simulating')
    addAlert('simulation', '🔴 Switched to simulation mode', 'warning')

    if (!simulationTimerRef.current) {
      simulationTimerRef.current = setInterval(() => {
        setVehicles(prev => simulateVehicleMovement(prev))
      }, 2000)
    }
  }, [addAlert])

  // Connect to WebSocket on mount
  useEffect(() => {
    shouldReconnectRef.current = true
    connectWebSocket()

    // Cleanup on unmount
    return () => {
      shouldReconnectRef.current = false

      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }

      if (simulationTimerRef.current) {
        clearInterval(simulationTimerRef.current)
        simulationTimerRef.current = null
      }
    }
  }, [connectWebSocket])

  // Function to send message to server (with buffering)
  const sendMessage = useCallback((type, data = {}) => {
    const message = { type, ...data }
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    } else {
      // Buffer message for replay when connected
      setMessageBuffer(prev => [...prev, message])
      console.warn('[GreenWave] WebSocket not connected, message buffered')
    }
  }, [])

  return {
    vehicles,
    corridors,
    alerts,
    connectionStatus,
    sendMessage
  }
}

export default useGreenWave
