import { useState, useEffect, useCallback } from 'react'
import { apiService } from '../lib/api'

export interface LocationCoords {
  lat: number
  lng: number
}

export interface LocationInfo {
  coordinates: LocationCoords
  city?: string
  state?: string
  country?: string
  formatted_address?: string
}

interface UseLocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
  autoUpdate?: boolean
}

export const useLocation = (options: UseLocationOptions = {}) => {
  const [location, setLocation] = useState<LocationInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown')

  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 300000, // 5 minutes
    autoUpdate = false
  } = options

  // Get current location from browser
  const getCurrentLocation = useCallback(async (): Promise<LocationCoords | null> => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy,
            timeout,
            maximumAge
          }
        )
      })

      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }

      setPermissionStatus('granted')
      return coords
    } catch (error: any) {
      let errorMessage = 'Unable to retrieve location'
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access denied by user'
          setPermissionStatus('denied')
          break
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information is unavailable'
          break
        case error.TIMEOUT:
          errorMessage = 'Location request timed out'
          break
      }

      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [enableHighAccuracy, timeout, maximumAge])

  // Update user location on backend
  const updateUserLocation = useCallback(async (coords: LocationCoords): Promise<boolean> => {
    try {
      if (!apiService.isAuthenticated()) {
        return false
      }

      const response = await apiService.put('/api/location/update', coords)
      
      if (response.success && response.data) {
        setLocation({
          coordinates: coords,
          city: response.data.location?.city,
          state: response.data.location?.state,
          country: response.data.location?.country,
          formatted_address: response.data.location?.formatted_address
        })
        return true
      }
      
      return false
    } catch (error) {
      console.error('Failed to update user location:', error)
      return false
    }
  }, [])

  // Get location and update backend
  const requestLocation = useCallback(async () => {
    const coords = await getCurrentLocation()
    
    if (coords) {
      const updated = await updateUserLocation(coords)
      
      if (!updated) {
        // Even if backend update fails, store location locally
        setLocation({
          coordinates: coords
        })
      }
    }
  }, [getCurrentLocation, updateUserLocation])

  // Watch position for continuous updates
  const watchPosition = useCallback(() => {
    if (!navigator.geolocation) return null

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        
        await updateUserLocation(coords)
      },
      (error) => {
        console.error('Location watch error:', error)
      },
      {
        enableHighAccuracy,
        maximumAge
      }
    )

    return watchId
  }, [updateUserLocation, enableHighAccuracy, maximumAge])

  // Get nearby places using backend
  const getNearbyPlaces = useCallback(async (query: string = 'restaurants') => {
    if (!location) {
      throw new Error('Location is required to find nearby places')
    }

    try {
      const response = await apiService.get(
        `/api/routes/nearby?lat=${location.coordinates.lat}&lng=${location.coordinates.lng}&query=${query}`
      )
      
      return response.data || []
    } catch (error) {
      console.error('Failed to get nearby places:', error)
      throw error
    }
  }, [location])

  // Check location permission status
  const checkLocationPermission = useCallback(async () => {
    if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' })
        setPermissionStatus(result.state as any)
        
        result.addEventListener('change', () => {
          setPermissionStatus(result.state as any)
        })
      } catch (error) {
        console.error('Error checking location permission:', error)
      }
    }
  }, [])

  // Initialize
  useEffect(() => {
    checkLocationPermission()
    
    if (autoUpdate) {
      requestLocation()
    }
  }, [autoUpdate, requestLocation, checkLocationPermission])

  // Watch position if auto-update is enabled
  useEffect(() => {
    let watchId: number | null = null
    
    if (autoUpdate && permissionStatus === 'granted') {
      watchId = watchPosition()
    }
    
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [autoUpdate, watchPosition, permissionStatus])

  return {
    // State
    location,
    isLoading,
    error,
    permissionStatus,
    
    // Actions
    requestLocation,
    getCurrentLocation,
    updateUserLocation,
    getNearbyPlaces,
    
    // Computed
    hasLocation: !!location,
    isLocationGranted: permissionStatus === 'granted',
    isLocationDenied: permissionStatus === 'denied'
  }
}

// Hook for distance calculations
export const useLocationUtils = () => {
  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = useCallback((
    coord1: LocationCoords,
    coord2: LocationCoords
  ): number => {
    const R = 6371 // Radius of the Earth in kilometers
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180
    const dLon = (coord2.lng - coord1.lng) * Math.PI / 180
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(coord1.lat * Math.PI / 180) *
      Math.cos(coord2.lat * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c // Distance in kilometers
  }, [])

  // Format distance for display
  const formatDistance = useCallback((distanceKm: number): string => {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`
    } else if (distanceKm < 10) {
      return `${distanceKm.toFixed(1)}km`
    } else {
      return `${Math.round(distanceKm)}km`
    }
  }, [])

  // Check if coordinates are within a certain radius
  const isWithinRadius = useCallback((
    center: LocationCoords,
    target: LocationCoords,
    radiusKm: number
  ): boolean => {
    const distance = calculateDistance(center, target)
    return distance <= radiusKm
  }, [calculateDistance])

  return {
    calculateDistance,
    formatDistance,
    isWithinRadius
  }
}

// Hook for location-based filtering
export const useLocationFilter = () => {
  const { location } = useLocation()
  const { isWithinRadius } = useLocationUtils()

  const filterByRadius = useCallback(<T extends { location?: { coordinates: [number, number] } }>(
    items: T[],
    radiusKm: number
  ): T[] => {
    if (!location) return items

    return items.filter(item => {
      if (!item.location?.coordinates) return false
      
      const itemCoords: LocationCoords = {
        lat: item.location.coordinates[1],
        lng: item.location.coordinates[0]
      }
      
      return isWithinRadius(location.coordinates, itemCoords, radiusKm)
    })
  }, [location, isWithinRadius])

  return {
    filterByRadius,
    userLocation: location,
    hasLocation: !!location
  }
}
