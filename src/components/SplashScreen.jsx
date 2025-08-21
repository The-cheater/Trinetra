import { motion } from 'framer-motion';
import { Shield, MapPin, Users } from 'lucide-react';

const SplashScreen = () => {
  return (
    <div className="splash-screen">
      <motion.div
        className="splash-logo"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 1, type: "spring", stiffness: 200 }}
      >
        <Shield size={48} color="white" />
      </motion.div>
      
      <motion.h1
        className="splash-title"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        TRINETRA
      </motion.h1>
      
      <motion.p
        className="splash-subtitle"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        Community-driven traffic and road incident reporting
      </motion.p>
      
      <motion.div
        style={{
          position: 'absolute',
          bottom: '20%',
          display: 'flex',
          gap: 'var(--spacing-2xl)',
          opacity: 0.7
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.7, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0 }}
        >
          <MapPin size={24} color="white" />
        </motion.div>
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        >
          <Shield size={24} color="white" />
        </motion.div>
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        >
          <Users size={24} color="white" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
