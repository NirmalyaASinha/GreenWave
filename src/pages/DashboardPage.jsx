import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { firestore } from '../config/firebase'
import { useCountUp } from '../hooks/useCountUp'
import LiveMap from '../components/map/LiveMap'
import RequestFeed from '../components/dashboard/RequestFeed'
import ActiveCorridors from '../components/dashboard/ActiveCorridors'
import SystemStatus from '../components/dashboard/SystemStatus'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    activeCorridors: 0,
    pendingRequests: 0,
    vehiclesOnDuty: 0,
    requestsToday: 0
  })

  const [currentTime, setCurrentTime] = useState(new Date())

  // Animated counts
  const animatedCorridors = useCountUp(stats.activeCorridors)
  const animatedPending = useCountUp(stats.pendingRequests)
  const animatedVehicles = useCountUp(stats.vehiclesOnDuty)
  const animatedRequests = useCountUp(stats.requestsToday)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const requestsRef = collection(firestore, 'Request')
    const unsubscribe = onSnapshot(requestsRef, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      setStats({
        activeCorridors: requests.filter(r => r.status === 'approved').length,
        pendingRequests: requests.filter(r => r.status === 'pending').length,
        vehiclesOnDuty: requests.filter(r => r.status === 'approved' || r.status === 'pending').length,
        requestsToday: requests.length
      })
    })
    
    return () => unsubscribe()
  }, [])

  return (
    <div style={styles.page}>
      {/* Page Title Bar */}
      <div style={styles.titleBar}>
        <div style={styles.titleSection}>
          <h1 style={styles.pageTitle}>Dashboard</h1>
          <p style={styles.pageSubtitle}>Real-time emergency response overview</p>
        </div>
        <div style={styles.clockSection}>
          <div style={styles.time}>{currentTime.toLocaleTimeString()}</div>
          <div style={styles.date}>{currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🚦</div>
          <div style={styles.statLabel}>Active Corridors</div>
          <div style={{ ...styles.statValue, color: '#00C853' }}>{animatedCorridors}</div>
          <div style={{
            ...styles.statGlow,
            background: 'radial-gradient(circle, rgba(0,200,83,0.15) 0%, transparent 70%)'
          }}></div>
        </div>
        
        <div style={{
          ...styles.statCard,
          ...(stats.pendingRequests > 0 ? styles.pulsingCard : {})
        }}>
          <div style={styles.statIcon}>⏳</div>
          <div style={styles.statLabel}>Pending Requests</div>
          <div style={{ ...styles.statValue, color: '#FF6D00' }}>{animatedPending}</div>
          <div style={{
            ...styles.statGlow,
            background: 'radial-gradient(circle, rgba(255,109,0,0.15) 0%, transparent 70%)'
          }}></div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🚗</div>
          <div style={styles.statLabel}>Vehicles On Duty</div>
          <div style={styles.statValue}>{animatedVehicles}</div>
          <div style={{
            ...styles.statGlow,
            background: 'radial-gradient(circle, rgba(66,165,245,0.15) 0%, transparent 70%)'
          }}></div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📊</div>
          <div style={styles.statLabel}>Requests Today</div>
          <div style={styles.statValue}>{animatedRequests}</div>
          <div style={{
            ...styles.statGlow,
            background: 'radial-gradient(circle, rgba(142,168,200,0.15) 0%, transparent 70%)'
          }}></div>
        </div>
      </div>

      <div style={styles.middleRow}>
        <div style={styles.mapContainer}>
          <LiveMap />
        </div>
        <div style={styles.feedContainer}>
          <RequestFeed />
        </div>
      </div>

      <div style={styles.bottomRow}>
        <div style={styles.corridorsContainer}>
          <ActiveCorridors />
        </div>
        <div style={styles.statusContainer}>
          <SystemStatus />
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    padding: '24px',
    animation: 'fadeIn 0.3s ease'
  },
  titleBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    padding: '20px 24px',
    background: 'rgba(15, 32, 64, 0.6)',
    border: '1px solid #1A3560',
    borderRadius: '12px',
    animation: 'fadeInUp 0.5s ease'
  },
  titleSection: {
    flex: 1
  },
  pageTitle: {
    margin: 0,
    fontSize: '28px',
    fontWeight: '700',
    color: '#00C853',
    marginBottom: '4px'
  },
  pageSubtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#8FA8C8'
  },
  clockSection: {
    textAlign: 'right'
  },
  time: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'monospace',
    marginBottom: '4px'
  },
  date: {
    fontSize: '12px',
    color: '#8FA8C8'
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    marginBottom: '20px'
  },
  statCard: {
    background: 'rgba(15, 32, 64, 0.8)',
    backdropFilter: 'blur(10px)',
    border: '1px solid #1A3560',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    animation: 'fadeInUp 0.6s ease'
  },
  pulsingCard: {
    animation: 'pulse 2s infinite'
  },
  statIcon: {
    fontSize: '32px',
    marginBottom: '8px'
  },
  statLabel: {
    color: '#8FA8C8',
    fontSize: '14px',
    marginBottom: '8px'
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: '32px',
    fontWeight: '700',
    position: 'relative',
    zIndex: 1
  },
  statGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '120%',
    height: '120%',
    borderRadius: '50%',
    zIndex: 0,
    pointerEvents: 'none',
    opacity: 0.6
  },
  middleRow: {
    display: 'grid',
    gridTemplateColumns: '60% 40%',
    gap: '20px',
    marginBottom: '20px'
  },
  mapContainer: {
    background: 'rgba(15, 32, 64, 0.8)',
    border: '1px solid #1A3560',
    borderRadius: '12px',
    overflow: 'hidden',
    height: '480px'
  },
  feedContainer: {
    background: 'rgba(15, 32, 64, 0.8)',
    border: '1px solid #1A3560',
    borderRadius: '12px',
    padding: '20px',
    height: '480px',
    overflow: 'auto'
  },
  bottomRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px'
  },
  corridorsContainer: {
    background: 'rgba(15, 32, 64, 0.8)',
    border: '1px solid #1A3560',
    borderRadius: '12px',
    padding: '20px'
  },
  statusContainer: {
    background: 'rgba(15, 32, 64, 0.8)',
    border: '1px solid #1A3560',
    borderRadius: '12px',
    padding: '20px'
  }
}
