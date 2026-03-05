import React, { useState, useMemo } from 'react'
import { useHistory } from '../hooks/useHistory'
import { motion, AnimatePresence } from 'framer-motion'

const IncidentsPage = () => {
  const { history, loading, error } = useHistory()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [expandedId, setExpandedId] = useState(null)

  const filteredHistory = useMemo(() => {
    let filtered = [...history]

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    filtered.sort((a, b) => {
      if (sortBy === 'newest') return b.timestamp?.seconds - a.timestamp?.seconds
      if (sortBy === 'oldest') return a.timestamp?.seconds - b.timestamp?.seconds
      return 0
    })

    return filtered
  }, [history, searchTerm, sortBy])

  const stats = {
    total: history.length,
    resolved: history.filter(h => h.status === 'resolved').length,
    rejected: history.filter(h => h.status === 'rejected').length
  }

  const getStatusColor = (status) => {
    const colors = {
      resolved: '#9E9E9E',
      rejected: '#F44336',
      approved: '#00C853',
      pending: '#FF6D00'
    }
    return colors[status] || '#8FA8C8'
  }

  const getTypeIcon = (type) => {
    const icons = {
      medical: '🚑',
      fire: '🔥',
      police: '🚔',
      traffic: '🚦',
      accident: '⚠️'
    }
    return icons[type] || '📋'
  }

  if (loading) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#8FA8C8' }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{ display: 'inline-block', fontSize: '32px' }}
      >
        ⚙️
      </motion.div>
      <div style={{ marginTop: '16px' }}>Loading history...</div>
    </div>
  )
  if (error) return <div style={{ padding: '40px', color: '#F44336' }}>Error: {error}</div>

  return (
    <div style={{ 
      padding: '40px',
      background: 'var(--bg-primary)',
      minHeight: 'calc(100vh - 80px)'
    }}>
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          color: 'var(--green)', 
          marginBottom: '30px',
          fontSize: '28px'
        }}
      >
        📜 Incident History
      </motion.h1>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '20px', 
          marginBottom: '30px' 
        }}
      >
        <motion.div whileHover={{ scale: 1.02 }} style={styles.statCard}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#00C853' }}>
            {stats.total}
          </div>
          <div style={{ fontSize: '12px', color: '#8FA8C8', marginTop: '4px' }}>
            Total Incidents
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} style={styles.statCard}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#9E9E9E' }}>
            {stats.resolved}
          </div>
          <div style={{ fontSize: '12px', color: '#8FA8C8', marginTop: '4px' }}>
            Resolved
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} style={styles.statCard}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#F44336' }}>
            {stats.rejected}
          </div>
          <div style={{ fontSize: '12px', color: '#8FA8C8', marginTop: '4px' }}>
            Rejected
          </div>
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ 
          display: 'flex', 
          gap: '16px', 
          marginBottom: '24px' 
        }}
      >
        <input
          type="text"
          placeholder="🔍 Search incidents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          style={styles.select}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </motion.div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {filteredHistory.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ 
              padding: '60px', 
              textAlign: 'center', 
              color: '#8FA8C8',
              background: 'var(--bg-card)',
              borderRadius: '8px',
              border: '1px solid var(--bg-subtle)'
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <div>No incident history found</div>
          </motion.div>
        ) : (
          <AnimatePresence>
            {filteredHistory.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01, borderColor: '#00C853' }}
                style={styles.incidentCard}
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '24px' }}>
                        {getTypeIcon(item.type)}
                      </span>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#FFFFFF' }}>
                          {item.type ? item.type.toUpperCase() : 'INCIDENT'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#8FA8C8', marginTop: '2px' }}>
                          ID: {item.id.substring(0, 12)}...
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {item.status && (
                        <span style={{
                          background: getStatusColor(item.status),
                          color: '#fff',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          textTransform: 'uppercase'
                        }}>
                          {item.status}
                        </span>
                      )}
                      {item.timestamp && (
                        <span style={{ fontSize: '12px', color: '#8FA8C8' }}>
                          📅 {new Date(item.timestamp.seconds * 1000).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <motion.div
                    animate={{ rotate: expandedId === item.id ? 180 : 0 }}
                    style={{ fontSize: '20px', cursor: 'pointer' }}
                  >
                    ⌄
                  </motion.div>
                </div>

                <AnimatePresence>
                  {expandedId === item.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ 
                        marginTop: '16px', 
                        paddingTop: '16px', 
                        borderTop: '1px solid var(--bg-subtle)',
                        overflow: 'hidden'
                      }}
                    >
                      <pre style={{ 
                        background: 'rgba(0, 0, 0, 0.3)',
                        padding: '16px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        color: '#8FA8C8',
                        overflow: 'auto',
                        maxHeight: '300px'
                      }}>
                        {JSON.stringify(item, null, 2)}
                      </pre>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

const styles = {
  statCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--bg-subtle)',
    borderRadius: '8px',
    padding: '24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.3s'
  },
  searchInput: {
    flex: 1,
    background: '#1A3560',
    border: '1px solid #1A3560',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#FFFFFF',
    fontSize: '14px',
    outline: 'none'
  },
  select: {
    background: '#1A3560',
    border: '1px solid #1A3560',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#FFFFFF',
    fontSize: '14px',
    cursor: 'pointer',
    outline: 'none',
    minWidth: '180px'
  },
  incidentCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--bg-subtle)',
    borderRadius: '8px',
    padding: '24px',
    cursor: 'pointer',
    transition: 'all 0.3s'
  }
}

export default IncidentsPage
