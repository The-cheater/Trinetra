'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, AlertTriangle, Construction, Car, MapPin, ThumbsUp, ThumbsDown, MessageCircle, Share2, CheckCircle, Filter, TrendingUp, Clock, MapPin as MapPinIcon, Users, Calendar, AlertCircle } from 'lucide-react'
import BottomNavigation from '../components/BottomNavigation'
import Logo from '../components/Logo'
import { useTheme } from '../contexts/ThemeContext'
import { StackedDialog, StackedDialogTrigger } from '../components/StackedDialog'
import { CommentForm } from '../components/CommentForm'

type Page = 'home' | 'maps' | 'contribute' | 'profile'

interface UrbanThreadProps {
  onNavigate: (page: Page) => void
}

const UrbanThread = ({ onNavigate }: UrbanThreadProps) => {
  const { isDark } = useTheme()
  const [activeFilter, setActiveFilter] = useState('all')
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [severityFilter, setSeverityFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [commentFormOpen, setCommentFormOpen] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState<any>(null)
  const [incidentReactions, setIncidentReactions] = useState<Record<number, { liked: boolean; disliked: boolean }>>({})

  const incidents = [
    { 
      id: 1, 
      type: 'traffic', 
      title: 'Major Traffic Jam on Main Street', 
      description: 'Multiple vehicle collision causing severe delays. Emergency services on scene.', 
      time: '2 minutes ago', 
      location: 'Main Street & 5th Ave', 
      severity: 'high', 
      upvotes: 156, 
      dislikes: 12,
      comments: 23, 
      verified: true,
      priority: 95
    },
    { 
      id: 2, 
      type: 'construction', 
      title: 'Road Work on Highway 101', 
      description: 'Lane closure for maintenance work. Expect delays during rush hour.', 
      time: '15 minutes ago', 
      location: 'Highway 101, Exit 15', 
      severity: 'medium', 
      upvotes: 89, 
      dislikes: 5,
      comments: 12, 
      verified: true,
      priority: 78
    },
    { 
      id: 3, 
      type: 'hazard', 
      title: 'Large Pothole on Oak Street', 
      description: 'Deep pothole causing vehicle damage. Multiple reports confirmed.', 
      time: '1 hour ago', 
      location: 'Oak Street, between 3rd & 4th', 
      severity: 'medium', 
      upvotes: 67, 
      dislikes: 3,
      comments: 8, 
      verified: false,
      priority: 65
    },
    { 
      id: 4, 
      type: 'traffic', 
      title: 'Traffic Light Malfunction', 
      description: 'Traffic light stuck on red causing major intersection backup.', 
      time: '2 hours ago', 
      location: 'Central Ave & Park Street', 
      severity: 'high', 
      upvotes: 234, 
      dislikes: 18,
      comments: 31, 
      verified: true,
      priority: 92
    },
    { 
      id: 5, 
      type: 'hazard', 
      title: 'Broken Street Light', 
      description: 'Street light not working, creating safety hazard at night.', 
      time: '3 hours ago', 
      location: 'Riverside Drive', 
      severity: 'low', 
      upvotes: 34, 
      dislikes: 1,
      comments: 5, 
      verified: false,
      priority: 45
    }
  ]

  const getIcon = (type: string) => {
    switch (type) {
      case 'traffic': return Car
      case 'construction': return Construction
      case 'hazard': return AlertTriangle
      default: return MapPin
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'var(--twitter-red)'
      case 'medium': return 'var(--twitter-yellow)'
      case 'low': return 'var(--twitter-green)'
      default: return 'var(--twitter-blue)'
    }
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 90) return 'var(--twitter-red)'
    if (priority >= 70) return 'var(--twitter-yellow)'
    return 'var(--twitter-green)'
  }

  const filteredIncidents = incidents.filter(incident => {
    const categoryMatch = activeFilter === 'all' || incident.type === activeFilter
    const severityMatch = severityFilter === 'all' || incident.severity === severityFilter
    return categoryMatch && severityMatch
  })

  const sortedIncidents = filteredIncidents.sort((a, b) => b.priority - a.priority)

  const handleReaction = (incidentId: number, reactionType: 'like' | 'dislike') => {
    setIncidentReactions(prev => {
      const current = prev[incidentId] || { liked: false, disliked: false }
      
      if (reactionType === 'like') {
        return {
          ...prev,
          [incidentId]: {
            liked: !current.liked,
            disliked: current.liked ? false : current.disliked
          }
        }
      } else if (reactionType === 'dislike') {
        return {
          ...prev,
          [incidentId]: {
            liked: current.disliked ? false : current.liked,
            disliked: !current.disliked
          }
        }
      }
      
      return prev
    })
  }

  // Create detailed dialog items for each incident
  const createDialogItems = (incident: any) => [
    {
      title: incident.title,
      description: `${incident.type.charAt(0).toUpperCase() + incident.type.slice(1)} Incident`,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ 
            backgroundColor: 'var(--twitter-secondary-bg)', 
            borderRadius: '8px', 
            padding: '16px' 
          }}>
            <p style={{ 
              color: 'var(--twitter-black)', 
              lineHeight: '1.6',
              margin: 0,
              fontSize: 'clamp(12px, 3.5vw, 14px)'
            }}>
              {incident.description}
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'clamp(11px, 3vw, 14px)' }}>
              <MapPinIcon size={16} style={{ color: 'var(--twitter-dark-gray)' }} />
              <span style={{ color: 'var(--twitter-dark-gray)' }}>{incident.location}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'clamp(11px, 3vw, 14px)' }}>
              <Calendar size={16} style={{ color: 'var(--twitter-dark-gray)' }} />
              <span style={{ color: 'var(--twitter-dark-gray)' }}>{incident.time}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div 
              style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '50%',
                backgroundColor: getSeverityColor(incident.severity) 
              }}
            />
            <span style={{ fontSize: 'clamp(12px, 3.5vw, 14px)', fontWeight: '500', textTransform: 'capitalize' }}>
              {incident.severity} Severity
            </span>
          </div>

          {incident.verified && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--twitter-green)' }}>
              <CheckCircle size={16} />
              <span style={{ fontSize: 'clamp(12px, 3.5vw, 14px)', fontWeight: '500' }}>Verified Report</span>
            </div>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="main-container">
      <div className="page-header">
        <div className="header-logo">
          <Logo size="small" />
        </div>
        <h1 className="page-title">Urban Thread</h1>
        <motion.button
          className="filter-button"
          onClick={() => setShowFilterModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ position: 'absolute', right: 'var(--spacing-lg)' }}
        >
          <Filter size={16} />
          Filter
        </motion.button>
      </div>

      {/* Priority Stats */}
      <motion.div 
        className="stats-grid content-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="stat-card">
          <TrendingUp size={24} color="var(--twitter-blue)" style={{ marginBottom: 'var(--spacing-sm)' }} />
          <div className="stat-number">{filteredIncidents.length}</div>
          <div className="stat-label">
            {activeFilter === 'all' && 'All Issues'}
            {activeFilter === 'traffic' && 'Traffic Issues'}
            {activeFilter === 'construction' && 'Construction Issues'}
            {activeFilter === 'hazard' && 'Hazard Issues'}
          </div>
        </div>
        <div className="stat-card">
          <Clock size={24} color="var(--twitter-green)" style={{ marginBottom: 'var(--spacing-sm)' }} />
          <div className="stat-number" style={{ color: 'var(--twitter-green)' }}>
            {filteredIncidents.length > 0 
              ? Math.round(filteredIncidents.reduce((acc, incident) => acc + incident.priority, 0) / filteredIncidents.length)
              : 0}%
          </div>
          <div className="stat-label">Avg Priority</div>
        </div>
      </motion.div>

      {/* Quick Filters */}
      <motion.div 
        className="card content-container" 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="chip-row">
          {[
            { id: 'all', name: 'All', color: 'var(--twitter-blue)' }, 
            { id: 'traffic', name: 'Traffic', color: 'var(--twitter-red)' }, 
            { id: 'construction', name: 'Construction', color: 'var(--twitter-yellow)' }, 
            { id: 'hazard', name: 'Hazards', color: 'var(--twitter-green)' }
          ].map((filter) => (
            <motion.button 
              key={filter.id} 
              onClick={() => setActiveFilter(filter.id)} 
              className={`btn-twitter ${activeFilter === filter.id ? 'btn-twitter-primary' : 'btn-twitter-outline'}`}
              style={{ 
                whiteSpace: 'nowrap',
                backgroundColor: activeFilter === filter.id ? filter.color : 'transparent',
                borderColor: filter.color,
                color: activeFilter === filter.id ? 'white' : filter.color
              }}
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
            >
              {filter.name}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Incidents List */}
      <div className="content-container" style={{ padding: '0 var(--spacing-md)' }}>
        {sortedIncidents.length === 0 ? (
          <motion.div
            className="card"
            style={{ 
              textAlign: 'center', 
              padding: 'var(--spacing-xl)',
              color: 'var(--twitter-dark-gray)'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AlertTriangle size={48} style={{ opacity: 0.5, marginBottom: 'var(--spacing-md)' }} />
            <h3 style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--twitter-black)' }}>
              No incidents found
            </h3>
            <p style={{ fontSize: 'clamp(0.8rem, 3.5vw, 0.875rem)' }}>
              Try adjusting your filters to see more results.
            </p>
          </motion.div>
        ) : (
          sortedIncidents.map((incident, index) => {
          const IconComponent = getIcon(incident.type)
          return (
            <StackedDialogTrigger key={incident.id} items={createDialogItems(incident)}>
              <motion.div 
                className="activity-item" 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.01 }}
                style={{ cursor: 'pointer' }}
              >
              <div 
                className="activity-avatar" 
                style={{ background: getSeverityColor(incident.severity) }}
              >
                <IconComponent size={20} color="white" />
              </div>
              
              <div className="activity-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)', flexWrap: 'wrap' }}>
                  <span className="activity-title">{incident.title}</span>
                  {incident.verified && (
                    <motion.div 
                      style={{ 
                        width: '16px', 
                        height: '16px', 
                        background: 'var(--twitter-green)', 
                        borderRadius: 'var(--radius-full)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexShrink: 0
                      }} 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }} 
                      transition={{ delay: 0.5 }}
                    >
                      <CheckCircle size={10} color="white" />
                    </motion.div>
                  )}
                  <motion.div
                    style={{
                      padding: 'var(--spacing-xs) var(--spacing-sm)',
                      background: getPriorityColor(incident.priority),
                      color: 'white',
                      borderRadius: 'var(--radius-full)',
                      fontSize: 'clamp(0.7rem, 2.5vw, 0.75rem)',
                      fontWeight: '600',
                      flexShrink: 0
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    P{incident.priority}
                  </motion.div>
                </div>
                <p style={{ fontSize: 'clamp(0.8rem, 3.5vw, 0.875rem)', color: 'var(--twitter-black)', marginBottom: 'var(--spacing-sm)', lineHeight: 1.4 }}>
                  {incident.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', fontSize: 'clamp(0.7rem, 3vw, 0.75rem)', color: 'var(--twitter-dark-gray)', flexWrap: 'wrap' }}>
                  <span>{incident.time}</span>
                  <span>•</span>
                  <span style={{ wordBreak: 'break-word' }}>{incident.location}</span>
                </div>
                
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                  <motion.button 
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleReaction(incident.id, 'like')
                    }}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 'var(--spacing-xs)', 
                      background: 'none', 
                      border: 'none', 
                      color: (incidentReactions[incident.id]?.liked ? 'var(--twitter-blue)' : 'var(--twitter-dark-gray)'), 
                      cursor: 'pointer', 
                      fontSize: 'clamp(0.8rem, 3.5vw, 0.875rem)', 
                      fontWeight: '500',
                      padding: 'var(--spacing-xs)',
                      borderRadius: 'var(--radius-sm)',
                      transition: 'all 0.2s ease',
                      minHeight: '32px'
                    }} 
                    whileHover={{ scale: 1.1 }} 
                    whileTap={{ scale: 0.9 }}
                  >
                    <ThumbsUp size={16} />
                    {incident.upvotes}
                  </motion.button>
                  
                  <motion.button 
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleReaction(incident.id, 'dislike')
                    }}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 'var(--spacing-xs)', 
                      background: 'none', 
                      border: 'none', 
                      color: (incidentReactions[incident.id]?.disliked ? 'var(--twitter-red)' : 'var(--twitter-dark-gray)'), 
                      cursor: 'pointer', 
                      fontSize: 'clamp(0.8rem, 3.5vw, 0.875rem)', 
                      fontWeight: '500',
                      padding: 'var(--spacing-xs)',
                      borderRadius: 'var(--radius-sm)',
                      transition: 'all 0.2s ease',
                      minHeight: '32px'
                    }} 
                    whileHover={{ scale: 1.1 }} 
                    whileTap={{ scale: 0.9 }}
                  >
                    <ThumbsDown size={16} />
                    {incident.dislikes || 0}
                  </motion.button>
                  
                  <motion.button 
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setSelectedIncident(incident)
                      setCommentFormOpen(true)
                    }}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 'var(--spacing-xs)', 
                      background: 'none', 
                      border: 'none', 
                      color: 'var(--twitter-dark-gray)', 
                      cursor: 'pointer', 
                      fontSize: 'clamp(0.8rem, 3.5vw, 0.875rem)', 
                      fontWeight: '500',
                      padding: 'var(--spacing-xs)',
                      borderRadius: 'var(--radius-sm)',
                      transition: 'all 0.2s ease',
                      minHeight: '32px'
                    }} 
                    whileHover={{ scale: 1.1 }} 
                    whileTap={{ scale: 0.9 }}
                  >
                    <MessageCircle size={16} />
                    {incident.comments}
                  </motion.button>
                  
                  <motion.button 
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      // Handle share
                    }}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 'var(--spacing-xs)', 
                      background: 'none', 
                      border: 'none', 
                      color: 'var(--twitter-dark-gray)', 
                      cursor: 'pointer', 
                      fontSize: 'clamp(0.8rem, 3.5vw, 0.875rem)', 
                      fontWeight: '500',
                      padding: 'var(--spacing-xs)',
                      borderRadius: 'var(--radius-sm)',
                      transition: 'all 0.2s ease',
                      minHeight: '32px'
                    }} 
                    whileHover={{ scale: 1.1 }} 
                    whileTap={{ scale: 0.9 }}
                  >
                    <Share2 size={16} />
                    Share
                  </motion.button>
                </div>
              </div>
            </motion.div>
            </StackedDialogTrigger>
          )
        })
        )}
      </div>

      <BottomNavigation activeTab="home" onNavigate={onNavigate} />
      
      {/* Stacked Dialog */}
      <StackedDialog />
      
      {/* Comment Form */}
      {selectedIncident && (
        <CommentForm
          open={commentFormOpen}
          setOpen={setCommentFormOpen}
          incidentTitle={selectedIncident.title}
        />
      )}
    </div>
  )
}

export default UrbanThread