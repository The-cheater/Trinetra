import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Shield } from 'lucide-react';
import Logo from '../components/Logo';
import { useTheme } from '../contexts/ThemeContext';

const Signup = ({ onSignup }) => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      onSignup();
    }, 1500);
  };

  return (
    <div className="auth-container">
      <motion.div 
        className="auth-card" 
        initial={{ opacity: 0, y: 50 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-3xl)' }}>
          <Logo size="medium" />
          <h1 className="auth-title">Join Community Safety</h1>
          <p className="auth-subtitle">Create your account to start contributing</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User 
                size={20} 
                style={{ 
                  position: 'absolute', 
                  left: 'var(--spacing-lg)', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'var(--twitter-dark-gray)', 
                  pointerEvents: 'none'
                }} 
              />
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                className="form-input" 
                style={{ paddingLeft: '48px' }} 
                placeholder="Enter your full name" 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail 
                size={20} 
                style={{ 
                  position: 'absolute', 
                  left: 'var(--spacing-lg)', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'var(--twitter-dark-gray)', 
                  pointerEvents: 'none'
                }} 
              />
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                className="form-input" 
                style={{ paddingLeft: '48px' }} 
                placeholder="Enter your email" 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock 
                size={20} 
                style={{ 
                  position: 'absolute', 
                  left: 'var(--spacing-lg)', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'var(--twitter-dark-gray)', 
                  pointerEvents: 'none'
                }} 
              />
              <input 
                type={showPassword ? 'text' : 'password'} 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                className="form-input" 
                style={{ paddingLeft: '48px', paddingRight: '48px' }} 
                placeholder="Create a password" 
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                style={{ 
                  position: 'absolute', 
                  right: 'var(--spacing-lg)', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  color: 'var(--twitter-dark-gray)', 
                  padding: 'var(--spacing-xs)',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--twitter-light-gray)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <Lock 
                size={20} 
                style={{ 
                  position: 'absolute', 
                  left: 'var(--spacing-lg)', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'var(--twitter-dark-gray)', 
                  pointerEvents: 'none'
                }} 
              />
              <input 
                type={showConfirmPassword ? 'text' : 'password'} 
                name="confirmPassword" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                className="form-input" 
                style={{ paddingLeft: '48px', paddingRight: '48px' }} 
                placeholder="Confirm your password" 
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                style={{ 
                  position: 'absolute', 
                  right: 'var(--spacing-lg)', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  color: 'var(--twitter-dark-gray)', 
                  padding: 'var(--spacing-xs)',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--twitter-light-gray)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <motion.button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isLoading} 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }}
            style={{ marginTop: 'var(--spacing-lg)' }}
          >
            {isLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <div className="loading-spinner"></div>
                Creating Account...
              </div>
            ) : (
              'Create Account'
            )}
          </motion.button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" className="auth-link">Sign In</Link></p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
