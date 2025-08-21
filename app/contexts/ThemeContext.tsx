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
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Check localStorage first, then system preference
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark')
    }
  }, [])

  useEffect(() => {
    // Save theme to localStorage
    localStorage.setItem('theme', theme)
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme)
    
    // Update CSS custom properties
    const root = document.documentElement
    
    if (theme === 'dark') {
      root.style.setProperty('--twitter-background', '#000000')
      root.style.setProperty('--twitter-secondary-bg', '#16181C')
      root.style.setProperty('--twitter-border', '#2F3336')
      root.style.setProperty('--twitter-black', '#E7E9EA')
      root.style.setProperty('--twitter-dark-gray', '#71767B')
      root.style.setProperty('--twitter-light-gray', '#16181C')
      root.style.setProperty('--page-header-bg', 'rgba(0, 0, 0, 0.95)')
      root.style.setProperty('--bottom-nav-bg', 'rgba(0, 0, 0, 0.95)')
    } else {
      root.style.setProperty('--twitter-background', '#FFFFFF')
      root.style.setProperty('--twitter-secondary-bg', '#F7F9FA')
      root.style.setProperty('--twitter-border', '#CFD9DE')
      root.style.setProperty('--twitter-black', '#0F1419')
      root.style.setProperty('--twitter-dark-gray', '#536471')
      root.style.setProperty('--twitter-light-gray', '#EFF3F4')
      root.style.setProperty('--page-header-bg', 'rgba(255, 255, 255, 0.95)')
      root.style.setProperty('--bottom-nav-bg', 'rgba(255, 255, 255, 0.95)')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark'
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}