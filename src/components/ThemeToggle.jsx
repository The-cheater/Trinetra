import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = ({ className = '', size = 'medium' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12'
  };

  const iconSizes = {
    small: 16,
    medium: 20,
    large: 24
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className={`theme-toggle ${sizeClasses[size]} ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={false}
      animate={{
        rotate: isDark ? 180 : 0,
        scale: 1
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
    >
      <motion.div
        initial={false}
        animate={{
          opacity: isDark ? 0 : 1,
          rotate: isDark ? -90 : 0
        }}
        transition={{ duration: 0.2 }}
        style={{ position: 'absolute' }}
      >
        <Sun size={iconSizes[size]} color="var(--twitter-black)" />
      </motion.div>
      
      <motion.div
        initial={false}
        animate={{
          opacity: isDark ? 1 : 0,
          rotate: isDark ? 0 : 90
        }}
        transition={{ duration: 0.2 }}
        style={{ position: 'absolute' }}
      >
        <Moon size={iconSizes[size]} color="var(--twitter-black)" />
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;
