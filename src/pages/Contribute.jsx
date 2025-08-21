import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, AlertTriangle, Construction, Car, MapPin, Send, ChevronLeft } from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';
import Logo from '../components/Logo';
import { useTheme } from '../contexts/ThemeContext';

const Contribute = () => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    category: '',
    severity: 'medium',
    description: '',
    location: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: 'traffic', name: 'Traffic', icon: Car, color: '#F4212E' },
    { id: 'construction', name: 'Road Work', icon: Construction, color: '#FFD400' },
    { id: 'hazard', name: 'Hazard', icon: AlertTriangle, color: '#00BA7C' },
    { id: 'other', name: 'Other', icon: MapPin, color: '#1D9BF0' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Report submitted successfully!');
      setFormData({
        category: '',
        severity: 'medium',
        description: '',
        location: ''
      });
    }, 2000);
  };

  return (
    <div className="main-container">
      {/* Consistent header with logo */}
      <div className="page-header">
        <div className="header-logo">
          <Logo size="small" />
        </div>
        <h1 className="page-title">Report Incident</h1>
      </div>
      {/* Scrollable content container */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto',
        padding: '16px',
        paddingBottom: '80px' // Space for bottom navigation
      }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          style={{
            borderRadius: '16px',
            padding: '20px',
            backgroundColor: 'var(--twitter-secondary-bg)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
            marginBottom: '16px',
            border: '1px solid var(--twitter-border)'
          }}
        >
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontWeight: '700',
                marginBottom: '12px',
                fontSize: '16px',
                color: 'var(--twitter-black)'
              }}>Incident Category</label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px'
              }}>
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  const isSelected = formData.category === category.id;
                  return (
                    <motion.button 
                      key={category.id} 
                      type="button" 
                      onClick={() => setFormData({ ...formData, category: category.id })}
                      style={{ 
                        padding: '16px 12px',
                        backgroundColor: isSelected ? `${category.color}20` : 'var(--twitter-background)',
                        border: isSelected ? `2px solid ${category.color}` : '2px solid var(--twitter-border)',
                        color: isSelected ? category.color : 'var(--twitter-black)',
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        gap: '8px',
                        minHeight: '88px',
                        borderRadius: '12px',
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                      whileHover={{ scale: 1.02 }} 
                      whileTap={{ scale: 0.98 }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: isSelected ? '4px' : 0,
                        backgroundColor: category.color,
                        transition: 'height 0.2s ease'
                      }}></div>
                      <IconComponent size={24} strokeWidth={isSelected ? 2 : 1.5} />
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: '700',
                        marginTop: '4px'
                      }}>{category.name}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontWeight: '700',
                marginBottom: '12px',
                fontSize: '16px',
                color: 'var(--twitter-black)'
              }}>Severity Level</label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--twitter-background)',
                borderRadius: '12px',
                padding: '4px',
                height: '52px',
                border: '1px solid var(--twitter-border)'
              }}>
                {['low', 'medium', 'high'].map((level) => (
                  <motion.div
                    key={level}
                    onClick={() => setFormData({ ...formData, severity: level })}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      borderRadius: '8px',
                      backgroundColor: formData.severity === level ? '#1D9BF0' : 'transparent',
                      cursor: 'pointer',
                      position: 'relative',
                      fontWeight: '700',
                      fontSize: '14px',
                      color: formData.severity === level ? '#fff' : 'var(--twitter-dark-gray)',
                      transition: 'all 0.2s'
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </motion.div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontWeight: '700',
                marginBottom: '12px',
                fontSize: '16px',
                color: 'var(--twitter-black)'
              }}>Location</label>
              <div style={{ 
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid var(--twitter-border)'
              }}>
                <MapPin 
                  size={20} 
                  style={{ 
                    position: 'absolute', 
                    left: '16px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: 'var(--twitter-dark-gray)', 
                    pointerEvents: 'none'
                  }} 
                />
                <input 
                  type="text" 
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange} 
                  style={{ 
                    padding: '16px 16px 16px 48px', 
                    width: '100%',
                    border: 'none',
                    fontSize: '16px',
                    backgroundColor: 'transparent',
                    color: 'var(--twitter-black)',
                    outline: 'none'
                  }} 
                  placeholder="Enter location or address" 
                  required 
                />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontWeight: '700',
                marginBottom: '12px',
                fontSize: '16px',
                color: 'var(--twitter-black)'
              }}>Description</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                style={{ 
                  minHeight: '120px', 
                  resize: 'vertical',
                  padding: '16px',
                  width: '100%',
                  borderRadius: '12px',
                  border: '1px solid var(--twitter-border)',
                  fontSize: '16px',
                  lineHeight: '1.4',
                  backgroundColor: 'transparent',
                  color: 'var(--twitter-black)',
                  outline: 'none'
                }} 
                placeholder="Describe the incident in detail..." 
                required 
              />
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontWeight: '700',
                marginBottom: '12px',
                fontSize: '16px',
                color: 'var(--twitter-black)'
              }}>Add Photo (Optional)</label>
              <motion.button 
                type="button" 
                style={{ 
                  width: '100%', 
                  padding: '16px', 
                  border: '2px dashed var(--twitter-border)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px', 
                  fontWeight: '700',
                  color: '#1D9BF0',
                  borderRadius: '12px',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  outline: 'none'
                }} 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
              >
                <Camera size={20} />
                Take or Upload Photo
              </motion.button>
            </div>

            <motion.button 
              type="submit" 
              disabled={isSubmitting || !formData.category} 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px',
                width: '100%',
                padding: '16px',
                backgroundColor: formData.category ? '#1D9BF0' : '#1d9bf020',
                color: formData.category ? '#fff' : '#1d9bf070',
                border: 'none',
                borderRadius: '9999px',
                fontSize: '17px',
                fontWeight: '700',
                cursor: formData.category ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                marginBottom: '16px'
              }}
            >
              {isSubmitting ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '3px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Submitting...
                </div>
              ) : (
                <>
                  <Send size={20} />
                  Submit Report
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
      {/* Fixed bottom navigation */}
      <BottomNavigation activeTab="contribute" />
      <style>{`
        .main-container {
          max-width: 500px;
          margin: 0 auto;
          background-color: #000;
          min-height: 100vh;
          color: #e7e9ea;
          font-family: "TwitterChirp", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: relative;
        }
        .page-header {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          background-color: #000;
          position: sticky;
          top: 0;
          z-index: 20;
          border-bottom: 1px solid #2f3336;
          flex-shrink: 0;
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
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        textarea:focus, input:focus {
          background-color: #000;
          border-color: #1D9BF0 !important;
        }
        button:focus {
          outline: 2px solid #1d9bf070;
        }
      `}</style>
    </div>
  );
};

export default Contribute;