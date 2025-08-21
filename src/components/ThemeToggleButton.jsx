import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggleButton = ({ 
  showLabel = false, 
  variant = 'default', 
  url = null, 
  start = 'center',
  size = 'medium'
}) => {
  const { theme, toggleTheme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const isDark = theme === 'dark';

  const sizeVariants = {
    small: { width: 40, height: 40, iconSize: 16 },
    medium: { width: 48, height: 48, iconSize: 20 },
    large: { width: 56, height: 56, iconSize: 24 }
  };

  const currentSize = sizeVariants[size];

  const getStartPosition = () => {
    switch (start) {
      case 'top-left': return { x: -20, y: -20 };
      case 'top-right': return { x: 20, y: -20 };
      case 'bottom-left': return { x: -20, y: 20 };
      case 'bottom-right': return { x: 20, y: 20 };
      case 'center': return { x: 0, y: 0 };
      default: return { x: 0, y: 0 };
    }
  };

  const renderContent = () => {
    switch (variant) {
      case 'gif':
        return (
          <motion.div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              overflow: 'hidden',
              position: 'relative'
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <img
              src={url}
              alt="Theme toggle animation"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            <motion.div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
            >
              {isDark ? <Sun size={currentSize.iconSize} color="white" /> : <Moon size={currentSize.iconSize} color="white" />}
            </motion.div>
          </motion.div>
        );

      case 'circle-blur':
        return (
          <motion.div
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              borderRadius: '50%',
              background: isDark ? 'var(--twitter-black)' : 'var(--twitter-background)',
              border: '2px solid var(--twitter-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            onTapStart={() => setIsPressed(true)}
            onTapEnd={() => setIsPressed(false)}
          >
            <AnimatePresence mode="wait">
              {isDark ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Sun size={currentSize.iconSize} color="var(--twitter-yellow)" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Moon size={currentSize.iconSize} color="var(--twitter-blue)" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Blur circles */}
            <AnimatePresence>
              {isHovered && (
                <>
                  <motion.div
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      filter: 'blur(8px)',
                      ...getStartPosition()
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  />
                  <motion.div
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                      filter: 'blur(12px)',
                      ...getStartPosition()
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 2, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  />
                </>
              )}
            </AnimatePresence>
          </motion.div>
        );

      case 'circle':
        return (
          <motion.div
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              borderRadius: '50%',
              background: isDark ? 'var(--twitter-black)' : 'var(--twitter-background)',
              border: '2px solid var(--twitter-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              overflow: 'hidden'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
          >
            <AnimatePresence mode="wait">
              {isDark ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Sun size={currentSize.iconSize} color="var(--twitter-yellow)" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Moon size={currentSize.iconSize} color="var(--twitter-blue)" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Circle animation */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    ...getStartPosition()
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1.2, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        );

      default:
        return (
          <motion.div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: isDark ? 'var(--twitter-black)' : 'var(--twitter-background)',
              border: '2px solid var(--twitter-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            whileHover={{ scale: 1.05, backgroundColor: isDark ? 'var(--twitter-dark-gray)' : 'var(--twitter-light-gray)' }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              {isDark ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Sun size={currentSize.iconSize} color="var(--twitter-yellow)" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Moon size={currentSize.iconSize} color="var(--twitter-blue)" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <motion.button
        onClick={toggleTheme}
        style={{
          width: currentSize.width,
          height: currentSize.height,
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          padding: 0
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {renderContent()}
      </motion.button>
      
      {showLabel && (
        <motion.span
          style={{
            fontSize: '12px',
            fontWeight: '500',
            color: 'var(--twitter-dark-gray)',
            textAlign: 'center'
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {variant === 'gif' ? 'GIF' : 
           variant === 'circle-blur' ? 'Blur' : 
           variant === 'circle' ? 'Circle' : 'Theme'}
        </motion.span>
      )}
    </div>
  );
};

export default ThemeToggleButton;
