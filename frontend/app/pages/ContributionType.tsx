'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Car, Construction, AlertTriangle, MapPin, Shield, Users, TrendingUp } from 'lucide-react'
import Logo from '../components/Logo'

type Page = 'home' | 'maps' | 'contribute' | 'profile'

interface ContributionTypeProps {
  onNavigate: (page: Page) => void
}

const ContributionType = ({ onNavigate }: ContributionTypeProps) => {
  const [selectedType, setSelectedType] = useState('')

  const contributionTypes = [
    { id: 'traffic', name: 'Traffic Incident', description: 'Report accidents, congestion, or traffic violations', icon: Car, color: 'var(--twitter-red)', examples: ['Car accidents', 'Traffic jams', 'Speeding vehicles'] },
    { id: 'construction', name: 'Road Work', description: 'Report construction zones and maintenance work', icon: Construction, color: 'var(--twitter-yellow)', examples: ['Road repairs', 'Lane closures', 'Construction zones'] },
    { id: 'hazard', name: 'Road Hazard', description: 'Report dangerous road conditions', icon: AlertTriangle, color: 'var(--twitter-green)', examples: ['Potholes', 'Broken glass', 'Debris on road'] },
    { id: 'safety', name: 'Safety Issue', description: 'Report safety concerns and violations', icon: Shield, color: 'var(--twitter-blue)', examples: ['Broken traffic lights', 'Missing signs', 'Unsafe conditions'] },
    { id: 'community', name: 'Community Alert', description: 'Share important community information', icon: Users, color: 'var(--twitter-blue)', examples: ['Events affecting traffic', 'Local announcements', 'Community updates'] },
    { id: 'trending', name: 'Trending Issue', description: 'Report recurring problems in your area', icon: TrendingUp, color: 'var(--twitter-green)', examples: ['Frequent accidents', 'Chronic congestion', 'Repeated hazards'] }
  ]

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId)
    setTimeout(() => {
      onNavigate('contribute')
    }, 500)
  }

  return (
    <div className="main-container">
      <div className="page-header">
        <div className="header-logo">
          <Logo size="small" />
        </div>
      </div>

      <div className="content-container">
        {/* Hero */}
        <motion.div 
          className="card"
          style={{ textAlign: 'center' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="card-title" style={{ marginBottom: '6px' }}>Report an Incident</h1>
          <p style={{ color: 'var(--twitter-dark-gray)', fontSize: 'clamp(12px, 3.5vw, 14px)' }}>Pick the category that best matches what you see.</p>
        </motion.div>

        {/* Types grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--spacing-md)',
          margin: 'var(--spacing-md) 0'
        }}>
          {contributionTypes.map((type, index) => {
            const IconComponent = type.icon
            const isSelected = selectedType === type.id
            return (
              <motion.button
                key={type.id}
                onClick={() => handleTypeSelect(type.id)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ 
                  border: isSelected ? `2px solid ${type.color}` : '1px solid var(--twitter-border)',
                  background: 'var(--twitter-background)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--spacing-lg)',
                  textAlign: 'left',
                  position: 'relative',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-sm)' }}>
                  <div style={{ 
                    width: '44px', 
                    height: '44px', 
                    borderRadius: 'var(--radius-full)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    border: '2px solid var(--twitter-border)',
                    background: isSelected ? type.color : 'var(--twitter-light-gray)', 
                    borderColor: isSelected ? type.color : 'var(--twitter-border)'
                  }}>
                    <IconComponent size={22} color={isSelected ? 'white' : type.color} />
                  </div>
                  <span style={{ 
                    fontWeight: '700', 
                    color: isSelected ? type.color : 'var(--twitter-black)',
                    fontSize: 'clamp(14px, 4vw, 16px)'
                  }}>{type.name}</span>
                </div>
                <p style={{ 
                  fontSize: 'clamp(12px, 3.5vw, 14px)', 
                  color: 'var(--twitter-dark-gray)', 
                  marginBottom: 'var(--spacing-sm)',
                  lineHeight: 1.4
                }}>{type.description}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)' }}>
                  {type.examples.map((example, idx) => (
                    <span key={idx} style={{ 
                      padding: '4px 8px', 
                      borderRadius: 'var(--radius-full)', 
                      fontSize: 'clamp(10px, 2.5vw, 12px)',
                      color: isSelected ? type.color : 'var(--twitter-dark-gray)', 
                      background: isSelected ? (type.color + '20') : 'var(--twitter-light-gray)'
                    }}>{example}</span>
                  ))}
                </div>
                {isSelected && (
                  <motion.div 
                    style={{
                      position: 'absolute',
                      top: 'var(--spacing-md)',
                      right: 'var(--spacing-md)',
                      width: '20px',
                      height: '20px',
                      background: type.color,
                      borderRadius: 'var(--radius-full)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }}
                  >
                    <Shield size={12} color="white" />
                  </motion.div>
                )}
              </motion.button>
            )
          })}
        </div>

        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h3 className="card-title">Tips</h3>
          <p style={{ fontSize: 'clamp(12px, 3.5vw, 14px)', color: 'var(--twitter-dark-gray)', lineHeight: 1.5 }}>
            Clear categories help responders act faster. Choose the closest match – you can add details on the next screen.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default ContributionType