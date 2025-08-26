'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface ThemeContextType {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Check localStorage first, then system preference
    const savedTheme = localStorage.getItem('trinetra_theme') as 'light' | 'dark' | null
    
    if (savedTheme) {
      setTheme(savedTheme)
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark')
    } else {
      setTheme('light')
    }
    
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Save theme to localStorage
    localStorage.setItem('trinetra_theme', theme)
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme)
    
    // Update CSS custom properties for better integration
    const root = document.documentElement

    if (theme === 'dark') {
      // Dark theme variables
      root.style.setProperty('--background-primary', '#000000')
      root.style.setProperty('--background-secondary', '#16181C')
      root.style.setProperty('--background-tertiary', '#111111')
      root.style.setProperty('--border-primary', '#2F3336')
      root.style.setProperty('--border-secondary', '#3C4043')
      root.style.setProperty('--text-primary', '#E7E9EA')
      root.style.setProperty('--text-secondary', '#71767B')
      root.style.setProperty('--text-tertiary', '#8B98A5')
      root.style.setProperty('--accent-blue', '#1D9BF0')
      root.style.setProperty('--accent-green', '#00BA7C')
      root.style.setProperty('--accent-red', '#F4212E')
      root.style.setProperty('--accent-yellow', '#FFD400')
      
      // Legacy Twitter variables for backward compatibility
      root.style.setProperty('--twitter-background', '#000000')
      root.style.setProperty('--twitter-secondary-bg', '#16181C')
      root.style.setProperty('--twitter-border', '#2F3336')
      root.style.setProperty('--twitter-black', '#E7E9EA')
      root.style.setProperty('--twitter-dark-gray', '#71767B')
      root.style.setProperty('--twitter-light-gray', '#16181C')
      root.style.setProperty('--twitter-blue', '#1D9BF0')
      root.style.setProperty('--twitter-green', '#00BA7C')
      root.style.setProperty('--twitter-red', '#F4212E')
      root.style.setProperty('--twitter-yellow', '#FFD400')
      
      // Layout specific
      root.style.setProperty('--page-header-bg', 'rgba(0, 0, 0, 0.95)')
      root.style.setProperty('--bottom-nav-bg', 'rgba(0, 0, 0, 0.95)')
      root.style.setProperty('--modal-bg', 'rgba(0, 0, 0, 0.75)')
      
      // Spacing (consistent across themes)
      root.style.setProperty('--spacing-xs', '4px')
      root.style.setProperty('--spacing-sm', '8px')
      root.style.setProperty('--spacing-md', '12px')
      root.style.setProperty('--spacing-lg', '16px')
      root.style.setProperty('--spacing-xl', '24px')
      root.style.setProperty('--spacing-2xl', '32px')
      
      // Border radius
      root.style.setProperty('--radius-xs', '2px')
      root.style.setProperty('--radius-sm', '4px')
      root.style.setProperty('--radius-md', '8px')
      root.style.setProperty('--radius-lg', '12px')
      root.style.setProperty('--radius-xl', '16px')
      
    } else {
      // Light theme variables
      root.style.setProperty('--background-primary', '#FFFFFF')
      root.style.setProperty('--background-secondary', '#F7F9FA')
      root.style.setProperty('--background-tertiary', '#F0F2F5')
      root.style.setProperty('--border-primary', '#CFD9DE')
      root.style.setProperty('--border-secondary', '#E1E8ED')
      root.style.setProperty('--text-primary', '#0F1419')
      root.style.setProperty('--text-secondary', '#536471')
      root.style.setProperty('--text-tertiary', '#657786')
      root.style.setProperty('--accent-blue', '#1D9BF0')
      root.style.setProperty('--accent-green', '#00BA7C')
      root.style.setProperty('--accent-red', '#F4212E')
      root.style.setProperty('--accent-yellow', '#FFD400')
      
      // Legacy Twitter variables for backward compatibility
      root.style.setProperty('--twitter-background', '#FFFFFF')
      root.style.setProperty('--twitter-secondary-bg', '#F7F9FA')
      root.style.setProperty('--twitter-border', '#CFD9DE')
      root.style.setProperty('--twitter-black', '#0F1419')
      root.style.setProperty('--twitter-dark-gray', '#536471')
      root.style.setProperty('--twitter-light-gray', '#EFF3F4')
      root.style.setProperty('--twitter-blue', '#1D9BF0')
      root.style.setProperty('--twitter-green', '#00BA7C')
      root.style.setProperty('--twitter-red', '#F4212E')
      root.style.setProperty('--twitter-yellow', '#FFD400')
      
      // Layout specific
      root.style.setProperty('--page-header-bg', 'rgba(255, 255, 255, 0.95)')
      root.style.setProperty('--bottom-nav-bg', 'rgba(255, 255, 255, 0.95)')
      root.style.setProperty('--modal-bg', 'rgba(0, 0, 0, 0.5)')
      
      // Spacing (consistent across themes)
      root.style.setProperty('--spacing-xs', '4px')
      root.style.setProperty('--spacing-sm', '8px')
      root.style.setProperty('--spacing-md', '12px')
      root.style.setProperty('--spacing-lg', '16px')
      root.style.setProperty('--spacing-xl', '24px')
      root.style.setProperty('--spacing-2xl', '32px')
      
      // Border radius
      root.style.setProperty('--radius-xs', '2px')
      root.style.setProperty('--radius-sm', '4px')
      root.style.setProperty('--radius-md', '8px')
      root.style.setProperty('--radius-lg', '12px')
      root.style.setProperty('--radius-xl', '16px')
    }

    // Update body background for smooth transitions
    document.body.style.backgroundColor = theme === 'dark' ? '#000000' : '#FFFFFF'
    document.body.style.color = theme === 'dark' ? '#E7E9EA' : '#0F1419'
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease'
    
  }, [theme, mounted])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark'
  }

  // Prevent flash of unstyled content
  if (!mounted) {
    return (
      <div style={{
        backgroundColor: '#000',
        color: '#fff',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <ThemeContext.Provider value={value}>
      <div className={`theme-${theme}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

// Hook to get theme-aware styles
export const useThemeStyles = () => {
  const { isDark } = useTheme()
  
  return {
    // Common style patterns
    card: {
      backgroundColor: isDark ? '#111' : '#fff',
      border: `1px solid ${isDark ? '#333' : '#e1e8ed'}`,
      borderRadius: 'var(--radius-lg)',
      color: isDark ? '#fff' : '#000'
    },
    
    button: {
      primary: {
        backgroundColor: '#1d9bf0',
        color: '#fff',
        border: 'none'
      },
      secondary: {
        backgroundColor: 'transparent',
        color: isDark ? '#fff' : '#000',
        border: `1px solid ${isDark ? '#333' : '#ccc'}`
      }
    },
    
    input: {
      backgroundColor: isDark ? '#111' : '#fff',
      border: `2px solid ${isDark ? '#333' : '#e1e8ed'}`,
      color: isDark ? '#fff' : '#000'
    },
    
    text: {
      primary: isDark ? '#fff' : '#000',
      secondary: isDark ? '#888' : '#666',
      tertiary: isDark ? '#666' : '#999'
    }
  }
}
