import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import './LiveMap.css'

function LiveMap({ intersections = null }) {
  const [activeVehicle, setActiveVehicle] = useState(null)
  const [corridorActive, setCorridorActive] = useState(true)

  // Default Ahmedabad city coordinates and intersections
  const defaultIntersections = [
    {
      id: 'INT-001',
      name: 'Intersection 1: CG Road & Ashram Road',
      lat: 23.1815,
      lng: 72.5371,
      status: 'normal', // green
      vehicles: [
        { id: 'VEH-101', type: 'Ambulance', eta: '2 mins', status: 'approaching' }
      ]
    },
    {
      id: 'INT-002',
      name: 'Intersection 2: S.G. Road & Mahal Road',
      lat: 23.1875,
      lng: 72.5456,
      status: 'warning', // yellow
      vehicles: []
    },
    {
      id: 'INT-003',
      name: 'Intersection 3: C.G. Road & Drive-in Road',
      lat: 23.1950,
      lng: 72.5410,
      status: 'active', // red pulsing
      vehicles: [
        { id: 'VEH-102', type: 'Fire Truck', eta: '30 secs', status: 'active' }
      ]
    },
    {
      id: 'INT-004',
      name: 'Intersection 4: Sardar Patel Ring Road & S.G. Road',
      lat: 23.1742,
      lng: 72.5520,
      status: 'normal', // green
      vehicles: []
    }
  ]

  const data = intersections || defaultIntersections

  // Ahmedabad city center
  const ahmedabadCenter = [23.1815, 72.5371]

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal':
        return '#4CAF50' // Green
      case 'warning':
        return '#FFC107' // Yellow
      case 'active':
        return '#FF5252' // Red
      default:
        return '#666'
    }
  }

  const handleIntersectionClick = (intersection) => {
    if (intersection.vehicles && intersection.vehicles.length > 0) {
      setActiveVehicle(intersection.vehicles[0])
    }
  }

  // Get polyline coordinates when corridor is active
  const getPolylineCoordinates = () => {
    if (!corridorActive) return []
    return data.map(int => [int.lat, int.lng])
  }

  return (
    <div className="livemap-container">
      <MapContainer
        center={ahmedabadCenter}
        zoom={14}
        className="map"
      >
        {/* Dark CartoDB Tile Layer */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={19}
        />

        {/* Polyline connecting intersections */}
        {corridorActive && (
          <Polyline
            positions={getPolylineCoordinates()}
            color="#00C853"
            weight={3}
            opacity={0.8}
            dashArray="5, 5"
          />
        )}

        {/* Intersection Circle Markers */}
        {data.map(intersection => (
          <CircleMarker
            key={intersection.id}
            center={[intersection.lat, intersection.lng]}
            radius={intersection.status === 'active' ? 15 : 10}
            pathOptions={{
              color: getStatusColor(intersection.status),
              weight: 2,
              opacity: 1,
              fillColor: getStatusColor(intersection.status),
              fillOpacity: intersection.status === 'active' ? 0.6 : 0.7,
              className: intersection.status === 'active' ? 'pulsing-marker' : ''
            }}
            eventHandlers={{
              click: () => handleIntersectionClick(intersection)
            }}
          >
            <Popup>
              <div className="marker-popup">
                <h4>{intersection.name}</h4>
                <p>Status: <strong>{intersection.status.toUpperCase()}</strong></p>
                {intersection.vehicles && intersection.vehicles.length > 0 && (
                  <div>
                    <p>Active Vehicles: {intersection.vehicles.length}</p>
                  </div>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Sidebar with vehicle info */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h3>Active Vehicle</h3>
          <button
            className="corridor-toggle"
            onClick={() => setCorridorActive(!corridorActive)}
            style={{
              backgroundColor: corridorActive ? 'var(--accent)' : 'var(--bg-secondary)',
              color: corridorActive ? 'var(--bg-primary)' : 'var(--text-primary)'
            }}
          >
            {corridorActive ? '✓ Corridor Active' : 'Corridor Inactive'}
          </button>
        </div>

        <div className="sidebar-content">
          {activeVehicle ? (
            <div className="vehicle-info">
              <div className="info-item">
                <label>Vehicle ID</label>
                <p>{activeVehicle.id}</p>
              </div>
              <div className="info-item">
                <label>Type</label>
                <p>{activeVehicle.type}</p>
              </div>
              <div className="info-item">
                <label>ETA</label>
                <p className="eta">{activeVehicle.eta}</p>
              </div>
              <div className="info-item">
                <label>Status</label>
                <p className="status">{activeVehicle.status.toUpperCase()}</p>
              </div>
            </div>
          ) : (
            <div className="no-vehicle">
              <p>Click on an intersection with vehicles to see details</p>
            </div>
          )}
        </div>

        {/* Intersections List */}
        <div className="intersections-list">
          <h4>Intersections</h4>
          {data.map(int => (
            <div
              key={int.id}
              className={`intersection-item status-${int.status}`}
              onClick={() => handleIntersectionClick(int)}
              style={{ cursor: int.vehicles?.length > 0 ? 'pointer' : 'default' }}
            >
              <div className="intersection-status"></div>
              <div className="intersection-info">
                <p className="intersection-name">{int.name}</p>
                {int.vehicles && int.vehicles.length > 0 && (
                  <p className="vehicle-count">{int.vehicles.length} vehicle(s)</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LiveMap
