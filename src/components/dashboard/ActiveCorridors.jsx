import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore'
import { firestore } from '../../config/firebase'
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
    const icons = {
      medical: '🚑',
      fire: '🔥',
      police: '🚔',
      traffic: '🚦',
      accident: '⚠️'
    }
    return icons[type] || '📍'
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
    <div>
      <h3 style={{ color: '#00C853', marginBottom: '16px' }}>Active Corridors</h3>
      {corridors.length === 0 && (
        <div style={{ color: '#8FA8C8', textAlign: 'center', padding: '40px 20px' }}>
          No active corridors
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {corridors.map((corridor) => (
          <div
            key={corridor.id}
            style={{
              ...styles.corridorCard,
              animation: 'pulseBorder 1.6s infinite'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span style={{ fontSize: '24px' }}>{getTypeIcon(corridor.type)}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', textTransform: 'capitalize' }}>
                  {corridor.type}
                </div>
                <div style={{ fontSize: '11px', color: '#8FA8C8', fontFamily: 'monospace' }}>
                  ID: {corridor.id.substring(0, 8)}
                </div>
              </div>
              <span style={styles.activeBadge}>
                ACTIVE
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#8FA8C8', marginBottom: '8px' }}>
              Location: {Number(corridor.cun_lat)?.toFixed(4)}, {Number(corridor.cun_lng)?.toFixed(4)}
            </div>
            <button
              onClick={() => handleCancel(corridor.id)}
              style={styles.btnCancel}
            >
              Cancel Corridor
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  corridorCard: {
    background: 'rgba(26, 53, 96, 0.6)',
    border: '2px solid #00C853',
    borderRadius: '10px',
    padding: '16px',
    boxShadow: '0 0 20px rgba(0, 200, 83, 0.2)',
    transition: 'all 0.3s ease'
  },
  activeBadge: {
    background: 'rgba(0, 200, 83, 0.2)',
    color: '#00C853',
    border: '1.5px solid #00C853',
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '10px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    animation: 'pulse 1.1s infinite'
  },
  btnCancel: {
    background: 'transparent',
    color: '#F44336',
    border: '1.5px solid #F44336',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '12px',
    width: '100%',
    transition: 'all 0.2s ease'
  }
}
