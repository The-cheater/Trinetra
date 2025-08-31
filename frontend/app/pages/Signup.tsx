'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react'
import Logo from '../components/Logo'
import { useTheme } from '../contexts/ThemeContext'

interface SignupProps {
  onSignup: () => void
  onNavigateToLogin: () => void
}

const Signup = ({ onSignup, onNavigateToLogin }: SignupProps) => {
  const { isDark } = useTheme()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Store JWT token
        localStorage.setItem('access_token', data.data.accessToken)
        localStorage.setItem('user_id', data.data.user.userId)
        localStorage.setItem('user_name', data.data.user.name)
        
        alert('Account created successfully!')
        onSignup()
      } else {
        setError(data.message || 'Registration failed')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-container" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: isDark ? '#000' : '#fff'
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
          Join Community Safety
        </h1>
        <p style={{ 
          color: isDark ? '#888' : '#666',
          marginTop: 'var(--spacing-sm)'
        }}>
          Create your account to start contributing
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
              marginBottom: 'var(--spacing-lg)'
            }}>
              {error}
            </div>
          )}

          {/* Name */}
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
                name="name"
                value={formData.name}
                onChange={handleChange}
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
                placeholder="Enter your full name"
              />
            </div>
          </div>

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
                style={{
                  width: '100%',
                  padding: 'var(--spacing-md) var(--spacing-md) var(--spacing-md) 2.5rem',
                  border: `2px solid ${isDark ? '#333' : '#e1e8ed'}`,
                  borderRadius: 'var(--radius-md)',
                  fontSize: '1rem',
                  backgroundColor: isDark ? '#111' : '#fff',
                  color: isDark ? '#fff' : '#000'
                }}
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
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
                minLength={6}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-md) 3rem var(--spacing-md) 2.5rem',
                  border: `2px solid ${isDark ? '#333' : '#e1e8ed'}`,
                  borderRadius: 'var(--radius-md)',
                  fontSize: '1rem',
                  backgroundColor: isDark ? '#111' : '#fff',
                  color: isDark ? '#fff' : '#000'
                }}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 'var(--spacing-md)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: isDark ? '#666' : '#999'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: 'var(--spacing-xl)' }}>
            <label style={{ 
              display: 'block',
              marginBottom: 'var(--spacing-sm)',
              fontWeight: '600',
              color: isDark ? '#fff' : '#000'
            }}>
              Confirm Password
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
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: 'var(--spacing-md) 3rem var(--spacing-md) 2.5rem',
                  border: `2px solid ${isDark ? '#333' : '#e1e8ed'}`,
                  borderRadius: 'var(--radius-md)',
                  fontSize: '1rem',
                  backgroundColor: isDark ? '#111' : '#fff',
                  color: isDark ? '#fff' : '#000'
                }}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: 'var(--spacing-md)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: isDark ? '#666' : '#999'
                }}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
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
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </motion.button>
        </form>

        {/* Login Link */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: 'var(--spacing-xl)',
          color: isDark ? '#888' : '#666'
        }}>
          Already have an account?{' '}
          <button
            onClick={onNavigateToLogin}
            style={{
              background: 'none',
              border: 'none',
              color: '#1d9bf0',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  )
}

export default Signup
