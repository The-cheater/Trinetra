'use client'

import { useState } from 'react'
import VideoLanding from './components/VideoLanding'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Map from './pages/Map'
import Contribute from './pages/Contribute'
import UrbanThread from './pages/UrbanThread'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import PrivacySettings from './pages/PrivacySettings'
import ContributionType from './pages/ContributionType'
import { ThemeProvider } from './contexts/ThemeContext'
import { StackedDialogProvider } from './components/StackedDialog'

type Page = 'video' | 'login' | 'signup' | 'home' | 'maps' | 'contribute' | 'profile' | 'edit-profile' | 'privacy-settings' | 'contribution-type'

export default function Home() {
  const [currentPage, setCurrentPage] = useState<Page>('video')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleVideoComplete = () => {
    setCurrentPage('login')
  }

  const handleLogin = () => {
    setIsAuthenticated(true)
    setCurrentPage('home')
  }

  const handleSignup = () => {
    setIsAuthenticated(true)
    setCurrentPage('home')
  }

  const handleSignOut = () => {
    setIsAuthenticated(false)
    setCurrentPage('login')
  }

  const navigateTo = (page: Page) => {
    setCurrentPage(page)
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'video':
        return <VideoLanding onVideoComplete={handleVideoComplete} />
      case 'login':
        return <Login onLogin={handleLogin} onNavigateToSignup={() => setCurrentPage('signup')} />
      case 'signup':
        return <Signup onSignup={handleSignup} onNavigateToLogin={() => setCurrentPage('login')} />
      case 'home':
        return <UrbanThread onNavigate={navigateTo} />
      case 'maps':
        return <Map onNavigate={navigateTo} />
      case 'contribute':
        return <Contribute onNavigate={navigateTo} />
      case 'profile':
        return <Profile onSignOut={handleSignOut} onNavigate={navigateTo} />
      case 'edit-profile':
        return <EditProfile onNavigate={navigateTo} />
      case 'privacy-settings':
        return <PrivacySettings onNavigate={navigateTo} />
      case 'contribution-type':
        return <ContributionType onNavigate={navigateTo} />
      default:
        return <UrbanThread onNavigate={navigateTo} />
    }
  }

  return (
    <ThemeProvider>
      <StackedDialogProvider>
        <div className="app">
          {renderCurrentPage()}
        </div>
      </StackedDialogProvider>
    </ThemeProvider>
  )
}