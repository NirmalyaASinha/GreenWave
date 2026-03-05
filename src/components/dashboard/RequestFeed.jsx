import { useEffect, useState, useRef } from 'react'
import { collection, onSnapshot, updateDoc, doc, query, orderBy } from 'firebase/firestore'
import { firestore } from '../../config/firebase'
import { Cross, Flame, Shield, AlertTriangle, AlertOctagon, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RequestFeed() {
  const [requests, setRequests] = useState([])
  const prevCountRef = useRef(0)
  const audioContextRef = useRef(null)

  useEffect(() => {
    const requestsRef = collection(firestore, 'Request')
    const q = query(requestsRef, orderBy('status'))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      const sorted = data.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1
        if (a.status !== 'pending' && b.status === 'pending') return 1
        return 0
      })
      
      const newPendingCount = sorted.filter(r => r.status === 'pending').length
      if (newPendingCount > prevCountRef.current && prevCountRef.current > 0) {
        playBeep()
        // Only show notification if already granted
        if ('Notification' in window && Notification.permission === 'granted') {
          const newRequest = sorted.find(r => r.status === 'pending')
          if (newRequest) {
            new Notification('🚨 New Emergency Request', {
              body: `New ${newRequest.type} request`,
              icon: '/vite.svg'
            })
          }
        }
      }
      prevCountRef.current = newPendingCount
      
      setRequests(sorted)
    })
    
    return () => unsubscribe()
  }, [])

  const playBeep = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }
      const ctx = audioContextRef.current
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      gainNode.gain.value = 0.3
      
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.1)
    } catch (error) {
      console.log('Audio playback failed')
    }
  }

  const getTypeIcon = (type) => {
    const iconMap = {
      medical: Cross,
      fire: Flame,
      police: Shield,
      traffic: AlertTriangle,
      accident: AlertOctagon
    }
    return iconMap[type] || MapPin
  }

  const getTypeColor = (type) => {
    const colors = {
      medical: '#DA3633',
      fire: '#D29922',
      police: '#1F6FEB',
      traffic: '#D29922',
      accident: '#8957E5'
    }
    return colors[type] || '#7D8590'
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: '#D29922',
      approved: '#2EA043',
      rejected: '#DA3633',
      resolved: '#7D8590'
    }
    return colors[status] || '#7D8590'
  }

  const handleApprove = async (id) => {
    try {
      await updateDoc(doc(firestore, 'Request', id), { status: 'approved' })
      toast.success('Request approved')
    } catch (error) {
      toast.error('Failed to approve')
    }
  }

  const handleReject = async (id) => {
    try {
      await updateDoc(doc(firestore, 'Request', id), { status: 'rejected' })
      toast.success('Request rejected')
    } catch (error) {
      toast.error('Failed to reject')
    }
  }

  const handleResolve = async (id) => {
    try {
      await updateDoc(doc(firestore, 'Request', id), { status: 'resolved' })
      toast.success('Request resolved')
    } catch (error) {
      toast.error('Failed to resolve')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={styles.header}>
        <MapPin size={14} />
        <span style={styles.headerTitle}>LIVE REQUEST FEED</span>
        <span style={styles.headerBadge}>{requests.length}</span>
      </div>

      {/* Body */}
      <div style={styles.body}>
        {requests.length === 0 && (
          <div style={styles.emptyState}>
            NO ACTIVE REQUESTS
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {requests.map((req) => {
            const IconComponent = getTypeIcon(req.type)
            return (
              <div
                key={req.id}
                style={{
                  ...styles.requestCard,
                  borderLeft: `2px solid ${getTypeColor(req.type)}`
                }}
              >
                {/* Row 1: Icon + Type + Status */}
                <div style={styles.row}>
                  <div style={styles.typeSection}>
                    <IconComponent size={16} color={getTypeColor(req.type)} />
                    <span style={styles.typeName}>{req.type.toUpperCase()}</span>
                  </div>
                  <span style={{
                    ...styles.statusBadge,
                    color: getStatusColor(req.status),
                    borderColor: getStatusColor(req.status),
                    background: `${getStatusColor(req.status)}33`
                  }}>
                    {req.status.toUpperCase()}
                  </span>
                </div>

                {/* Row 2: ID + Time */}
                <div style={styles.row}>
                  <div style={styles.metaText}>
                    <span style={styles.metaLabel}>REQ ID:</span>{' '}
                    <span style={styles.metaValue}>{req.id.substring(0, 8)}</span>
                  </div>
                </div>

                {/* Row 3: Location */}
                <div style={styles.metaText}>
                  <span style={styles.metaLabel}>LOCATION:</span>{' '}
                  <span style={styles.metaValue}>
                    {Number(req.cun_lat)?.toFixed(4)}° N  {Number(req.cun_lng)?.toFixed(4)}° E
                  </span>
                </div>

                {/* Row 4: Actions */}
                {req.status === 'pending' && (
                  <div style={styles.actionRow}>
                    <button
                      onClick={() => handleApprove(req.id)}
                      style={{ ...styles.btn, ...styles.btnApprove }}
                    >
                      APPROVE
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      style={{ ...styles.btn, ...styles.btnReject }}
                    >
                      REJECT
                    </button>
                  </div>
                )}

                {req.status === 'approved' && (
                  <button
                    onClick={() => handleResolve(req.id)}
                    style={{ ...styles.btn, ...styles.btnResolve, width: '100%' }}
                  >
                    RESOLVE
                  </button>
                )}
              </div>
            )
          })}
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
  headerBadge: {
    background: '#1C2128',
    border: '1px solid #30363D',
    color: '#E6EDF3',
    padding: '2px 8px',
    borderRadius: '2px',
    fontSize: '11px',
    fontFamily: 'monospace'
  },
  body: {
    padding: '12px',
    flex: 1,
    overflowY: 'auto'
  },
  emptyState: {
    textAlign: 'center',
    color: '#7D8590',
    fontSize: '11px',
    letterSpacing: '2px',
    padding: '40px 20px'
  },
  requestCard: {
    background: '#1C2128',
    border: '1px solid #30363D',
    borderRadius: '2px',
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  typeSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  typeName: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#E6EDF3',
    letterSpacing: '0.5px'
  },
  statusBadge: {
    padding: '2px 8px',
    borderRadius: '2px',
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '1px',
    border: '1px solid'
  },
  metaText: {
    fontSize: '11px',
    color: '#7D8590'
  },
  metaLabel: {
    letterSpacing: '1px'
  },
  metaValue: {
    color: '#79C0FF',
    fontFamily: 'monospace'
  },
  actionRow: {
    display: 'flex',
    gap: '8px',
    marginTop: '4px'
  },
  btn: {
    flex: 1,
    padding: '5px 12px',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '1px',
    borderRadius: '2px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: 'transparent'
  },
  btnApprove: {
    border: '1px solid #2EA043',
    color: '#2EA043'
  },
  btnReject: {
    border: '1px solid #DA3633',
    color: '#DA3633'
  },
  btnResolve: {
    border: '1px solid #7D8590',
    color: '#7D8590'
  }
}
