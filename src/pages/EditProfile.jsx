import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Camera, Save, ArrowLeft, Mail, Phone, MapPin, Globe, Calendar, CheckCircle } from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';
import Logo from '../components/Logo';
import { useTheme } from '../contexts/ThemeContext';

const EditProfile = () => {
  const { isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fullName: 'John Doe',
    handle: 'johndoe',
    bio: 'Community Safety Contributor | Helping make our streets safer one report at a time',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    website: 'https://johndoe.com',
    birthDate: '1990-01-01',
    avatar: null
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          avatar: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }, 1500);
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="main-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-logo">
          <Logo size="small" />
        </div>
        <h1 className="page-title">Edit Profile</h1>
        <motion.button
          onClick={handleBack}
          style={{
            position: 'absolute',
            left: 'var(--spacing-lg)',
            background: 'none',
            border: 'none',
            color: 'var(--twitter-blue)',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft size={20} />
        </motion.button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Avatar Section */}
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="card-title">Profile Picture</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
            <div style={{ position: 'relative' }}>
              <div 
                className="profile-avatar" 
                style={{ 
                  width: '80px', 
                  height: '80px', 
                  margin: 0,
                  backgroundImage: formData.avatar ? `url(${formData.avatar})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {!formData.avatar && <User size={40} color="var(--twitter-blue)" />}
              </div>
              <label
                htmlFor="avatar-upload"
                style={{
                  position: 'absolute',
                  bottom: '-8px',
                  right: '-8px',
                  background: 'var(--twitter-blue)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: '2px solid var(--twitter-background)'
                }}
              >
                <Camera size={16} />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </div>
            <div>
              <h4 style={{ margin: '0 0 8px 0', color: 'var(--twitter-black)' }}>Profile Picture</h4>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--twitter-dark-gray)' }}>
                Upload a new profile picture. Recommended size: 400x400 pixels.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Basic Information */}
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h3 className="card-title">Basic Information</h3>
          
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="form-input"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Handle</label>
            <div style={{ position: 'relative' }}>
              <span style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--twitter-dark-gray)' 
              }}>
                @
              </span>
              <input
                type="text"
                value={formData.handle}
                onChange={(e) => handleInputChange('handle', e.target.value)}
                className="form-input"
                style={{ paddingLeft: '28px' }}
                placeholder="username"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className="form-input"
              placeholder="Tell us about yourself..."
              rows={3}
              maxLength={160}
            />
            <div style={{ 
              textAlign: 'right', 
              fontSize: '12px', 
              color: 'var(--twitter-dark-gray)', 
              marginTop: '4px' 
            }}>
              {formData.bio.length}/160
            </div>
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h3 className="card-title">Contact Information</h3>
          
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--twitter-dark-gray)' 
              }} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="form-input"
                style={{ paddingLeft: '36px' }}
                placeholder="Enter your email address"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--twitter-dark-gray)' 
              }} />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="form-input"
                style={{ paddingLeft: '36px' }}
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--twitter-dark-gray)' 
              }} />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="form-input"
                style={{ paddingLeft: '36px' }}
                placeholder="Enter your location"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Website</label>
            <div style={{ position: 'relative' }}>
              <Globe size={16} style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--twitter-dark-gray)' 
              }} />
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="form-input"
                style={{ paddingLeft: '36px' }}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Birth Date</label>
            <div style={{ position: 'relative' }}>
              <Calendar size={16} style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--twitter-dark-gray)' 
              }} />
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                className="form-input"
                style={{ paddingLeft: '36px' }}
              />
            </div>
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div 
          style={{ padding: 'var(--spacing-lg)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <motion.button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            style={{ 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px',
              padding: '16px',
              fontSize: '16px',
              fontWeight: '600'
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                Save Changes
              </>
            )}
          </motion.button>
        </motion.div>
      </form>

      {/* Success Message */}
      {showSuccess && (
        <motion.div
          style={{
            position: 'fixed',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--twitter-green)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <CheckCircle size={16} />
          Profile updated successfully!
        </motion.div>
      )}

      <BottomNavigation activeTab="profile" />
      
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
          justify-content: center;
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
        .form-group {
          margin-bottom: var(--spacing-lg);
        }
        .form-label {
          display: block;
          margin-bottom: var(--spacing-sm);
          font-weight: 600;
          color: var(--twitter-black);
          font-size: 14px;
        }
        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid var(--twitter-border);
          border-radius: 8px;
          background-color: var(--twitter-background);
          color: var(--twitter-black);
          font-size: 14px;
          transition: border-color 0.2s ease;
        }
        .form-input:focus {
          outline: none;
          border-color: var(--twitter-blue);
          box-shadow: 0 0 0 2px rgba(29, 161, 242, 0.2);
        }
        .form-input::placeholder {
          color: var(--twitter-dark-gray);
        }
        .loading-spinner {
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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

export default EditProfile;
