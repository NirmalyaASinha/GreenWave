import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, AuthContext } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import RequestsPage from './pages/RequestsPage'
import MapPage from './pages/MapPage'
import IncidentsPage from './pages/IncidentsPage'
import { Toaster } from 'react-hot-toast'
import './App.css'
import { useContext } from 'react'

function AppContent() {
  const { user, loading } = useContext(AuthContext)

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#0D1117',
        color: '#2EA043',
        fontSize: '16px',
        fontWeight: '600',
        letterSpacing: '3px',
        textTransform: 'uppercase'
      }}>
        Initializing System...
      </div>
    )
  }

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#161B22',
            color: '#E6EDF3',
            border: '1px solid #30363D',
            borderRadius: '4px'
          },
          success: {
            iconTheme: {
              primary: '#2EA043',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#DA3633',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
      {user && <Sidebar />}
      <div style={{ marginLeft: user ? '220px' : '0', minHeight: '100vh' }}>
        {user && <TopBar />}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requests"
            element={
              <ProtectedRoute>
                <RequestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <MapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/incidents"
            element={
              <ProtectedRoute>
                <IncidentsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
        </Routes>
      </div>
    </>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App
