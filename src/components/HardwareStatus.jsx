import { useState, useEffect } from 'react'
import './HardwareStatus.css'

const MOCK_HARDWARE = [
  { id: 'gps', name: 'Neo-6M GPS', status: 'online', lastPing: 0, details: 'Timestamp: sync' },
  { id: 'wifi', name: 'ESP8266 WiFi', status: 'online', lastPing: 0, signal: 95, details: 'Signal: 95%' },
  { id: 'signals', name: 'Arduino Signals', status: 'online', lastPing: 0, active: 4, details: '4/4 intersections' },
  { id: 'sim', name: 'SIM800L GSM', status: 'online', lastPing: 0, details: 'Carrier: Jio' },
  { id: 'rpi', name: 'Raspberry Pi', status: 'online', lastPing: 0, cpu: 42, mem: 58, details: 'CPU: 42%, Mem: 58%' }
]

export const HardwareStatus = () => {
  const [hardware, setHardware] = useState(MOCK_HARDWARE)
  const [selectedComponent, setSelectedComponent] = useState(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setHardware(prev =>
        prev.map(h => ({
          ...h,
          lastPing: h.lastPing + 1,
          signal: h.signal ? Math.max(85, h.signal - Math.random() * 5) : undefined,
          cpu: h.cpu ? Math.max(30, h.cpu + (Math.random() - 0.5) * 10) : undefined,
          mem: h.mem ? Math.max(45, h.mem + (Math.random() - 0.5) * 10) : undefined,
          status: h.lastPing + 1 > 30 ? 'offline' : 'online'
        }))
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="hardware-status">
      <h3 className="hardware-title">System Hardware Status</h3>

      <div className="hardware-list">
        {hardware.map(component => (
          <div
            key={component.id}
            className={`hardware-item status-${component.status}`}
            onClick={() => setSelectedComponent(component.id)}
          >
            <div className="hardware-header">
              <span className={`status-dot status-${component.status}`} />
              <span className="hardware-name">{component.name}</span>
            </div>
            <div className="hardware-details">{component.details}</div>
            <div className="hardware-ping">Last ping: {component.lastPing}s ago</div>
          </div>
        ))}
      </div>

      {selectedComponent && (
        <div className="hardware-logs">
          <h4>Recent Logs</h4>
          <div className="logs-list">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="log-entry">
                <span className="log-time">{new Date(Date.now() - i * 5000).toLocaleTimeString()}</span>
                <span className="log-message">Component heartbeat received</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default HardwareStatus
