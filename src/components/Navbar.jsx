import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useConnection } from '../contexts/ConnectionContext'
import './Navbar.css'

function Navbar() {
  const navigate = useNavigate()
  const { auth, logout } = useAuth()
  const { connectionState, CONNECTION_STATES } = useConnection()

  const isConnected = connectionState === CONNECTION_STATES.CONNECTED
  const statusLabel = isConnected ? 'Live' : connectionState === CONNECTION_STATES.SIMULATING ? 'Simulation' : 'Offline'
  const statusColor = isConnected ? '#4CAF50' : connectionState === CONNECTION_STATES.SIMULATING ? '#FF9800' : '#F44336'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!auth) {
    return null
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="traffic-light">🚦</span>
          <h2>GreenWave</h2>
        </Link>
        <div className="navbar-center">
          <ul className="navbar-menu">
            <li>
              <Link to="/" className="navbar-link">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/map" className="navbar-link">
                Live Map
              </Link>
            </li>
            <li>
              <Link to="/incidents" className="navbar-link">
                Incident Log
              </Link>
            </li>
            <li>
              <Link to="/analytics" className="navbar-link">
                Analytics
              </Link>
            </li>
          </ul>
        </div>
        <div className="navbar-right">
          <div className="connection-indicator">
            <span className="status-dot" style={{ backgroundColor: statusColor }}></span>
            <span className="status-label">{statusLabel}</span>
          </div>
          <div className="user-info">
            <span className="user-role">{auth.role.toUpperCase()}</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
