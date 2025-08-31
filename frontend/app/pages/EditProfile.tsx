'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Camera, Save, ArrowLeft, Mail, Phone, MapPin } from 'lucide-react'
import BottomNavigation from '../components/BottomNavigation'
import Logo from '../components/Logo'
import { useTheme } from '../contexts/ThemeContext'

type Page = 'home' | 'maps' | 'contribute' | 'profile'

interface EditProfileProps {
  onNavigate: (page: Page) => void
}

const EditProfile = ({ onNavigate }: EditProfileProps) => {
  const { isDark } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState('')
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: ''
  })

  useEffect(() => {
    fetchCurrentProfile()
  }, [])

  const fetchCurrentProfile = async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setError('Please login first')
      return
    }

    try {
      const response = await fetch('http://localhost:8080/api/profile/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setFormData({
          name: data.data.user.name || '',
          email: data.data.user.email || '',
          phone: '',
          location: '',
          bio: ''
        })
      } else {
        setError(data.message || 'Failed to load profile')
      }
    } catch (error) {
      setError('Network error')
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const token = localStorage.getItem('access_token')
    if (!token) {
      setError('Please login first')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('http://localhost:8080/api/profile/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setShowSuccess(true)
        // Update localStorage with new name
        localStorage.setItem('user_name', formData.name)
        setTimeout(() => {
          setShowSuccess(false)
          onNavigate('profile')
        }, 2000)
      } else {
        setError(data.message || 'Failed to update profile')
      }
    } catch (error) {
      setError('Network error')
    } finally {
      setIsLoading(false)
    }
  }

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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <button
            onClick={() => onNavigate('profile')}
            style={{
              background: 'none',
              border: 'none',
              color: isDark ? '#fff' : '#000',
              cursor: 'pointer',
              padding: 'var(--spacing-sm)'
            }}
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <Logo />
            <h1 style={{ 
              fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
              marginTop: 'var(--spacing-sm)',
              color: isDark ? '#fff' : '#000'
            }}>
              Edit Profile
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: 'var(--spacing-lg)' }}>
        <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: '0 auto' }}>
          {error && (
            <div style={{
              padding: 'var(--spacing-md)',
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              borderRadius: 'var(--radius-sm)',
              color: '#c33',
              marginBottom: 'var(--spacing-lg)'
            }}>
              {error}
            </div>
          )}

          {showSuccess && (
            <div style={{
              padding: 'var(--spacing-md)',
              backgroundColor: '#efe',
              border: '1px solid #cfc',
              borderRadius: 'var(--radius-sm)',
              color: '#363',
              marginBottom: 'var(--spacing-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)'
            }}>
              <Save size={20} />
              Profile updated successfully!
            </div>
          )}

          {/* Avatar Section */}
          <div style={{
            textAlign: 'center',
            marginBottom: 'var(--spacing-xl)'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              backgroundColor: '#1d9bf0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '3rem',
              fontWeight: 'bold',
              margin: '0 auto var(--spacing-md)'
            }}>
              {formData.name?.charAt(0) || 'U'}
            </div>
            <button
              type="button"
              style={{
                background: 'none',
                border: `1px solid ${isDark ? '#333' : '#ccc'}`,
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                color: isDark ? '#fff' : '#000',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm)',
                margin: '0 auto'
              }}
            >
              <Camera size={16} />
              Change Photo
            </button>
          </div>

          {/* Basic Information */}
          <div style={{ marginBottom: 'var(--spacing-xl)' }}>
            <h3 style={{ 
              color: isDark ? '#fff' : '#000',
              marginBottom: 'var(--spacing-lg)'
            }}>
              Basic Information
            </h3>

            {/* Full Name */}
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label style={{ 
                display: 'block',
                marginBottom: 'var(--spacing-sm)',
                fontWeight: '600',
                color: isDark ? '#fff' : '#000'
              }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={20} style={{
                  position: 'absolute',
                  left: 'var(--spacing-md)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: isDark ? '#666' : '#999'
                }} />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  required
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-md) var(--spacing-md) var(--spacing-md) 2.5rem',
                    border: `2px solid ${isDark ? '#333' : '#e1e8ed'}`,
                    borderRadius: 'var(--radius-md)',
                    fontSize: '1rem',
                    backgroundColor: isDark ? '#111' : '#fff',
                    color: isDark ? '#fff' : '#000'
                  }}
                />
              </div>
            </div>

            {/* Email (Read Only) */}
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label style={{ 
                display: 'block',
                marginBottom: 'var(--spacing-sm)',
                fontWeight: '600',
                color: isDark ? '#fff' : '#000'
              }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={20} style={{
                  position: 'absolute',
                  left: 'var(--spacing-md)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: isDark ? '#666' : '#999'
                }} />
                <input
                  type="email"
                  value={formData.email}
                  readOnly
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-md) var(--spacing-md) var(--spacing-md) 2.5rem',
                    border: `2px solid ${isDark ? '#333' : '#e1e8ed'}`,
                    borderRadius: 'var(--radius-md)',
                    fontSize: '1rem',
                    backgroundColor: isDark ? '#0a0a0a' : '#f5f5f5',
                    color: isDark ? '#888' : '#666',
                    cursor: 'not-allowed'
                  }}
                />
              </div>
              <p style={{ 
                fontSize: '0.875rem',
                color: isDark ? '#888' : '#666',
                marginTop: 'var(--spacing-xs)'
              }}>
                Email cannot be changed
              </p>
            </div>

            {/* Phone */}
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label style={{ 
                display: 'block',
                marginBottom: 'var(--spacing-sm)',
                fontWeight: '600',
                color: isDark ? '#fff' : '#000'
              }}>
                Phone Number
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={20} style={{
                  position: 'absolute',
                  left: 'var(--spacing-md)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: isDark ? '#666' : '#999'
                }} />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-md) var(--spacing-md) var(--spacing-md) 2.5rem',
                    border: `2px solid ${isDark ? '#333' : '#e1e8ed'}`,
                    borderRadius: 'var(--radius-md)',
                    fontSize: '1rem',
                    backgroundColor: isDark ? '#111' : '#fff',
                    color: isDark ? '#fff' : '#000'
                  }}
                />
              </div>
            </div>

            {/* Location */}
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label style={{ 
                display: 'block',
                marginBottom: 'var(--spacing-sm)',
                fontWeight: '600',
                color: isDark ? '#fff' : '#000'
              }}>
                Location
              </label>
              <div style={{ position: 'relative' }}>
                <MapPin size={20} style={{
                  position: 'absolute',
                  left: 'var(--spacing-md)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: isDark ? '#666' : '#999'
                }} />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter your location"
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-md) var(--spacing-md) var(--spacing-md) 2.5rem',
                    border: `2px solid ${isDark ? '#333' : '#e1e8ed'}`,
                    borderRadius: 'var(--radius-md)',
                    fontSize: '1rem',
                    backgroundColor: isDark ? '#111' : '#fff',
                    color: isDark ? '#fff' : '#000'
                  }}
                />
              </div>
            </div>

            {/* Bio */}
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
              <label style={{ 
                display: 'block',
                marginBottom: 'var(--spacing-sm)',
                fontWeight: '600',
                color: isDark ? '#fff' : '#000'
              }}>
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about yourself..."
                maxLength={160}
                rows={3}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-md)',
                  border: `2px solid ${isDark ? '#333' : '#e1e8ed'}`,
                  borderRadius: 'var(--radius-md)',
                  fontSize: '1rem',
                  backgroundColor: isDark ? '#111' : '#fff',
                  color: isDark ? '#fff' : '#000',
                  resize: 'vertical',
                  minHeight: '80px'
                }}
              />
              <p style={{ 
                fontSize: '0.875rem',
                color: isDark ? '#888' : '#666',
                marginTop: 'var(--spacing-xs)',
                textAlign: 'right'
              }}>
                {formData.bio.length}/160
              </p>
            </div>
          </div>

          {/* Save Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%',
              padding: 'var(--spacing-lg)',
              backgroundColor: '#1d9bf0',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--spacing-sm)'
            }}
          >
            {isLoading ? (
              'Saving...'
            ) : (
              <>
                <Save size={20} />
                Save Changes
              </>
            )}
          </motion.button>
        </form>
      </div>

      <BottomNavigation current="profile" onNavigate={onNavigate} />
    </div>
  )
}

export default EditProfile
