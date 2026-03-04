import React, { createContext, useState, useCallback, useRef, useEffect } from 'react'

export const ConnectionContext = createContext()

const CONNECTION_STATES = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  FAILED: 'failed',
  SIMULATING: 'simulating'
}

export const ConnectionProvider = ({ children }) => {
  const [connectionState, setConnectionState] = useState(CONNECTION_STATES.CONNECTING)
  const [isOnline, setIsOnline] = useState(true)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttemptsRef = useRef(6) // 1+2+4+8+16+30s = 31s max

  const getBackoffDelay = useCallback((attempt) => {
    const delays = [1000, 2000, 4000, 8000, 16000, 30000]
    return delays[Math.min(attempt, delays.length - 1)]
  }, [])

  const setFailedState = useCallback(() => {
    setConnectionState(CONNECTION_STATES.FAILED)
    reconnectAttemptsRef.current = 0
  }, [])

  const setConnectedState = useCallback(() => {
    setConnectionState(CONNECTION_STATES.CONNECTED)
    reconnectAttemptsRef.current = 0
  }, [])

  const setReconnectingState = useCallback(() => {
    setConnectionState(CONNECTION_STATES.RECONNECTING)
  }, [])

  const scheduleReconnect = useCallback((onReconnect) => {
    if (reconnectAttemptsRef.current >= maxReconnectAttemptsRef.current) {
      return null
    }

    const delay = getBackoffDelay(reconnectAttemptsRef.current)
    reconnectAttemptsRef.current++

    const timeoutId = setTimeout(() => {
      onReconnect()
    }, delay)

    return timeoutId
  }, [getBackoffDelay])

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <ConnectionContext.Provider
      value={{
        connectionState,
        isOnline,
        setConnectedState,
        setReconnectingState,
        setFailedState,
        scheduleReconnect,
        CONNECTION_STATES,
        getBackoffDelay
      }}
    >
      {children}
    </ConnectionContext.Provider>
  )
}

export const useConnection = () => {
  const context = React.useContext(ConnectionContext)
  if (!context) {
    throw new Error('useConnection must be used within ConnectionProvider')
  }
  return context
}
