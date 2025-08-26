'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Shield, Award, Clock, MapPin, Settings, LogOut, TrendingUp, CheckCircle, AlertCircle, Sun, Moon, Edit } from 'lucide-react'
import BottomNavigation from '../components/BottomNavigation'
import Logo from '../components/Logo'
import { useTheme } from '../contexts/ThemeContext'

type Page = 'home' | 'maps' | 'contribute' | 'profile' | 'edit-profile' | 'privacy-settings'

interface ProfileProps {
  onSignOut: () => void
  onNavigate: (page: Page) => void
}

const Profile = ({ onSignOut, onNavigate }: ProfileProps) => {
  const { isDark, toggleTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('stats')
  const [profileData, setProfileData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      setError('Please login first')
      return
    }

    try {
      const response = await fetch('http://localhost:8080/api/profile/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setProfileData(data.data)
      } else {
        setError(data.message || 'Failed to load profile')
      }
    } catch (error) {
      setError('Network error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_id')
    localStorage.removeItem('user_name')
    onSignOut()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return '#00ba7c'
      case 'unverified': return '#ffd400'
      case 'rejected': return '#f4212e'
      default: return '#1d9bf0'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return CheckCircle
      case 'unverified': return Clock
      case 'rejected': return AlertCircle
      default: return MapPin
    }
  }

  const getReputationBadge = (score: number) => {
    if (score >= 85) return { level: 'Expert', badge: '🏆', color: '#ffd700' }
    if (score >= 75) return { level: 'Trusted', badge: '⭐', color: '#00ba7c' }
    if (score >= 65) return { level: 'Contributor', badge: '📝', color: '#1d9bf0' }
    return { level: 'Reporter', badge: '👋', color: '#666' }
  }

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: isDark ? '#000' : '#fff'
      }}>
        <div style={{ color: isDark ? '#fff' : '#000' }}>Loading profile...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: isDark ? '#000' : '#fff'
      }}>
        <div style={{ color: '#f4212e' }}>{error}</div>
      </div>
    )
  }

  const reputation = getReputationBadge(profileData?.user?.stats?.avg_credibility_score || 0)

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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <Logo />
          <h1 style={{ 
            fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
            marginTop: 'var(--spacing-sm)',
            color: isDark ? '#fff' : '#000'
          }}>
            Profile
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          <button
            onClick={toggleTheme}
            style={{
              background: 'none',
              border: `1px solid ${isDark ? '#333' : '#ccc'}`,
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--spacing-sm)',
              color: isDark ? '#fff' : '#000',
              cursor: 'pointer'
            }}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={() => onNavigate('edit-profile')}
            style={{
              background: 'none',
              border: `1px solid ${isDark ? '#333' : '#ccc'}`,
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--spacing-sm)',
              color: isDark ? '#fff' : '#000',
              cursor: 'pointer'
            }}
          >
            <Edit size={20} />
          </button>
        </div>
      </div>

      {/* Profile Info */}
      <div style={{ padding: 'var(--spacing-lg)' }}>
        {/* User Card */}
        <div style={{
          backgroundColor: isDark ? '#111' : '#f7f9fa',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-xl)',
          marginBottom: 'var(--spacing-lg)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#1d9bf0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '2rem',
              fontWeight: 'bold'
            }}>
              {profileData?.user?.name?.charAt(0) || 'U'}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ 
                color: isDark ? '#fff' : '#000',
                marginBottom: 'var(--spacing-xs)'
              }}>
                {profileData?.user?.name || 'Unknown User'}
              </h2>
              <p style={{ 
                color: isDark ? '#888' : '#666',
                marginBottom: 'var(--spacing-sm)'
              }}>
                @{profileData?.user?.userId || 'user'} • Community Safety Contributor
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm)',
                color: reputation.color
              }}>
                <span>{reputation.badge}</span>
                <span style={{ fontWeight: '600' }}>{reputation.level}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-lg)'
        }}>
          <div style={{
            backgroundColor: isDark ? '#111' : '#f7f9fa',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--spacing-lg)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#1d9bf0',
              marginBottom: 'var(--spacing-xs)'
            }}>
              {profileData?.user?.stats?.reports_submitted || 0}
            </div>
            <div style={{ color: isDark ? '#888' : '#666' }}>Total Reports</div>
          </div>
          
          <div style={{
            backgroundColor: isDark ? '#111' : '#f7f9fa',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--spacing-lg)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#00ba7c',
              marginBottom: 'var(--spacing-xs)'
            }}>
              {profileData?.user?.stats?.reports_verified || 0}
            </div>
            <div style={{ color: isDark ? '#888' : '#666' }}>Verified</div>
          </div>

          <div style={{
            backgroundColor: isDark ? '#111' : '#f7f9fa',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--spacing-lg)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#ffd400',
              marginBottom: 'var(--spacing-xs)'
            }}>
              {profileData?.user?.stats?.avg_credibility_score || 0}%
            </div>
            <div style={{ color: isDark ? '#888' : '#666' }}>Accuracy Rate</div>
          </div>

          <div style={{
            backgroundColor: isDark ? '#111' : '#f7f9fa',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--spacing-lg)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: reputation.color,
              marginBottom: 'var(--spacing-xs)'
            }}>
              {reputation.badge}
            </div>
            <div style={{ color: isDark ? '#888' : '#666' }}>Rank</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          backgroundColor: isDark ? '#111' : '#f7f9fa',
          borderRadius: 'var(--radius-sm)',
          padding: 'var(--spacing-xs)',
          marginBottom: 'var(--spacing-lg)'
        }}>
          {['stats', 'recent'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: 'var(--spacing-sm)',
                border: 'none',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: activeTab === tab ? '#1d9bf0' : 'transparent',
                color: activeTab === tab ? '#fff' : (isDark ? '#888' : '#666'),
                fontWeight: '600',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {tab === 'stats' ? 'Statistics' : 'Recent Activity'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'stats' && (
          <div style={{
            backgroundColor: isDark ? '#111' : '#f7f9fa',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--spacing-lg)'
          }}>
            <h3 style={{ 
              color: isDark ? '#fff' : '#000',
              marginBottom: 'var(--spacing-md)'
            }}>
              Performance Analytics
            </h3>
            <div style={{ color: isDark ? '#888' : '#666' }}>
              <p>Success Rate: {profileData?.analytics?.successRate || 0}%</p>
              <p>Total Contributions: {profileData?.analytics?.totalContributions || 0}</p>
              <p>Community Impact: High</p>
            </div>
          </div>
        )}

        {activeTab === 'recent' && (
          <div>
            {profileData?.recentPosts?.length > 0 ? (
              profileData.recentPosts.map((report: any, index: number) => {
                const StatusIcon = getStatusIcon(report.status)
                return (
                  <div
                    key={report._id || index}
                    style={{
                      backgroundColor: isDark ? '#111' : '#f7f9fa',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--spacing-lg)',
                      marginBottom: 'var(--spacing-md)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 'var(--spacing-md)'
                    }}
                  >
                    <StatusIcon 
                      size={20} 
                      style={{ color: getStatusColor(report.status), marginTop: '2px' }} 
                    />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        color: isDark ? '#fff' : '#000',
                        marginBottom: 'var(--spacing-xs)'
                      }}>
                        {report.category} - {report.description?.substring(0, 50)}...
                      </h4>
                      <p style={{ 
                        color: isDark ? '#888' : '#666',
                        fontSize: '0.9rem'
                      }}>
                        {report.locationName} • {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                      <div style={{
                        marginTop: 'var(--spacing-xs)',
                        padding: '2px 8px',
                        backgroundColor: getStatusColor(report.status),
                        color: '#fff',
                        borderRadius: 'var(--radius-xs)',
                        fontSize: '0.8rem',
                        display: 'inline-block',
                        textTransform: 'capitalize'
                      }}>
                        {report.status}
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div style={{
                backgroundColor: isDark ? '#111' : '#f7f9fa',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-xl)',
                textAlign: 'center',
                color: isDark ? '#888' : '#666'
              }}>
                No recent activity
              </div>
            )}
          </div>
        )}

        {/* Settings */}
        <div style={{ marginTop: 'var(--spacing-xl)' }}>
          <motion.button
            onClick={handleSignOut}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%',
              padding: 'var(--spacing-lg)',
              backgroundColor: '#f4212e',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--spacing-sm)'
            }}
          >
            <LogOut size={20} />
            Sign Out
          </motion.button>
        </div>
      </div>

      <BottomNavigation current="profile" onNavigate={onNavigate} />
    </div>
  )
}

export default Profile
