import { useState } from 'react'
import './IncidentLog.css'

function IncidentLog() {
  const [incidents] = useState([
    {
      id: 'INC-001',
      timestamp: '2026-03-05 11:45:23',
      type: 'Medical Emergency',
      severity: 'high',
      location: 'CG Road, Ahmedabad',
      vehicleAssigned: 'A-101',
      status: 'responded',
      description: 'Patient with chest pain, ambulance en-route'
    },
    {
      id: 'INC-002',
      timestamp: '2026-03-05 11:32:15',
      type: 'Fire',
      severity: 'critical',
      location: 'Drive-in Road, Ahmedabad',
      vehicleAssigned: 'F-202',
      status: 'active',
      description: 'Building fire reported, multiple fire trucks dispatched'
    },
    {
      id: 'INC-003',
      timestamp: '2026-03-05 11:20:48',
      type: 'Traffic Accident',
      severity: 'medium',
      location: 'S.G. Road, Ahmedabad',
      vehicleAssigned: 'A-102',
      status: 'responded',
      description: 'Multi-vehicle collision, ambulance en-route'
    },
    {
      id: 'INC-004',
      timestamp: '2026-03-05 10:55:32',
      type: 'Medical Emergency',
      severity: 'medium',
      location: 'Ashram Road, Ahmedabad',
      vehicleAssigned: 'A-103',
      status: 'resolved',
      description: 'Patient transferred to hospital successfully'
    },
    {
      id: 'INC-005',
      timestamp: '2026-03-05 10:40:10',
      type: 'Fire',
      severity: 'low',
      location: 'Mahal Road, Ahmedabad',
      vehicleAssigned: 'F-201',
      status: 'resolved',
      description: 'Small fire extinguished, area cleared'
    }
  ])

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return '#FF5252'
      case 'high':
        return '#FF9800'
      case 'medium':
        return '#FFC107'
      case 'low':
        return '#4CAF50'
      default:
        return '#666'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Active'
      case 'responded':
        return 'En-Route'
      case 'resolved':
        return 'Resolved'
      default:
        return status
    }
  }

  return (
    <main className="incident-log">
      <div className="incident-log-container">
        <h1>Incident Log</h1>
        
        <div className="log-controls">
          <input
            type="text"
            placeholder="Search incidents..."
            className="search-input"
          />
          <select className="filter-select">
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="incidents-table-wrapper">
          <table className="incidents-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Timestamp</th>
                <th>Type</th>
                <th>Severity</th>
                <th>Location</th>
                <th>Vehicle</th>
                <th>Status</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map(incident => (
                <tr key={incident.id} className={`severity-${incident.severity}`}>
                  <td className="incident-id">{incident.id}</td>
                  <td className="timestamp">{incident.timestamp}</td>
                  <td className="type">{incident.type}</td>
                  <td>
                    <span
                      className="severity-badge"
                      style={{ backgroundColor: getSeverityColor(incident.severity) }}
                    >
                      {incident.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="location">{incident.location}</td>
                  <td className="vehicle">{incident.vehicleAssigned}</td>
                  <td>
                    <span
                      className={`status-badge status-${incident.status}`}
                    >
                      {getStatusLabel(incident.status)}
                    </span>
                  </td>
                  <td className="description">{incident.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}

export default IncidentLog
