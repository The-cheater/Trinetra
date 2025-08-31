'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, AlertTriangle, Construction, Car, MapPin, ThumbsUp, ThumbsDown, MessageCircle, Share2, CheckCircle, Filter, TrendingUp, Clock, Users, Locate, Camera, X } from 'lucide-react'
import BottomNavigation from '../components/BottomNavigation'
import Logo from '../components/Logo'
import { useTheme } from '../contexts/ThemeContext'

type Page = 'home' | 'maps' | 'contribute' | 'profile'

interface UrbanThreadProps {
  onNavigate: (page: Page) => void
}

interface Comment {
  _id: string
  author: string
  body: string
  createdAt: string
  userId: string
}

interface Incident {
  _id: string
  category: string
  description: string
  locationName: string
  severity: string
  confidence_score: number
  author: string
  author_city?: string
  photo_url?: string
  upvotes: number
  downvotes: number
  comments_count: number
  createdAt: string
  distance_km?: number
}

const UrbanThread = ({ onNavigate }: UrbanThreadProps) => {
  const { isDark } = useTheme()
  const [activeFilter, setActiveFilter] = useState('All')
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null)
  const [useCityFilter, setUseCityFilter] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          updateUserLocation(position.coords.latitude, position.coords.longitude)
        },
        (error) => {
          console.error('Location error:', error)
        }
      )
    }
  }, [])

  useEffect(() => {
    fetchIncidents()
  }, [activeFilter, currentLocation, useCityFilter])

  const updateUserLocation = async (lat: number, lng: number) => {
    const token = localStorage.getItem('access_token')
    if (!token) return

    try {
      await fetch('/api/location/update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lat, lng })
      })
    } catch (error) {
      console.error('Failed to update location:', error)
    }
  }

  const fetchIncidents = async () => {
    setIsLoading(true)
    setError('')

    try {
      let url = '/api/threads?'

      if (currentLocation) {
        url += `lat=${currentLocation.lat}&lng=${currentLocation.lng}&`
        if (useCityFilter) {
          url += 'user_city_only=true&'
        }
      }

      if (activeFilter !== 'All') {
        url += `category=${activeFilter}&`
      }

      const token = localStorage.getItem('access_token')
      const headers: any = {}
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(url, { headers })
      const data = await response.json()

      if (response.ok && data.success) {
        setIncidents(data.data.posts || [])
      } else {
        setError(data.message || 'Failed to fetch incidents')
      }
    } catch (error) {
      setError('Network error')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchComments = async (postId: string) => {
    try {
      const response = await fetch(`/api/comments/${postId}`)
      const data = await response.json()
      
      if (data.success) {
        setComments(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    }
  }

  const handleCommentSubmit = async (postId: string) => {
    if (!newComment.trim()) return

    const token = localStorage.getItem('access_token')
    if (!token) {
      alert('Please login to comment')
      return
    }

    setIsSubmittingComment(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          postId,
          body: newComment.trim()
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setComments([data.data, ...comments])
        setNewComment('')
        // Update incident comment count
        setIncidents(incidents.map(inc => 
          inc._id === postId 
            ? { ...inc, comments_count: inc.comments_count + 1 }
            : inc
        ))
      } else {
        alert(data.message || 'Failed to add comment')
      }
    } catch (error) {
      console.error('Failed to add comment:', error)
      alert('Network error. Please try again.')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const openComments = async (incident: Incident) => {
    setSelectedIncident(incident._id)
    await fetchComments(incident._id)
  }

  const closeComments = () => {
    setSelectedIncident(null)
    setComments([])
    setNewComment('')
  }

  const getIcon = (category: string) => {
    switch (category) {
      case 'Traffic': return Car
      case 'Road Work': return Construction
      case 'Hazard': return AlertTriangle
      default: return MapPin
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'high': return '#f4212e'
      case 'medium': return '#ffd400'
      case 'low': return '#00ba7c'
      default: return '#1d9bf0'
    }
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const past = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
    return `${Math.floor(diffInMinutes / 1440)} days ago`
  }

  const categories = [
    { id: 'All', name: 'All', color: '#1d9bf0' },
    { id: 'Traffic', name: 'Traffic', color: '#f4212e' },
    { id: 'Road Work', name: 'Construction', color: '#ffd400' },
    { id: 'Hazard', name: 'Hazards', color: '#00ba7c' },
    { id: 'Other', name: 'Other', color: '#666' }
  ]

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: isDark ? '#000' : '#fff',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: 'var(--spacing-lg)',
        borderBottom: `1px solid ${isDark ? '#333' : '#eee'}`,
        position: 'sticky',
        top: 0,
        backgroundColor: isDark ? '#000' : '#fff',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Logo />
            <h1 style={{ 
              fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
              marginTop: 'var(--spacing-sm)',
              color: isDark ? '#fff' : '#000'
            }}>
              Urban Thread
            </h1>
          </div>
          <button
            onClick={() => setUseCityFilter(!useCityFilter)}
            style={{
              background: useCityFilter ? '#1d9bf0' : 'none',
              border: `1px solid ${useCityFilter ? '#1d9bf0' : (isDark ? '#333' : '#ccc')}`,
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--spacing-sm)',
              color: useCityFilter ? '#fff' : (isDark ? '#fff' : '#000'),
              cursor: 'pointer'
            }}
          >
            <Locate size={16} />
          </button>
        </div>

        {/* Location Status */}
        {currentLocation && (
          <p style={{ 
            color: isDark ? '#888' : '#666',
            fontSize: '0.8rem',
            margin: 'var(--spacing-sm) 0 0 0'
          }}>
            📍 {useCityFilter ? 'Showing incidents from your city' : 'Showing all nearby incidents'}
          </p>
        )}

        {/* Quick Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--spacing-md)',
          marginTop: 'var(--spacing-md)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              color: '#1d9bf0' 
            }}>
              {incidents.length}
            </div>
            <div style={{ 
              fontSize: '0.8rem', 
              color: isDark ? '#888' : '#666' 
            }}>
              Active Issues
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              color: '#00ba7c' 
            }}>
              {incidents.filter(i => i.confidence_score >= 70).length}
            </div>
            <div style={{ 
              fontSize: '0.8rem', 
              color: isDark ? '#888' : '#666' 
            }}>
              Verified
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              color: '#ffd400' 
            }}>
              {incidents.length > 0
                ? Math.round(incidents.reduce((acc, incident) => acc + incident.confidence_score, 0) / incidents.length)
                : 0}%
            </div>
            <div style={{ 
              fontSize: '0.8rem', 
              color: isDark ? '#888' : '#666' 
            }}>
              Avg Confidence
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div style={{
          display: 'flex',
          gap: 'var(--spacing-sm)',
          overflowX: 'auto',
          paddingTop: 'var(--spacing-md)'
        }}>
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setActiveFilter(category.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                whiteSpace: 'nowrap',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${category.color}`,
                backgroundColor: activeFilter === category.id ? category.color : 'transparent',
                color: activeFilter === category.id ? '#fff' : category.color,
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}
            >
              {category.name}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Incidents List */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto',
        paddingBottom: '100px'
      }}>
        {isLoading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            color: isDark ? '#888' : '#666'
          }}>
            Loading incidents...
          </div>
        ) : error ? (
          <div style={{
            padding: 'var(--spacing-lg)',
            textAlign: 'center',
            color: '#f4212e'
          }}>
            {error}
          </div>
        ) : incidents.length === 0 ? (
          <div style={{
            padding: 'var(--spacing-xl)',
            textAlign: 'center',
            color: isDark ? '#888' : '#666'
          }}>
            <AlertTriangle size={48} style={{ marginBottom: 'var(--spacing-md)' }} />
            <h3>No incidents found</h3>
            <p>Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div style={{ padding: 'var(--spacing-lg)' }}>
            {incidents.map((incident, index) => {
              const IconComponent = getIcon(incident.category)
              const severityColor = getSeverityColor(incident.severity)

              return (
                <motion.div
                  key={incident._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    backgroundColor: isDark ? '#111' : '#fff',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--spacing-lg)',
                    marginBottom: 'var(--spacing-lg)',
                    border: `1px solid ${isDark ? '#333' : '#eee'}`
                  }}
                >
                  {/* Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-sm)',
                    marginBottom: 'var(--spacing-md)'
                  }}>
                    <div style={{
                      padding: 'var(--spacing-xs)',
                      backgroundColor: severityColor + '20',
                      borderRadius: 'var(--radius-sm)'
                    }}>
                      <IconComponent size={16} style={{ color: severityColor }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        color: isDark ? '#fff' : '#000',
                        margin: 0,
                        fontSize: '1rem'
                      }}>
                        {incident.category}
                      </h4>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-xs)',
                        color: isDark ? '#888' : '#666',
                        fontSize: '0.8rem'
                      }}>
                        <MapPin size={12} />
                        <span>{incident.locationName || 'Unknown location'}</span>
                        {incident.distance_km && (
                          <span>• {incident.distance_km}km away</span>
                        )}
                        <Clock size={12} />
                        <span>{getTimeAgo(incident.createdAt)}</span>
                      </div>
                    </div>
                    {incident.confidence_score >= 70 && (
                      <CheckCircle size={16} style={{ color: '#00ba7c' }} />
                    )}
                    <div style={{
                      padding: 'var(--spacing-xs)',
                      backgroundColor: incident.confidence_score >= 70 ? '#00ba7c20' : '#ffd40020',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      color: incident.confidence_score >= 70 ? '#00ba7c' : '#ffd400'
                    }}>
                      {incident.confidence_score}%
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{
                    color: isDark ? '#ccc' : '#666',
                    marginBottom: 'var(--spacing-md)',
                    lineHeight: 1.5
                  }}>
                    {incident.description}
                  </p>

                  {/* Photo Display */}
                  {incident.photo_url && (
                    <div style={{ 
                      marginBottom: 'var(--spacing-md)',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: `1px solid ${isDark ? '#333' : '#eee'}`
                    }}>
                      <img
                        src={`http://localhost:8080${incident.photo_url}`}
                        alt="Incident evidence"
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover',
                          cursor: 'pointer'
                        }}
                        onClick={() => window.open(`http://localhost:8080${incident.photo_url}`, '_blank')}
                      />
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-xs)',
                        padding: 'var(--spacing-sm)',
                        backgroundColor: isDark ? '#0a0a0a' : '#f9f9f9',
                        fontSize: '0.8rem',
                        color: isDark ? '#888' : '#666'
                      }}>
                        <Camera size={12} />
                        <span>Evidence photo • Click to view full size</span>
                      </div>
                    </div>
                  )}

                  {/* Author */}
                  <div style={{
                    fontSize: '0.8rem',
                    color: isDark ? '#888' : '#666',
                    marginBottom: 'var(--spacing-md)'
                  }}>
                    Reported by {incident.author}
                    {incident.author_city && ` from ${incident.author_city}`}
                  </div>

                  {/* Actions */}
                  <div style={{
                    display: 'flex',
                    gap: 'var(--spacing-lg)'
                  }}>
                    <button style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-xs)',
                      background: 'none',
                      border: 'none',
                      color: isDark ? '#888' : '#666',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}>
                      <ThumbsUp size={16} />
                      <span>{incident.upvotes || 0}</span>
                    </button>
                    
                    <button 
                      onClick={() => openComments(incident)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-xs)',
                        background: 'none',
                        border: 'none',
                        color: isDark ? '#888' : '#666',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      <MessageCircle size={16} />
                      <span>{incident.comments_count || 0}</span>
                    </button>
                    
                    <button style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-xs)',
                      background: 'none',
                      border: 'none',
                      color: isDark ? '#888' : '#666',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}>
                      <Share2 size={16} />
                      <span>Share</span>
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Comments Modal */}
      {selectedIncident && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'flex-end',
          zIndex: 1000
        }}>
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            style={{
              width: '100%',
              maxHeight: '80vh',
              backgroundColor: isDark ? '#111' : '#fff',
              borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
              padding: 'var(--spacing-lg)',
              overflowY: 'auto'
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--spacing-lg)',
              paddingBottom: 'var(--spacing-md)',
              borderBottom: `1px solid ${isDark ? '#333' : '#eee'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <MessageCircle size={20} style={{ color: '#1d9bf0' }} />
                <h3 style={{ color: isDark ? '#fff' : '#000', margin: 0 }}>
                  Comments ({comments.length})
                </h3>
              </div>
              <button
                onClick={closeComments}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: isDark ? '#888' : '#666'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Comment Form */}
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  style={{
                    flex: 1,
                    padding: 'var(--spacing-md)',
                    border: `2px solid ${isDark ? '#333' : '#e1e8ed'}`,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isDark ? '#0a0a0a' : '#f9f9f9',
                    color: isDark ? '#fff' : '#000',
                    fontSize: '0.9rem',
                    resize: 'vertical'
                  }}
                />
                <button
                  onClick={() => handleCommentSubmit(selectedIncident)}
                  disabled={isSubmittingComment || !newComment.trim()}
                  style={{
                    padding: 'var(--spacing-sm)',
                    backgroundColor: '#1d9bf0',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: isSubmittingComment || !newComment.trim() ? 'not-allowed' : 'pointer',
                    opacity: isSubmittingComment || !newComment.trim() ? 0.6 : 1,
                    alignSelf: 'flex-start'
                  }}
                >
                  {isSubmittingComment ? '...' : 'Post'}
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div>
              {comments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: isDark ? '#888' : '#666' }}>
                  No comments yet. Be the first to comment!
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment._id}
                    style={{
                      padding: 'var(--spacing-md)',
                      borderBottom: `1px solid ${isDark ? '#333' : '#eee'}`,
                      marginBottom: 'var(--spacing-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-sm)' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: '#1d9bf0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#fff'
                      }}>
                        {comment.author[0].toUpperCase()}
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                          <span style={{ 
                            fontWeight: '600', 
                            color: isDark ? '#fff' : '#000',
                            fontSize: '0.9rem'
                          }}>
                            {comment.author}
                          </span>
                          <span style={{ 
                            fontSize: '0.8rem', 
                            color: isDark ? '#888' : '#666' 
                          }}>
                            {getTimeAgo(comment.createdAt)}
                          </span>
                        </div>
                        <p style={{ 
                          color: isDark ? '#ccc' : '#666',
                          margin: 0,
                          fontSize: '0.9rem'
                        }}>
                          {comment.body}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}

      <BottomNavigation current="home" onNavigate={onNavigate} />
    </div>
  )
}

export default UrbanThread
