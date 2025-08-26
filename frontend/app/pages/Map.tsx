'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Search, Navigation, Car, Shield, AlertTriangle, Locate, Clock, DollarSign, Zap, Leaf, Route, Target } from 'lucide-react'
import dynamic from 'next/dynamic'
import BottomNavigation from '../components/BottomNavigation'
import Logo from '../components/Logo'
import { useTheme } from '../contexts/ThemeContext'

// Dynamic imports for Leaflet (prevents SSR issues)
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Polyline = dynamic(() => import('react-leaflet').then(mod => mod.Polyline), { ssr: false })

type Page = 'home' | 'maps' | 'contribute' | 'profile'

interface MapProps {
  onNavigate: (page: Page) => void
}

interface LocationSuggestion {
  place_id: string
  display_name: string
  lat: string
  lon: string
  type: string
  importance: number
}

interface RouteData {
  type: string
  duration: string
  duration_minutes: number
  distance: string
  distance_km: number
  estimated_fuel_cost: string
  route_features?: string[]
  safety_score?: string
  safety_features?: string[]
  eco_features?: string[]
  environmental_impact?: any
  incidents_on_route?: number
  path_points?: [number, number][]
}

const Map = ({ onNavigate }: MapProps) => {
  const { isDark } = useTheme()
  const [originInput, setOriginInput] = useState('')
  const [destinationInput, setDestinationInput] = useState('')
  const [selectedRoute, setSelectedRoute] = useState<'fastest' | 'eco' | 'safest'>('fastest')
  const [routes, setRoutes] = useState<{[key: string]: RouteData} | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLocationLoading, setIsLocationLoading] = useState(false)
  const [isGeocodingOrigin, setIsGeocodingOrigin] = useState(false)
  const [isGeocodingDestination, setIsGeocodingDestination] = useState(false)
  const [error, setError] = useState('')
  const [origin, setOrigin] = useState<{lat: number, lng: number} | null>(null)
  const [destination, setDestination] = useState<{lat: number, lng: number} | null>(null)
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt')
  const [originSuggestions, setOriginSuggestions] = useState<LocationSuggestion[]>([])
  const [destinationSuggestions, setDestinationSuggestions] = useState<LocationSuggestion[]>([])
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false)
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false)
  
  // Refs for click outside detection and map control
  const originContainerRef = useRef<HTMLDivElement>(null)
  const destinationContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)

  const routeOptions = [
    { 
      id: 'fastest', 
      name: 'Fastest', 
      icon: Zap, 
      color: '#1d9bf0',
      description: 'Quickest route using main roads'
    },
    { 
      id: 'eco', 
      name: 'Eco', 
      icon: Leaf, 
      color: '#00ba7c',
      description: 'Fuel efficient route'
    },
    { 
      id: 'safest', 
      name: 'Safest', 
      icon: Shield, 
      color: '#f4212e',
      description: 'Safest route avoiding incidents'
    }
  ]

  // Calculate proper bounds for zooming to route
  const calculateRouteBounds = () => {
    if (!origin || !destination) return null

    const lats = [origin.lat, destination.lat]
    const lngs = [origin.lng, destination.lng]

    // Add some padding
    const latPadding = Math.abs(Math.max(...lats) - Math.min(...lats)) * 0.1 || 0.01
    const lngPadding = Math.abs(Math.max(...lngs) - Math.min(...lngs)) * 0.1 || 0.01

    return [
      [Math.min(...lats) - latPadding, Math.min(...lngs) - lngPadding],
      [Math.max(...lats) + latPadding, Math.max(...lngs) + lngPadding]
    ]
  }

  // Enhanced geocoding with live suggestions using Nominatim
  const geocodeAddressLive = async (address: string): Promise<LocationSuggestion[]> => {
    if (!address || address.length < 3) return []

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&` +
        `q=${encodeURIComponent(address)}&` +
        `countrycodes=in&` +
        `limit=5&` +
        `addressdetails=1&` +
        `extratags=1&` +
        `dedupe=1`
      )

      if (!response.ok) throw new Error('Geocoding failed')

      const data = await response.json()
      return data.map((item: any) => ({
        place_id: item.place_id,
        display_name: item.display_name,
        lat: item.lat,
        lon: item.lon,
        type: item.type || 'location',
        importance: item.importance || 0
      }))
    } catch (error) {
      console.error('Geocoding error:', error)
      return []
    }
  }

  // Debounced search for origin suggestions
  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (originInput.length >= 3 && originInput !== 'Current Location') {
        setIsGeocodingOrigin(true)
        try {
          const suggestions = await geocodeAddressLive(originInput)
          setOriginSuggestions(suggestions)
          setShowOriginSuggestions(suggestions.length > 0)
        } catch (error) {
          console.error('Origin search error:', error)
        } finally {
          setIsGeocodingOrigin(false)
        }
      } else {
        setOriginSuggestions([])
        setShowOriginSuggestions(false)
      }
    }, 300)

    return () => clearTimeout(searchTimer)
  }, [originInput])

  // Debounced search for destination suggestions
  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (destinationInput.length >= 3) {
        setIsGeocodingDestination(true)
        try {
          const suggestions = await geocodeAddressLive(destinationInput)
          setDestinationSuggestions(suggestions)
          setShowDestinationSuggestions(suggestions.length > 0)
        } catch (error) {
          console.error('Destination search error:', error)
        } finally {
          setIsGeocodingDestination(false)
        }
      } else {
        setDestinationSuggestions([])
        setShowDestinationSuggestions(false)
      }
    }, 300)

    return () => clearTimeout(searchTimer)
  }, [destinationInput])

  // Handle origin input change
  const handleOriginChange = (value: string) => {
    setOriginInput(value)
  }

  // Handle destination input change
  const handleDestinationChange = (value: string) => {
    setDestinationInput(value)
  }

  // Select origin from suggestions
  const selectOrigin = (suggestion: LocationSuggestion) => {
    setOrigin({
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon)
    })
    setOriginInput(suggestion.display_name.split(',')[0])
    setOriginSuggestions([])
    setShowOriginSuggestions(false)
  }

  // Select destination from suggestions
  const selectDestination = (suggestion: LocationSuggestion) => {
    setDestination({
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon)
    })
    setDestinationInput(suggestion.display_name.split(',')[0])
    setDestinationSuggestions([])
    setShowDestinationSuggestions(false)
  }

  // Request user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser')
      return
    }

    setIsLocationLoading(true)
    setError('')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const currentPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setOrigin(currentPos)
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?` +
            `format=json&` +
            `lat=${currentPos.lat}&` +
            `lon=${currentPos.lng}&` +
            `zoom=16&` +
            `addressdetails=1`
          )
          const data = await response.json()
          setOriginInput(data.display_name?.split(',')[0] || 'Current Location')
        } catch (error) {
          setOriginInput('Current Location')
        }

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
        maximumAge: 300000
      }
    )
  }

  // Calculate routes using your enhanced backend
  const calculateRoutes = async () => {
    if (!origin || !destination) {
      setError('Please set both origin and destination')
      return
    }

    setIsLoading(true)
    setError('')

    try {
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
        const processedRoutes = { ...data.data }
        Object.keys(processedRoutes).forEach(routeKey => {
          const route = processedRoutes[routeKey]
          if (route && !route.path_points) {
            // Create a more detailed path for better route visualization
            const steps = 20 // Number of intermediate points
            const pathPoints: [number, number][] = []
            
            for (let i = 0; i <= steps; i++) {
              const ratio = i / steps
              const lat = origin.lat + (destination.lat - origin.lat) * ratio
              const lng = origin.lng + (destination.lng - origin.lng) * ratio
              pathPoints.push([lat, lng])
            }
            
            route.path_points = pathPoints
          }
        })
        
        setRoutes(processedRoutes)
        
        if (data.data.incidents_count > 0) {
          console.log(`Routes calculated. ${data.data.incidents_count} incidents detected on route corridors.`)
        }
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

  // Auto-calculate routes when both origin and destination are set
  useEffect(() => {
    if (origin && destination) {
      const timer = setTimeout(() => {
        calculateRoutes()
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [origin, destination])

  // Auto-zoom to route when routes are calculated
  useEffect(() => {
    if (routes && mapRef.current && origin && destination) {
      const bounds = calculateRouteBounds()
      if (bounds) {
        setTimeout(() => {
          try {
            mapRef.current.fitBounds(bounds, {
              padding: [50, 50], // Add padding around the route
              maxZoom: 12 // Prevent zooming too close
            })
          } catch (error) {
            console.log('Auto-zoom failed:', error)
          }
        }, 500)
      }
    }
  }, [routes, origin, destination])

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (originContainerRef.current && !originContainerRef.current.contains(event.target as Node)) {
        setShowOriginSuggestions(false)
      }
      if (destinationContainerRef.current && !destinationContainerRef.current.contains(event.target as Node)) {
        setShowDestinationSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
        borderBottom: `1px solid ${isDark ? '#333' : '#eee'}`,
        position: 'sticky',
        top: 0,
        backgroundColor: isDark ? '#000' : '#fff',
        zIndex: 100
      }}>
        <Logo />
        <h1 style={{ 
          fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
          marginTop: 'var(--spacing-sm)',
          color: isDark ? '#fff' : '#000'
        }}>
          Smart Routes
        </h1>
        <p style={{
          color: isDark ? '#888' : '#666',
          fontSize: '0.9rem',
          margin: 'var(--spacing-xs) 0 0 0'
        }}>
          Powered by OpenStreetMap & TRINETRA Safety Data
        </p>
      </div>

      {/* Search Inputs */}
      <div style={{
        padding: 'var(--spacing-lg)',
        backgroundColor: isDark ? '#0a0a0a' : '#f9f9f9',
        borderBottom: `1px solid ${isDark ? '#333' : '#eee'}`
      }}>
        {/* Origin Input with Live Suggestions */}
        <div ref={originContainerRef} style={{ marginBottom: 'var(--spacing-md)', position: 'relative' }}>
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
              color: origin ? '#00ba7c' : (isDark ? '#666' : '#999'),
              zIndex: 2
            }} />
            <input
              type="text"
              value={originInput}
              onChange={(e) => handleOriginChange(e.target.value)}
              onFocus={() => setShowOriginSuggestions(originSuggestions.length > 0)}
              placeholder="Search for starting location..."
              style={{
                width: '100%',
                padding: 'var(--spacing-md) 3rem var(--spacing-md) 2.5rem',
                border: `2px solid ${origin ? '#00ba7c' : (isDark ? '#333' : '#e1e8ed')}`,
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
                opacity: isLocationLoading ? 0.6 : 1,
                zIndex: 2
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

            {/* Origin Suggestions Dropdown */}
            {showOriginSuggestions && originSuggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: isDark ? '#111' : '#fff',
                border: `1px solid ${isDark ? '#333' : '#ccc'}`,
                borderRadius: 'var(--radius-md)',
                maxHeight: '300px',
                overflowY: 'auto',
                zIndex: 1000,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
              }}>
                <div style={{
                  padding: 'var(--spacing-sm)',
                  borderBottom: `1px solid ${isDark ? '#333' : '#eee'}`,
                  fontSize: '0.8rem',
                  color: isDark ? '#888' : '#666',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-xs)'
                }}>
                  <Search size={12} />
                  {isGeocodingOrigin ? 'Searching...' : `${originSuggestions.length} suggestions`}
                </div>
                {originSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.place_id}
                    onClick={() => selectOrigin(suggestion)}
                    style={{
                      padding: 'var(--spacing-md)',
                      cursor: 'pointer',
                      borderBottom: `1px solid ${isDark ? '#333' : '#eee'}`,
                      color: isDark ? '#fff' : '#000',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-sm)',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isDark ? '#222' : '#f5f5f5'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <Target size={16} style={{ color: '#1d9bf0', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                        {suggestion.display_name.split(',')[0]}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: isDark ? '#888' : '#666' }}>
                        {suggestion.display_name.split(',').slice(1, 3).join(', ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Destination Input with Live Suggestions */}
        <div ref={destinationContainerRef} style={{ marginBottom: 'var(--spacing-md)', position: 'relative' }}>
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
              color: destination ? '#f4212e' : (isDark ? '#666' : '#999'),
              zIndex: 2
            }} />
            <input
              type="text"
              value={destinationInput}
              onChange={(e) => handleDestinationChange(e.target.value)}
              onFocus={() => setShowDestinationSuggestions(destinationSuggestions.length > 0)}
              placeholder="Search for destination..."
              style={{
                width: '100%',
                padding: 'var(--spacing-md) 2.5rem',
                border: `2px solid ${destination ? '#f4212e' : (isDark ? '#333' : '#e1e8ed')}`,
                borderRadius: 'var(--radius-md)',
                fontSize: '1rem',
                backgroundColor: isDark ? '#111' : '#fff',
                color: isDark ? '#fff' : '#000'
              }}
            />
            {isGeocodingDestination && (
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

            {/* Destination Suggestions Dropdown */}
            {showDestinationSuggestions && destinationSuggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: isDark ? '#111' : '#fff',
                border: `1px solid ${isDark ? '#333' : '#ccc'}`,
                borderRadius: 'var(--radius-md)',
                maxHeight: '300px',
                overflowY: 'auto',
                zIndex: 1000,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
              }}>
                <div style={{
                  padding: 'var(--spacing-sm)',
                  borderBottom: `1px solid ${isDark ? '#333' : '#eee'}`,
                  fontSize: '0.8rem',
                  color: isDark ? '#888' : '#666',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-xs)'
                }}>
                  <Search size={12} />
                  {isGeocodingDestination ? 'Searching...' : `${destinationSuggestions.length} suggestions`}
                </div>
                {destinationSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.place_id}
                    onClick={() => selectDestination(suggestion)}
                    style={{
                      padding: 'var(--spacing-md)',
                      cursor: 'pointer',
                      borderBottom: `1px solid ${isDark ? '#333' : '#eee'}`,
                      color: isDark ? '#fff' : '#000',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-sm)',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isDark ? '#222' : '#f5f5f5'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <Target size={16} style={{ color: '#f4212e', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                        {suggestion.display_name.split(',')[0]}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: isDark ? '#888' : '#666' }}>
                        {suggestion.display_name.split(',').slice(1, 3).join(', ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Auto-calculation status */}
        {origin && destination && !routes && !isLoading && (
          <div style={{
            padding: 'var(--spacing-sm)',
            backgroundColor: isDark ? '#111' : '#e8f4f8',
            borderRadius: 'var(--radius-sm)',
            color: isDark ? '#1d9bf0' : '#0066cc',
            fontSize: '0.9rem',
            textAlign: 'center',
            marginBottom: 'var(--spacing-sm)'
          }}>
            📍 Calculating routes automatically...
          </div>
        )}
      </div>

      {/* Enhanced Interactive Map Display with Traffic View */}
      {origin && destination && (
        <div style={{ padding: 'var(--spacing-lg)' }}>
          <div style={{ 
            height: '400px',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            border: `2px solid ${isDark ? '#333' : '#eee'}`
          }}>
            <MapContainer
              ref={mapRef}
              center={[
                (origin.lat + destination.lat) / 2,
                (origin.lng + destination.lng) / 2
              ]}
              zoom={8}
              style={{ height: '100%', width: '100%' }}
              whenCreated={(mapInstance) => {
                mapRef.current = mapInstance
              }}
            >
              {/* Traffic-oriented tile layer instead of satellite */}
              <TileLayer
                url={isDark 
                  ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
                  : "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
                }
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                maxZoom={18}
              />
              
              {/* Origin Marker */}
              <Marker 
                position={[origin.lat, origin.lng]}
              />
              
              {/* Destination Marker */}
              <Marker 
                position={[destination.lat, destination.lng]}
              />
              
              {/* Enhanced Route Polyline */}
              {routes && routes[selectedRoute] && routes[selectedRoute].path_points && (
                <Polyline
                  positions={routes[selectedRoute].path_points}
                  pathOptions={{
                    color: routeOptions.find(r => r.id === selectedRoute)?.color || '#1d9bf0',
                    weight: 6,
                    opacity: 0.9,
                    lineCap: 'round',
                    lineJoin: 'round'
                  }}
                />
              )}
            </MapContainer>
          </div>
          
          {/* Enhanced Map Controls */}
          <div style={{
            marginTop: 'var(--spacing-sm)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8rem',
            color: isDark ? '#888' : '#666'
          }}>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <span>🗺️ Traffic View</span>
              <span>•</span>
              <span>📍 Route Optimized</span>
            </div>
            <div style={{
              padding: 'var(--spacing-xs) var(--spacing-sm)',
              backgroundColor: isDark ? '#111' : '#f0f0f0',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.7rem'
            }}>
              Auto-zoomed to route
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Responsive Route Options */}
      {routes && (
        <div style={{
          padding: 'var(--spacing-lg)',
          borderTop: `1px solid ${isDark ? '#333' : '#eee'}`
        }}>
          <h3 style={{
            color: isDark ? '#fff' : '#000',
            marginBottom: 'var(--spacing-md)'
          }}>
            Route Options
          </h3>
          
          {/* Responsive Horizontal Scroll Container */}
          <div style={{
            display: 'flex',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            gap: 'var(--spacing-md)',
            paddingBottom: 'var(--spacing-sm)',
            scrollbarWidth: 'thin',
            scrollbarColor: isDark ? '#444 transparent' : '#ccc transparent'
          }}>
            {routeOptions.map((option) => {
              const IconComponent = option.icon
              const isSelected = selectedRoute === option.id
              const route = routes[option.id]
              
              return (
                <motion.button
                  key={option.id}
                  onClick={() => setSelectedRoute(option.id as any)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    flex: '0 0 auto', // Don't shrink, don't grow, auto width
                    minWidth: '160px', // Minimum width for content
                    maxWidth: '180px', // Maximum width to prevent over-stretching
                    padding: 'var(--spacing-lg)',
                    backgroundColor: isSelected ? `${option.color}20` : 'transparent',
                    border: `2px solid ${isSelected ? option.color : (isDark ? '#333' : '#e1e8ed')}`,
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 'var(--spacing-sm)',
                    cursor: 'pointer',
                    color: isSelected ? option.color : (isDark ? '#fff' : '#000'),
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <IconComponent size={24} />
                  <span style={{ 
                    fontWeight: '600', 
                    fontSize: '1rem',
                    textAlign: 'center' 
                  }}>
                    {option.name}
                  </span>
                  
                  {route && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 'var(--spacing-xs)',
                      width: '100%'
                    }}>
                      <div style={{
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        color: isSelected ? option.color : (isDark ? '#ccc' : '#555')
                      }}>
                        {route.duration}
                      </div>
                      <div style={{
                        fontSize: '0.8rem',
                        color: isSelected ? option.color : (isDark ? '#ccc' : '#555')
                      }}>
                        {route.distance}
                      </div>
                      <div style={{
                        fontSize: '0.8rem',
                        color: '#00ba7c',
                        fontWeight: '500'
                      }}>
                        {route.estimated_fuel_cost}
                      </div>
                      
                      {route.incidents_on_route !== undefined && (
                        <div style={{
                          fontSize: '0.7rem',
                          color: route.incidents_on_route > 0 ? '#f4212e' : '#00ba7c',
                          backgroundColor: route.incidents_on_route > 0 ? '#f4212e20' : '#00ba7c20',
                          padding: 'var(--spacing-xs)',
                          borderRadius: 'var(--radius-xs)',
                          textAlign: 'center',
                          width: '100%'
                        }}>
                          {route.incidents_on_route} incidents
                        </div>
                      )}
                    </div>
                  )}
                </motion.button>
              )
            })}
          </div>
          
          {/* Scroll hint for mobile */}
          <div style={{
            textAlign: 'center',
            marginTop: 'var(--spacing-sm)',
            fontSize: '0.8rem',
            color: isDark ? '#666' : '#888'
          }}>
            ← Swipe to see all options →
          </div>
        </div>
      )}

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
            flexDirection: 'column',
            gap: 'var(--spacing-md)',
            color: isDark ? '#888' : '#666'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid transparent',
              borderTop: '4px solid #1d9bf0',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <div>Analyzing routes and safety data...</div>
          </div>
        )}

        {currentRoute && (
          <div style={{
            backgroundColor: isDark ? '#111' : '#f7f9fa',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-xl)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--spacing-lg)'
            }}>
              <h3 style={{
                color: isDark ? '#fff' : '#000',
                margin: 0,
                textTransform: 'capitalize'
              }}>
                {selectedRoute} Route Details
              </h3>
              {currentRoute.safety_score && (
                <div style={{
                  padding: 'var(--spacing-xs) var(--spacing-sm)',
                  backgroundColor: routeOptions.find(r => r.id === selectedRoute)?.color + '20',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  color: routeOptions.find(r => r.id === selectedRoute)?.color
                }}>
                  Safety: {currentRoute.safety_score}
                </div>
              )}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: 'var(--spacing-lg)',
              marginBottom: 'var(--spacing-lg)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <Clock size={20} style={{ color: routeOptions.find(r => r.id === selectedRoute)?.color }} />
                <div>
                  <div style={{ fontWeight: 'bold', color: isDark ? '#fff' : '#000' }}>
                    {currentRoute.duration}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: isDark ? '#888' : '#666' }}>Duration</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <MapPin size={20} style={{ color: routeOptions.find(r => r.id === selectedRoute)?.color }} />
                <div>
                  <div style={{ fontWeight: 'bold', color: isDark ? '#fff' : '#000' }}>
                    {currentRoute.distance}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: isDark ? '#888' : '#666' }}>Distance</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <DollarSign size={20} style={{ color: '#00ba7c' }} />
                <div>
                  <div style={{ fontWeight: 'bold', color: isDark ? '#fff' : '#000' }}>
                    {currentRoute.estimated_fuel_cost}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: isDark ? '#888' : '#666' }}>Est. Cost</div>
                </div>
              </div>

              {currentRoute.incidents_on_route !== undefined && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  <AlertTriangle size={20} style={{ color: currentRoute.incidents_on_route > 0 ? '#f4212e' : '#00ba7c' }} />
                  <div>
                    <div style={{ fontWeight: 'bold', color: isDark ? '#fff' : '#000' }}>
                      {currentRoute.incidents_on_route}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: isDark ? '#888' : '#666' }}>Incidents</div>
                  </div>
                </div>
              )}
            </div>

            {/* Route Features */}
            {currentRoute.route_features && (
              <div style={{
                backgroundColor: isDark ? '#0a0a0a' : '#fff',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-lg)',
                marginBottom: 'var(--spacing-lg)'
              }}>
                <h4 style={{ color: isDark ? '#fff' : '#000', marginBottom: 'var(--spacing-sm)' }}>
                  Route Features:
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
          </div>
        )}

        {!routes && !isLoading && !error && (origin || destination) && (
          <div style={{
            textAlign: 'center',
            padding: 'var(--spacing-xl)',
            color: isDark ? '#888' : '#666'
          }}>
            <Route size={48} style={{ marginBottom: 'var(--spacing-md)' }} />
            <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>
              {!origin && !destination ? 'Ready to Navigate' : 
               !destination ? 'Add Destination' : 'Add Origin'}
            </h3>
            <p>
              {!origin && !destination ? 'Search for origin and destination to get smart route suggestions' :
               !destination ? 'Search for your destination to calculate routes' :
               'Search for your starting location to calculate routes'}
            </p>
          </div>
        )}

        {!routes && !isLoading && !error && !origin && !destination && (
          <div style={{
            textAlign: 'center',
            padding: 'var(--spacing-xl)',
            color: isDark ? '#888' : '#666'
          }}>
            <MapPin size={48} style={{ marginBottom: 'var(--spacing-md)' }} />
            <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Ready to Navigate</h3>
            <p>Type in the search boxes to get live location suggestions with traffic-optimized routing!</p>
          </div>
        )}
      </div>

      <BottomNavigation current="maps" onNavigate={onNavigate} />
    </div>
  )
}

export default Map
