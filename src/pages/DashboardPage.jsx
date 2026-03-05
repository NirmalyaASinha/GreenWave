import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { firestore } from '../config/firebase'
import { useCountUp } from '../hooks/useCountUp'
import { Signal, AlertCircle, Truck, FileText } from 'lucide-react'
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

  // Animated counts
  const animatedCorridors = useCountUp(stats.activeCorridors)
  const animatedPending = useCountUp(stats.pendingRequests)
  const animatedVehicles = useCountUp(stats.vehiclesOnDuty)
  const animatedRequests = useCountUp(stats.requestsToday)

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
      {/* Stats Row */}
      <div style={styles.statsRow}>
        {/* Active Corridors */}
        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <Signal size={16} color="#7D8590" />
            <span style={styles.statHeaderLabel}>ACTIVE CORRIDORS</span>
          </div>
          <div style={{ ...styles.statValue, color: '#E6EDF3' }}>{animatedCorridors}</div>
          <div style={styles.statStatus}>OPERATIONAL</div>
          <div style={{ ...styles.statLine, background: '#2EA043' }}></div>
        </div>
        
        {/* Pending Requests */}
        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <AlertCircle size={16} color="#7D8590" />
            <span style={styles.statHeaderLabel}>PENDING REQUESTS</span>
          </div>
          <div style={{ ...styles.statValue, color: '#E6EDF3' }}>{animatedPending}</div>
          <div style={styles.statStatus}>AWAITING APPROVAL</div>
          <div style={{ ...styles.statLine, background: '#D29922' }}></div>
        </div>
        
        {/* Vehicles On Duty */}
        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <Truck size={16} color="#7D8590" />
            <span style={styles.statHeaderLabel}>VEHICLES ON DUTY</span>
          </div>
          <div style={{ ...styles.statValue, color: '#E6EDF3' }}>{animatedVehicles}</div>
          <div style={styles.statStatus}>ACTIVE NOW</div>
          <div style={{ ...styles.statLine, background: '#1F6FEB' }}></div>
        </div>
        
        {/* Requests Today */}
        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <FileText size={16} color="#7D8590" />
            <span style={styles.statHeaderLabel}>REQUESTS TODAY</span>
          </div>
          <div style={{ ...styles.statValue, color: '#E6EDF3' }}>{animatedRequests}</div>
          <div style={styles.statStatus}>TOTAL COUNT</div>
          <div style={{ ...styles.statLine, background: '#7D8590' }}></div>
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
    padding: '20px'
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '20px'
  },
  statCard: {
    background: '#161B22',
    border: '1px solid #30363D',
    borderRadius: '4px',
    padding: '20px',
    position: 'relative'
  },
  statHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px'
  },
  statHeaderLabel: {
    fontSize: '10px',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    color: '#7D8590',
    fontWeight: '600'
  },
  statValue: {
    fontSize: '40px',
    fontWeight: '700',
    fontFamily: 'monospace',
    marginBottom: '8px',
    lineHeight: '1'
  },
  statStatus: {
    fontSize: '10px',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    color: '#7D8590',
    marginBottom: '16px'
  },
  statLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '2px'
  },
  middleRow: {
    display: 'grid',
    gridTemplateColumns: '60% 40%',
    gap: '16px',
    marginBottom: '16px'
  },
  mapContainer: {
    background: '#161B22',
    border: '1px solid #30363D',
    borderRadius: '4px',
    overflow: 'hidden',
    height: '480px'
  },
  feedContainer: {
    background: '#161B22',
    border: '1px solid #30363D',
    borderRadius: '4px',
    height: '480px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  bottomRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  corridorsContainer: {
    background: '#161B22',
    border: '1px solid #30363D',
    borderRadius: '4px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  statusContainer: {
    background: '#161B22',
    border: '1px solid #30363D',
    borderRadius: '4px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  }
}
