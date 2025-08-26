'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, CheckCircle } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

interface PopoverFormProps {
  title: string
  open: boolean
  setOpen: (open: boolean) => void
  width?: string
  height?: string
  showCloseButton?: boolean
  showSuccess?: boolean
  openChild: React.ReactNode
  successChild: React.ReactNode
  onSubmit?: () => void
}

export const PopoverForm = ({
  title,
  open,
  setOpen,
  width = "90vw",
  height = "auto",
  showCloseButton = true,
  showSuccess = false,
  openChild,
  successChild,
  onSubmit
}: PopoverFormProps) => {
  const { isDark } = useTheme()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    if (open) {
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, setOpen])

  if (!open) return null

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-lg)',
        zIndex: 2000
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          style={{
            backgroundColor: isDark ? '#111' : '#fff',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: width,
            height: height,
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <div style={{
            padding: 'var(--spacing-lg)',
            borderBottom: `1px solid ${isDark ? '#333' : '#e1e8ed'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}>
            <h3 style={{
              margin: 0,
              color: isDark ? '#fff' : '#000',
              fontSize: '1.1rem',
              fontWeight: '600'
            }}>
              {title}
            </h3>
            
            {showCloseButton && (
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isDark ? '#888' : '#666',
                  cursor: 'pointer',
                  padding: 'var(--spacing-sm)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Content */}
          <div style={{ 
            flex: 1, 
            overflow: 'auto',
            padding: showSuccess ? 0 : 'var(--spacing-lg)'
          }}>
            {showSuccess ? successChild : openChild}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// Button component for the popover form
interface PopoverFormButtonProps {
  type?: 'button' | 'submit'
  variant?: 'primary' | 'secondary'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  children: React.ReactNode
  icon?: React.ReactNode
}

export const PopoverFormButton = ({
  type = 'button',
  variant = 'primary',
  disabled = false,
  loading = false,
  onClick,
  children,
  icon
}: PopoverFormButtonProps) => {
  const { isDark } = useTheme()
  
  const getPrimaryStyles = () => ({
    backgroundColor: '#1d9bf0',
    color: '#fff',
    border: 'none'
  })
  
  const getSecondaryStyles = () => ({
    backgroundColor: 'transparent',
    color: isDark ? '#fff' : '#000',
    border: `1px solid ${isDark ? '#333' : '#ccc'}`
  })

  const styles = variant === 'primary' ? getPrimaryStyles() : getSecondaryStyles()

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      style={{
        padding: 'var(--spacing-md) var(--spacing-lg)',
        borderRadius: 'var(--radius-md)',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        fontWeight: '600',
        fontSize: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-sm)',
        opacity: disabled || loading ? 0.6 : 1,
        transition: 'all 0.2s ease',
        ...styles
      }}
    >
      {loading ? (
        <>
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid transparent',
            borderTop: '2px solid currentColor',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          Loading...
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </motion.button>
  )
}

// Success component for the popover form
interface PopoverFormSuccessProps {
  title: string
  description: string
  icon?: React.ReactNode
}

export const PopoverFormSuccess = ({
  title,
  description,
  icon = <CheckCircle size={48} />
}: PopoverFormSuccessProps) => {
  const { isDark } = useTheme()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        textAlign: 'center',
        padding: 'var(--spacing-xl)',
        color: '#00ba7c'
      }}
    >
      <div style={{
        marginBottom: 'var(--spacing-lg)'
      }}>
        {icon}
      </div>
      
      <h3 style={{ 
        margin: '0 0 var(--spacing-sm)', 
        color: isDark ? '#fff' : '#000',
        fontSize: '1.2rem'
      }}>
        {title}
      </h3>
      
      <p style={{ 
        margin: 0, 
        color: isDark ? '#888' : '#666',
        lineHeight: '1.4'
      }}>
        {description}
      </p>
    </motion.div>
  )
}

// Additional utility components
export const PopoverFormSeparator = () => {
  const { isDark } = useTheme()
  
  return (
    <div style={{
      height: '1px',
      backgroundColor: isDark ? '#333' : '#e1e8ed',
      margin: 'var(--spacing-lg) 0'
    }} />
  )
}

export const PopoverFormCutOutLeftIcon = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    position: 'absolute',
    left: 'var(--spacing-md)',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#666'
  }}>
    {children}
  </div>
)

export const PopoverFormCutOutRightIcon = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    position: 'absolute',
    right: 'var(--spacing-md)',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#666'
  }}>
    {children}
  </div>
)
