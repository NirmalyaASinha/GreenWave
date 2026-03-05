import { useState, useMemo, useRef, useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from 'react-leaflet'
import { useRequests } from '../hooks/useRequests'
import { updateDoc, doc } from 'firebase/firestore'
import { firestore } from '../config/firebase'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import 'leaflet/dist/leaflet.css'

function MapPage() {
  const { requests, loading, error } = useRequests()
  const [selectedType, setSelectedType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const mapInitialized = useRef(false)

  useEffect(() => {
    return () => {
      // Cleanup map container
      const container = document.getElementById('mappage-container')
      if (container && container._leaflet_id) {
        container._leaflet_id = null
      }
    }
  }, [])

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateDoc(doc(firestore, 'Request', id), { status })
      toast.success(`Request ${status}`)
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const getTypeColor = (type) => {
    switch(type) {
      case 'medical': return '#F44336'
      case 'fire': return '#FF6D00'
      case 'police': return '#2962FF'
      case 'traffic': return '#FFC107'
      case 'accident': return '#9C27B0'
      default: return '#8FA8C8'
    }
  }

  const getTypeIcon = (type) => {
    switch(type) {
      case 'medical': return '🚑'
      case 'fire': return '🔥'
      case 'police': return '🚔'
      case 'traffic': return '🚦'
      case 'accident': return '⚠️'
      default: return '📍'
    }
  }

  const validRequests = useMemo(() => {
    return requests.filter(req => 
      !isNaN(req.cun_lat) && 
      !isNaN(req.cun_lng) &&
      (selectedType === 'all' || req.type === selectedType) &&
      (selectedStatus === 'all' || req.status === selectedStatus)
    )
  }, [requests, selectedType, selectedStatus])

  const stats = useMemo(() => {
    return requests.reduce((acc, req) => {
      acc[req.type] = (acc[req.type] || 0) + 1
      return acc
    }, {})
  }, [requests])

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ display: 'inline-block', fontSize: '32px' }}
        >
          ⚙️
        </motion.div>
        <div style={{ marginTop: '16px' }}>Loading map...</div>
      </div>
    )
  }

  if (error) {
    return <div style={styles.errorContainer}>Error: {error}</div>
  }

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <motion.div 
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
        style={styles.sidebar}
      >
        <h3 style={styles.sidebarTitle}>Map Filters</h3>
        
        {/* Type Filter */}
        <div style={styles.filterGroup}>
          <label style={styles.label}>Filter by Type</label>
          <select 
            value={selectedType} 
            onChange={(e) => setSelectedType(e.target.value)}
            style={styles.select}
          >
            <option value="all">All Types ({requests.length})</option>
            <option value="medical">🚑 Medical ({stats.medical || 0})</option>
            <option value="fire">🔥 Fire ({stats.fire || 0})</option>
            <option value="police">🚔 Police ({stats.police || 0})</option>
            <option value="traffic">🚦 Traffic ({stats.traffic || 0})</option>
            <option value="accident">⚠️ Accident ({stats.accident || 0})</option>
          </select>
        </div>

        {/* Status Filter */}
        <div style={styles.filterGroup}>
          <label style={styles.label}>Filter by Status</label>
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={styles.select}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* Legend */}
        <div style={styles.card}>
          <h4 style={styles.cardTitle}>Legend</h4>
          {['medical', 'fire', 'police', 'traffic', 'accident'].map(type => (
            <div key={type} style={styles.legendItem}>
              <div style={{ ...styles.legendDot, background: getTypeColor(type) }} />
              <span style={styles.legendText}>{type}</span>
            </div>
          ))}
        </div>

        {/* Statistics */}
        <div style={styles.card}>
          <h4 style={styles.cardTitle}>Statistics</h4>
          <div style={styles.statText}>
            <div>Showing: {validRequests.length} / {requests.length}</div>
            <div style={{ marginTop: '8px' }}>
              Active Corridors: {requests.filter(r => r.status === 'approved').length}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Map Container */}
      <div id="mappage-container" style={styles.mapWrapper}>
        {!mapInitialized.current && (
          <MapContainer
            key="greenwave-mappage"
            center={[23.0395, 72.583]}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
            whenCreated={() => { mapInitialized.current = true }}
          >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap contributors &copy; CartoDB'
          />
          
          {/* Request Markers */}
          {validRequests.map((req) => (
            <CircleMarker
              key={req.id}
              center={[req.cun_lat, req.cun_lng]}
              radius={req.status === 'approved' ? 12 : 8}
              fillColor={getTypeColor(req.type)}
              color={req.status === 'approved' ? '#00C853' : '#FFFFFF'}
              weight={req.status === 'approved' ? 3 : 2}
              opacity={1}
              fillOpacity={0.8}
            >
              <Popup>
                <div style={styles.popup}>
                  <div style={styles.popupTitle}>
                    {getTypeIcon(req.type)} {req.type.toUpperCase()}
                  </div>
                  
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{
                      ...styles.statusBadge,
                      background: req.status === 'approved' ? '#00C853' : 
                                 req.status === 'pending' ? '#FF6D00' : 
                                 req.status === 'rejected' ? '#F44336' : '#9E9E9E'
                    }}>
                      {req.status}
                    </span>
                  </div>
                  
                  <div style={styles.popupInfo}>
                    <div><strong>ID:</strong> {req.id.substring(0, 8)}...</div>
                    <div><strong>Lat:</strong> {req.cun_lat.toFixed(6)}</div>
                    <div><strong>Lng:</strong> {req.cun_lng.toFixed(6)}</div>
                  </div>
                  
                  {req.status === 'pending' && (
                    <div style={styles.popupActions}>
                      <button
                        onClick={() => handleStatusUpdate(req.id, 'approved')}
                        style={{ ...styles.actionBtn, background: '#00C853' }}
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(req.id, 'rejected')}
                        style={{ ...styles.actionBtn, background: '#F44336' }}
                      >
                        ✕ Reject
                      </button>
                    </div>
                  )}
                  
                  {req.status === 'approved' && (
                    <button
                      onClick={() => handleStatusUpdate(req.id, 'resolved')}
                      style={{ ...styles.actionBtn, background: '#9E9E9E', width: '100%', marginTop: '12px' }}
                    >
                      ✔ Resolve
                    </button>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* Green Corridors */}
          {validRequests
            .filter(req => req.status === 'approved')
            .map(req => (
              <Polyline
                key={`corridor-${req.id}`}
                positions={[
                  [req.cun_lat, req.cun_lng],
                  [req.cun_lat + 0.005, req.cun_lng + 0.005]
                ]}
                color="#00C853"
                weight={4}
                opacity={0.8}
                dashArray="10, 10"
              />
            ))
          }
        </MapContainer>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: {
    height: 'calc(100vh - 80px)',
    position: 'relative',
    display: 'flex',
    overflow: 'hidden'
  },
  loadingContainer: {
    padding: '40px',
    textAlign: 'center',
    color: '#8FA8C8'
  },
  errorContainer: {
    padding: '40px',
    color: '#F44336'
  },
  sidebar: {
    width: '320px',
    background: 'rgba(10, 22, 40, 0.95)',
    borderRight: '1px solid #1A3560',
    padding: '24px',
    overflowY: 'auto',
    backdropFilter: 'blur(10px)',
    flexShrink: 0
  },
  sidebarTitle: {
    color: '#00C853',
    marginBottom: '20px',
    fontSize: '18px',
    fontWeight: '600'
  },
  filterGroup: {
    marginBottom: '20px'
  },
  label: {
    color: '#8FA8C8',
    fontSize: '12px',
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500'
  },
  select: {
    width: '100%',
    background: '#1A3560',
    border: '1px solid #1A3560',
    borderRadius: '8px',
    padding: '10px 12px',
    color: '#FFFFFF',
    fontSize: '13px',
    cursor: 'pointer',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  card: {
    background: 'rgba(15, 32, 64, 0.8)',
    border: '1px solid #1A3560',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '20px'
  },
  cardTitle: {
    color: '#00C853',
    marginBottom: '12px',
    fontSize: '14px',
    fontWeight: '600'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px'
  },
  legendDot: {
    width: '16px',
    height: '16px',
    borderRadius: '50%'
  },
  legendText: {
    color: '#FFFFFF',
    fontSize: '12px',
    textTransform: 'capitalize'
  },
  statText: {
    color: '#8FA8C8',
    fontSize: '12px'
  },
  mapWrapper: {
    flex: 1,
    position: 'relative'
  },
  popup: {
    color: '#000',
    minWidth: '220px'
  },
  popupTitle: {
    fontSize: '18px',
    marginBottom: '8px',
    fontWeight: 'bold'
  },
  statusBadge: {
    color: '#fff',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    display: 'inline-block'
  },
  popupInfo: {
    fontSize: '11px',
    color: '#666',
    marginBottom: '8px'
  },
  popupActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px'
  },
  actionBtn: {
    border: 'none',
    color: '#fff',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '12px',
    flex: 1,
    transition: 'opacity 0.2s'
  }
}

export default MapPage