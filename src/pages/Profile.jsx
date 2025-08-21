import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Award, Clock, MapPin, Settings, LogOut, TrendingUp, CheckCircle, AlertCircle, Sun, Moon } from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

const Profile = ({ onSignOut }) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('stats');
  const navigate = useNavigate();

  const userStats = {
    totalReports: 15,
    verifiedReports: 12,
    accuracyRate: 80,
    communityRank: 'Gold'
  };

  const recentReports = [
    { id: 1, type: 'traffic', title: 'Traffic Light Malfunction', status: 'verified', time: '2 hours ago', location: 'Central Ave & Park Street' },
    { id: 2, type: 'hazard', title: 'Pothole on Oak Street', status: 'pending', time: '1 day ago', location: 'Oak Street, between 3rd & 4th' },
    { id: 3, type: 'construction', title: 'Road Work Alert', status: 'verified', time: '3 days ago', location: 'Highway 101, Exit 15' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'var(--twitter-green)';
      case 'pending': return 'var(--twitter-yellow)';
      case 'rejected': return 'var(--twitter-red)';
      default: return 'var(--twitter-blue)';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified': return CheckCircle;
      case 'pending': return Clock;
      case 'rejected': return AlertCircle;
      default: return MapPin;
    }
  };

  return (
    <div className="main-container">
      {/* Consistent header */}
      <div className="page-header">
        <div className="header-logo">
          <Logo size="small" />
        </div>
        <h1 className="page-title">Profile</h1>
      </div>

      {/* Profile summary */}
      <motion.div 
        className="card profile-card" 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.3 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
          <div className="profile-avatar" style={{ margin: 0 }}>
            <User size={40} color="var(--twitter-blue)" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="profile-name" style={{ marginBottom: 4 }}>John Doe</h2>
            <p className="profile-handle" style={{ margin: 0 }}>@johndoe • Community Safety Contributor</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 'var(--spacing-sm)' }}>
              <span className="profile-tag">
                <Award size={14} /> {userStats.communityRank} Member
              </span>
              <span className="profile-tag">
                <Shield size={14} /> Trusted Reporter
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="stats-grid"
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="stat-card">
          <TrendingUp size={24} color="var(--twitter-blue)" style={{ marginBottom: 'var(--spacing-sm)' }} />
          <div className="stat-number">{userStats.totalReports}</div>
          <div className="stat-label">Total Reports</div>
        </div>
        <div className="stat-card">
          <CheckCircle size={24} color="var(--twitter-green)" style={{ marginBottom: 'var(--spacing-sm)' }} />
          <div className="stat-number" style={{ color: 'var(--twitter-green)' }}>{userStats.verifiedReports}</div>
          <div className="stat-label">Verified</div>
        </div>
        <div className="stat-card">
          <Shield size={24} color="var(--twitter-blue)" style={{ marginBottom: 'var(--spacing-sm)' }} />
          <div className="stat-number">{userStats.accuracyRate}%</div>
          <div className="stat-label">Accuracy</div>
        </div>
        <div className="stat-card">
          <Clock size={24} color="var(--twitter-yellow)" style={{ marginBottom: 'var(--spacing-sm)' }} />
          <div className="stat-number" style={{ color: 'var(--twitter-yellow)' }}>12</div>
          <div className="stat-label">This Month</div>
        </div>
      </motion.div>

      <motion.div 
        className="card" 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          {[
            { id: 'stats', name: 'Statistics' }, 
            { id: 'history', name: 'History' }, 
            { id: 'settings', name: 'Settings' }
          ].map((tab) => (
            <motion.button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`btn-twitter ${activeTab === tab.id ? 'btn-twitter-primary' : 'btn-twitter-outline'}`}
              style={{ flex: 1 }}
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }}
            >
              {tab.name}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'history' && (
          <motion.div 
            className="card" 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
          >
            <h3 className="card-title">Recent Reports</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
              {recentReports.map((report, index) => {
                const StatusIcon = getStatusIcon(report.status);
                return (
                  <motion.div 
                    key={report.id} 
                    className="activity-item"
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div 
                      className="activity-avatar"
                      style={{ backgroundColor: getStatusColor(report.status) }}
                    >
                      <StatusIcon size={20} color="white" />
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">{report.title}</div>
                      <div className="activity-meta">{report.time} • {report.location}</div>
                    </div>
                    <div 
                      style={{ 
                        padding: 'var(--spacing-xs) var(--spacing-sm)', 
                        background: getStatusColor(report.status), 
                        color: 'white', 
                        borderRadius: 'var(--radius-full)', 
                        fontSize: '0.75rem', 
                        fontWeight: '600', 
                        textTransform: 'capitalize' 
                      }}
                    >
                      {report.status}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div 
            className="card" 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
          >
            <h3 className="card-title">Account Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
              <motion.button 
                onClick={() => navigate('/edit-profile')}
                className="activity-item"
                style={{ 
                  border: '1px solid var(--twitter-border)', 
                  background: 'var(--twitter-background)', 
                  cursor: 'pointer',
                  justifyContent: 'flex-start'
                }}
                whileHover={{ scale: 1.01 }} 
                whileTap={{ scale: 0.99 }}
              >
                <div className="activity-avatar" style={{ backgroundColor: 'var(--twitter-blue)' }}>
                  <Settings size={20} color="white" />
                </div>
                <div className="activity-content">
                  <div className="activity-title">Edit Profile</div>
                  <div className="activity-meta">Update your personal information</div>
                </div>
              </motion.button>
              
              <motion.button 
                onClick={() => navigate('/privacy-settings')}
                className="activity-item"
                style={{ 
                  border: '1px solid var(--twitter-border)', 
                  background: 'var(--twitter-background)', 
                  cursor: 'pointer',
                  justifyContent: 'flex-start'
                }}
                whileHover={{ scale: 1.01 }} 
                whileTap={{ scale: 0.99 }}
              >
                <div className="activity-avatar" style={{ backgroundColor: 'var(--twitter-green)' }}>
                  <Shield size={20} color="white" />
                </div>
                <div className="activity-content">
                  <div className="activity-title">Privacy Settings</div>
                  <div className="activity-meta">Manage your privacy preferences</div>
                </div>
              </motion.button>
              
              {/* Theme Toggle Setting */}
              <motion.div 
                className="activity-item"
                style={{ 
                  border: '1px solid var(--twitter-border)', 
                  background: 'var(--twitter-background)', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--spacing-lg)'
                }}
                whileHover={{ scale: 1.01 }} 
                whileTap={{ scale: 0.99 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
                  <div className="activity-avatar" style={{ backgroundColor: isDark ? '#FFD700' : '#1DA1F2' }}>
                    {isDark ? <Sun size={20} color="white" /> : <Moon size={20} color="white" />}
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">Theme</div>
                    <div className="activity-meta">{isDark ? 'Dark Mode' : 'Light Mode'}</div>
                  </div>
                </div>
                <ThemeToggle size="small" />
              </motion.div>
              
              <motion.button 
                onClick={() => {
                  onSignOut();
                  navigate('/login');
                }}
                className="activity-item"
                style={{ 
                  border: '1px solid var(--twitter-red)', 
                  background: 'var(--twitter-background)', 
                  cursor: 'pointer',
                  justifyContent: 'flex-start'
                }}
                whileHover={{ scale: 1.01 }} 
                whileTap={{ scale: 0.99 }}
              >
                <div className="activity-avatar" style={{ backgroundColor: 'var(--twitter-red)' }}>
                  <LogOut size={20} color="white" />
                </div>
                <div className="activity-content">
                  <div className="activity-title" style={{ color: 'var(--twitter-red)' }}>Sign Out</div>
                  <div className="activity-meta">Log out of your account</div>
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.div>

      <BottomNavigation activeTab="profile" />
    </div>
  );
};

export default Profile;
