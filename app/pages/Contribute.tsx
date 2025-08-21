'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, AlertTriangle, Construction, Car, MapPin, Send } from 'lucide-react'
import BottomNavigation from '../components/BottomNavigation'
import Logo from '../components/Logo'
import { useTheme } from '../contexts/ThemeContext'

type Page = 'home' | 'maps' | 'contribute' | 'profile'

interface ContributeProps {
  onNavigate: (page: Page) => void
}

const Contribute = ({ onNavigate }: ContributeProps) => {
  const { isDark } = useTheme()
  const [formData, setFormData] = useState({
    category: '',
    severity: 'medium',
    description: '',
    location: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = [
    { id: 'traffic', name: 'Traffic', icon: Car, color: '#F4212E' },
    { id: 'construction', name: 'Road Work', icon: Construction, color: '#FFD400' },
    { id: 'hazard', name: 'Hazard', icon: AlertTriangle, color: '#00BA7C' },
    { id: 'other', name: 'Other', icon: MapPin, color: '#1D9BF0' }
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    setTimeout(() => {
      setIsSubmitting(false)
      alert('Report submitted successfully!')
      setFormData({
        category: '',
        severity: 'medium',
        description: '',
        location: ''
      })
    }, 2000)
  }

  return (
    <div className="main-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-logo">
          <Logo size="small" />
        </div>
        <h1 className="page-title">Report Incident</h1>
      </div>

      {/* Scrollable content */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto',
        padding: 'var(--spacing-md)',
        paddingBottom: 'calc(88px + var(--safe-area-bottom))'
      }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          style={{
            borderRadius: '16px',
            padding: 'var(--spacing-lg)',
            backgroundColor: 'var(--twitter-secondary-bg)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
            marginBottom: 'var(--spacing-lg)',
            border: '1px solid var(--twitter-border)'
          }}
        >
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
              <label style={{
                display: 'block',
                fontWeight: '700',
                marginBottom: 'var(--spacing-md)',
                fontSize: 'clamp(14px, 4vw, 16px)',
                color: 'var(--twitter-black)'
              }}>Incident Category</label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 'var(--spacing-md)'
              }}>
                {categories.map((category) => {
                  const IconComponent = category.icon
                  const isSelected = formData.category === category.id
                  return (
                    <motion.button 
                      key={category.id} 
                      type="button" 
                      onClick={() => setFormData({ ...formData, category: category.id })}
                      style={{ 
                        padding: 'var(--spacing-lg) var(--spacing-md)',
                        backgroundColor: isSelected ? `${category.color}20` : 'var(--twitter-background)',
                        border: isSelected ? `2px solid ${category.color}` : '2px solid var(--twitter-border)',
                        color: isSelected ? category.color : 'var(--twitter-black)',
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        gap: 'var(--spacing-sm)',
                        minHeight: '88px',
                        borderRadius: 'var(--radius-md)',
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                      whileHover={{ scale: 1.02 }} 
                      whileTap={{ scale: 0.98 }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: isSelected ? '4px' : 0,
                        backgroundColor: category.color,
                        transition: 'height 0.2s ease'
                      }}></div>
                      <IconComponent size={24} strokeWidth={isSelected ? 2 : 1.5} />
                      <span style={{ 
                        fontSize: 'clamp(12px, 3.5vw, 14px)', 
                        fontWeight: '700',
                        marginTop: '4px',
                        textAlign: 'center'
                      }}>{category.name}</span>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
              <label style={{
                display: 'block',
                fontWeight: '700',
                marginBottom: 'var(--spacing-md)',
                fontSize: 'clamp(14px, 4vw, 16px)',
                color: 'var(--twitter-black)'
              }}>Severity Level</label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--twitter-background)',
                borderRadius: 'var(--radius-md)',
                padding: '4px',
                height: '52px',
                border: '1px solid var(--twitter-border)'
              }}>
                {['low', 'medium', 'high'].map((level) => (
                  <motion.div
                    key={level}
                    onClick={() => setFormData({ ...formData, severity: level })}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: formData.severity === level ? '#1D9BF0' : 'transparent',
                      cursor: 'pointer',
                      position: 'relative',
                      fontWeight: '700',
                      fontSize: 'clamp(12px, 3.5vw, 14px)',
                      color: formData.severity === level ? '#fff' : 'var(--twitter-dark-gray)',
                      transition: 'all 0.2s'
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </motion.div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
              <label style={{
                display: 'block',
                fontWeight: '700',
                marginBottom: 'var(--spacing-md)',
                fontSize: 'clamp(14px, 4vw, 16px)',
                color: 'var(--twitter-black)'
              }}>Location</label>
              <div style={{ 
                position: 'relative',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--twitter-border)'
              }}>
                <MapPin 
                  size={20} 
                  style={{ 
                    position: 'absolute', 
                    left: 'var(--spacing-lg)', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: 'var(--twitter-dark-gray)', 
                    pointerEvents: 'none'
                  }} 
                />
                <input 
                  type="text" 
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange} 
                  style={{ 
                    padding: 'var(--spacing-lg) var(--spacing-lg) var(--spacing-lg) 48px', 
                    width: '100%',
                    border: 'none',
                    fontSize: 'clamp(14px, 4vw, 16px)',
                    backgroundColor: 'transparent',
                    color: 'var(--twitter-black)',
                    outline: 'none',
                    minHeight: '48px'
                  }} 
                  placeholder="Enter location or address" 
                  required 
                />
              </div>
            </div>

            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
              <label style={{
                display: 'block',
                fontWeight: '700',
                marginBottom: 'var(--spacing-md)',
                fontSize: 'clamp(14px, 4vw, 16px)',
                color: 'var(--twitter-black)'
              }}>Description</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                style={{ 
                  minHeight: 'clamp(100px, 25vh, 120px)', 
                  resize: 'vertical',
                  padding: 'var(--spacing-lg)',
                  width: '100%',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--twitter-border)',
                  fontSize: 'clamp(14px, 4vw, 16px)',
                  lineHeight: '1.4',
                  backgroundColor: 'transparent',
                  color: 'var(--twitter-black)',
                  outline: 'none'
                }} 
                placeholder="Describe the incident in detail..." 
                required 
              />
            </div>

            <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
              <label style={{
                display: 'block',
                fontWeight: '700',
                marginBottom: 'var(--spacing-md)',
                fontSize: 'clamp(14px, 4vw, 16px)',
                color: 'var(--twitter-black)'
              }}>Add Photo (Optional)</label>
              <motion.button 
                type="button" 
                style={{ 
                  width: '100%', 
                  padding: 'var(--spacing-lg)', 
                  border: '2px dashed var(--twitter-border)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: 'var(--spacing-sm)', 
                  fontWeight: '700',
                  color: '#1D9BF0',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  outline: 'none',
                  fontSize: 'clamp(14px, 4vw, 16px)',
                  minHeight: '48px'
                }} 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
              >
                <Camera size={20} />
                Take or Upload Photo
              </motion.button>
            </div>

            <motion.button 
              type="submit" 
              disabled={isSubmitting || !formData.category} 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: 'var(--spacing-sm)',
                width: '100%',
                padding: 'var(--spacing-lg)',
                backgroundColor: formData.category ? '#1D9BF0' : '#1d9bf020',
                color: formData.category ? '#fff' : '#1d9bf070',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                fontSize: 'clamp(15px, 4vw, 17px)',
                fontWeight: '700',
                cursor: formData.category ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                marginBottom: 'var(--spacing-lg)',
                minHeight: '48px'
              }}
            >
              {isSubmitting ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '3px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Submitting...
                </div>
              ) : (
                <>
                  <Send size={20} />
                  Submit Report
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>

      <BottomNavigation activeTab="contribute" onNavigate={onNavigate} />
    </div>
  )
}

export default Contribute