import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export const ProtectedRoute = ({ children }) => {
  const { auth } = useAuth()

  if (!auth) {
    return <Navigate to="/login" replace />
  }

  return children
}

export const AdminRoute = ({ children }) => {
  const { auth } = useAuth()

  if (!auth || auth.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}

export const DispatchRoute = ({ children }) => {
  const { auth, hasPermission } = useAuth()

  if (!auth || !hasPermission('trigger')) {
    return <Navigate to="/" replace />
  }

  return children
}
