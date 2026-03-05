import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { ref, onValue } from 'firebase/database'
import { firestore, database } from '../config/firebase'
import { useAuth } from '../context/AuthContext'

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [pendingCount, setPendingCount] = useState(0)
  const [firebaseConnected, setFirebaseConnected] = useState(true)

  useEffect(() => {
    if (!firestore) return
    const requestsRef = collection(firestore, 'Request')
    const q = query(requestsRef, where('status', '==', 'pending'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPendingCount(snapshot.docs.length)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (database) {
      const connectedRef = ref(database, '.info/connected')
      const unsubscribe = onValue(connectedRef, (snapshot) => {
        setFirebaseConnected(snapshot.val() === true)
      })
      return () => unsubscribe()
    } else {
      setFirebaseConnected(true)
    }
  }, [])

  const navItems = [
    { path: '/', icon: '🏠', label: 'Dashboard' },
    { path: '/map', icon: '🗺️', label: 'Live Map' },
    { path: '/requests', icon: '📋', label: 'Requests' },
    { path: '/incidents', icon: '📁', label: 'History' }
  ]

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (!user) return null

  return (
    <div style={styles.sidebar}>
      {/* Logo Section */}
      <div style={styles.logoSection}>
        <div style={styles.logoIcon}>🚦</div>
        <div style={styles.logoText}>GreenWave</div>
        <div style={styles.logoSubtext}>Emergency Response</div>
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {})
              }}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              <span style={styles.navLabel}>{item.label}</span>
              {item.path === '/requests' && pendingCount > 0 && (
                <span style={styles.badge}>{pendingCount}</span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div style={styles.bottomSection}>
        {/* Firebase Status */}
        <div style={styles.statusBar}>
          <span style={{
            ...styles.statusDot,
            background: firebaseConnected ? '#00C853' : '#F44336',
            boxShadow: firebaseConnected ? '0 0 8px rgba(0, 200, 83, 0.6)' : '0 0 8px rgba(244, 67, 54, 0.6)'
          }}></span>
          <span style={styles.statusText}>
            {firebaseConnected ? 'Connected' : 'Offline'}
          </span>
        </div>

        {/* User Info */}
        <div style={styles.userSection}>
          <div style={styles.userInfo}>
            <div style={styles.userIcon}>👤</div>
            <div style={styles.userEmail}>{user?.email || 'User'}</div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  sidebar: {
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    width: '220px',
    background: '#0A1628',
    borderRight: '1px solid #1A3560',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000
  },
  logoSection: {
    padding: '24px 20px',
    borderBottom: '1px solid #1A3560',
    textAlign: 'center'
  },
  logoIcon: {
    fontSize: '36px',
    marginBottom: '8px'
  },
  logoText: {
    color: '#00C853',
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '4px'
  },
  logoSubtext: {
    color: '#8FA8C8',
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  nav: {
    flex: 1,
    padding: '20px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    overflowY: 'auto'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: 'transparent',
    border: 'none',
    borderLeft: '3px solid transparent',
    borderRadius: '8px',
    color: '#8FA8C8',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '14px',
    fontWeight: '500',
    textAlign: 'left',
    position: 'relative'
  },
  navItemActive: {
    background: 'rgba(0, 200, 83, 0.08)',
    borderLeftColor: '#00C853',
    color: '#00C853'
  },
  navIcon: {
    fontSize: '18px',
    width: '24px',
    textAlign: 'center'
  },
  navLabel: {
    flex: 1
  },
  badge: {
    background: '#FF6D00',
    color: '#FFFFFF',
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '12px',
    minWidth: '20px',
    textAlign: 'center'
  },
  bottomSection: {
    borderTop: '1px solid #1A3560',
    padding: '16px'
  },
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 12px',
    background: 'rgba(26, 53, 96, 0.5)',
    borderRadius: '8px',
    marginBottom: '12px'
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    transition: 'all 0.3s ease'
  },
  statusText: {
    color: '#8FA8C8',
    fontSize: '12px',
    fontWeight: '600'
  },
  userSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    background: 'rgba(26, 53, 96, 0.5)',
    borderRadius: '8px'
  },
  userIcon: {
    fontSize: '16px'
  },
  userEmail: {
    color: '#FFFFFF',
    fontSize: '12px',
    fontWeight: '600',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1
  },
  logoutBtn: {
    width: '100%',
    padding: '10px',
    background: 'transparent',
    border: '1px solid #F44336',
    borderRadius: '8px',
    color: '#F44336',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }
}
