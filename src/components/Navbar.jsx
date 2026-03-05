import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Navbar.css'

function Navbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  if (!user) {
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
                Requests
              </Link>
            </li>
            <li>
              <Link to="/map" className="navbar-link">
                Map
              </Link>
            </li>
            <li>
              <Link to="/incidents" className="navbar-link">
                Incidents
              </Link>
            </li>
          </ul>
        </div>
        <div className="navbar-right">
          <div className="user-info">
            <span className="user-role">{user.email}</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
