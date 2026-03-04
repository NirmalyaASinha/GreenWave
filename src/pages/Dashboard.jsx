import './Dashboard.css'
import { useEffect } from 'react'
import useGreenWave from '../hooks/useGreenWave'
import { useCountUp } from '../hooks/useCountUp'
import { useConnection } from '../contexts/ConnectionContext'
import { useToast } from '../contexts/ToastContext'
import PredictionPanel from '../components/PredictionPanel'
import HardwareStatus from '../components/HardwareStatus'

function Dashboard() {
  const { vehicles, alerts, connectionStatus } = useGreenWave()
  const { connectionState } = useConnection()
  const { showToast } = useToast()

  const ambulanceCount = vehicles.filter(v => v.type === 'Ambulance').length
  const fireCount = vehicles.filter(v => v.type === 'Fire Truck').length
  const alertCount = alerts.length
  const alertCountUp = useCountUp(alertCount, 300)

  useEffect(() => {
    if (connectionState === 'connected') {
      showToast('🟢 Connected to GreenWave backend', 'success')
    } else if (connectionState === 'simulating') {
      showToast('🔴 Switched to simulation mode', 'warning')
    }
  }, [connectionState, showToast])

  return (
    <main className="dashboard">
      <div className="dashboard-container">
        <h1>GreenWave Dashboard</h1>

        <div className="stats-grid">
          <div className="stat-card stat-green">
            <div className="stat-icon">🚑</div>
            <h3>Active Ambulances</h3>
            <p className="stat-value">{ambulanceCount}</p>
            <p className="stat-subtitle">Type 1 Response</p>
          </div>

          <div className="stat-card stat-white">
            <div className="stat-icon">🚒</div>
            <h3>Fire Trucks</h3>
            <p className="stat-value">{fireCount}</p>
            <p className="stat-subtitle">Dispatch Ready</p>
          </div>

          <div className="stat-card stat-green">
            <div className="stat-icon">⏱️</div>
            <h3>Avg Time Saved</h3>
            <p className="stat-value">3.2 min</p>
            <p className="stat-subtitle">Per Activation</p>
          </div>

          <div className={`stat-card ${alertCountUp > 0 ? 'stat-orange' : 'stat-white'}`}>
            <div className="stat-icon">⚠️</div>
            <h3>Alerts Today</h3>
            <p className="stat-value">{alertCountUp}</p>
            <p className="stat-subtitle">Real-time Updates</p>
          </div>
        </div>

        <PredictionPanel />
        <HardwareStatus />
      </div>
    </main>
  )
}

export default Dashboard
