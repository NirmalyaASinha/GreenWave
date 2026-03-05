import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore'
import { firestore } from '../../config/firebase'
import { MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default function LiveMap() {
  const [requests, setRequests] = useState([])
  const [mapReady, setMapReady] = useState(false)
  const mapInitialized = useRef(false)

  useEffect(() => {
    // Ensure map renders only once mounted
    const timer = setTimeout(() => setMapReady(true), 100)
    return () => {
      clearTimeout(timer)
      setMapReady(false)
      // Cleanup map container
      const container = document.getElementById('livemap-container')
      if (container && container._leaflet_id) {
        container._leaflet_id = null
      }
    }
  }, [])

  useEffect(() => {
    const requestsRef = collection(firestore, 'Request')
    const unsubscribe = onSnapshot(requestsRef, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const docData = doc.data()
        return {
          id: doc.id,
          ...docData,
          cun_lat: Number(docData.cun_lat),
          cun_lng: Number(docData.cun_lng)
        }
      }).filter(req => 
        !isNaN(req.cun_lat) && 
        !isNaN(req.cun_lng)
      )
      setRequests(data)
    })
    return () => unsubscribe()
  }, [])

  const getMarkerColor = (type) => {
    const colors = {
      medical: '#DA3633',
      fire: '#D29922',
      police: '#1F6FEB',
      traffic: '#D29922',
      accident: '#8957E5'
    }
    return colors[type] || '#7D8590'
  }

  const getTypeLabel = (type) => {
    return type.charAt(0).toUpperCase()
  }

  const createMarkerIcon = (type) => {
    const color = getMarkerColor(type)
    const label = getTypeLabel(type)
    
    return L.divIcon({
      html: `<div style="
        width: 12px;
        height: 12px;
        background: ${color};
        border: 2px solid #E6EDF3;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #FFFFFF;
        font-weight: bold;
        font-size: 9px;
      ">${label}</div>`,
      className: '',
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    })
  }

  const handleApprove = async (requestId) => {
    try {
      await updateDoc(doc(firestore, 'Request', requestId), { status: 'approved' })
      toast.success('Request approved')
    } catch (error) {
      toast.error('Failed to approve request')
    }
  }

  const handleReject = async (requestId) => {
    try {
      await updateDoc(doc(firestore, 'Request', requestId), { status: 'rejected' })
      toast.success('Request rejected')
    } catch (error) {
      toast.error('Failed to reject request')
    }
  }

  if (!requests || requests.length === 0) {
    return (
      <div style={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          background: '#1C2128',
          borderBottom: '1px solid #30363D',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#7D8590'
        }}>
          <MapPin size={14} />
          <span style={{ fontSize: '11px', letterSpacing: '2px', fontWeight: '600' }}>LIVE TACTICAL MAP</span>
        </div>
        <div style={{ 
          flex: 1,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#7D8590',
          fontSize: '11px',
          letterSpacing: '2px'
        }}>
          NO ACTIVE REQUESTS
        </div>
      </div>
    )
  }

  if (!mapReady) {
    return (
      <div style={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          background: '#1C2128',
          borderBottom: '1px solid #30363D',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#7D8590'
        }}>
          <MapPin size={14} />
          <span style={{ fontSize: '11px', letterSpacing: '2px', fontWeight: '600' }}>LIVE TACTICAL MAP</span>
        </div>
        <div style={{ 
          flex: 1,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#7D8590',
          fontSize: '11px',
          letterSpacing: '2px'
        }}>
          LOADING MAP...
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        background: '#1C2128',
        borderBottom: '1px solid #30363D',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: '#7D8590'
      }}>
        <MapPin size={14} />
        <span style={{ fontSize: '11px', letterSpacing: '2px', fontWeight: '600' }}>LIVE TACTICAL MAP</span>
        <span style={{
          marginLeft: 'auto',
          fontSize: '11px',
          color: '#79C0FF',
          fontFamily: 'monospace'
        }}>
          23.0395° N  72.5830° E
        </span>
      </div>
      {/* Map */}
      <div id="livemap-container" style={{ flex: 1, overflow: 'hidden' }}>
      {!mapInitialized.current && (
        <MapContainer
          key="greenwave-livemap"
          center={[23.0395, 72.583]}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
          whenCreated={() => { mapInitialized.current = true }}
        >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap contributors &copy; CartoDB'
        />
        
        {requests.map((req) => (
        <Marker
          key={req.id}
          position={[req.cun_lat, req.cun_lng]}
          icon={createMarkerIcon(req.type)}
        >
          <Popup>
            <div style={{ 
              color: '#E6EDF3', 
              minWidth: '180px',
              background: '#161B22',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}>
              <div style={{ marginBottom: '8px', fontSize: '11px', letterSpacing: '1px' }}>
                <strong style={{ color: '#E6EDF3' }}>TYPE:</strong> {req.type.toUpperCase()}
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong>STATUS:</strong> <span style={{ 
                  color: req.status === 'approved' ? '#2EA043' : 
                         req.status === 'pending' ? '#D29922' : 
                         req.status === 'rejected' ? '#DA3633' : '#7D8590',
                  fontWeight: 'bold'
                }}>{req.status.toUpperCase()}</span>
              </div>
              <div style={{ marginBottom: '8px', fontSize: '11px', color: '#7D8590' }}>
                <div>LAT: {req.cun_lat.toFixed(4)}° N</div>
                <div>LNG: {req.cun_lng.toFixed(4)}° E</div>
              </div>
              {req.status === 'pending' && (
                <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                  <button
                    onClick={() => handleApprove(req.id)}
                    style={{
                      background: 'transparent',
                      color: '#2EA043',
                      border: '1px solid #2EA043',
                      padding: '4px 10px',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '10px',
                      letterSpacing: '1px',
                      flex: 1
                    }}
                  >
                    APPROVE
                  </button>
                  <button
                    onClick={() => handleReject(req.id)}
                    style={{
                      background: 'transparent',
                      color: '#DA3633',
                      border: '1px solid #DA3633',
                      padding: '4px 10px',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '10px',
                      letterSpacing: '1px',
                      flex: 1
                    }}
                  >
                    REJECT
                  </button>
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

        {requests
          .filter(req => req.status === 'approved')
          .map(req => (
            <Polyline
              key={`line-${req.id}`}
              positions={[[req.cun_lat, req.cun_lng], [req.cun_lat + 0.01, req.cun_lng + 0.01]]}
              color="#2EA043"
              weight={3}
              opacity={0.7}
            />
          ))}
      </MapContainer>
      )}
      </div>
    </div>
  )
}
