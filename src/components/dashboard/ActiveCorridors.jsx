import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore'
import { firestore } from '../../config/firebase'
import { Signal, Cross, Flame, Shield, AlertTriangle, AlertOctagon, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ActiveCorridors() {
  const [corridors, setCorridors] = useState([])

  useEffect(() => {
    const requestsRef = collection(firestore, 'Request')
    const q = query(requestsRef, where('status', '==', 'approved'))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setCorridors(data)
    })
    
    return () => unsubscribe()
  }, [])

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

  const handleCancel = async (id) => {
    try {
      await updateDoc(doc(firestore, 'Request', id), { status: 'cancelled' })
      toast.success('Corridor cancelled')
    } catch (error) {
      toast.error('Failed to cancel corridor')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={styles.header}>
        <Signal size={14} />
        <span style={styles.headerTitle}>ACTIVE CORRIDORS</span>
        <span style={styles.headerBadge}>{corridors.length}</span>
      </div>

      {/* Body */}
      <div style={styles.body}>
        {corridors.length === 0 && (
          <div style={styles.emptyState}>
            NO ACTIVE CORRIDORS
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {corridors.map((corridor) => {
            const IconComponent = getTypeIcon(corridor.type)
            return (
              <div
                key={corridor.id}
                style={styles.corridorCard}
              >
                {/* Row 1: Icon + Label + Status */}
                <div style={styles.row}>
                  <div style={styles.typeSection}>
                    <IconComponent size={14} color="#2EA043" />
                    <span style={styles.label}>CORRIDOR</span>
                  </div>
                  <div style={styles.activeBadge}>
                    <span style={styles.dot}></span>
                    <span>ACTIVE</span>
                  </div>
                </div>

                {/* Row 2: Unit ID */}
                <div style={styles.metaText}>
                  <span style={styles.metaLabel}>UNIT ID:</span>{' '}
                  <span style={styles.metaValue}>{corridor.id.substring(0, 8)}</span>
                </div>

                {/* Row 3: Location */}
                <div style={styles.metaText}>
                  <span style={styles.metaLabel}>LOCATION:</span>{' '}
                  <span style={styles.metaValue}>
                    {Number(corridor.cun_lat)?.toFixed(4)}° N  {Number(corridor.cun_lng)?.toFixed(4)}° E
                  </span>
                </div>

                {/* Row 4: Cancel Button */}
                <button
                  onClick={() => handleCancel(corridor.id)}
                  style={styles.btnCancel}
                >
                  CANCEL CORRIDOR
                </button>
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
  corridorCard: {
    background: '#1C2128',
    border: '1px solid #30363D',
    borderLeft: '2px solid #2EA043',
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
  label: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#7D8590',
    letterSpacing: '1px'
  },
  activeBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '10px',
    fontWeight: '700',
    color: '#2EA043',
    letterSpacing: '1px'
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#2EA043'
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
  btnCancel: {
    background: 'transparent',
    color: '#DA3633',
    border: '1px solid #DA3633',
    padding: '6px',
    borderRadius: '2px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '11px',
    letterSpacing: '1px',
    width: '100%',
    transition: 'all 0.2s ease'
  }
}
