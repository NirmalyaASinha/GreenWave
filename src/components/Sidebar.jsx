import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { ref, onValue } from 'firebase/database'
import { firestore, database } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import { 
  LayoutDashboard, 
  Map, 
  ClipboardList, 
  Archive, 
  Shield,
  LogOut
} from 'lucide-react'

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
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/map', icon: Map, label: 'Live Map' },
    { path: '/requests', icon: ClipboardList, label: 'Requests' },
    { path: '/incidents', icon: Archive, label: 'History' }
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
        <Shield size={32} color="#1F6FEB" strokeWidth={2.5} />
        <div style={styles.logoText}>GREENWAVE</div>
        <div style={styles.logoSubtext}>EMERGENCY CORRIDOR SYSTEM</div>
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const IconComponent = item.icon
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {})
              }}
            >
              <IconComponent size={18} />
              <span style={styles.navLabel}>{item.label.toUpperCase()}</span>
              {item.path === '/requests' && pendingCount > 0 && (
                <span style={styles.badge}>{pendingCount}</span>
              )}
            </button>
          )
        })}
      </nav>

      <div style={styles.divider}></div>

      {/* Bottom Section */}
      <div style={styles.bottomSection}>
        {/* System Status Label */}
        <div style={styles.sectionLabel}>SYSTEM STATUS</div>
        
        {/* Firebase Status */}
        <div style={styles.statusRow}>
          <span style={{
            ...styles.statusDot,
            background: firebaseConnected ? '#2EA043' : '#DA3633'
          }}></span>
          <span style={styles.statusLabel}>FIREBASE</span>
          <span style={styles.statusValue}>
            {firebaseConnected ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>

        <div style={styles.divider}></div>

        {/* Operator Label */}
        <div style={styles.sectionLabel}>OPERATOR</div>
        
        {/* User Email */}
        <div style={styles.userEmail}>{user?.email || 'User'}</div>

        {/* Logout Button */}
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <LogOut size={14} />
          <span>SIGN OUT</span>
        </button>
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
    background: '#0D1117',
    borderRight: '1px solid #30363D',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000
  },
  logoSection: {
    padding: '32px 20px 24px',
    borderBottom: '1px solid #30363D',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px'
  },
  logoText: {
    color: '#E6EDF3',
    fontSize: '14px',
    fontWeight: '700',
    letterSpacing: '3px'
  },
  logoSubtext: {
    color: '#7D8590',
    fontSize: '9px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    lineHeight: '1.4'
  },
  nav: {
    flex: 1,
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    overflowY: 'auto'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    background: 'transparent',
    border: 'none',
    borderLeft: '2px solid transparent',
    color: '#7D8590',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '12px',
    fontWeight: '600',
    textAlign: 'left',
    position: 'relative',
    letterSpacing: '1px'
  },
  navItemActive: {
    background: 'rgba(31, 111, 235, 0.1)',
    borderLeftColor: '#1F6FEB',
    color: '#E6EDF3'
  },
  navLabel: {
    flex: 1
  },
  badge: {
    background: '#D29922',
    color: '#000000',
    fontSize: '9px',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '2px',
    minWidth: '18px',
    textAlign: 'center'
  },
  divider: {
    borderTop: '1px solid #30363D',
    margin: '8px 12px'
  },
  bottomSection: {
    padding: '16px'
  },
  sectionLabel: {
    fontSize: '9px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: '#7D8590',
    marginBottom: '12px',
    fontWeight: '600'
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 0',
    fontSize: '11px'
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%'
  },
  statusLabel: {
    color: '#7D8590',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '1px',
    flex: 1
  },
  statusValue: {
    color: '#E6EDF3',
    fontSize: '10px',
    fontWeight: '600',
    letterSpacing: '1px'
  },
  userEmail: {
    color: '#79C0FF',
    fontSize: '11px',
    fontFamily: 'monospace',
    marginBottom: '12px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  logoutBtn: {
    width: '100%',
    padding: '8px',
    background: 'transparent',
    border: 'none',
    color: '#DA3633',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '1px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px'
  }
}
