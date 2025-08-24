'use client'

import { useState, createContext, useContext, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface DialogItem {
  title: string
  description: string
  content: ReactNode
}

interface StackedDialogContextType {
  isOpen: boolean
  currentIndex: number
  items: DialogItem[]
  openDialog: (newItems: DialogItem[], startIndex?: number) => void
  closeDialog: () => void
  goToNext: () => void
  goToPrevious: () => void
}

const StackedDialogContext = createContext<StackedDialogContextType | undefined>(undefined)

export const useStackedDialog = () => {
  const context = useContext(StackedDialogContext)
  if (!context) {
    throw new Error('useStackedDialog must be used within a StackedDialogProvider')
  }
  return context
}

interface StackedDialogProviderProps {
  children: ReactNode
}

export const StackedDialogProvider = ({ children }: StackedDialogProviderProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [items, setItems] = useState<DialogItem[]>([])

  const openDialog = (newItems: DialogItem[], startIndex = 0) => {
    setItems(newItems)
    setCurrentIndex(startIndex)
    setIsOpen(true)
  }

  const closeDialog = () => {
    setIsOpen(false)
    setCurrentIndex(0)
    setItems([])
  }

  const goToNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const value = {
    isOpen,
    currentIndex,
    items,
    openDialog,
    closeDialog,
    goToNext,
    goToPrevious
  }

  return (
    <StackedDialogContext.Provider value={value}>
      {children}
    </StackedDialogContext.Provider>
  )
}

export const StackedDialog = () => {
  const { isOpen, closeDialog, items, currentIndex } = useStackedDialog()

  return (
    <AnimatePresence>
      {isOpen && items.length > 0 && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            padding: '16px'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDialog}
          />
          
          {/* Dialog Content */}
          <motion.div
            className="relative z-10 w-full max-w-md mx-auto"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <StackedDialogContent 
              item={items[currentIndex]} 
              index={currentIndex} 
              total={items.length} 
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface StackedDialogContentProps {
  item: DialogItem
  index: number
  total: number
}

export const StackedDialogContent = ({ item, index, total }: StackedDialogContentProps) => {
  const { closeDialog, goToNext, goToPrevious, currentIndex } = useStackedDialog()
  const isFirst = currentIndex === 0
  const isLast = currentIndex === total - 1

  return (
    <motion.div
      className="rounded-2xl shadow-2xl overflow-hidden"
      style={{ 
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        backgroundColor: 'var(--twitter-background)',
        border: '1px solid var(--twitter-border)',
        color: 'var(--twitter-black)',
        width: '100%'
      }}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              background: 'linear-gradient(135deg, var(--twitter-blue), #7920D0)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <span style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>
                {index + 1}
              </span>
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h2 style={{ 
                fontSize: 'clamp(16px, 4.5vw, 20px)', 
                fontWeight: '600', 
                color: 'var(--twitter-black)', 
                margin: 0,
                lineHeight: 1.3,
                wordBreak: 'break-word'
              }}>
                {item.title}
              </h2>
              <p style={{ 
                fontSize: 'clamp(12px, 3.5vw, 14px)', 
                color: 'var(--twitter-dark-gray)', 
                margin: 0,
                lineHeight: 1.3,
                wordBreak: 'break-word'
              }}>
                {item.description}
              </p>
            </div>
          </div>
          <button
            onClick={closeDialog}
            style={{
              padding: '8px',
              borderRadius: '50%',
              transition: 'all 0.2s ease',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              minWidth: '32px',
              minHeight: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginLeft: '8px'
            }}
            onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--twitter-light-gray)'}
            onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
          >
            <X size={20} style={{ color: 'var(--twitter-dark-gray)' }} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '0 20px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {item.content}
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        padding: '20px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderTop: '1px solid var(--twitter-border)',
        gap: '12px'
      }}>
        <button
          onClick={goToPrevious}
          disabled={isFirst}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '8px',
            transition: 'all 0.2s ease',
            color: isFirst ? 'var(--twitter-dark-gray)' : 'var(--twitter-black)',
            cursor: isFirst ? 'not-allowed' : 'pointer',
            opacity: isFirst ? 0.5 : 1,
            background: 'transparent',
            border: 'none',
            fontSize: 'clamp(12px, 3.5vw, 14px)',
            minHeight: '36px'
          }}
          onMouseEnter={(e) => {
            if (!isFirst) {
              (e.target as HTMLElement).style.backgroundColor = 'var(--twitter-light-gray)'
            }
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.backgroundColor = 'transparent'
          }}
        >
          <ChevronLeft size={16} />
          Previous
        </button>
        
        <span style={{ 
          fontSize: 'clamp(12px, 3.5vw, 14px)', 
          color: 'var(--twitter-dark-gray)',
          whiteSpace: 'nowrap'
        }}>
          {currentIndex + 1} of {total}
        </span>
        
        <button
          onClick={goToNext}
          disabled={isLast}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '8px',
            transition: 'all 0.2s ease',
            color: isLast ? 'var(--twitter-dark-gray)' : 'var(--twitter-black)',
            cursor: isLast ? 'not-allowed' : 'pointer',
            opacity: isLast ? 0.5 : 1,
            background: 'transparent',
            border: 'none',
            fontSize: 'clamp(12px, 3.5vw, 14px)',
            minHeight: '36px'
          }}
          onMouseEnter={(e) => {
            if (!isLast) {
              (e.target as HTMLElement).style.backgroundColor = 'var(--twitter-light-gray)'
            }
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.backgroundColor = 'transparent'
          }}
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </motion.div>
  )
}

interface StackedDialogTriggerProps {
  children: ReactNode
  items: DialogItem[]
  startIndex?: number
}

export const StackedDialogTrigger = ({ children, items, startIndex = 0 }: StackedDialogTriggerProps) => {
  const { openDialog } = useStackedDialog()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    openDialog(items, startIndex)
  }

  return (
    <div onClick={handleClick} style={{ cursor: 'pointer' }}>
      {children}
    </div>
  )
}