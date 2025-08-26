import { useContext } from 'react'
import { useAuth as useAuthContext } from '../contexts/AuthContext'

// Re-export useAuth for convenience
export const useAuth = useAuthContext

// Additional auth-related hooks
export const useAuthRequired = () => {
  const auth = useAuthContext()
  
  if (!auth.isAuthenticated && !auth.isLoading) {
    throw new Error('Authentication required')
  }
  
  return auth
}

// Hook for handling auth redirects
export const useAuthRedirect = () => {
  const { isAuthenticated, isLoading } = useAuthContext()
  
  const requireAuth = (callback?: () => void) => {
    if (!isLoading && !isAuthenticated) {
      // In a real app, you'd redirect to login page
      alert('Please login to access this feature')
      return false
    }
    
    if (callback) callback()
    return true
  }
  
  const requireGuest = (callback?: () => void) => {
    if (!isLoading && isAuthenticated) {
      // User is already authenticated
      return false
    }
    
    if (callback) callback()
    return true
  }
  
  return {
    requireAuth,
    requireGuest,
    isLoading
  }
}

// Hook for auth form states
export const useAuthForm = () => {
  const { login, register } = useAuthContext()
  
  const handleLogin = async (formData: { email: string; password: string }) => {
    const result = await login(formData.email, formData.password)
    return result
  }
  
  const handleRegister = async (formData: { name: string; email: string; password: string }) => {
    const result = await register(formData.name, formData.email, formData.password)
    return result
  }
  
  return {
    handleLogin,
    handleRegister
  }
}

// Hook for checking specific permissions
export const usePermissions = () => {
  const { user, isAuthenticated } = useAuthContext()
  
  const hasPermission = (permission: string, resourceUserId?: string): boolean => {
    if (!isAuthenticated) return false
    
    switch (permission) {
      case 'create:post':
        return true
      case 'edit:post':
      case 'delete:post':
        return resourceUserId ? user?.userId === resourceUserId : false
      case 'comment:post':
        return true
      case 'edit:profile':
        return true
      default:
        return false
    }
  }
  
  const canCreatePost = () => hasPermission('create:post')
  const canEditPost = (postUserId: string) => hasPermission('edit:post', postUserId)
  const canDeletePost = (postUserId: string) => hasPermission('delete:post', postUserId)
  const canComment = () => hasPermission('comment:post')
  const canEditProfile = () => hasPermission('edit:profile')
  
  return {
    hasPermission,
    canCreatePost,
    canEditPost,
    canDeletePost,
    canComment,
    canEditProfile
  }
}
