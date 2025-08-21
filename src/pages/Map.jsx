import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search, Navigation, Car, Shield, Users, Bell, TrendingUp, AlertTriangle, MapPin as MapPinIcon, Users as UsersIcon, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';
import Logo from '../components/Logo';
import { useTheme } from '../contexts/ThemeContext';
import { StackedDialog, StackedDialogContent, StackedDialogTrigger } from '../components/StackedDialog';

const Map = () => {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('fastest');

  const routeOptions = [
    { id: 'fastest', name: 'Fastest', icon: Navigation, color: 'var(--twitter-blue)' },
    { id: 'eco', name: 'Eco', icon: Car, color: 'var(--twitter-green)' },
    { id: 'safety', name: 'Safety', icon: Shield, color: 'var(--twitter-red)' }
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'var(--twitter-red)';
      case 'medium': return 'var(--twitter-yellow)';
      case 'low': return 'var(--twitter-green)';
      default: return 'var(--twitter-blue)';
    }
  };

  const getPriorityColor = (priority) => {
    if (priority >= 90) return 'var(--twitter-red)';
    if (priority >= 70) return 'var(--twitter-yellow)';
    return 'var(--twitter-green)';
  };

  // Create detailed dialog items for each activity
  const createDialogItems = (activity) => [
    {
      title: activity.title,
      description: `${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} Incident`,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ 
            backgroundColor: 'var(--twitter-secondary-bg)', 
            borderRadius: '8px', 
            padding: '16px' 
          }}>
            <p style={{ 
              color: 'var(--twitter-black)', 
              lineHeight: '1.6',
              margin: 0
            }}>
              {activity.description}
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <MapPinIcon size={16} style={{ color: 'var(--twitter-dark-gray)' }} />
              <span style={{ color: 'var(--twitter-dark-gray)' }}>{activity.location}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <Calendar size={16} style={{ color: 'var(--twitter-dark-gray)' }} />
              <span style={{ color: 'var(--twitter-dark-gray)' }}>{activity.time}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div 
              style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '50%',
                backgroundColor: getSeverityColor(activity.severity) 
              }}
            />
            <span style={{ fontSize: '14px', fontWeight: '500', textTransform: 'capitalize' }}>
              {activity.severity} Severity
            </span>
          </div>

          {activity.verified && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--twitter-green)' }}>
              <CheckCircle size={16} />
              <span style={{ fontSize: '14px', fontWeight: '500' }}>Verified Report</span>
            </div>
          )}
        </div>
      )
    },
    {
      title: "Community Response",
      description: "Community engagement and updates",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '16px', 
            backgroundColor: 'rgba(29, 161, 242, 0.1)', 
            borderRadius: '8px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <TrendingUp size={20} style={{ color: 'var(--twitter-blue)' }} />
              <div>
                <div style={{ fontWeight: '600', color: 'var(--twitter-blue)' }}>
                  {activity.upvotes} Upvotes
                </div>
                <div style={{ fontSize: '14px', color: 'var(--twitter-dark-gray)' }}>
                  Community support
                </div>
              </div>
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '16px', 
            backgroundColor: 'rgba(0, 186, 124, 0.1)', 
            borderRadius: '8px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <UsersIcon size={20} style={{ color: 'var(--twitter-green)' }} />
              <div>
                <div style={{ fontWeight: '600', color: 'var(--twitter-green)' }}>
                  {activity.comments} Comments
                </div>
                <div style={{ fontSize: '14px', color: 'var(--twitter-dark-gray)' }}>
                  Community discussion
                </div>
              </div>
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '16px', 
            backgroundColor: 'rgba(121, 32, 208, 0.1)', 
            borderRadius: '8px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Shield size={20} style={{ color: '#7920D0' }} />
              <div>
                <div style={{ fontWeight: '600', color: '#7920D0' }}>
                  Priority Score: {activity.priority}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--twitter-dark-gray)' }}>
                  Based on community reports
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Safety Recommendations",
      description: "Tips and advice for this situation",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ 
            backgroundColor: 'rgba(255, 215, 0, 0.1)', 
            borderLeft: '4px solid #FFD700', 
            padding: '16px', 
            borderRadius: '0 8px 8px 0' 
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <AlertCircle size={20} style={{ color: '#FFD700', marginTop: '2px' }} />
              <div>
                <h4 style={{ fontWeight: '600', color: 'var(--twitter-black)', margin: '0 0 8px 0' }}>
                  Safety Alert
                </h4>
                <p style={{ fontSize: '14px', color: 'var(--twitter-dark-gray)', margin: 0 }}>
                  {activity.type === 'traffic' && 'Reduce speed and maintain safe distance from other vehicles.'}
                  {activity.type === 'construction' && 'Follow detour signs and expect delays in the area.'}
                  {activity.type === 'hazard' && 'Avoid the affected area and report any additional hazards.'}
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontWeight: '600', color: 'var(--twitter-black)', margin: 0 }}>What to do:</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: 'var(--twitter-dark-gray)', margin: 0, padding: 0, listStyle: 'none' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ width: '6px', height: '6px', backgroundColor: 'var(--twitter-blue)', borderRadius: '50%', marginTop: '8px', flexShrink: 0 }} />
                <span>Stay alert and follow traffic signals</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ width: '6px', height: '6px', backgroundColor: 'var(--twitter-blue)', borderRadius: '50%', marginTop: '8px', flexShrink: 0 }} />
                <span>Report any additional issues you observe</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ width: '6px', height: '6px', backgroundColor: 'var(--twitter-blue)', borderRadius: '50%', marginTop: '8px', flexShrink: 0 }} />
                <span>Share this information with others</span>
              </li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const allActivities = [
    {
      id: 1,
      type: 'traffic',
      title: 'Traffic Incident Reported',
      location: 'Main Street',
      time: '2 minutes ago',
      icon: AlertTriangle,
      color: 'var(--twitter-red)',
      description: 'Multiple vehicle collision causing severe delays. Emergency services on scene.',
      severity: 'high',
      verified: true,
      priority: 95,
      upvotes: 156,
      dislikes: 12,
      comments: 23,
      routeType: 'safety'
    },
    {
      id: 2,
      type: 'construction',
      title: 'Road Work Alert',
      location: 'Highway 101',
      time: '5 minutes ago',
      icon: Shield,
      color: 'var(--twitter-yellow)',
      description: 'Lane closure for maintenance work. Expect delays during rush hour.',
      severity: 'medium',
      verified: true,
      priority: 78,
      upvotes: 89,
      dislikes: 5,
      comments: 12,
      routeType: 'eco'
    },
    {
      id: 3,
      type: 'hazard',
      title: 'Pothole Detected',
      location: 'Oak Avenue',
      time: '8 minutes ago',
      icon: AlertTriangle,
      color: 'var(--twitter-red)',
      description: 'Deep pothole causing vehicle damage. Multiple reports confirmed.',
      severity: 'medium',
      verified: false,
      priority: 65,
      upvotes: 67,
      dislikes: 3,
      comments: 8,
      routeType: 'safety'
    },
    {
      id: 4,
      type: 'traffic',
      title: 'Traffic Light Malfunction',
      location: 'Central Ave & Park Street',
      time: '10 minutes ago',
      icon: AlertTriangle,
      color: 'var(--twitter-red)',
      description: 'Traffic light stuck on red causing major intersection backup.',
      severity: 'high',
      verified: true,
      priority: 92,
      upvotes: 234,
      dislikes: 18,
      comments: 31,
      routeType: 'fastest'
    },
    {
      id: 5,
      type: 'construction',
      title: 'Bridge Maintenance',
      location: 'Riverside Bridge',
      time: '15 minutes ago',
      icon: Shield,
      color: 'var(--twitter-yellow)',
      description: 'Scheduled bridge maintenance work. Single lane traffic.',
      severity: 'low',
      verified: true,
      priority: 45,
      upvotes: 34,
      dislikes: 1,
      comments: 5,
      routeType: 'eco'
    },
    {
      id: 6,
      type: 'hazard',
      title: 'Fallen Tree Blocking Road',
      location: 'Forest Drive',
      time: '20 minutes ago',
      icon: AlertTriangle,
      color: 'var(--twitter-red)',
      description: 'Large tree fallen across the road. Emergency services clearing.',
      severity: 'high',
      verified: true,
      priority: 88,
      upvotes: 123,
      dislikes: 7,
      comments: 15,
      routeType: 'safety'
    }
  ];

  // Filter activities based on selected route
  const recentActivity = allActivities.filter(activity => {
    if (selectedRoute === 'fastest') {
      return activity.routeType === 'fastest' || activity.type === 'traffic';
    } else if (selectedRoute === 'eco') {
      return activity.routeType === 'eco' || activity.type === 'construction';
    } else if (selectedRoute === 'safety') {
      return activity.routeType === 'safety' || activity.type === 'hazard';
    }
    return true; // Show all if no specific filter
  }).slice(0, 3); // Show only first 3 filtered results

  return (
    <div className="main-container">
      <div className="page-header">
        <div className="header-logo">
          <Logo size="small" />
        </div>
        <h1 className="page-title">Maps</h1>
      </div>

      {/* Twitter-style Search */}
      <motion.div 
        className="search-container"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Search size={20} className="search-icon" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
          placeholder="Search for destination..."
        />
      </motion.div>

      {/* Map Container */}
      <motion.div 
        className="map-container"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="map-placeholder">
          <MapPin size={48} color="var(--twitter-dark-gray)" style={{ opacity: 0.3 }} />
          <p style={{ marginTop: 'var(--spacing-lg)', opacity: 0.6, fontWeight: '500' }}>
            {selectedRoute === 'fastest' && 'Fastest Route'}
            {selectedRoute === 'eco' && 'Eco-Friendly Route'}
            {selectedRoute === 'safety' && 'Safety-First Route'}
            {!selectedRoute && 'Interactive Map'}
          </p>
          <p style={{ fontSize: '0.875rem', opacity: 0.5 }}>
            {selectedRoute === 'fastest' && 'Optimized for speed and efficiency'}
            {selectedRoute === 'eco' && 'Minimizes environmental impact'}
            {selectedRoute === 'safety' && 'Prioritizes safety and low-risk roads'}
            {!selectedRoute && 'Google Maps integration'}
          </p>
        </div>
      </motion.div>

      {/* Route Options */}
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <h3 className="card-title">Route Options</h3>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
          {routeOptions.map((route) => {
            const IconComponent = route.icon;
            const isActive = selectedRoute === route.id;
            return (
              <motion.button
                key={route.id}
                onClick={() => setSelectedRoute(route.id)}
                className={`btn-twitter ${isActive ? 'btn-twitter-primary' : 'btn-twitter-outline'}`}
                style={{ 
                  flex: 1, 
                  minWidth: '100px',
                  backgroundColor: isActive ? route.color : 'transparent',
                  borderColor: route.color,
                  color: isActive ? 'white' : route.color
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <IconComponent size={16} />
                {route.name}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Community Stats */}
      <motion.div 
        className="stats-grid"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <div className="stat-card">
          <Users size={24} color="var(--twitter-blue)" style={{ marginBottom: 'var(--spacing-sm)' }} />
          <div className="stat-number">{recentActivity.length}</div>
          <div className="stat-label">
            {selectedRoute === 'fastest' && 'Fastest Routes'}
            {selectedRoute === 'eco' && 'Eco Routes'}
            {selectedRoute === 'safety' && 'Safety Routes'}
            {!selectedRoute && 'Active Routes'}
          </div>
        </div>
        <div className="stat-card">
          <TrendingUp size={24} color="var(--twitter-green)" style={{ marginBottom: 'var(--spacing-sm)' }} />
          <div className="stat-number" style={{ color: 'var(--twitter-green)' }}>
            {recentActivity.reduce((sum, activity) => sum + activity.priority, 0)}
          </div>
          <div className="stat-label">Total Priority</div>
        </div>
      </motion.div>

      {/* Recent Activity Feed */}
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <h3 className="card-title">Recent Activity</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {recentActivity.map((activity) => {
            const IconComponent = activity.icon;
            return (
              <StackedDialogTrigger key={activity.id} items={createDialogItems(activity)}>
                <motion.div
                  className="activity-item"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  style={{ cursor: 'pointer' }}
                >
                  <div 
                    className="activity-avatar"
                    style={{ backgroundColor: activity.color }}
                  >
                    <IconComponent size={20} color="white" />
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">{activity.title}</div>
                    <div className="activity-meta">{activity.time} • {activity.location}</div>
                  </div>
                </motion.div>
              </StackedDialogTrigger>
            );
          })}
        </div>
      </motion.div>

      <BottomNavigation activeTab="maps" />
      
      {/* Stacked Dialog */}
      <StackedDialog />
      <style>{`
        .main-container {
          max-width: 428px;
          margin: 0 auto;
          background-color: var(--twitter-background);
          min-height: 100vh;
          color: var(--twitter-black);
          font-family: "TwitterChirp", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          position: relative;
          padding-top: 60px;
        }
        .page-header {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          background-color: var(--twitter-background);
          position: fixed;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          max-width: 428px;
          z-index: 20;
          border-bottom: 1px solid var(--twitter-border);
        }
        .header-logo {
          margin-right: 12px;
        }
        /* Hide scrollbar for Chrome, Safari and Opera */
        ::-webkit-scrollbar {
          display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        body, .main-container, * {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Map;
