'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Bell, 
  Camera, 
  Mic, 
  MapPin, 
  ArrowLeft, 
  Shield, 
  FileText, 
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import BottomNavigation from '../components/BottomNavigation'
import Logo from '../components/Logo'
import { useTheme } from '../contexts/ThemeContext'

type Page = 'home' | 'maps' | 'contribute' | 'profile'

interface PrivacySettingsProps {
  onNavigate: (page: Page) => void
}

const PrivacySettings = ({ onNavigate }: PrivacySettingsProps) => {
  const { isDark } = useTheme()
  const [showSuccess, setShowSuccess] = useState(false)

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    notifications: true,
    camera: false,
    mic: false,
    location: true
  })

  const handleToggle = (setting: keyof typeof privacySettings) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }))
    
    // Show success message
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
    }, 2000)
  }

  const handleBack = () => {
    onNavigate('profile')
  }

  const privacyOptions = [
    {
      key: 'notifications' as keyof typeof privacySettings,
      title: 'Notifications Access',
      description: 'Receive alerts for new incidents and updates',
      icon: Bell,
      color: 'var(--twitter-blue)'
    },
    {
      key: 'camera' as keyof typeof privacySettings,
      title: 'Camera Access',
      description: 'Take photos when reporting incidents',
      icon: Camera,
      color: 'var(--twitter-green)'
    },
    {
      key: 'mic' as keyof typeof privacySettings,
      title: 'Microphone Access',
      description: 'Record audio for incident reports',
      icon: Mic,
      color: 'var(--twitter-yellow)'
    },
    {
      key: 'location' as keyof typeof privacySettings,
      title: 'Location Access',
      description: 'Share your location for accurate reporting',
      icon: MapPin,
      color: 'var(--twitter-red)'
    }
  ]

  return (
    <div className="main-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-logo">
          <Logo size="small" />
        </div>
        <h1 className="page-title">Privacy Settings</h1>
        <motion.button
          onClick={handleBack}
          style={{
            position: 'absolute',
            left: 'var(--spacing-lg)',
            background: 'none',
            border: 'none',
            color: 'var(--twitter-blue)',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '32px',
            minHeight: '32px'
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft size={20} />
        </motion.button>
      </div>

      {/* Privacy Settings Section */}
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '50%', 
            background: 'var(--twitter-blue)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Shield size={24} color="white" />
          </div>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: 'clamp(16px, 4.5vw, 18px)', fontWeight: '600', color: 'var(--twitter-black)' }}>
              App Permissions
            </h3>
            <p style={{ margin: 0, fontSize: 'clamp(12px, 3.5vw, 14px)', color: 'var(--twitter-dark-gray)' }}>
              Control how the app accesses your device
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          {privacyOptions.map((option, index) => {
            const IconComponent = option.icon
            const isEnabled = privacySettings[option.key]
            
            return (
              <motion.div
                key={option.key}
                className="activity-item"
                style={{ 
                  border: '1px solid var(--twitter-border)', 
                  background: 'var(--twitter-background)', 
                  padding: 'var(--spacing-lg)',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
                whileHover={{ scale: 1.01 }} 
                whileTap={{ scale: 0.99 }}
                onClick={() => handleToggle(option.key)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)', flex: 1, minWidth: 0 }}>
                    <div 
                      className="activity-avatar" 
                      style={{ backgroundColor: option.color, flexShrink: 0 }}
                    >
                      <IconComponent size={20} color="white" />
                    </div>
                    <div className="activity-content" style={{ minWidth: 0 }}>
                      <div className="activity-title">{option.title}</div>
                      <div className="activity-meta">{option.description}</div>
                    </div>
                  </div>
                  
                  {/* Toggle Switch */}
                  <motion.div
                    style={{
                      width: '48px',
                      height: '24px',
                      borderRadius: '12px',
                      background: isEnabled ? option.color : 'var(--twitter-border)',
                      position: 'relative',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '2px',
                      flexShrink: 0,
                      marginLeft: 'var(--spacing-sm)'
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: 'white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                      animate={{ x: isEnabled ? 24 : 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  </motion.div>
                </div>
                
                {/* Status Indicator */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  marginTop: 'var(--spacing-sm)',
                  fontSize: 'clamp(10px, 2.5vw, 12px)'
                }}>
                  {isEnabled ? (
                    <>
                      <CheckCircle size={14} color="var(--twitter-green)" />
                      <span style={{ color: 'var(--twitter-green)' }}>Enabled</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={14} color="var(--twitter-dark-gray)" />
                      <span style={{ color: 'var(--twitter-dark-gray)' }}>Disabled</span>
                    </>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Privacy Information */}
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <h3 className="card-title">Privacy Information</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <div style={{ 
            background: 'rgba(29, 161, 242, 0.1)', 
            padding: 'var(--spacing-md)', 
            borderRadius: '8px',
            borderLeft: '4px solid var(--twitter-blue)'
          }}>
            <p style={{ 
              margin: 0, 
              fontSize: 'clamp(12px, 3.5vw, 14px)', 
              color: 'var(--twitter-black)',
              lineHeight: '1.5'
            }}>
              <strong>Data Protection:</strong> Your privacy is our priority. We only collect data necessary for app functionality and never share your personal information with third parties.
            </p>
          </div>
          
          <div style={{ 
            background: 'rgba(0, 186, 124, 0.1)', 
            padding: 'var(--spacing-md)', 
            borderRadius: '8px',
            borderLeft: '4px solid var(--twitter-green)'
          }}>
            <p style={{ 
              margin: 0, 
              fontSize: 'clamp(12px, 3.5vw, 14px)', 
              color: 'var(--twitter-black)',
              lineHeight: '1.5'
            }}>
              <strong>Local Storage:</strong> All sensitive data is stored locally on your device and encrypted for maximum security.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Terms and Conditions */}
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '50%', 
            background: 'var(--twitter-dark-gray)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <FileText size={24} color="white" />
          </div>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: 'clamp(16px, 4.5vw, 18px)', fontWeight: '600', color: 'var(--twitter-black)' }}>
              Legal Information
            </h3>
            <p style={{ margin: 0, fontSize: 'clamp(12px, 3.5vw, 14px)', color: 'var(--twitter-dark-gray)' }}>
              Important legal documents and policies
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <motion.button
            className="activity-item"
            style={{ 
              border: '1px solid var(--twitter-border)', 
              background: 'var(--twitter-background)', 
              cursor: 'pointer',
              justifyContent: 'flex-start',
              padding: 'var(--spacing-lg)'
            }}
            whileHover={{ scale: 1.01 }} 
            whileTap={{ scale: 0.99 }}
          >
            <div className="activity-content">
              <div className="activity-title">Terms of Service</div>
              <div className="activity-meta">Read our terms and conditions of use</div>
            </div>
          </motion.button>
          
          <motion.button
            className="activity-item"
            style={{ 
              border: '1px solid var(--twitter-border)', 
              background: 'var(--twitter-background)', 
              cursor: 'pointer',
              justifyContent: 'flex-start',
              padding: 'var(--spacing-lg)'
            }}
            whileHover={{ scale: 1.01 }} 
            whileTap={{ scale: 0.99 }}
          >
            <div className="activity-content">
              <div className="activity-title">Privacy Policy</div>
              <div className="activity-meta">Learn how we protect your data</div>
            </div>
          </motion.button>
          
          <motion.button
            className="activity-item"
            style={{ 
              border: '1px solid var(--twitter-border)', 
              background: 'var(--twitter-background)', 
              cursor: 'pointer',
              justifyContent: 'flex-start',
              padding: 'var(--spacing-lg)'
            }}
            whileHover={{ scale: 1.01 }} 
            whileTap={{ scale: 0.99 }}
          >
            <div className="activity-content">
              <div className="activity-title">Data Usage Policy</div>
              <div className="activity-meta">Understand how your data is used</div>
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* Success Message */}
      {showSuccess && (
        <motion.div
          style={{
            position: 'fixed',
            top: 'calc(80px + var(--safe-area-top))',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--twitter-green)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: 'clamp(12px, 3.5vw, 14px)'
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <CheckCircle size={16} />
          Privacy settings updated!
        </motion.div>
      )}

      <BottomNavigation activeTab="profile" onNavigate={onNavigate} />
    </div>
  )
}

export default PrivacySettings