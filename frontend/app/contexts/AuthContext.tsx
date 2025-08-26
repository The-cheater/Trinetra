'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiService } from '../lib/api'

interface User {
  userId: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      if (apiService.isAuthenticated()) {
        // Get user info from localStorage first
        const currentUser = apiService.getCurrentUser()
        if (currentUser) {
          // Verify token is still valid by fetching user profile
          const response = await apiService.get('/api/profile/me')
          if (response.success && response.data) {
            setUser({
              userId: response.data.user.userId,
              name: response.data.user.name,
              email: response.data.user.email
            })
          } else {
            // Token is invalid, clear it
            apiService.removeAuthToken()
            setUser(null)
          }
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      // If auth check fails, clear invalid tokens
      apiService.removeAuthToken()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password)
      
      if (response.success && response.data) {
        setUser({
          userId: response.data.user.userId,
          name: response.data.user.name,
          email: response.data.user.email
        })
        
        return { success: true, message: 'Login successful!' }
      } else {
        return { success: false, message: response.message || 'Login failed' }
      }
    } catch (error: any) {
      console.error('Login error:', error)
      return { success: false, message: error.message || 'Network error' }
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await apiService.register(name, email, password)
      
      if (response.success && response.data) {
        setUser({
          userId: response.data.user.userId,
          name: response.data.user.name,
          email: response.data.user.email
        })
        
        return { success: true, message: 'Registration successful!' }
      } else {
        return { success: false, message: response.message || 'Registration failed' }
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      return { success: false, message: error.message || 'Network error' }
    }
  }

  const logout = () => {
    apiService.logout()
    setUser(null)
  }

  const refreshUser = async () => {
    if (!apiService.isAuthenticated()) return

    try {
      const response = await apiService.get('/api/profile/me')
      if (response.success && response.data) {
        setUser({
          userId: response.data.user.userId,
          name: response.data.user.name,
          email: response.data.user.email
        })
      }
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook for checking if user has specific permissions (extensible)
export const usePermissions = () => {
  const { user, isAuthenticated } = useAuth()
  
  return {
    canCreatePost: isAuthenticated,
    canEditPost: (postUserId: string) => isAuthenticated && user?.userId === postUserId,
    canDeletePost: (postUserId: string) => isAuthenticated && user?.userId === postUserId,
    canComment: isAuthenticated,
    canViewProfile: isAuthenticated,
    canEditProfile: isAuthenticated,
  }
}
