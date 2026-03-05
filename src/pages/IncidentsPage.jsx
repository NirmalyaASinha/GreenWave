import React from 'react'
import { useHistory } from '../hooks/useHistory'

const IncidentsPage = () => {
  const { history, loading, error } = useHistory()

  if (loading) return <div style={{ padding: '40px', color: '#8FA8C8' }}>Loading incidents...</div>
  if (error) return <div style={{ padding: '40px', color: '#F44336' }}>Error: {error}</div>

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ color: '#00C853', marginBottom: '30px' }}>Incident History</h1>
      
      <div style={{
        backgroundColor: 'rgba(15, 32, 64, 0.8)',
        borderRadius: '12px',
        border: '1px solid #1A3560',
        backdropFilter: 'blur(10px)',
        overflowX: 'auto'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          color: '#FFFFFF'
        }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #1A3560' }}>
              <th style={{ padding: '15px', textAlign: 'left', color: '#00C853' }}>Document ID</th>
              <th style={{ padding: '15px', textAlign: 'left', color: '#00C853' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {history.map((incident) => (
              <tr key={incident.id} style={{ borderBottom: '1px solid #1A3560' }}>
                <td style={{ padding: '15px', fontSize: '12px', fontFamily: 'monospace', color: '#00C853' }}>
                  {incident.id}
                </td>
                <td style={{ padding: '15px', fontSize: '12px', color: '#8FA8C8' }}>
                  <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
                    {Object.entries(incident).map(([key, value]) => {
                      if (key === 'id') return null
                      return (
                        <div key={key}>
                          <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </div>
                      )
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {history.length === 0 && (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: '#8FA8C8',
          backgroundColor: 'rgba(15, 32, 64, 0.8)',
          borderRadius: '12px',
          marginTop: '20px'
        }}>
          No incident history available
        </div>
      )}
    </div>
  )
}

export default IncidentsPage
