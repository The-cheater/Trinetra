// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
}

// User Types
export interface User {
  userId: string
  name: string
  email: string
  location?: {
    type: string
    coordinates: [number, number] // [lng, lat]
  }
  city?: string
  state?: string
  country?: string
  locationUpdatedAt?: string
  reports_submitted: number
  reports_verified: number
  reports_rejected: number
  avg_credibility_score: number
  createdAt: string
}

export interface AuthTokens {
  token: string
  user: User
}

// Post/Incident Types
export interface Post {
  _id: string
  userId: string
  category: IncidentCategory
  description: string
  location: {
    type: 'Point'
    coordinates: [number, number] // [lng, lat]
  }
  locationName: string
  severity: IncidentSeverity
  photo_url?: string
  confidence_score: number
  status: IncidentStatus
  verification_reason?: string
  evidence: any[]
  author?: string
  author_city?: string
  distance_km?: number
  createdAt: string
  expiresAt: string
}

export type IncidentCategory = 'Traffic' | 'Road Work' | 'Accident' | 'Flood' | 'Public Event' | 'Hazard' | 'Other'
export type IncidentSeverity = 'Low' | 'Medium' | 'High'
export type IncidentStatus = 'verified' | 'unverified' | 'rejected'

// Comment Types
export interface Comment {
  _id: string
  postId: string
  userId: string
  body: string
  parentCommentId?: string
  author?: {
    name: string
    userId: string
  }
  createdAt: string
  expiresAt: string
}

// Route Types
export interface RouteCoordinates {
  lat: number
  lng: number
}

export interface RouteInfo {
  type: 'fastest' | 'eco' | 'safest'
  duration: string
  duration_minutes?: number
  distance: string
  distance_km?: number
  start_address?: string
  end_address?: string
  estimated_fuel_cost?: string
  route_features?: string[]
  safety_features?: string[]
  eco_features?: string[]
  environmental_impact?: {
    co2_reduction?: string
    fuel_savings?: string
    route_type?: string
  }
  safety_benefits?: {
    accident_risk?: string
    speed_limits?: string
    road_type?: string
  }
  polyline?: string
  fallback?: boolean
  error?: string
}

export interface RouteResponse {
  fastest: RouteInfo
  eco: RouteInfo
  safest: RouteInfo
  origin: RouteCoordinates
  destination: RouteCoordinates
}

// Profile Types
export interface UserProfile {
  user: User & {
    stats: {
      reports_submitted: number
      reports_verified: number
      reports_rejected: number
      avg_credibility_score: number
      reputation_level: {
        level: string
        badge: string
      }
    }
  }
  recentPosts: Post[]
  analytics: {
    postsByStatus: Array<{
      _id: IncidentStatus
      count: number
      avgConfidence: number
    }>
    postsByCategory: Array<{
      _id: IncidentCategory
      count: number
      avgConfidence: number
    }>
    totalContributions: number
    successRate: number
  }
}

// Location Types
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

export interface NearbyPlace {
  name: string
  address: string
  rating?: number
  reviews?: number
  type?: string
  position?: {
    lat: number
    lng: number
  }
  price_level?: string
  open_now?: string
}

// Form Types
export interface ContributeFormData {
  category: IncidentCategory
  severity: IncidentSeverity
  description: string
  location: string // JSON string of coordinates
  locationName: string
  photo?: File
}

export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface ProfileFormData {
  name: string
  email: string
  phone?: string
  location?: string
  bio?: string
  avatar?: File
}

// Pagination Types
export interface PaginationInfo {
  current: number
  total: number
  count: number
  totalPosts: number
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: PaginationInfo
}

// Filter Types
export interface ThreadFilters {
  category?: IncidentCategory | 'All'
  severity?: IncidentSeverity | 'All'
  status?: IncidentStatus | 'All'
  location_based?: boolean
  city?: string
  radius_km?: number
}

// Leaderboard Types
export interface LeaderboardEntry {
  rank: number
  name: string
  userId: string
  verified_reports: number
  avg_credibility: number
  reputation: {
    level: string
    badge: string
  }
  recent_contributions: number
}

// Confidence Analysis Types
export interface ConfidenceBreakdown {
  exif_analysis?: number
  vision_analysis?: number
  text_analysis: number
  location_validation: number
  user_reputation: number
  total: number
  error?: string
}

export interface ConfidenceEvidence {
  source: string
  [key: string]: any
}

// Error Types
export interface ApiError {
  message: string
  code?: string | number
  details?: any
}

// Utility Types
export type Page = 'home' | 'maps' | 'contribute' | 'profile' | 'edit-profile' | 'privacy-settings'

export interface NavigationItem {
  id: string
  icon: any
  label: string
  page: Page
}

// Theme Types
export type Theme = 'light' | 'dark'

export interface ThemeColors {
  background: {
    primary: string
    secondary: string
    tertiary: string
  }
  text: {
    primary: string
    secondary: string
    tertiary: string
  }
  border: {
    primary: string
    secondary: string
  }
  accent: {
    blue: string
    green: string
    red: string
    yellow: string
  }
}

// Component Prop Types
export interface BaseComponentProps {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export interface NavigationProps {
  current: Page
  onNavigate?: (page: Page) => void
}

// Hook Return Types
export interface UseLocationReturn {
  location: LocationInfo | null
  isLoading: boolean
  error: string | null
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown'
  requestLocation: () => Promise<void>
  getCurrentLocation: () => Promise<LocationCoords | null>
  updateUserLocation: (coords: LocationCoords) => Promise<boolean>
  getNearbyPlaces: (query?: string) => Promise<NearbyPlace[]>
  hasLocation: boolean
  isLocationGranted: boolean
  isLocationDenied: boolean
}

export interface UseAuthReturn {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  refreshUser: () => Promise<void>
}

// Environment Variables
export interface EnvironmentConfig {
  API_URL: string
  BACKEND_URL: string
  APP_NAME: string
  APP_VERSION: string
  SERPAPI_KEY: string
  GOOGLE_MAPS_API_KEY: string
  NODE_ENV: 'development' | 'production' | 'test'
  ENABLE_LOCATION_SERVICES: boolean
  ENABLE_PHOTO_UPLOAD: boolean
  ENABLE_PUSH_NOTIFICATIONS: boolean
  DEBUG_MODE: boolean
}

// Export convenience type aliases
export type Thread = Post
export type Incident = Post
export type ThreadsResponse = ApiResponse<{ 
  posts: Post[]
  user_location: LocationInfo | null
  filters_applied: ThreadFilters
  pagination: PaginationInfo
}>
