import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { firestore } from '../config/firebase'
import { AlertCircle } from 'lucide-react'

export default function TopBar() {
  const location = useLocation()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!firestore) return
    const requestsRef = collection(firestore, 'Request')
    const q = query(requestsRef, where('status', '==', 'pending'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPendingCount(snapshot.docs.length)
    })
    return () => unsubscribe()
  }, [])

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'DASHBOARD OVERVIEW'
      case '/map':
        return 'LIVE TACTICAL MAP'
      case '/requests':
        return 'REQUEST MANAGEMENT'
      case '/incidents':
        return 'INCIDENT HISTORY'
      default:
        return 'CONTROL CENTER'
    }
  }

  const formatDateTime = () => {
    const day = currentTime.getDate().toString().padStart(2, '0')
    const month = currentTime.toLocaleString('en-US', { month: 'short' }).toUpperCase()
    const year = currentTime.getFullYear()
    const time = currentTime.toLocaleTimeString('en-US', { hour12: false })
    return `${day} ${month} ${year}  ${time} IST`
  }

  return (
    <div style={styles.topBar}>
      {/* Left: Breadcrumb */}
      <div style={styles.breadcrumb}>
        <span style={styles.breadcrumbText}>{getPageTitle()}</span>
        <span style={styles.separator}>/</span>
        <span style={styles.breadcrumbText}>CONTROL CENTER</span>
      </div>

      {/* Right: Clock & Alert */}
      <div style={styles.rightSection}>
        <div style={styles.clock}>{formatDateTime()}</div>
        <div style={styles.separator}>|</div>
        <div style={styles.alertSection}>
          <span style={{
            ...styles.statusDot,
            background: pendingCount > 0 ? '#DA3633' : '#2EA043'
          }}></span>
          <span style={{
            ...styles.alertText,
            color: pendingCount > 0 ? '#DA3633' : '#2EA043'
          }}>
            {pendingCount > 0 ? `${pendingCount} ALERT${pendingCount > 1 ? 'S' : ''} PENDING` : 'ALL CLEAR'}
          </span>
        </div>
      </div>
    </div>
  )
}

const styles = {
  topBar: {
    height: '48px',
    background: '#161B22',
    borderBottom: '1px solid #30363D',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 24px',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  breadcrumbText: {
    color: '#7D8590',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '0.5px'
  },
  separator: {
    color: '#30363D',
    fontSize: '12px',
    fontWeight: '300'
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  clock: {
    fontFamily: 'monospace',
    fontSize: '12px',
    color: '#79C0FF',
    fontWeight: '600',
    letterSpacing: '1px'
  },
  alertSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    display: 'inline-block'
  },
  alertText: {
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '1px'
  }
}
