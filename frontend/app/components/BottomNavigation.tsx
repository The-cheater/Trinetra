'use client'

import { motion } from 'framer-motion'
import { Home, Plus, Bell, User, Map } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

type Page = 'home' | 'maps' | 'contribute' | 'profile'

interface BottomNavigationProps {
  current: Page
  onNavigate?: (page: Page) => void
}

const BottomNavigation = ({ current, onNavigate }: BottomNavigationProps) => {
  const { isDark } = useTheme()

  const navItems = [
    { id: 'home', icon: Bell, label: 'Urban Thread', page: 'home' as Page },
    { id: 'maps', icon: Map, label: 'Routes', page: 'maps' as Page },
    { id: 'contribute', icon: Plus, label: 'Report', page: 'contribute' as Page },
    { id: 'profile', icon: User, label: 'Profile', page: 'profile' as Page }
  ]

  const handleNavigate = (page: Page) => {
    if (onNavigate) {
      onNavigate(page)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(12px)',
      borderTop: `1px solid ${isDark ? '#333' : '#e1e8ed'}`,
      padding: 'var(--spacing-sm) 0',
      zIndex: 1000
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        maxWidth: '600px',
        margin: '0 auto',
        padding: '0 var(--spacing-md)'
      }}>
        {navItems.map((item) => {
          const IconComponent = item.icon
          const isActive = current === item.page
          
          return (
            <motion.button
              key={item.id}
              onClick={() => handleNavigate(item.page)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--spacing-xs)',
                padding: 'var(--spacing-sm)',
                borderRadius: 'var(--radius-md)',
                minWidth: '60px',
                position: 'relative'
              }}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '32px',
                    height: '3px',
                    backgroundColor: '#1d9bf0',
                    borderRadius: '0 0 var(--radius-sm) var(--radius-sm)'
                  }}
                />
              )}
              
              <div style={{
                padding: 'var(--spacing-xs)',
                borderRadius: '50%',
                backgroundColor: isActive ? 'rgba(29, 155, 240, 0.1)' : 'transparent',
                transition: 'all 0.2s ease'
              }}>
                <IconComponent 
                  size={20} 
                  style={{ 
                    color: isActive ? '#1d9bf0' : (isDark ? '#71767B' : '#536471')
                  }} 
                />
              </div>
              
              <span style={{
                fontSize: 'clamp(10px, 2.5vw, 12px)',
                fontWeight: isActive ? '600' : '400',
                color: isActive ? '#1d9bf0' : (isDark ? '#71767B' : '#536471'),
                textAlign: 'center',
                lineHeight: 1
              }}>
                {item.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

export default BottomNavigation
