import React from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { useRequests } from '../hooks/useRequests'
import L from 'leaflet'

const MapPage = () => {
  const { requests, loading, error } = useRequests()

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

  if (loading) return <div style={{ padding: '40px', color: '#8FA8C8' }}>Loading map...</div>
  if (error) return <div style={{ padding: '40px', color: '#F44336' }}>Error: {error}</div>

  // Filter out requests with invalid coordinates
  const validRequests = requests.filter(
    req => typeof req.cun_lat === 'number' && 
            typeof req.cun_lng === 'number' && 
            !isNaN(req.cun_lat) && 
            !isNaN(req.cun_lng)
  )

  return (
    <div style={{
      height: 'calc(100vh - 80px)',
      position: 'relative'
    }}>
      <MapContainer
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
            radius={8}
            fillColor={getTypeColor(req.type)}
            color="#FFFFFF"
            weight={2}
            opacity={1}
            fillOpacity={0.8}
          >
            <Popup>
              <div style={{ color: '#000' }}>
                <div><strong>Type:</strong> {req.type}</div>
                <div><strong>Status:</strong> {req.status}</div>
                <div><strong>Lat:</strong> {req.cun_lat.toFixed(4)}</div>
                <div><strong>Long:</strong> {req.cun_lng.toFixed(4)}</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}

export default MapPage
