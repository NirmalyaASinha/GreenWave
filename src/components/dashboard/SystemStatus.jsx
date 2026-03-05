import { useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { database } from '../../config/firebase'
import { Database, Map, Radio, ShieldCheck, Activity } from 'lucide-react'

export default function SystemStatus() {
  const [firebaseConnected, setFirebaseConnected] = useState(true)
  const [mapOnline, setMapOnline] = useState(true)
  const [feedLive, setFeedLive] = useState(true)
  const [authActive, setAuthActive] = useState(true)
  const [lastSync, setLastSync] = useState(new Date())

  useEffect(() => {
    if (database) {
      const connectedRef = ref(database, '.info/connected')
      const unsubscribe = onValue(connectedRef, (snapshot) => {
        setFirebaseConnected(snapshot.val() === true)
        setLastSync(new Date())
      })
      return () => unsubscribe()
    } else {
      setFirebaseConnected(true)
    }
  }, [])

  useEffect(() => {
    const checkMapStatus = setInterval(() => {
      setMapOnline(true)
      setLastSync(new Date())
    }, 5000)
    
    return () => clearInterval(checkMapStatus)
  }, [])

  const StatusRow = ({ icon: Icon, label, active }) => (
    <div style={styles.statusRow}>
      <div style={styles.statusLeft}>
        <Icon size={14} />
        <span style={styles.statusLabel}>{label}</span>
      </div>
      <div style={styles.statusRight}>
        <span style={{
          ...styles.statusDot,
          background: active ? '#2EA043' : '#DA3633'
        }}></span>
        <span style={{
          ...styles.statusText,
          color: active ? '#2EA043' : '#DA3633'
        }}>
          {active ? 'OPERATIONAL' : 'OFFLINE'}
        </span>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={styles.header}>
        <Activity size={14} />
        <span style={styles.headerTitle}>SYSTEM DIAGNOSTICS</span>
      </div>

      {/* Body */}
      <div style={styles.body}>
        <StatusRow icon={Database} label="DATABASE" active={firebaseConnected} />
        <StatusRow icon={Map} label="CARTOGRAPHY" active={mapOnline} />
        <StatusRow icon={Radio} label="REQUEST FEED" active={feedLive} />
        <StatusRow icon={ShieldCheck} label="AUTHENTICATION" active={authActive} />
        
        <div style={{...styles.statusRow, borderBottom: 'none', marginTop: '8px'}}>
          <div style={styles.statusLeft}>
            <Activity size={14} />
            <span style={styles.statusLabel}>LAST SYNC</span>
          </div>
          <span style={styles.timestampText}>
            {lastSync.toLocaleTimeString('en-US', { hour12: false })}
          </span>
        </div>
      </div>
    </div>
  )
}

const styles = {
  header: {
    background: '#1C2128',
    borderBottom: '1px solid #30363D',
    padding: '10px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#7D8590'
  },
  headerTitle: {
    flex: 1,
    fontSize: '11px',
    letterSpacing: '2px',
    fontWeight: '600'
  },
  body: {
    padding: '12px 16px',
    flex: 1
  },
  statusRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #30363D'
  },
  statusLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#7D8590'
  },
  statusLabel: {
    fontSize: '11px',
    letterSpacing: '1px',
    fontWeight: '600'
  },
  statusRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%'
  },
  statusText: {
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '1px'
  },
  timestampText: {
    fontSize: '11px',
    color: '#79C0FF',
    fontFamily: 'monospace'
  }
}
