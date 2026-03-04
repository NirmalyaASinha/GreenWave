import './Login.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()
  const { showToast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = login(username, password)
      if (result.success) {
        showToast('Login successful!', 'success')
        navigate('/')
      } else {
        showToast(result.error || 'Login failed', 'error')
      }
    } catch (error) {
      showToast('An error occurred', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <h1>GreenWave</h1>
          <p className="subtitle">Emergency Response Management System</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin123"
                disabled={isLoading}
              />
            </div>

            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="demo-credentials">
            <h3>Demo Credentials</h3>
            <div className="cred-group">
              <strong>Admin</strong>
              <code>admin / admin123</code>
            </div>
            <div className="cred-group">
              <strong>Dispatch Officer</strong>
              <code>dispatch / dispatch123</code>
            </div>
            <div className="cred-group">
              <strong>View Only</strong>
              <code>viewer / viewer123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
