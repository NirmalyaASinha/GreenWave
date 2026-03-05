import React, { useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from 'react-leaflet'
import { useRequests } from '../hooks/useRequests'
import { updateDoc, doc } from 'firebase/firestore'
import { firestore } from '../config/firebase'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import 'leaflet/dist/leaflet.css'

const MapPage = () => {
  const { requests, loading, error } = useRequests()
  const [selectedType, setSelectedType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const getTypeColor = (type) => {
    const colors = {
      'medical': '#F44336',
      'fire': '#FF6D00',
      'police': '#2962FF',
      'traffic': '#FFC107',
      'accident': '#9C27B0'
    }
    return colors[type] || '#8FA8C8'
  }

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

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateDoc(doc(firestore, 'Request', id), { status })
      toast.success(`Request ${status}`)
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  if (loading) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#8FA8C8' }}>
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
  if (error) return <div style={{ padding: '40px', color: '#F44336' }}>Error: {error}</div>

  const validRequests = requests.filter(
    req => typeof req.cun_lat === 'number' && 
            typeof req.cun_lng === 'number' && 
            !isNaN(req.cun_lat) && 
            !isNaN(req.cun_lng) &&
            (selectedType === 'all' || req.type === selectedType) &&
            (selectedStatus === 'all' || req.status === selectedStatus)
  )

  const stats = requests.reduce((acc, req) => {
    acc[req.type] = (acc[req.type] || 0) + 1
    return acc
  }, {})

  return (
    <div style={{ height: 'calc(100vh - 80px)', position: 'relative', display: 'flex' }}>
      <motion.div 
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        style={styles.sidebar}
      >
        <h3 style={{ color: '#00C853', marginBottom: '20px' }}>Map Filters</h3>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ color: '#8FA8C8', fontSize: '12px', display: 'block', marginBottom: '8px' }}>
            Filter by Type
          </label>
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

        <div style={{ marginBottom: '20px' }}>
          <label style={{ color: '#8FA8C8', fontSize: '12px', display: 'block', marginBottom: '8px' }}>
            Filter by Status
          </label>
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

        <div style={styles.legendCard}>
          <h4 style={{ color: '#00C853', marginBottom: '12px', fontSize: '14px' }}>Legend</h4>
          {Object.entries({ medical: '#F44336', fire: '#FF6D00', police: '#2962FF', traffic: '#FFC107', accident: '#9C27B0' }).map(([type, color]) => (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: color }}></div>
              <span style={{ color: '#FFFFFF', fontSize: '12px', textTransform: 'capitalize' }}>{type}</span>
            </div>
          ))}
        </div>

        <div style={styles.statsCard}>
          <h4 style={{ color: '#00C853', marginBottom: '12px', fontSize: '14px' }}>Statistics</h4>
          <div style={{ color: '#8FA8C8', fontSize: '12px' }}>
            <div>Showing: {validRequests.length} / {requests.length}</div>
            <div>Active Corridors: {requests.filter(r => r.status === 'approved').length}</div>
          </div>
        </div>
      </motion.div>

      <div style={{ flex: 1 }} id="map-page-container">
        <MapContainer
          key="map-page"
          center={[23.0395, 72.583]}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap contributors &copy; CartoDB'
          />
          
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
                <div style={{ color: '#000', minWidth: '220px' }}>
                  <div style={{ fontSize: '20px', marginBottom: '8px', fontWeight: 'bold' }}>
                    {getTypeIcon(req.type)} {req.type.toUpperCase()}
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ 
                      background: req.status === 'approved' ? '#00C853' : 
                                 req.status === 'pending' ? '#FF6D00' : 
                                 req.status === 'rejected' ? '#F44336' : '#9E9E9E',
                      color: '#fff',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      {req.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>
                    <div><strong>ID:</strong> {req.id.substring(0, 8)}...</div>
                    <div><strong>Latitude:</strong> {req.cun_lat.toFixed(6)}</div>
                    <div><strong>Longitude:</strong> {req.cun_lng.toFixed(6)}</div>
                  </div>
                  {req.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <button
                        onClick={() => handleStatusUpdate(req.id, 'approved')}
                        style={{ ...styles.popupBtn, background: '#00C853' }}
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(req.id, 'rejected')}
                        style={{ ...styles.popupBtn, background: '#F44336' }}
                      >
                        ✕ Reject
                      </button>
                    </div>
                  )}
                  {req.status === 'approved' && (
                    <button
                      onClick={() => handleStatusUpdate(req.id, 'resolved')}
                      style={{ ...styles.popupBtn, background: '#9E9E9E', width: '100%', marginTop: '12px' }}
                    >
                      ✔ Mark Resolved
                    </button>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          ))}

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
            ))}
        </MapContainer>
      </div>
    </div>
  )
}

const styles = {
  sidebar: {
    width: '320px',
    background: 'rgba(10, 22, 40, 0.95)',
    borderRight: '1px solid #1A3560',
    padding: '24px',
    overflowY: 'auto',
    backdropFilter: 'blur(10px)'
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
    outline: 'none'
  },
  legendCard: {
    background: 'rgba(15, 32, 64, 0.8)',
    border: '1px solid #1A3560',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '20px'
  },
  statsCard: {
    background: 'rgba(15, 32, 64, 0.8)',
    border: '1px solid #1A3560',
    borderRadius: '8px',
    padding: '16px'
  },
  popupBtn: {
    border: 'none',
    color: '#fff',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '12px',
    flex: 1
  }
}

export default MapPage
