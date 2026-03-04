import './PredictionPanel.css'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts'

const MOCK_PREDICTIONS = [
  {
    id: 'intersection-001',
    name: 'CG Road x Ashram',
    riskScore: 85,
    timeOfDay: '9:30 AM',
    trendData: [
      { hour: '3h ago', risk: 45 },
      { hour: '2h ago', risk: 62 },
      { hour: '1h ago', risk: 73 },
      { hour: 'Now', risk: 85 }
    ]
  },
  {
    id: 'intersection-002',
    name: 'S.G. Road x Drive-in',
    riskScore: 72,
    timeOfDay: '6:15 PM',
    trendData: [
      { hour: '3h ago', risk: 35 },
      { hour: '2h ago', risk: 52 },
      { hour: '1h ago', risk: 65 },
      { hour: 'Now', risk: 72 }
    ]
  },
  {
    id: 'intersection-003',
    name: 'Mahal Road x Ring',
    riskScore: 58,
    timeOfDay: '4:45 PM',
    trendData: [
      { hour: '3h ago', risk: 28 },
      { hour: '2h ago', risk: 38 },
      { hour: '1h ago', risk: 48 },
      { hour: 'Now', risk: 58 }
    ]
  }
]

export const PredictionPanel = () => {
  return (
    <div className="prediction-panel">
      <h3 className="prediction-title">Risk Predictions</h3>
      <p className="prediction-subtitle">Next 3 high-risk intersections</p>

      <div className="predictions-grid">
        {MOCK_PREDICTIONS.map(prediction => (
          <div key={prediction.id} className="prediction-card">
            <div className="prediction-header">
              <h4 className="prediction-name">{prediction.name}</h4>
              {prediction.riskScore > 75 && (
                <span className="pre-clear-badge">⚠️ Pre-clear Recommended</span>
              )}
            </div>

            <div className="risk-score-container">
              <div className="risk-label">Risk Score</div>
              <div className="risk-bar-group">
                <div className="risk-percentage">{prediction.riskScore}%</div>
                <div className="risk-bar">
                  <div
                    className={`risk-fill risk-${getRiskLevel(prediction.riskScore)}`}
                    style={{ width: `${prediction.riskScore}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="sparkline-container">
              <ResponsiveContainer width="100%" height={50}>
                <LineChart data={prediction.trendData}>
                  <XAxis dataKey="hour" hide />
                  <YAxis hide domain={[0, 100]} />
                  <Line
                    type="monotone"
                    dataKey="risk"
                    stroke={getRiskColor(prediction.riskScore)}
                    dot={false}
                    strokeWidth={2}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="prediction-time">Time window: {prediction.timeOfDay}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function getRiskLevel(score) {
  if (score >= 75) return 'high'
  if (score >= 50) return 'medium'
  return 'low'
}

function getRiskColor(score) {
  if (score >= 75) return '#FF5252'
  if (score >= 50) return '#FFC107'
  return '#4CAF50'
}

export default PredictionPanel
