import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Plus, Bell, User } from 'lucide-react';

const BottomNavigation = ({ activeTab }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'home', icon: Bell, label: 'Urban Thread', path: '/' },
    { id: 'maps', icon: Home, label: 'Maps', path: '/maps' },
    { id: 'contribute', icon: Plus, label: 'Contribute', path: '/contribute' },
    { id: 'profile', icon: User, label: 'Profile', path: '/profile' }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="bottom-nav">
      {navItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = location.pathname === item.path || activeTab === item.id;
        
        return (
          <motion.div
            key={item.id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => handleNavigation(item.path)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <IconComponent 
              size={24} 
              className="nav-icon"
              color={isActive ? 'var(--twitter-blue)' : 'var(--twitter-dark-gray)'}
            />
            <span className="nav-label">{item.label}</span>
          </motion.div>
        );
      })}
    </div>
  );
};

export default BottomNavigation;
