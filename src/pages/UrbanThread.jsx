import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle, Construction, Car, MapPin, ThumbsUp, ThumbsDown, MessageCircle, Share2, CheckCircle, Filter, TrendingUp, Clock, MapPin as MapPinIcon, Users, Calendar, AlertCircle } from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';
import Logo from '../components/Logo';
import { useTheme } from '../contexts/ThemeContext';
import { StackedDialog, StackedDialogContent, StackedDialogTrigger } from '../components/StackedDialog';
import { CommentForm } from '../components/CommentForm';
import ShareModal from '../components/ShareModal';

const UrbanThread = () => {
  const { isDark } = useTheme();
  const [activeFilter, setActiveFilter] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [commentFormOpen, setCommentFormOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [incidentReactions, setIncidentReactions] = useState({});
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedIncidentForShare, setSelectedIncidentForShare] = useState(null);

  const incidents = [
    { 
      id: 1, 
      type: 'traffic', 
      title: 'Major Traffic Jam on Main Street', 
      description: 'Multiple vehicle collision causing severe delays. Emergency services on scene.', 
      time: '2 minutes ago', 
      location: 'Main Street & 5th Ave', 
      severity: 'high', 
      upvotes: 156, 
      dislikes: 12,
      comments: 23, 
      verified: true,
      priority: 95
    },
    { 
      id: 2, 
      type: 'construction', 
      title: 'Road Work on Highway 101', 
      description: 'Lane closure for maintenance work. Expect delays during rush hour.', 
      time: '15 minutes ago', 
      location: 'Highway 101, Exit 15', 
      severity: 'medium', 
      upvotes: 89, 
      dislikes: 5,
      comments: 12, 
      verified: true,
      priority: 78
    },
    { 
      id: 3, 
      type: 'hazard', 
      title: 'Large Pothole on Oak Street', 
      description: 'Deep pothole causing vehicle damage. Multiple reports confirmed.', 
      time: '1 hour ago', 
      location: 'Oak Street, between 3rd & 4th', 
      severity: 'medium', 
      upvotes: 67, 
      dislikes: 3,
      comments: 8, 
      verified: false,
      priority: 65
    },
    { 
      id: 4, 
      type: 'traffic', 
      title: 'Traffic Light Malfunction', 
      description: 'Traffic light stuck on red causing major intersection backup.', 
      time: '2 hours ago', 
      location: 'Central Ave & Park Street', 
      severity: 'high', 
      upvotes: 234, 
      dislikes: 18,
      comments: 31, 
      verified: true,
      priority: 92
    },
    { 
      id: 5, 
      type: 'hazard', 
      title: 'Broken Street Light', 
      description: 'Street light not working, creating safety hazard at night.', 
      time: '3 hours ago', 
      location: 'Riverside Drive', 
      severity: 'low', 
      upvotes: 34, 
      dislikes: 1,
      comments: 5, 
      verified: false,
      priority: 45
    }
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'traffic': return Car;
      case 'construction': return Construction;
      case 'hazard': return AlertTriangle;
      default: return MapPin;
    }
  };

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

  const filteredIncidents = incidents.filter(incident => {
    const categoryMatch = activeFilter === 'all' || incident.type === activeFilter;
    const severityMatch = severityFilter === 'all' || incident.severity === severityFilter;
    return categoryMatch && severityMatch;
  });

  const sortedIncidents = filteredIncidents.sort((a, b) => b.priority - a.priority);

  const handleReaction = (incidentId, reactionType) => {
    setIncidentReactions(prev => {
      const current = prev[incidentId] || { liked: false, disliked: false };
      
      if (reactionType === 'like') {
        return {
          ...prev,
          [incidentId]: {
            liked: !current.liked,
            disliked: current.liked ? false : current.disliked
          }
        };
      } else if (reactionType === 'dislike') {
        return {
          ...prev,
          [incidentId]: {
            liked: current.disliked ? false : current.liked,
            disliked: !current.disliked
          }
        };
      }
      
      return prev;
    });
  };

  // Create detailed dialog items for each incident
  const createDialogItems = (incident) => [
    {
      title: incident.title,
      description: `${incident.type.charAt(0).toUpperCase() + incident.type.slice(1)} Incident`,
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
              {incident.description}
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <MapPinIcon size={16} style={{ color: 'var(--twitter-dark-gray)' }} />
              <span style={{ color: 'var(--twitter-dark-gray)' }}>{incident.location}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <Calendar size={16} style={{ color: 'var(--twitter-dark-gray)' }} />
              <span style={{ color: 'var(--twitter-dark-gray)' }}>{incident.time}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div 
              style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '50%',
                backgroundColor: getSeverityColor(incident.severity) 
              }}
            />
            <span style={{ fontSize: '14px', fontWeight: '500', textTransform: 'capitalize' }}>
              {incident.severity} Severity
            </span>
          </div>

          {incident.verified && (
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
              <ThumbsUp size={20} style={{ color: 'var(--twitter-blue)' }} />
              <div>
                <div style={{ fontWeight: '600', color: 'var(--twitter-blue)' }}>
                  {incident.upvotes} Upvotes
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
              <MessageCircle size={20} style={{ color: 'var(--twitter-green)' }} />
              <div>
                <div style={{ fontWeight: '600', color: 'var(--twitter-green)' }}>
                  {incident.comments} Comments
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
              <Users size={20} style={{ color: '#7920D0' }} />
              <div>
                <div style={{ fontWeight: '600', color: '#7920D0' }}>
                  Priority Score: {incident.priority}
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
                  {incident.type === 'traffic' && 'Reduce speed and maintain safe distance from other vehicles.'}
                  {incident.type === 'construction' && 'Follow detour signs and expect delays in the area.'}
                  {incident.type === 'hazard' && 'Avoid the affected area and report any additional hazards.'}
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

  return (
    <div className="main-container">
      <div className="page-header">
        <div className="header-logo">
          <Logo size="small" />
        </div>
        <h1 className="page-title">Urban Thread</h1>
        <motion.button
          className="filter-button"
          onClick={() => setShowFilterModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ position: 'absolute', right: 'var(--spacing-lg)' }}
        >
          <Filter size={16} />
          Filter
        </motion.button>
      </div>

      {/* Priority Stats */}
      <motion.div 
        className="stats-grid content-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="stat-card">
          <TrendingUp size={24} color="var(--twitter-blue)" style={{ marginBottom: 'var(--spacing-sm)' }} />
          <div className="stat-number">{filteredIncidents.length}</div>
          <div className="stat-label">
            {activeFilter === 'all' && 'All Issues'}
            {activeFilter === 'traffic' && 'Traffic Issues'}
            {activeFilter === 'construction' && 'Construction Issues'}
            {activeFilter === 'hazard' && 'Hazard Issues'}
          </div>
        </div>
        <div className="stat-card">
          <Clock size={24} color="var(--twitter-green)" style={{ marginBottom: 'var(--spacing-sm)' }} />
          <div className="stat-number" style={{ color: 'var(--twitter-green)' }}>
            {filteredIncidents.length > 0 
              ? Math.round(filteredIncidents.reduce((acc, incident) => acc + incident.priority, 0) / filteredIncidents.length)
              : 0}%
          </div>
          <div className="stat-label">Avg Priority</div>
        </div>
      </motion.div>

      {/* Quick Filters */}
      <motion.div 
        className="card content-container" 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="chip-row">
          {[
            { id: 'all', name: 'All', color: 'var(--twitter-blue)' }, 
            { id: 'traffic', name: 'Traffic', color: 'var(--twitter-red)' }, 
            { id: 'construction', name: 'Construction', color: 'var(--twitter-yellow)' }, 
            { id: 'hazard', name: 'Hazards', color: 'var(--twitter-green)' }
          ].map((filter) => (
            <motion.button 
              key={filter.id} 
              onClick={() => setActiveFilter(filter.id)} 
              className={`btn-twitter ${activeFilter === filter.id ? 'btn-twitter-primary' : 'btn-twitter-outline'}`}
              style={{ 
                whiteSpace: 'nowrap',
                backgroundColor: activeFilter === filter.id ? filter.color : 'transparent',
                borderColor: filter.color,
                color: activeFilter === filter.id ? 'white' : filter.color
              }}
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
            >
              {filter.name}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Incidents List */}
      <div className="content-container" style={{ padding: '0 var(--spacing-lg)' }}>
        {sortedIncidents.length === 0 ? (
          <motion.div
            className="card"
            style={{ 
              textAlign: 'center', 
              padding: 'var(--spacing-xl)',
              color: 'var(--twitter-dark-gray)'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AlertTriangle size={48} style={{ opacity: 0.5, marginBottom: 'var(--spacing-md)' }} />
            <h3 style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--twitter-black)' }}>
              No incidents found
            </h3>
            <p style={{ fontSize: '0.875rem' }}>
              Try adjusting your filters to see more results.
            </p>
          </motion.div>
        ) : (
          sortedIncidents.map((incident, index) => {
          const IconComponent = getIcon(incident.type);
          return (
            <StackedDialogTrigger key={incident.id} items={createDialogItems(incident)}>
              <motion.div 
                className="activity-item" 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.01 }}
                style={{ cursor: 'pointer' }}
              >
              <div 
                className="activity-avatar" 
                style={{ background: getSeverityColor(incident.severity) }}
              >
                <IconComponent size={20} color="white" />
              </div>
              
              <div className="activity-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                  <span className="activity-title">{incident.title}</span>
                  {incident.verified && (
                    <motion.div 
                      style={{ 
                        width: '16px', 
                        height: '16px', 
                        background: 'var(--twitter-green)', 
                        borderRadius: 'var(--radius-full)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }} 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }} 
                      transition={{ delay: 0.5 }}
                    >
                      <CheckCircle size={10} color="white" />
                    </motion.div>
                  )}
                  <motion.div
                    style={{
                      padding: 'var(--spacing-xs) var(--spacing-sm)',
                      background: getPriorityColor(incident.priority),
                      color: 'white',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    P{incident.priority}
                  </motion.div>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--twitter-black)', marginBottom: 'var(--spacing-sm)' }}>
                  {incident.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)', fontSize: '0.75rem', color: 'var(--twitter-dark-gray)' }}>
                  <span>{incident.time}</span>
                  <span>•</span>
                  <span>{incident.location}</span>
                </div>
                
                <div style={{ display: 'flex', gap: 'var(--spacing-lg)', marginTop: 'var(--spacing-md)' }}>
                  <motion.button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleReaction(incident.id, 'like');
                    }}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 'var(--spacing-xs)', 
                      background: 'none', 
                      border: 'none', 
                      color: (incidentReactions[incident.id]?.liked ? 'var(--twitter-blue)' : 'var(--twitter-dark-gray)'), 
                      cursor: 'pointer', 
                      fontSize: '0.875rem', 
                      fontWeight: '500',
                      padding: 'var(--spacing-xs)',
                      borderRadius: 'var(--radius-sm)',
                      transition: 'all 0.2s ease'
                    }} 
                    whileHover={{ scale: 1.1, color: 'var(--twitter-blue)' }} 
                    whileTap={{ scale: 0.9 }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--twitter-light-gray)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <ThumbsUp size={16} />
                    {incident.upvotes}
                  </motion.button>
                  
                  <motion.button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleReaction(incident.id, 'dislike');
                    }}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 'var(--spacing-xs)', 
                      background: 'none', 
                      border: 'none', 
                      color: (incidentReactions[incident.id]?.disliked ? 'var(--twitter-red)' : 'var(--twitter-dark-gray)'), 
                      cursor: 'pointer', 
                      fontSize: '0.875rem', 
                      fontWeight: '500',
                      padding: 'var(--spacing-xs)',
                      borderRadius: 'var(--radius-sm)',
                      transition: 'all 0.2s ease'
                    }} 
                    whileHover={{ scale: 1.1, color: 'var(--twitter-red)' }} 
                    whileTap={{ scale: 0.9 }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--twitter-light-gray)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <ThumbsDown size={16} />
                    {incident.dislikes || 0}
                  </motion.button>
                  
                  <motion.button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedIncident(incident);
                      setCommentFormOpen(true);
                    }}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 'var(--spacing-xs)', 
                      background: 'none', 
                      border: 'none', 
                      color: 'var(--twitter-dark-gray)', 
                      cursor: 'pointer', 
                      fontSize: '0.875rem', 
                      fontWeight: '500',
                      padding: 'var(--spacing-xs)',
                      borderRadius: 'var(--radius-sm)',
                      transition: 'all 0.2s ease'
                    }} 
                    whileHover={{ scale: 1.1, color: 'var(--twitter-blue)' }} 
                    whileTap={{ scale: 0.9 }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--twitter-light-gray)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <MessageCircle size={16} />
                    {incident.comments}
                  </motion.button>
                  
                  <motion.button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedIncidentForShare(incident);
                      setShareModalOpen(true);
                    }}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 'var(--spacing-xs)', 
                      background: 'none', 
                      border: 'none', 
                      color: 'var(--twitter-dark-gray)', 
                      cursor: 'pointer', 
                      fontSize: '0.875rem', 
                      fontWeight: '500',
                      padding: 'var(--spacing-xs)',
                      borderRadius: 'var(--radius-sm)',
                      transition: 'all 0.2s ease'
                    }} 
                    whileHover={{ scale: 1.1, color: 'var(--twitter-blue)' }} 
                    whileTap={{ scale: 0.9 }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--twitter-light-gray)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <Share2 size={16} />
                    Share
                  </motion.button>
                </div>
              </div>
            </motion.div>
            </StackedDialogTrigger>
          );
        })
        )}
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <motion.div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--spacing-lg)'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowFilterModal(false)}
        >
          <motion.div
            className="card"
            style={{
              maxWidth: '400px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="card-title">Filter Incidents</h3>
            
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="form-input"
              >
                <option value="all">All Categories</option>
                <option value="traffic">Traffic</option>
                <option value="construction">Construction</option>
                <option value="hazard">Hazards</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Severity</label>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="form-input"
              >
                <option value="all">All Severities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-lg)' }}>
              <motion.button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => {
                  setCategoryFilter('all');
                  setSeverityFilter('all');
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Reset
              </motion.button>
              <motion.button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => setShowFilterModal(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Apply
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <BottomNavigation activeTab="home" />
      
      {/* Stacked Dialog */}
      <StackedDialog />
      
      {/* Comment Form */}
      {selectedIncident && (
        <CommentForm
          open={commentFormOpen}
          setOpen={setCommentFormOpen}
          incidentTitle={selectedIncident.title}
        />
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => {
          setShareModalOpen(false);
          setSelectedIncidentForShare(null);
        }}
        incident={selectedIncidentForShare}
      />
      
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

export default UrbanThread;
