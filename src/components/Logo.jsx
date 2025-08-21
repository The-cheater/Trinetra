import { motion } from 'framer-motion';

const Logo = ({ size = 'medium', showText = true }) => {
  const sizes = {
    small: { width: 150, height: 36 },
    medium: { width: 170, height: 46 },
    large: { width: 220, height: 55 }
  };

  const currentSize = sizes[size];

  return (
    <motion.div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <img
        src="/logo.png"
        alt="Trinetra Logo"
        style={{
          width: currentSize.width,
          height: currentSize.height,
          objectFit: 'contain'
        }}
      />
    </motion.div>
  );
};

export default Logo;
