import React, { useState, useMemo } from 'react'
import { useRequests } from '../hooks/useRequests'
import { updateDoc, doc } from 'firebase/firestore'
import { firestore } from '../config/firebase'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const RequestsPage = () => {
  const { requests, loading, error } = useRequests()
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')

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

  const filteredRequests = useMemo(() => {
    let filtered = requests
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => r.status === filterStatus)
    }
    
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (sortBy === 'newest') {
      filtered = [...filtered].reverse()
    } else if (sortBy === 'priority') {
      const priority = { medical: 1, fire: 2, police: 3, accident: 4, traffic: 5 }
      filtered = [...filtered].sort((a, b) => (priority[a.type] || 99) - (priority[b.type] || 99))
    }
    
    return filtered
  }, [requests, filterStatus, searchTerm, sortBy])

  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    resolved: requests.filter(r => r.status === 'resolved').length
  }), [requests])

  if (loading) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#8FA8C8' }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{ display: 'inline-block', fontSize: '32px' }}
      >
        ⚙️
      </motion.div>
      <div style={{ marginTop: '16px' }}>Loading requests...</div>
    </div>
  )
  if (error) return <div style={{ padding: '40px', color: '#F44336' }}>Error: {error}</div>

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: '40px', maxWidth: '1800px', margin: '0 auto' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#00C853', margin: 0 }}>Emergency Requests</h1>
        <div style={{ fontSize: '14px', color: '#8FA8C8' }}>
          Total: {requests.length} | Pending: {stats.pending} | Active: {stats.approved}
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '16px', 
        marginBottom: '24px' 
      }}>
        <motion.div whileHover={{ scale: 1.02 }} style={styles.statCard}>
          <div style={{ fontSize: '32px' }}>📊</div>
          <div style={{ color: '#8FA8C8', fontSize: '12px' }}>Total Requests</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#FFFFFF' }}>{stats.total}</div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} style={{ ...styles.statCard, borderLeft: '3px solid #FF6D00' }}>
          <div style={{ fontSize: '32px' }}>⏳</div>
          <div style={{ color: '#8FA8C8', fontSize: '12px' }}>Pending</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#FF6D00' }}>{stats.pending}</div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} style={{ ...styles.statCard, borderLeft: '3px solid #00C853' }}>
          <div style={{ fontSize: '32px' }}>✓</div>
          <div style={{ color: '#8FA8C8', fontSize: '12px' }}>Approved</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#00C853' }}>{stats.approved}</div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} style={{ ...styles.statCard, borderLeft: '3px solid #9E9E9E' }}>
          <div style={{ fontSize: '32px' }}>✔</div>
          <div style={{ color: '#8FA8C8', fontSize: '12px' }}>Resolved</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#9E9E9E' }}>{stats.resolved}</div>
        </motion.div>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="🔍 Search by type or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          style={styles.select}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="resolved">Resolved</option>
        </select>
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          style={styles.select}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="priority">By Priority</option>
        </select>
      </div>
      
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
            <AnimatePresence>
              {filteredRequests.map((req, index) => (
                <motion.tr
                  key={req.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ backgroundColor: 'rgba(26, 53, 96, 0.5)' }}
                  style={{ borderBottom: '1px solid #1A3560' }}
                >
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
              </motion.tr>
            ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {filteredRequests.length === 0 && requests.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            padding: '40px',
            textAlign: 'center',
            color: '#8FA8C8',
            backgroundColor: 'rgba(15, 32, 64, 0.8)',
            borderRadius: '12px',
            marginTop: '20px'
          }}
        >
          No requests match your filters
        </motion.div>
      )}

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
    </motion.div>
  )
}

const styles = {
  statCard: {
    background: 'rgba(15, 32, 64, 0.8)',
    backdropFilter: 'blur(10px)',
    border: '1px solid #1A3560',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    cursor: 'pointer'
  },
  searchInput: {
    flex: 1,
    minWidth: '300px',
    background: '#1A3560',
    border: '1px solid #1A3560',
    borderRadius: '8px',
    padding: '10px 16px',
    color: '#FFFFFF',
    fontSize: '14px',
    outline: 'none'
  },
  select: {
    background: '#1A3560',
    border: '1px solid #1A3560',
    borderRadius: '8px',
    padding: '10px 16px',
    color: '#FFFFFF',
    fontSize: '14px',
    cursor: 'pointer',
    outline: 'none'
  }
}

export default RequestsPage
