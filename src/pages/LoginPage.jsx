import { useState } from 'react'
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth } from '../config/firebase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('login')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const googleProvider = new GoogleAuthProvider()

  const onSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
      navigate('/', { replace: true })
    } catch (err) {
      const code = err?.code || 'auth/unknown'
      const messages = {
        'auth/invalid-email': 'Invalid email format.',
        'auth/missing-password': 'Password is required.',
        'auth/invalid-credential': 'Incorrect email or password.',
        'auth/user-not-found': 'No account found for this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/email-already-in-use': 'Email is already registered. Please sign in.',
        'auth/weak-password': 'Password must be at least 6 characters.',
        'auth/operation-not-allowed': 'Enable Email/Password in Firebase Authentication settings.',
      }
      setError(messages[code] || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const onGoogleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      await signInWithPopup(auth, googleProvider)
      navigate('/', { replace: true })
    } catch (err) {
      const code = err?.code || 'auth/unknown'
      const messages = {
        'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
        'auth/popup-blocked': 'Popup blocked by browser. Please allow popups.',
        'auth/operation-not-allowed': 'Enable Google provider in Firebase Authentication settings.',
      }
      setError(messages[code] || 'Google sign-in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.loginScreen}>
      <form style={styles.loginCard} onSubmit={onSubmit}>
        <h1>🚦 GreenWave</h1>
        <p>Emergency Corridor Dashboard</p>
        {error && <div style={styles.errorMessage}>{error}</div>}
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          style={styles.input}
          required
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          style={styles.input}
          required
        />
        <button style={styles.btnPrimary} type="submit" disabled={loading}>
          {loading ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Login'}
        </button>
        <button
          style={styles.btnGhost}
          type="button"
          disabled={loading}
          onClick={onGoogleLogin}
        >
          Continue with Google
        </button>
        <button
          style={styles.btnGhost}
          type="button"
          disabled={loading}
          onClick={() => setMode((currentMode) => (currentMode === 'login' ? 'signup' : 'login'))}
        >
          {mode === 'login' ? 'Need an account? Create one' : 'Already have an account? Login'}
        </button>
      </form>
    </div>
  )
}

const styles = {
  loginScreen: {
    minHeight: '100vh',
    display: 'grid',
    placeContent: 'center',
    background: '#0A1628',
  },
  loginCard: {
    width: 'min(92vw, 360px)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    background: '#0F2040',
    border: '1px solid #1A3560',
    borderRadius: '12px',
    padding: '24px',
    color: '#FFFFFF',
  },
  input: {
    background: '#1A3560',
    border: '1px solid #1A3560',
    color: 'white',
    borderRadius: '8px',
    padding: '8px 10px',
    marginBottom: '8px',
  },
  btnPrimary: {
    background: '#00C853',
    color: '#000',
    border: 'none',
    borderRadius: '10px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontWeight: '700',
    marginTop: '8px',
  },
  btnGhost: {
    border: '1px solid #00C853',
    color: '#00C853',
    background: 'transparent',
    borderRadius: '10px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontWeight: '700',
    marginBottom: '4px',
  },
  errorMessage: {
    background: '#F4433622',
    border: '1px solid #F44336',
    color: '#F44336',
    padding: '8px 10px',
    borderRadius: '8px',
    marginBottom: '8px',
    fontSize: '14px',
  },
}
