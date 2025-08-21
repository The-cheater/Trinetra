'use client'

import { motion } from 'framer-motion'
import { Home, Plus, Bell, User } from 'lucide-react'

type Page = 'home' | 'maps' | 'contribute' | 'profile'

interface BottomNavigationProps {
  activeTab: string
  onNavigate: (page: Page) => void
}

const BottomNavigation = ({ activeTab, onNavigate }: BottomNavigationProps) => {
  const navItems = [
    { id: 'home', icon: Bell, label: 'Urban Thread', page: 'home' as Page },
    { id: 'maps', icon: Home, label: 'Maps', page: 'maps' as Page },
    { id: 'contribute', icon: Plus, label: 'Contribute', page: 'contribute' as Page },
    { id: 'profile', icon: User, label: 'Profile', page: 'profile' as Page }
  ]

  return (
    <div className="bottom-nav">
      {navItems.map((item) => {
        const IconComponent = item.icon
        const isActive = activeTab === item.id
        
        return (
          <motion.div
            key={item.id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => onNavigate(item.page)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <IconComponent 
              size={24} 
              className="nav-icon"
              color={isActive ? 'var(--twitter-blue)' : 'var(--twitter-dark-gray)'}
            />
            <span className="nav-label">{item.label}</span>
          </motion.div>
        )
      })}
    </div>
  )
}

export default BottomNavigation