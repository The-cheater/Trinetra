'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Camera, AlertTriangle, Construction, Car, MapPin, Send, Upload, Search, Locate } from 'lucide-react'
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
    severity: 'Medium',
    description: '',
    locationName: ''
  })
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [placeSuggestions, setPlaceSuggestions] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const categories = [
    { id: 'Traffic', name: 'Traffic', icon: Car, color: '#F4212E' },
    { id: 'Road Work', name: 'Road Work', icon: Construction, color: '#FFD400' },
    { id: 'Accident', name: 'Accident', icon: AlertTriangle, color: '#FF6B00' },
    { id: 'Hazard', name: 'Hazard', icon: AlertTriangle, color: '#00BA7C' },
    { id: 'Other', name: 'Other', icon: MapPin, color: '#1D9BF0' }
  ]

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setCurrentLocation(coords)
          
          // Reverse geocode to get place name
          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.lat},${coords.lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
            )
            const data = await response.json()
            if (data.results && data.results[0]) {
              setFormData(prev => ({ 
                ...prev, 
                locationName: data.results[0].formatted_address 
              }))
            }
          } catch (error) {
            console.error('Reverse geocoding failed:', error)
            setFormData(prev => ({ 
              ...prev, 
              locationName: `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` 
            }))
          }
        },
        (error) => {
          console.error('Location error:', error)
          setError('Unable to get current location. Please enable location services.')
        }
      )
    }
  }, [])

  const searchPlaces = async (query: string) => {
    if (!query.trim() || !process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) return

    setIsSearching(true)
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&components=country:in`
      )
      const data = await response.json()
      
      if (data.predictions) {
        setPlaceSuggestions(data.predictions.slice(0, 5))
      }
    } catch (error) {
      console.error('Places search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const selectPlace = async (placeId: string, description: string) => {
    setFormData(prev => ({ ...prev, locationName: description }))
    setPlaceSuggestions([])

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      )
      const data = await response.json()
      
      if (data.result?.geometry?.location) {
        setCurrentLocation({
          lat: data.result.geometry.location.lat,
          lng: data.result.geometry.location.lng
        })
      }
    } catch (error) {
      console.error('Place details error:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')

    if (name === 'locationName' && value.length > 2) {
      searchPlaces(value)
    } else if (name === 'locationName') {
      setPlaceSuggestions([])
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedPhoto(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.category || !formData.description) {
      setError('Please fill in all required fields')
      return
    }

    if (!currentLocation) {
      setError('Location is required. Please enable location services or search for a place.')
      return
    }

    const token = localStorage.getItem('auth_token')
    if (!token) {
      setError('Please login first')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('category', formData.category)
      formDataToSend.append('severity', formData.severity)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('location', JSON.stringify(currentLocation))
      formDataToSend.append('locationName', formData.locationName || `${currentLocation.lat}, ${currentLocation.lng}`)
      
      if (selectedPhoto) {
        formDataToSend.append('photo', selectedPhoto)
      }

      const response = await fetch('/api/contribute', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      })

      const data = await response.json()

      if (response.ok && data.success) {
        alert(`Report submitted successfully! AI Confidence Score: ${data.data.confidence_score}% (AI Analysis: ${data.data.ai_score}%)`)
        setFormData({
          category: '',
          severity: 'Medium',
          description: '',
          locationName: ''
        })
        setSelectedPhoto(null)
        onNavigate('home')
      } else {
        setError(data.message || 'Failed to submit report')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: isDark ? '#000' : '#fff',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {/* Header - Fixed */}
      <div style={{
        padding: 'var(--spacing-lg)',
        borderBottom: `1px solid ${isDark ? '#333' : '#eee'}`,
        backgroundColor: isDark ? '#000' : '#fff',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <Logo />
        <h1 style={{ 
          fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
          marginTop: 'var(--spacing-sm)',
          color: isDark ? '#fff' : '#000'
        }}>
          Report Incident
        </h1>
      </div>

      {/* Scrollable Content Area */}
      <div style={{ 
        flex: 1,
        overflowY: 'auto',
        paddingBottom: '100px',
        WebkitOverflowScrolling: 'touch'
      }}>
        <div style={{ padding: 'var(--spacing-lg)' }}>
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

            {/* Category Selection */}
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
              <h3 style={{ 
                marginBottom: 'var(--spacing-md)',
                color: isDark ? '#fff' : '#000'
              }}>
                Incident Category *
              </h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
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
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        padding: 'var(--spacing-lg)',
                        backgroundColor: isSelected ? `${category.color}20` : 'transparent',
                        border: `2px solid ${isSelected ? category.color : (isDark ? '#333' : '#e1e8ed')}`,
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 'var(--spacing-sm)',
                        cursor: 'pointer',
                        color: isSelected ? category.color : (isDark ? '#fff' : '#000'),
                        minHeight: '100px'
                      }}
                    >
                      <IconComponent size={32} />
                      <span style={{ fontWeight: '600' }}>{category.name}</span>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Severity */}
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
              <h3 style={{ 
                marginBottom: 'var(--spacing-md)',
                color: isDark ? '#fff' : '#000'
              }}>
                Severity Level
              </h3>
              <div style={{ 
                display: 'flex', 
                gap: 'var(--spacing-sm)',
                backgroundColor: isDark ? '#111' : '#f7f9fa',
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--spacing-xs)'
              }}>
                {['Low', 'Medium', 'High'].map((level) => (
                  <motion.button
                    key={level}
                    type="button"
                    onClick={() => setFormData({ ...formData, severity: level })}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      flex: 1,
                      padding: 'var(--spacing-sm)',
                      border: 'none',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: formData.severity === level ? '#1d9bf0' : 'transparent',
                      color: formData.severity === level ? '#fff' : (isDark ? '#888' : '#666'),
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {level}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Enhanced Location with Places Search */}
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
              <h3 style={{ 
                marginBottom: 'var(--spacing-md)',
                color: isDark ? '#fff' : '#000'
              }}>
                Location *
              </h3>
              
              {/* Address Search Input */}
              <div style={{ position: 'relative', marginBottom: 'var(--spacing-md)' }}>
                <input
                  type="text"
                  name="locationName"
                  value={formData.locationName}
                  onChange={handleChange}
                  placeholder="Search for a place or address..."
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-md) 2.5rem var(--spacing-md) var(--spacing-md)',
                    border: `2px solid ${isDark ? '#333' : '#e1e8ed'}`,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isDark ? '#111' : '#fff',
                    color: isDark ? '#fff' : '#000',
                    fontSize: '1rem'
                  }}
                />
                <Search size={20} style={{
                  position: 'absolute',
                  right: 'var(--spacing-md)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: isDark ? '#666' : '#999'
                }} />

                {/* Place Suggestions */}
                {placeSuggestions.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: isDark ? '#111' : '#fff',
                    border: `1px solid ${isDark ? '#333' : '#ccc'}`,
                    borderRadius: 'var(--radius-md)',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 1000
                  }}>
                    {placeSuggestions.map((suggestion) => (
                      <div
                        key={suggestion.place_id}
                        onClick={() => selectPlace(suggestion.place_id, suggestion.description)}
                        style={{
                          padding: 'var(--spacing-md)',
                          cursor: 'pointer',
                          borderBottom: `1px solid ${isDark ? '#333' : '#eee'}`,
                          color: isDark ? '#fff' : '#000'
                        }}
                      >
                        <div style={{ fontWeight: '600' }}>
                          {suggestion.structured_formatting?.main_text || suggestion.description}
                        </div>
                        {suggestion.structured_formatting?.secondary_text && (
                          <div style={{ fontSize: '0.8rem', color: isDark ? '#888' : '#666' }}>
                            {suggestion.structured_formatting.secondary_text}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Current Location Button */}
              <motion.button
                type="button"
                onClick={async () => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      async (position) => {
                        const coords = {
                          lat: position.coords.latitude,
                          lng: position.coords.longitude
                        }
                        setCurrentLocation(coords)
                        
                        try {
                          const response = await fetch(
                            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.lat},${coords.lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
                          )
                          const data = await response.json()
                          if (data.results && data.results[0]) {
                            setFormData({ 
                              ...formData, 
                              locationName: data.results[0].formatted_address 
                            })
                          }
                        } catch (error) {
                          console.error('Reverse geocoding failed:', error)
                          setFormData({ 
                            ...formData, 
                            locationName: `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` 
                          })
                        }
                      }
                    )
                  }
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  backgroundColor: isDark ? '#111' : '#f7f9fa',
                  border: `1px solid ${isDark ? '#333' : '#ddd'}`,
                  borderRadius: 'var(--radius-sm)',
                  color: isDark ? '#fff' : '#000',
                  cursor: 'pointer'
                }}
              >
                <Locate size={16} />
                <span>Use Current Location</span>
              </motion.button>

              {/* Coordinates Display */}
              {currentLocation && (
                <div style={{
                  marginTop: 'var(--spacing-sm)',
                  padding: 'var(--spacing-sm)',
                  backgroundColor: isDark ? '#0a0a0a' : '#f0f0f0',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.8rem',
                  color: isDark ? '#888' : '#666'
                }}>
                  📍 {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                </div>
              )}
            </div>

            {/* Description */}
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
              <h3 style={{ 
                marginBottom: 'var(--spacing-md)',
                color: isDark ? '#fff' : '#000'
              }}>
                Description *
              </h3>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the incident in detail... (AI will analyze your description for credibility)"
                required
                style={{
                  width: '100%',
                  padding: 'var(--spacing-md)',
                  border: `2px solid ${isDark ? '#333' : '#e1e8ed'}`,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isDark ? '#111' : '#fff',
                  color: isDark ? '#fff' : '#000',
                  fontSize: '1rem',
                  resize: 'vertical',
                  minHeight: '100px'
                }}
              />
              <div style={{
                fontSize: '0.8rem',
                color: isDark ? '#888' : '#666',
                marginTop: 'var(--spacing-xs)'
              }}>
                💡 Tip: More detailed descriptions receive higher credibility scores from AI analysis
              </div>
            </div>

            {/* Photo Upload */}
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
              <h3 style={{ 
                marginBottom: 'var(--spacing-md)',
                color: isDark ? '#fff' : '#000'
              }}>
                Add Photo (Optional - Increases credibility score)
              </h3>
              <div style={{
                border: `2px dashed ${isDark ? '#333' : '#e1e8ed'}`,
                borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-xl)',
                textAlign: 'center',
                backgroundColor: isDark ? '#111' : '#f7f9fa'
              }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" style={{ cursor: 'pointer' }}>
                  <Upload size={48} style={{ 
                    color: isDark ? '#666' : '#999',
                    marginBottom: 'var(--spacing-md)'
                  }} />
                  <p style={{ 
                    color: isDark ? '#888' : '#666',
                    margin: 0
                  }}>
                    {selectedPhoto ? selectedPhoto.name : 'Click to upload photo evidence'}
                  </p>
                  <p style={{ 
                    color: isDark ? '#666' : '#999',
                    margin: 'var(--spacing-xs) 0 0 0',
                    fontSize: '0.8rem'
                  }}>
                    Photos significantly boost AI credibility scores
                  </p>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                padding: 'var(--spacing-lg)',
                backgroundColor: isSubmitting ? '#666' : '#1d9bf0',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--spacing-sm)',
                marginBottom: 'var(--spacing-xl)'
              }}
            >
              {isSubmitting ? (
                <>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid transparent',
                    borderTop: '2px solid currentColor',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Submit Report for AI Analysis
                </>
              )}
            </motion.button>
          </form>
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }}>
        <BottomNavigation current="contribute" onNavigate={onNavigate} />
      </div>
    </div>
  )
}

export default Contribute
