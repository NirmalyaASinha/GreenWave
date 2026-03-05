import React, { useState } from 'react'
import { useRequests } from '../hooks/useRequests'
import { updateDoc, doc } from 'firebase/firestore'
import { firestore } from '../config/firebase'
import toast from 'react-hot-toast'

const RequestsPage = () => {
  const { requests, loading, error } = useRequests()

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      const docRef = doc(firestore, 'Request', requestId)
      await updateDoc(docRef, { status: newStatus })
      const statusText = newStatus.charAt(0).toUpperCase() + newStatus.slice(1)
      toast.success(`Request ${statusText}`)
    } catch (err) {
      toast.error('Failed to update request')
      console.error(err)
    }
  }

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

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#FF6D00',
      'approved': '#00C853',
      'rejected': '#F44336',
      'resolved': '#9E9E9E'
    }
    return colors[status] || '#8FA8C8'
  }

  if (loading) return <div style={{ padding: '40px', color: '#8FA8C8' }}>Loading requests...</div>
  if (error) return <div style={{ padding: '40px', color: '#F44336' }}>Error: {error}</div>

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ color: '#00C853', marginBottom: '30px' }}>Emergency Requests</h1>
      
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
              <th style={{ padding: '15px', textAlign: 'left', color: '#00C853' }}>Type</th>
              <th style={{ padding: '15px', textAlign: 'left', color: '#00C853' }}>Status</th>
              <th style={{ padding: '15px', textAlign: 'left', color: '#00C853' }}>Location</th>
              <th style={{ padding: '15px', textAlign: 'left', color: '#00C853' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} style={{ borderBottom: '1px solid #1A3560' }}>
                <td style={{ padding: '15px' }}>
                  <span style={{
                    backgroundColor: getTypeColor(req.type),
                    color: '#FFFFFF',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {req.type}
                  </span>
                </td>
                <td style={{ padding: '15px' }}>
                  <span style={{
                    backgroundColor: getStatusColor(req.status),
                    color: '#FFFFFF',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {req.status}
                  </span>
                </td>
                <td style={{ padding: '15px', fontSize: '12px', color: '#8FA8C8' }}>
                  {req.cun_lat?.toFixed(4)}, {req.cun_lng?.toFixed(4)}
                </td>
                <td style={{ padding: '15px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {req.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(req.id, 'approved')}
                          style={{
                            backgroundColor: '#00C853',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(req.id, 'rejected')}
                          style={{
                            backgroundColor: '#F44336',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}
                        >
                          ✕ Reject
                        </button>
                      </>
                    )}
                    {req.status === 'approved' && (
                      <button
                        onClick={() => handleStatusUpdate(req.id, 'resolved')}
                        style={{
                          backgroundColor: '#9E9E9E',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}
                      >
                        ✔ Resolve
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {requests.length === 0 && (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: '#8FA8C8',
          backgroundColor: 'rgba(15, 32, 64, 0.8)',
          borderRadius: '12px',
          marginTop: '20px'
        }}>
          No requests at this time
        </div>
      )}
    </div>
  )
}

export default RequestsPage
