'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import Logo from '../components/Logo'
import { useTheme } from '../contexts/ThemeContext'

interface LoginProps {
  onLogin: () => void
  onNavigateToSignup: () => void
}

const Login = ({ onLogin, onNavigateToSignup }: LoginProps) => {
  const { isDark } = useTheme()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)

  // Handle cooldown timer
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [cooldown])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('') // Clear error on input change
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check cooldown
    if (cooldown > 0) {
      setError(`Please wait ${cooldown} seconds before trying again`)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Use proxy endpoint (handled by next.config.js)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Store JWT token and user info
        localStorage.setItem('auth_token', data.data.token)
        localStorage.setItem('user_id', data.data.user.userId)
        localStorage.setItem('user_name', data.data.user.name)
        
        console.log('Login successful!')
        onLogin()
      } else {
        setError(data.message || 'Login failed')
        
        // Handle rate limiting
        if (response.status === 429) {
          setCooldown(60) // 1 minute cooldown
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Network error. Please check your connection.')
    } finally {
      setIsLoading(false)
    }
  }

  const clearStorageAndRetry = () => {
    localStorage.clear()
    sessionStorage.clear()
    setCooldown(0)
    setError('')
  }

  return (
    <div className="auth-container" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: isDark ? '#000' : '#fff',
      color: isDark ? '#fff' : '#000'
    }}>
      {/* Header */}
      <div style={{
        padding: 'var(--spacing-lg)',
        borderBottom: `1px solid ${isDark ? '#333' : '#eee'}`
      }}>
        <Logo />
        <h1 style={{ 
          fontSize: 'clamp(1.5rem, 5vw, 2rem)',
          marginTop: 'var(--spacing-lg)',
          color: isDark ? '#fff' : '#000'
        }}>
          Welcome Back
        </h1>
        <p style={{ 
          color: isDark ? '#888' : '#666',
          marginTop: 'var(--spacing-sm)'
        }}>
          Sign in to your Community Safety account
        </p>
      </div>

      {/* Form */}
      <div style={{ padding: 'var(--spacing-lg)', flex: 1 }}>
        <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
          {error && (
            <div style={{
              padding: 'var(--spacing-md)',
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              borderRadius: 'var(--radius-sm)',
              color: '#c33',
              marginBottom: 'var(--spacing-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>{error}</span>
              {cooldown > 0 && (
                <button
                  type="button"
                  onClick={clearStorageAndRetry}
                  style={{
                    backgroundColor: '#1d9bf0',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 'var(--radius-xs)',
                    padding: 'var(--spacing-xs) var(--spacing-sm)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    marginLeft: 'var(--spacing-sm)'
                  }}
                >
                  Clear & Retry
                </button>
              )}
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <label style={{ 
              display: 'block',
              marginBottom: 'var(--spacing-sm)',
              fontWeight: '600',
              color: isDark ? '#fff' : '#000'
            }}>
              Email
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
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={cooldown > 0}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-md) var(--spacing-md) var(--spacing-md) 2.5rem',
                  border: `2px solid ${isDark ? '#333' : '#e1e8ed'}`,
                  borderRadius: 'var(--radius-md)',
                  fontSize: '1rem',
                  backgroundColor: isDark ? '#111' : '#fff',
                  color: isDark ? '#fff' : '#000',
                  opacity: cooldown > 0 ? 0.6 : 1
                }}
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 'var(--spacing-xl)' }}>
            <label style={{ 
              display: 'block',
              marginBottom: 'var(--spacing-sm)',
              fontWeight: '600',
              color: isDark ? '#fff' : '#000'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={20} style={{
                position: 'absolute',
                left: 'var(--spacing-md)',
                top: '50%',
                transform: 'translateY(-50%)',
                color: isDark ? '#666' : '#999'
              }} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={cooldown > 0}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-md) 3rem var(--spacing-md) 2.5rem',
                  border: `2px solid ${isDark ? '#333' : '#e1e8ed'}`,
                  borderRadius: 'var(--radius-md)',
                  fontSize: '1rem',
                  backgroundColor: isDark ? '#111' : '#fff',
                  color: isDark ? '#fff' : '#000',
                  opacity: cooldown > 0 ? 0.6 : 1
                }}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={cooldown > 0}
                style={{
                  position: 'absolute',
                  right: 'var(--spacing-md)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
                  color: isDark ? '#666' : '#999',
                  opacity: cooldown > 0 ? 0.6 : 1
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading || cooldown > 0}
            whileHover={{ scale: isLoading || cooldown > 0 ? 1 : 1.02 }}
            whileTap={{ scale: isLoading || cooldown > 0 ? 1 : 0.98 }}
            style={{
              width: '100%',
              padding: 'var(--spacing-md)',
              backgroundColor: cooldown > 0 ? '#666' : '#1d9bf0',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: (isLoading || cooldown > 0) ? 'not-allowed' : 'pointer',
              opacity: (isLoading || cooldown > 0) ? 0.6 : 1
            }}
          >
            {cooldown > 0 
              ? `Wait ${cooldown}s` 
              : isLoading 
                ? 'Signing In...' 
                : 'Sign In'
            }
          </motion.button>
        </form>

        {/* Sign Up Link */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: 'var(--spacing-xl)',
          color: isDark ? '#888' : '#666'
        }}>
          Don't have an account?{' '}
          <button
            onClick={onNavigateToSignup}
            style={{
              background: 'none',
              border: 'none',
              color: '#1d9bf0',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
