import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import VideoLanding from './components/VideoLanding';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Map from './pages/Map';
import Contribute from './pages/Contribute';
import UrbanThread from './pages/UrbanThread';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import PrivacySettings from './pages/PrivacySettings';
import ContributionType from './pages/ContributionType';
import { ThemeProvider } from './contexts/ThemeContext';
import { StackedDialogProvider } from './components/StackedDialog';
import './App.css';

function App() {
  const [showIntroVideo, setShowIntroVideo] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleVideoComplete = () => {
    setShowIntroVideo(false);
  };

    return (
    <ThemeProvider>
      <StackedDialogProvider>
        <Router>
          <div className="app">
            <div className="phone-frame">
              {showIntroVideo ? (
                <VideoLanding onVideoComplete={handleVideoComplete} />
              ) : (
                <Routes>
                  {!isAuthenticated ? (
                    <>
                      <Route path="/" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
                      <Route path="/signup" element={<Signup onSignup={() => setIsAuthenticated(true)} />} />
                    </>
                  ) : (
                    <>
                      <Route path="/" element={<UrbanThread />} />
                                              <Route path="/maps" element={<Map />} />
                        <Route path="/contribute" element={<Contribute />} />
                        <Route path="/profile" element={<Profile onSignOut={() => setIsAuthenticated(false)} />} />
                        <Route path="/edit-profile" element={<EditProfile />} />
                        <Route path="/privacy-settings" element={<PrivacySettings />} />
                      <Route path="/contribution-type" element={<ContributionType />} />
                    </>
                  )}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              )}
            </div>
          </div>
        </Router>
      </StackedDialogProvider>
    </ThemeProvider>
  );
}

export default App;
