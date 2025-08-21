import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Copy, 
  Check, 
  Instagram, 
  Linkedin, 
  Twitter, 
  MessageCircle, 
  Camera, 
  MessageSquare, 
  Share2, 
  Mail,
  ExternalLink
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ShareModal = ({ isOpen, onClose, incident }) => {
  const { isDark } = useTheme();
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/incident/${incident?.id}`;
  const shareText = `${incident?.title} - ${incident?.description}`;

  const shareOptions = [
    {
      name: 'Copy Link',
      icon: copied ? Check : Copy,
      color: copied ? 'var(--twitter-green)' : 'var(--twitter-blue)',
      action: () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    },
    {
      name: 'X (Twitter)',
      icon: Twitter,
      color: '#1DA1F2',
      action: () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank');
      }
    },
    {
      name: 'Instagram',
      icon: Instagram,
      color: '#E4405F',
      action: () => {
        // Instagram doesn't support direct sharing via URL, so we copy the link
        navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: '#0077B5',
      action: () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank');
      }
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: '#25D366',
      action: () => {
        const url = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
        window.open(url, '_blank');
      }
    },
    {
      name: 'Snapchat',
      icon: Camera,
      color: '#FFFC00',
      action: () => {
        // Snapchat doesn't support direct sharing via URL, so we copy the link
        navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    },
    {
      name: 'Discord',
      icon: MessageSquare,
      color: '#5865F2',
      action: () => {
        // Discord doesn't support direct sharing via URL, so we copy the link
        navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    },
    {
      name: 'Reddit',
      icon: Share2,
      color: '#FF4500',
      action: () => {
        const url = `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(incident?.title)}`;
        window.open(url, '_blank');
      }
    },
    {
      name: 'Telegram',
      icon: MessageSquare,
      color: '#0088CC',
      action: () => {
        const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank');
      }
    },
    {
      name: 'Gmail',
      icon: Mail,
      color: '#EA4335',
      action: () => {
        const url = `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${encodeURIComponent(incident?.title)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
        window.open(url, '_blank');
      }
    }
  ];

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--spacing-lg)'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            style={{
              background: 'var(--twitter-background)',
              borderRadius: '16px 16px 0 0',
              padding: 'var(--spacing-lg)',
              width: '100%',
              maxWidth: '428px',
              maxHeight: '80vh',
              overflow: 'hidden'
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: 'var(--spacing-lg)',
              paddingBottom: 'var(--spacing-md)',
              borderBottom: '1px solid var(--twitter-border)'
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '18px', 
                fontWeight: '700', 
                color: 'var(--twitter-black)' 
              }}>
                Share Incident
              </h3>
              <motion.button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--twitter-dark-gray)',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                whileHover={{ scale: 1.1, backgroundColor: 'var(--twitter-light-gray)' }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Incident Preview */}
            {incident && (
              <motion.div
                style={{
                  background: 'var(--twitter-secondary-bg)',
                  borderRadius: '12px',
                  padding: 'var(--spacing-md)',
                  marginBottom: 'var(--spacing-lg)',
                  border: '1px solid var(--twitter-border)'
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h4 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: 'var(--twitter-black)' 
                }}>
                  {incident.title}
                </h4>
                <p style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '14px', 
                  color: 'var(--twitter-dark-gray)',
                  lineHeight: '1.4'
                }}>
                  {incident.description}
                </p>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 'var(--spacing-sm)', 
                  fontSize: '12px', 
                  color: 'var(--twitter-dark-gray)' 
                }}>
                  <span>{incident.time}</span>
                  <span>•</span>
                  <span>{incident.location}</span>
                </div>
              </motion.div>
            )}

            {/* Share Options Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: 'var(--spacing-md)',
              marginBottom: 'var(--spacing-lg)'
            }}>
              {shareOptions.map((option, index) => {
                const IconComponent = option.icon;
                return (
                  <motion.button
                    key={option.name}
                    onClick={option.action}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      padding: 'var(--spacing-md)',
                      background: 'var(--twitter-background)',
                      border: '1px solid var(--twitter-border)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    whileHover={{ 
                      scale: 1.05, 
                      backgroundColor: 'var(--twitter-secondary-bg)',
                      borderColor: option.color
                    }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: option.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}>
                      <IconComponent size={24} />
                    </div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: 'var(--twitter-black)',
                      textAlign: 'center'
                    }}>
                      {option.name}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Copy Link Section */}
            <motion.div
              style={{
                background: 'var(--twitter-secondary-bg)',
                borderRadius: '12px',
                padding: 'var(--spacing-md)',
                border: '1px solid var(--twitter-border)'
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                gap: 'var(--spacing-sm)'
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ 
                    margin: '0 0 4px 0', 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    color: 'var(--twitter-dark-gray)' 
                  }}>
                    Direct Link
                  </p>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '14px', 
                    color: 'var(--twitter-blue)', 
                    wordBreak: 'break-all',
                    fontFamily: 'monospace'
                  }}>
                    {shareUrl}
                  </p>
                </div>
                <motion.button
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  style={{
                    background: copied ? 'var(--twitter-green)' : 'var(--twitter-blue)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    whiteSpace: 'nowrap'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
                </motion.button>
              </div>
            </motion.div>

            {/* Success Message */}
            {copied && (
              <motion.div
                style={{
                  position: 'absolute',
                  top: '20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--twitter-green)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  zIndex: 1001
                }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Check size={16} />
                Link copied to clipboard!
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;
