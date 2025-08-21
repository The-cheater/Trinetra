import { useState, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const StackedDialogContext = createContext();

export const useStackedDialog = () => {
  const context = useContext(StackedDialogContext);
  if (!context) {
    throw new Error('useStackedDialog must be used within a StackedDialogProvider');
  }
  return context;
};

export const StackedDialogProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [items, setItems] = useState([]);

  const openDialog = (newItems, startIndex = 0) => {
    setItems(newItems);
    setCurrentIndex(startIndex);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setCurrentIndex(0);
    setItems([]);
  };

  const goToNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const value = {
    isOpen,
    currentIndex,
    items,
    openDialog,
    closeDialog,
    goToNext,
    goToPrevious
  };

  return (
    <StackedDialogContext.Provider value={value}>
      {children}
    </StackedDialogContext.Provider>
  );
};

export const StackedDialog = ({ children }) => {
  const { isOpen, closeDialog, items, currentIndex } = useStackedDialog();

  return (
    <AnimatePresence>
      {isOpen && items.length > 0 && (
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
            className="absolute inset-0 stacked-dialog-backdrop"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDialog}
          />
          
          {/* Dialog Content */}
          <motion.div
            className="relative z-10"
            style={{ 
              width: '100%', 
              maxWidth: '400px', 
              margin: '0 16px'
            }}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <StackedDialogContent 
              item={items[currentIndex]} 
              index={currentIndex} 
              total={items.length} 
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const StackedDialogContent = ({ item, index, total }) => {
  const { closeDialog, goToNext, goToPrevious, currentIndex } = useStackedDialog();
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === total - 1;

  return (
    <motion.div
      className="stacked-dialog-content rounded-2xl shadow-2xl overflow-hidden"
      style={{ 
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="stacked-dialog-header" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                background: 'linear-gradient(135deg, var(--twitter-blue), #7920D0)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <span style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>
                  {index + 1}
                </span>
              </div>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--twitter-black)', margin: 0 }}>
                  {item.title}
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--twitter-dark-gray)', margin: 0 }}>
                  {item.description}
                </p>
              </div>
            </div>
            <button
              onClick={closeDialog}
              style={{
                padding: '8px',
                borderRadius: '50%',
                transition: 'all 0.2s ease',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--twitter-light-gray)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <X size={20} style={{ color: 'var(--twitter-dark-gray)' }} />
            </button>
          </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {item.content}
        </div>
      </div>

      {/* Footer */}
      <div className="stacked-dialog-footer" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={goToPrevious}
          disabled={isFirst}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            transition: 'all 0.2s ease',
            color: isFirst ? 'var(--twitter-dark-gray)' : 'var(--twitter-black)',
            cursor: isFirst ? 'not-allowed' : 'pointer',
            opacity: isFirst ? 0.5 : 1
          }}
          onMouseEnter={(e) => {
            if (!isFirst) {
              e.target.style.backgroundColor = 'var(--twitter-light-gray)';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          <ChevronLeft size={16} />
          Previous
        </button>
        
        <span style={{ fontSize: '14px', color: 'var(--twitter-dark-gray)' }}>
          {currentIndex + 1} of {total}
        </span>
        
        <button
          onClick={goToNext}
          disabled={isLast}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            transition: 'all 0.2s ease',
            color: isLast ? 'var(--twitter-dark-gray)' : 'var(--twitter-black)',
            cursor: isLast ? 'not-allowed' : 'pointer',
            opacity: isLast ? 0.5 : 1
          }}
          onMouseEnter={(e) => {
            if (!isLast) {
              e.target.style.backgroundColor = 'var(--twitter-light-gray)';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </motion.div>
  );
};

export const StackedDialogTrigger = ({ children, items, startIndex = 0 }) => {
  const { openDialog } = useStackedDialog();

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    openDialog(items, startIndex);
  };

  return (
    <div onClick={handleClick} style={{ cursor: 'pointer' }}>
      {children}
    </div>
  );
};
