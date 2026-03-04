import React, { createContext, useState, useCallback } from 'react'

export const AuthContext = createContext()

const CREDENTIALS = {
  'admin': 'admin123',
  'dispatch': 'dispatch123',
  'viewer': 'viewer123'
}

const ROLES = {
  'admin': { permissions: ['view', 'trigger', 'admin'] },
  'dispatch': { permissions: ['view', 'trigger'] },
  'viewer': { permissions: ['view'] }
}

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const stored = sessionStorage.getItem('greenwave_auth')
    return stored ? JSON.parse(stored) : null
  })

  const login = useCallback((username, password) => {
    if (CREDENTIALS[username] && CREDENTIALS[username] === password) {
      const authData = {
        username,
        role: username,
        permissions: ROLES[username].permissions,
        loginTime: new Date().toISOString()
      }
      sessionStorage.setItem('greenwave_auth', JSON.stringify(authData))
      setAuth(authData)
      return { success: true }
    }
    return { success: false, error: 'Invalid credentials' }
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem('greenwave_auth')
    setAuth(null)
  }, [])

  const hasPermission = useCallback((permission) => {
    return auth?.permissions.includes(permission) ?? false
  }, [auth])

  return (
    <AuthContext.Provider value={{ auth, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
