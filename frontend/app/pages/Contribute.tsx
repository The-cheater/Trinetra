'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Camera, AlertTriangle, Construction, Car, MapPin, Send, Upload, Search, Locate, Brain } from 'lucide-react'
import BottomNavigation from '../components/BottomNavigation'
import Logo from '../components/Logo'
import CredibilityPopup from '../components/CredibilityPopup'
import { useTheme } from '../contexts/ThemeContext'
import toast, { Toaster } from 'react-hot-toast'

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
  
  // Credibility popup state
  const [showCredibilityPopup, setShowCredibilityPopup] = useState(false)
  const [credibilityData, setCredibilityData] = useState<any>(null)

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
          
          // Reverse geocode using Nominatim (free alternative)
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`
            )
            const data = await response.json()
            if (data.display_name) {
              setFormData(prev => ({
                ...prev,
                locationName: data.display_name.split(',')[0] || `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
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
          toast.error('Unable to get current location. Please enable location services.')
        }
      )
    }
  }, [])

  const searchPlaces = async (query: string) => {
    if (!query.trim() || query.length < 3) return
    
    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5`
      )
      const data = await response.json()
      setPlaceSuggestions(data || [])
    } catch (error) {
      console.error('Places search error:', error)
      toast.error('Failed to search places')
    } finally {
      setIsSearching(false)
    }
  }

  const selectPlace = async (place: any) => {
    setFormData(prev => ({ ...prev, locationName: place.display_name }))
    setPlaceSuggestions([])
    setCurrentLocation({
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon)
    })
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
      const file = e.target.files[0]
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be smaller than 5MB')
        return
      }
      
      setSelectedPhoto(file)
      toast.success('Image selected for AI analysis')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.category || !formData.description) {
      setError('Please fill in all required fields')
      toast.error('Please fill in all required fields')
      return
    }

    if (!currentLocation) {
      setError('Location is required. Please enable location services or search for a place.')
      toast.error('Location is required')
      return
    }

    const token = localStorage.getItem('access_token')
    if (!token) {
      setError('Please login first')
      toast.error('Please login first')
      return
    }

    setIsSubmitting(true)
    setError('')

    // Show loading toast for AI analysis
    const loadingToastId = toast.loading(
      selectedPhoto 
        ? 'Analyzing with AI and Vision API...' 
        : 'Analyzing with Gemini AI...'
    )

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
      
      toast.dismiss(loadingToastId)

      if (response.ok && data.success) {
        // Show success toast
        toast.success('Report submitted successfully!')
        
        // Set credibility data and show popup
        setCredibilityData(data.data)
        setShowCredibilityPopup(true)

        // Reset form
        setFormData({
          category: '',
          severity: 'Medium',
          description: '',
          locationName: ''
        })
        setSelectedPhoto(null)
        
      } else {
        setError(data.message || 'Failed to submit report')
        toast.error(data.message || 'Failed to submit report')
      }

    } catch (error) {
      toast.dismiss(loadingToastId)
      setError('Network error. Please try again.')
      toast.error('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCredibilityPopupClose = () => {
    setShowCredibilityPopup(false)
    setCredibilityData(null)
    onNavigate('home')
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: isDark ? '#000' : '#fff',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Toaster position="top-center" />
      
      {/* Header - Fixed */}
      <div style={{
        padding: 'var(--spacing-lg)',
        borderBottom: `1px solid ${isDark ? '#333' : '#eee'}`,
        position: 'sticky',
        top: 0,
        backgroundColor: isDark ? '#000' : '#fff',
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
        <p style={{
          color: isDark ? '#888' : '#666',
          fontSize: '0.9rem',
          margin: 'var(--spacing-xs) 0 0 0'
        }}>
          AI-powered credibility analysis with Google Vision API
        </p>
      </div>

      {/* Scrollable Content Area */}
      <div style={{ 
        flex: 1, 
        padding: 'var(--spacing-lg)', 
        paddingBottom: '120px',
        overflowY: 'auto' 
      }}>
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
          <label style={{
            display: 'block',
            marginBottom: 'var(--spacing-md)',
            color: isDark ? '#fff' : '#000',
            fontSize: '1.1rem',
            fontWeight: '600'
          }}>
            Incident Category *
          </label>
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
                  <IconComponent size={24} />
                  <span style={{ fontWeight: '600' }}>{category.name}</span>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Severity */}
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <label style={{
            display: 'block',
            marginBottom: 'var(--spacing-md)',
            color: isDark ? '#fff' : '#000',
            fontSize: '1.1rem',
            fontWeight: '600'
          }}>
            Severity Level
          </label>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
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
          <label style={{
            display: 'block',
            marginBottom: 'var(--spacing-md)',
            color: isDark ? '#fff' : '#000',
            fontSize: '1.1rem',
            fontWeight: '600'
          }}>
            Location *
          </label>

          {/* Address Search Input */}
          <div style={{ position: 'relative', marginBottom: 'var(--spacing-md)' }}>
            <Search size={20} style={{
              position: 'absolute',
              left: 'var(--spacing-md)',
              top: '50%',
              transform: 'translateY(-50%)',
              color: isDark ? '#666' : '#999',
              zIndex: 2
            }} />
            <input
              type="text"
              name="locationName"
              value={formData.locationName}
              onChange={handleChange}
              placeholder="Search for a location..."
              style={{
                width: '100%',
                padding: 'var(--spacing-md) 2.5rem',
                border: `2px solid ${isDark ? '#333' : '#e1e8ed'}`,
                borderRadius: 'var(--radius-md)',
                fontSize: '1rem',
                backgroundColor: isDark ? '#111' : '#fff',
                color: isDark ? '#fff' : '#000'
              }}
            />
            {isSearching && (
              <div style={{
                position: 'absolute',
                right: 'var(--spacing-md)',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid transparent',
                  borderTop: '2px solid #1d9bf0',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              </div>
            )}
          </div>

          {/* Place Suggestions */}
          {placeSuggestions.length > 0 && (
            <div style={{
              backgroundColor: isDark ? '#111' : '#fff',
              border: `1px solid ${isDark ? '#333' : '#ccc'}`,
              borderRadius: 'var(--radius-md)',
              maxHeight: '200px',
              overflowY: 'auto',
              marginBottom: 'var(--spacing-md)'
            }}>
              {placeSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => selectPlace(suggestion)}
                  style={{
                    padding: 'var(--spacing-md)',
                    cursor: 'pointer',
                    borderBottom: `1px solid ${isDark ? '#333' : '#eee'}`,
                    color: isDark ? '#fff' : '#000'
                  }}
                >
                  <div style={{ fontWeight: '600' }}>
                    {suggestion.display_name.split(',')[0]}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: isDark ? '#888' : '#666' }}>
                    {suggestion.display_name.split(',').slice(1, 3).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Current Location Button */}
          <motion.button
            type="button"
            onClick={() => {
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
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`
                      )
                      const data = await response.json()
                      setFormData({
                        ...formData,
                        locationName: data.display_name?.split(',')[0] || `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
                      })
                    } catch (error) {
                      setFormData({
                        ...formData,
                        locationName: `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
                      })
                    }
                  },
                  (error) => {
                    toast.error('Unable to get current location')
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
            Use Current Location
          </motion.button>

          {/* Coordinates Display */}
          {currentLocation && (
            <div style={{
              marginTop: 'var(--spacing-sm)',
              fontSize: '0.8rem',
              color: isDark ? '#888' : '#666'
            }}>
              📍 {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
            </div>
          )}
        </div>

        {/* Description */}
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <label style={{
            display: 'block',
            marginBottom: 'var(--spacing-md)',
            color: isDark ? '#fff' : '#000',
            fontSize: '1.1rem',
            fontWeight: '600'
          }}>
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the incident in detail..."
            rows={4}
            style={{
              width: '100%',
              padding: 'var(--spacing-md)',
              border: `2px solid ${isDark ? '#333' : '#e1e8ed'}`,
              borderRadius: 'var(--radius-md)',
              fontSize: '1rem',
              backgroundColor: isDark ? '#111' : '#fff',
              color: isDark ? '#fff' : '#000',
              resize: 'vertical',
              minHeight: '100px'
            }}
          />
          <div style={{
            marginTop: 'var(--spacing-xs)',
            fontSize: '0.8rem',
            color: isDark ? '#888' : '#666',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-xs)'
          }}>
            <Brain size={14} />
            💡 Tip: More detailed descriptions receive higher credibility scores from AI analysis
          </div>
        </div>

        {/* Photo Upload */}
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <label style={{
            display: 'block',
            marginBottom: 'var(--spacing-md)',
            color: isDark ? '#fff' : '#000',
            fontSize: '1.1rem',
            fontWeight: '600'
          }}>
            Add Photo (Optional - Increases credibility score)
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--spacing-sm)',
                padding: 'var(--spacing-lg)',
                border: `2px dashed ${isDark ? '#333' : '#ccc'}`,
                borderRadius: 'var(--radius-md)',
                backgroundColor: isDark ? '#111' : '#f9f9f9',
                color: isDark ? '#fff' : '#000',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              <Camera size={20} />
              <span>{selectedPhoto ? selectedPhoto.name : 'Click to upload photo evidence'}</span>
            </label>
          </div>
          <div style={{
            marginTop: 'var(--spacing-xs)',
            fontSize: '0.8rem',
            color: isDark ? '#888' : '#666',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-xs)'
          }}>
            <Brain size={14} />
            Photos significantly boost AI credibility scores through Google Vision analysis
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          onClick={handleSubmit}
          disabled={isSubmitting || !formData.category || !formData.description || !currentLocation}
          whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
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
            gap: 'var(--spacing-sm)'
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
              <Brain size={20} />
              Submit Report for AI Analysis
            </>
          )}
        </motion.button>
      </div>

      {/* Credibility Popup */}
      <CredibilityPopup
        isOpen={showCredibilityPopup}
        onClose={handleCredibilityPopupClose}
        data={credibilityData}
      />

      {/* Fixed Bottom Navigation */}
      <BottomNavigation current="contribute" onNavigate={onNavigate} />
    </div>
  )
}

export default Contribute
