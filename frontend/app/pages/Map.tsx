'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Search, Navigation, Car, Shield, Users, Bell, TrendingUp, AlertTriangle } from 'lucide-react'
import BottomNavigation from '../components/BottomNavigation'
import Logo from '../components/Logo'
import { useTheme } from '../contexts/ThemeContext'

type Page = 'home' | 'maps' | 'contribute' | 'profile'

interface MapProps {
  onNavigate: (page: Page) => void
}

const Map = ({ onNavigate }: MapProps) => {
  const { isDark } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRoute, setSelectedRoute] = useState('fastest')

  const routeOptions = [
    { id: 'fastest', name: 'Fastest', icon: Navigation, color: 'var(--twitter-blue)' },
    { id: 'eco', name: 'Eco', icon: Car, color: 'var(--twitter-green)' },
    { id: 'safety', name: 'Safety', icon: Shield, color: 'var(--twitter-red)' }
  ]

  const recentActivity = [
    { 
      id: 1, 
      type: 'traffic', 
      title: 'Traffic Incident Reported', 
      location: 'Main Street', 
      time: '2 minutes ago', 
      icon: AlertTriangle, 
      color: 'var(--twitter-red)' 
    },
    { 
      id: 2, 
      type: 'construction', 
      title: 'Road Work Alert', 
      location: 'Highway 101', 
      time: '5 minutes ago', 
      icon: Shield, 
      color: 'var(--twitter-yellow)' 
    },
    { 
      id: 3, 
      type: 'hazard', 
      title: 'Pothole Detected', 
      location: 'Oak Avenue', 
      time: '8 minutes ago', 
      icon: AlertTriangle, 
      color: 'var(--twitter-red)' 
    }
  ]

  return (
    <div className="main-container">
      <div className="page-header">
        <div className="header-logo">
          <Logo size="small" />
        </div>
        <h1 className="page-title">Maps</h1>
      </div>

      {/* Search */}
      <motion.div 
        className="search-container"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Search size={20} className="search-icon" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
          placeholder="Search for destination..."
        />
      </motion.div>

      {/* Map Container */}
      <motion.div 
        className="map-container"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="map-placeholder">
          <MapPin size={48} color="var(--twitter-dark-gray)" style={{ opacity: 0.3 }} />
          <p style={{ marginTop: 'var(--spacing-lg)', opacity: 0.6, fontWeight: '500', fontSize: 'clamp(0.875rem, 3.5vw, 1rem)' }}>
            {selectedRoute === 'fastest' && 'Fastest Route'}
            {selectedRoute === 'eco' && 'Eco-Friendly Route'}
            {selectedRoute === 'safety' && 'Safety-First Route'}
            {!selectedRoute && 'Interactive Map'}
          </p>
          <p style={{ fontSize: 'clamp(0.8rem, 3vw, 0.875rem)', opacity: 0.5, textAlign: 'center', lineHeight: 1.4 }}>
            {selectedRoute === 'fastest' && 'Optimized for speed and efficiency'}
            {selectedRoute === 'eco' && 'Minimizes environmental impact'}
            {selectedRoute === 'safety' && 'Prioritizes safety and low-risk roads'}
            {!selectedRoute && 'Google Maps integration'}
          </p>
        </div>
      </motion.div>

      {/* Route Options */}
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <h3 className="card-title">Route Options</h3>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
          {routeOptions.map((route) => {
            const IconComponent = route.icon
            const isActive = selectedRoute === route.id
            return (
              <motion.button
                key={route.id}
                onClick={() => setSelectedRoute(route.id)}
                className={`btn-twitter ${isActive ? 'btn-twitter-primary' : 'btn-twitter-outline'}`}
                style={{ 
                  flex: 1, 
                  minWidth: '100px',
                  backgroundColor: isActive ? route.color : 'transparent',
                  borderColor: route.color,
                  color: isActive ? 'white' : route.color
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <IconComponent size={16} />
                {route.name}
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* Community Stats */}
      <motion.div 
        className="stats-grid"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <div className="stat-card">
          <Users size={24} color="var(--twitter-blue)" style={{ marginBottom: 'var(--spacing-sm)' }} />
          <div className="stat-number">{recentActivity.length}</div>
          <div className="stat-label">Active Routes</div>
        </div>
        <div className="stat-card">
          <TrendingUp size={24} color="var(--twitter-green)" style={{ marginBottom: 'var(--spacing-sm)' }} />
          <div className="stat-number" style={{ color: 'var(--twitter-green)' }}>
            {Math.floor(Math.random() * 100) + 50}
          </div>
          <div className="stat-label">Total Priority</div>
        </div>
      </motion.div>

      {/* Recent Activity Feed */}
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <h3 className="card-title">Recent Activity</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {recentActivity.map((activity) => {
            const IconComponent = activity.icon
            return (
              <motion.div
                key={activity.id}
                className="activity-item"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
                style={{ cursor: 'pointer' }}
              >
                <div 
                  className="activity-avatar"
                  style={{ backgroundColor: activity.color }}
                >
                  <IconComponent size={20} color="white" />
                </div>
                <div className="activity-content">
                  <div className="activity-title">{activity.title}</div>
                  <div className="activity-meta">{activity.time} • {activity.location}</div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      <BottomNavigation activeTab="maps" onNavigate={onNavigate} />
    </div>
  )
}

export default Map