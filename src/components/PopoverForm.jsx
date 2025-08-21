import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle } from 'lucide-react';

export const PopoverForm = ({ 
  title, 
  open, 
  setOpen, 
  width = "320px", 
  height = "auto",
  showCloseButton = true,
  showSuccess = false,
  openChild,
  successChild 
}) => {
  const [formState, setFormState] = useState("idle");

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    if (open) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          
          {/* Popover Content */}
          <motion.div
            className="relative z-10"
            style={{ 
              width: width,
              height: height,
              maxWidth: '90vw',
              maxHeight: '90vh'
            }}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div 
              className="popover-form-content"
              style={{ 
                backgroundColor: 'var(--twitter-background)',
                border: '1px solid var(--twitter-border)',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden'
              }}
            >
              {/* Header */}
              <div 
                className="popover-form-header"
                style={{ 
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--twitter-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <h3 style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: 'var(--twitter-black)',
                  margin: 0
                }}>
                  {title}
                </h3>
                {showCloseButton && (
                  <button
                    onClick={() => setOpen(false)}
                    style={{
                      padding: '4px',
                      borderRadius: '50%',
                      transition: 'all 0.2s ease',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--twitter-light-gray)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <X size={16} style={{ color: 'var(--twitter-dark-gray)' }} />
                  </button>
                )}
              </div>

              {/* Content */}
              <div style={{ position: 'relative' }}>
                <AnimatePresence mode="wait">
                  {showSuccess ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      {successChild}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      {openChild}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const PopoverFormButton = ({ loading = false, text = "Submit" }) => {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        width: '100%',
        padding: '12px 16px',
        backgroundColor: loading ? 'var(--twitter-dark-gray)' : 'var(--twitter-blue)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.target.style.backgroundColor = 'var(--twitter-blue-hover)';
        }
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = loading ? 'var(--twitter-dark-gray)' : 'var(--twitter-blue)';
      }}
    >
      {loading ? (
        <>
          <div className="loading-spinner" style={{ width: '16px', height: '16px' }}></div>
          Loading...
        </>
      ) : (
        <>
          <Send size={16} />
          {text}
        </>
      )}
    </button>
  );
};

export const PopoverFormSuccess = ({ title, description }) => {
  return (
    <div style={{ 
      padding: '32px 24px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        backgroundColor: 'var(--twitter-green)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <CheckCircle size={24} color="white" />
      </div>
      <div>
        <h4 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          color: 'var(--twitter-black)',
          margin: '0 0 8px 0'
        }}>
          {title}
        </h4>
        <p style={{ 
          fontSize: '14px', 
          color: 'var(--twitter-dark-gray)',
          margin: 0,
          lineHeight: '1.5'
        }}>
          {description}
        </p>
      </div>
    </div>
  );
};

export const PopoverFormSeparator = () => (
  <div style={{ 
    width: '100%', 
    height: '1px', 
    backgroundColor: 'var(--twitter-border)' 
  }} />
);

export const PopoverFormCutOutLeftIcon = () => (
  <div style={{
    width: '12px',
    height: '12px',
    backgroundColor: 'var(--twitter-background)',
    border: '1px solid var(--twitter-border)',
    borderRight: 'none',
    borderBottom: 'none',
    transform: 'rotate(-45deg)',
    position: 'absolute',
    left: '0',
    top: '50%',
    marginTop: '-6px'
  }} />
);

export const PopoverFormCutOutRightIcon = () => (
  <div style={{
    width: '12px',
    height: '12px',
    backgroundColor: 'var(--twitter-background)',
    border: '1px solid var(--twitter-border)',
    borderLeft: 'none',
    borderTop: 'none',
    transform: 'rotate(-45deg)',
    position: 'absolute',
    right: '0',
    top: '50%',
    marginTop: '-6px'
  }} />
);
