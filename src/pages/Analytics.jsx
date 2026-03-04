import './Analytics.css'
import { useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts'

const CORRIDOR_DATA = [
  { hour: '12am', activations: 2 },
  { hour: '1am', activations: 1 },
  { hour: '2am', activations: 0 },
  { hour: '6am', activations: 4 },
  { hour: '8am', activations: 12 },
  { hour: '9am', activations: 18 },
  { hour: '10am', activations: 14 },
  { hour: '12pm', activations: 8 },
  { hour: '1pm', activations: 6 },
  { hour: '3pm', activations: 11 },
  { hour: '5pm', activations: 16 },
  { hour: '6pm', activations: 22 },
  { hour: '7pm', activations: 19 },
  { hour: '9pm', activations: 5 }
]

const ETA_DATA = [
  { day: 'Mon', saved: 45, avg: 3.2 },
  { day: 'Tue', saved: 52, avg: 3.5 },
  { day: 'Wed', saved: 38, avg: 2.8 },
  { day: 'Thu', saved: 61, avg: 4.1 },
  { day: 'Fri', saved: 58, avg: 3.9 },
  { day: 'Sat', saved: 42, avg: 3.0 },
  { day: 'Sun', saved: 35, avg: 2.5 }
]

const VEHICLE_TYPE_DATA = [
  { name: 'Ambulance', value: 58, color: '#FF5252' },
  { name: 'Fire Truck', value: 28, color: '#FF9800' },
  { name: 'Police', value: 14, color: '#2196F3' }
]

const RESPONSE_TIME_DATA = [
  { day: '1 Mar', avg: 4.2 },
  { day: '2 Mar', avg: 3.9 },
  { day: '3 Mar', avg: 4.1 },
  { day: '4 Mar', avg: 3.7 },
  { day: '5 Mar', avg: 3.5 }
]

function Analytics() {
  const [timeRange, setTimeRange] = useState('week')

  const getFilteredData = () => {
    switch (timeRange) {
      case 'today':
        return { corridor: CORRIDOR_DATA, eta: ETA_DATA.slice(0, 1), response: RESPONSE_TIME_DATA.slice(-1) }
      case 'week':
        return { corridor: CORRIDOR_DATA, eta: ETA_DATA, response: RESPONSE_TIME_DATA }
      case 'month':
        return { corridor: CORRIDOR_DATA, eta: ETA_DATA, response: RESPONSE_TIME_DATA }
      default:
        return { corridor: CORRIDOR_DATA, eta: ETA_DATA, response: RESPONSE_TIME_DATA }
    }
  }

  const data = getFilteredData()
  const totalCorridors = CORRIDOR_DATA.reduce((sum, d) => sum + d.activations, 0)
  const totalTimeSaved = ETA_DATA.reduce((sum, d) => sum + d.saved, 0)

  return (
    <main className="analytics-page">
      <div className="analytics-container">
        <h1>Analytics Dashboard</h1>

        <div className="filter-section">
          <label>Time Range:</label>
          <div className="filter-buttons">
            {['today', 'week', 'month'].map(range => (
              <button
                key={range}
                className={`filter-btn ${timeRange === range ? 'active' : ''}`}
                onClick={() => setTimeRange(range)}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="summary-section">
          <div className="summary-card">
            <div className="summary-value">{totalCorridors}</div>
            <div className="summary-label">Total Corridors Activated</div>
          </div>
          <div className="summary-card">
            <div className="summary-value">{totalTimeSaved.toFixed(1)}</div>
            <div className="summary-label">Hours of Time Saved</div>
          </div>
          <div className="summary-card">
            <div className="summary-value">{totalCorridors}</div>
            <div className="summary-label">Lives Potentially Impacted</div>
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <h3>Corridor Activations (Hourly)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.corridor} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A3560" />
                <XAxis dataKey="hour" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 32, 64, 0.9)',
                    border: '1px solid #00C853',
                    borderRadius: '6px'
                  }}
                />
                <Bar dataKey="activations" fill="#00C853" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Average ETA Saved (Minutes)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.eta} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A3560" />
                <XAxis dataKey="day" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 32, 64, 0.9)',
                    border: '1px solid #00C853',
                    borderRadius: '6px'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="avg" stroke="#00C853" strokeWidth={2} dot={{ fill: '#00C853' }} name="Avg Time Saved (min)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Breakdown by Vehicle Type</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={VEHICLE_TYPE_DATA}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {VEHICLE_TYPE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 32, 64, 0.9)',
                    border: '1px solid #00C853'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Response Time Trend (Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.response} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A3560" />
                <XAxis dataKey="day" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 32, 64, 0.9)',
                    border: '1px solid #00C853',
                    borderRadius: '6px'
                  }}
                />
                <Area type="monotone" dataKey="avg" fill="rgba(0, 200, 83, 0.2)" stroke="#00C853" strokeWidth={2} name="Avg Response Time (min)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Analytics
