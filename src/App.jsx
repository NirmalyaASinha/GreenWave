import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider, ToastContext } from './contexts/ToastContext'
import { ConnectionProvider } from './contexts/ConnectionContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ToastContainer } from './components/Toast'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import LiveMap from './pages/LiveMap'
import IncidentLog from './pages/IncidentLog'
import Analytics from './pages/Analytics'
import Login from './pages/Login'
import './App.css'
import { useContext } from 'react'

function AppContent() {
  const { toasts, removeToast } = useContext(ToastContext)

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/map"
          element={
            <ProtectedRoute>
              <LiveMap />
            </ProtectedRoute>
          }
        />
        <Route
          path="/incidents"
          element={
            <ProtectedRoute>
              <IncidentLog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ConnectionProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </ConnectionProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
