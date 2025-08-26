'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Search, Navigation, Car, Shield, AlertTriangle, Locate } from 'lucide-react'
import BottomNavigation from '../components/BottomNavigation'
import Logo from '../components/Logo'
import { useTheme } from '../contexts/ThemeContext'

type Page = 'home' | 'maps' | 'contribute' | 'profile'

interface MapProps {
  onNavigate: (page: Page) => void
}

const Map = ({ onNavigate }: MapProps) => {
  const { isDark } = useTheme()
  const [originInput, setOriginInput] = useState('')
  const [destinationInput, setDestinationInput] = useState('')
  const [selectedRoute, setSelectedRoute] = useState('fastest')
  const [routes, setRoutes] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLocationLoading, setIsLocationLoading] = useState(false)
  const [error, setError] = useState('')
  const [origin, setOrigin] = useState<{lat: number, lng: number} | null>(null)
  const [destination, setDestination] = useState<{lat: number, lng: number} | null>(null)
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt')

  const routeOptions = [
    { id: 'fastest', name: 'Fastest', icon: Navigation, color: '#1d9bf0' },
    { id: 'eco', name: 'Eco', icon: Car, color: '#00ba7c' },
    { id: 'safest', name: 'Safest', icon: Shield, color: '#f4212e' }
  ]

  // Request user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser')
      return
    }

    setIsLocationLoading(true)
    setError('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setOrigin(currentPos)
        setOriginInput('Current Location')
        setLocationPermission('granted')
        setIsLocationLoading(false)
      },
      (error) => {
        console.error('Location error:', error)
        setIsLocationLoading(false)
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Location access denied. Please enable location permission.')
            setLocationPermission('denied')
            break
          case error.POSITION_UNAVAILABLE:
            setError('Location information is unavailable.')
            break
          case error.TIMEOUT:
            setError('Location request timed out.')
            break
          default:
            setError('An unknown error occurred while retrieving location.')
            break
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  }

  // Convert address to coordinates (simplified - you could use Google Geocoding API)
  const geocodeAddress = async (address: string): Promise<{lat: number, lng: number} | null> => {
    // For demo purposes, return sample coordinates based on common locations
    const locations: {[key: string]: {lat: number, lng: number}} = {
      'bangalore': { lat: 12.9716, lng: 77.5946 },
      'delhi': { lat: 28.7041, lng: 77.1025 },
      'mumbai': { lat: 19.0760, lng: 72.8777 },
      'chennai': { lat: 13.0827, lng: 80.2707 },
      'kolkata': { lat: 22.5726, lng: 88.3639 }
    }

    const key = address.toLowerCase()
    for (const [city, coords] of Object.entries(locations)) {
      if (key.includes(city)) {
        return coords
      }
    }

    // Default to Bangalore if no match found
    return { lat: 12.9716, lng: 77.5946 }
  }

  const calculateRoutes = async () => {
    if (!origin || !destination) {
      setError('Please set both origin and destination')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Use proxy (next.config.js handles this)
      const response = await fetch('/api/routes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          origin,
          destination
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setRoutes(data.data)
      } else {
        setError(data.message || 'Failed to calculate routes')
      }
    } catch (error) {
      console.error('Route calculation error:', error)
      setError('Network error - please check if backend is running')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetDirections = async () => {
    setError('')
    
    // Set origin
    if (originInput.toLowerCase() === 'current location' || !originInput) {
      if (!origin) {
        getCurrentLocation()
        return
      }
    } else {
      const originCoords = await geocodeAddress(originInput)
      if (originCoords) {
        setOrigin(originCoords)
      }
    }

    // Set destination
    if (destinationInput) {
      const destCoords = await geocodeAddress(destinationInput)
      if (destCoords) {
        setDestination(destCoords)
        // Auto-calculate routes once both are set
        setTimeout(() => calculateRoutes(), 100)
      }
    } else {
      setError('Please enter a destination')
    }
  }

  // Get current location on component mount
  useEffect(() => {
    getCurrentLocation()
  }, [])

  const getRouteInfo = () => {
    if (!routes) return null
    return routes[selectedRoute]
  }

  const currentRoute = getRouteInfo()

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
        borderBottom: `1px solid ${isDark ? '#333' : '#eee'}`
      }}>
        <Logo />
        <h1 style={{ 
          fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
          marginTop: 'var(--spacing-sm)',
          color: isDark ? '#fff' : '#000'
        }}>
          Smart Routes
        </h1>
      </div>

      {/* Origin and Destination Inputs */}
      <div style={{
        padding: 'var(--spacing-lg)',
        backgroundColor: isDark ? '#0a0a0a' : '#f9f9f9',
        borderBottom: `1px solid ${isDark ? '#333' : '#eee'}`
      }}>
        {/* Origin Input */}
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <label style={{ 
            display: 'block',
            marginBottom: 'var(--spacing-xs)',
            color: isDark ? '#fff' : '#000',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            From
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
              value={originInput}
              onChange={(e) => setOriginInput(e.target.value)}
              placeholder="Enter starting location"
              style={{
                width: '100%',
                padding: 'var(--spacing-md) 3rem var(--spacing-md) 2.5rem',
                border: `2px solid ${isDark ? '#333' : '#e1e8ed'}`,
                borderRadius: 'var(--radius-md)',
                fontSize: '1rem',
                backgroundColor: isDark ? '#111' : '#fff',
                color: isDark ? '#fff' : '#000'
              }}
            />
            <button
              onClick={getCurrentLocation}
              disabled={isLocationLoading}
              style={{
                position: 'absolute',
                right: 'var(--spacing-sm)',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: '#1d9bf0',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--spacing-sm)',
                cursor: isLocationLoading ? 'not-allowed' : 'pointer',
                opacity: isLocationLoading ? 0.6 : 1
              }}
            >
              {isLocationLoading ? (
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid transparent',
                  borderTop: '2px solid currentColor',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              ) : (
                <Locate size={16} />
              )}
            </button>
          </div>
        </div>

        {/* Destination Input */}
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <label style={{ 
            display: 'block',
            marginBottom: 'var(--spacing-xs)',
            color: isDark ? '#fff' : '#000',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            To
          </label>
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{
              position: 'absolute',
              left: 'var(--spacing-md)',
              top: '50%',
              transform: 'translateY(-50%)',
              color: isDark ? '#666' : '#999'
            }} />
            <input
              type="text"
              value={destinationInput}
              onChange={(e) => setDestinationInput(e.target.value)}
              placeholder="Enter destination"
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
          </div>
        </div>

        {/* Get Directions Button */}
        <motion.button
          onClick={handleGetDirections}
          disabled={isLoading || isLocationLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            width: '100%',
            padding: 'var(--spacing-md)',
            backgroundColor: '#1d9bf0',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: (isLoading || isLocationLoading) ? 'not-allowed' : 'pointer',
            opacity: (isLoading || isLocationLoading) ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--spacing-sm)'
          }}
        >
          {isLoading ? (
            'Calculating Routes...'
          ) : (
            <>
              <Navigation size={16} />
              Get Directions
            </>
          )}
        </motion.button>
      </div>

      {/* Route Options */}
      <div style={{
        padding: 'var(--spacing-lg)',
        borderBottom: `1px solid ${isDark ? '#333' : '#eee'}`
      }}>
        <h3 style={{
          color: isDark ? '#fff' : '#000',
          marginBottom: 'var(--spacing-md)'
        }}>
          Route Options
        </h3>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
          {routeOptions.map((option) => {
            const IconComponent = option.icon
            const isSelected = selectedRoute === option.id
            return (
              <motion.button
                key={option.id}
                onClick={() => setSelectedRoute(option.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  flex: 1,
                  padding: 'var(--spacing-lg)',
                  backgroundColor: isSelected ? `${option.color}20` : 'transparent',
                  border: `2px solid ${isSelected ? option.color : (isDark ? '#333' : '#e1e8ed')}`,
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  cursor: 'pointer',
                  color: isSelected ? option.color : (isDark ? '#fff' : '#000')
                }}
              >
                <IconComponent size={24} />
                <span style={{ fontWeight: '600' }}>{option.name}</span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Route Details */}
      <div style={{ flex: 1, padding: 'var(--spacing-lg)' }}>
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
            {locationPermission === 'denied' && (
              <div style={{ marginTop: 'var(--spacing-sm)' }}>
                <button
                  onClick={getCurrentLocation}
                  style={{
                    backgroundColor: '#1d9bf0',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    padding: 'var(--spacing-xs) var(--spacing-sm)',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}

        {isLoading && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            color: isDark ? '#888' : '#666'
          }}>
            Calculating routes...
          </div>
        )}

        {currentRoute && (
          <div style={{
            backgroundColor: isDark ? '#111' : '#f7f9fa',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-xl)'
          }}>
            <h3 style={{
              color: isDark ? '#fff' : '#000',
              marginBottom: 'var(--spacing-lg)',
              textTransform: 'capitalize'
            }}>
              {selectedRoute} Route
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 'var(--spacing-lg)',
              marginBottom: 'var(--spacing-lg)'
            }}>
              <div>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: routeOptions.find(r => r.id === selectedRoute)?.color,
                  marginBottom: 'var(--spacing-xs)'
                }}>
                  {currentRoute.duration || 'N/A'}
                </div>
                <div style={{ color: isDark ? '#888' : '#666' }}>Duration</div>
              </div>

              <div>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: routeOptions.find(r => r.id === selectedRoute)?.color,
                  marginBottom: 'var(--spacing-xs)'
                }}>
                  {currentRoute.distance || 'N/A'}
                </div>
                <div style={{ color: isDark ? '#888' : '#666' }}>Distance</div>
              </div>
            </div>

            {/* Route Features */}
            {currentRoute.route_features && (
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h4 style={{
                  color: isDark ? '#fff' : '#000',
                  marginBottom: 'var(--spacing-sm)'
                }}>
                  Features
                </h4>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  {currentRoute.route_features.map((feature: string, index: number) => (
                    <li
                      key={index}
                      style={{
                        color: isDark ? '#ccc' : '#666',
                        marginBottom: 'var(--spacing-xs)',
                        paddingLeft: 'var(--spacing-md)',
                        position: 'relative'
                      }}
                    >
                      <span style={{
                        position: 'absolute',
                        left: 0,
                        color: routeOptions.find(r => r.id === selectedRoute)?.color
                      }}>
                        •
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Cost Information */}
            {currentRoute.estimated_fuel_cost && (
              <div style={{
                backgroundColor: isDark ? '#0a0a0a' : '#fff',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ color: isDark ? '#fff' : '#000' }}>Estimated Cost:</span>
                <span style={{
                  fontWeight: 'bold',
                  color: routeOptions.find(r => r.id === selectedRoute)?.color
                }}>
                  {currentRoute.estimated_fuel_cost}
                </span>
              </div>
            )}
          </div>
        )}

        {!routes && !isLoading && !error && (
          <div style={{
            textAlign: 'center',
            padding: 'var(--spacing-xl)',
            color: isDark ? '#888' : '#666'
          }}>
            <MapPin size={48} style={{ marginBottom: 'var(--spacing-md)' }} />
            <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Ready to Navigate</h3>
            <p>Enter your destination to get smart route suggestions</p>
          </div>
        )}
      </div>

      <BottomNavigation current="maps" onNavigate={onNavigate} />
    </div>
  )
}

export default Map
