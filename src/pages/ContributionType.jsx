import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, Construction, AlertTriangle, MapPin, Shield, Users, TrendingUp } from 'lucide-react';
import Logo from '../components/Logo';

const ContributionType = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('');

  const contributionTypes = [
    { id: 'traffic', name: 'Traffic Incident', description: 'Report accidents, congestion, or traffic violations', icon: Car, color: 'var(--twitter-red)', examples: ['Car accidents', 'Traffic jams', 'Speeding vehicles'] },
    { id: 'construction', name: 'Road Work', description: 'Report construction zones and maintenance work', icon: Construction, color: 'var(--twitter-yellow)', examples: ['Road repairs', 'Lane closures', 'Construction zones'] },
    { id: 'hazard', name: 'Road Hazard', description: 'Report dangerous road conditions', icon: AlertTriangle, color: 'var(--twitter-green)', examples: ['Potholes', 'Broken glass', 'Debris on road'] },
    { id: 'safety', name: 'Safety Issue', description: 'Report safety concerns and violations', icon: Shield, color: 'var(--twitter-blue)', examples: ['Broken traffic lights', 'Missing signs', 'Unsafe conditions'] },
    { id: 'community', name: 'Community Alert', description: 'Share important community information', icon: Users, color: 'var(--twitter-blue)', examples: ['Events affecting traffic', 'Local announcements', 'Community updates'] },
    { id: 'trending', name: 'Trending Issue', description: 'Report recurring problems in your area', icon: TrendingUp, color: 'var(--twitter-green)', examples: ['Frequent accidents', 'Chronic congestion', 'Repeated hazards'] }
  ];

  const handleTypeSelect = (typeId) => {
    setSelectedType(typeId);
    setTimeout(() => {
      navigate('/contribute', { state: { selectedType: typeId } });
    }, 500);
  };

  return (
    <div className="main-container">
      <div className="page-header">
        <div className="header-logo">
          <Logo size="small" />
        </div>
      </div>

      <div className="content-container">
        {/* Hero */}
        <motion.div 
          className="card type-hero"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="card-title" style={{ marginBottom: '6px' }}>Report an Incident</h1>
          <p style={{ color: 'var(--twitter-dark-gray)' }}>Pick the category that best matches what you see.</p>
        </motion.div>

        {/* Types grid */}
        <div className="type-grid">
          {contributionTypes.map((type, index) => {
            const IconComponent = type.icon;
            const isSelected = selectedType === type.id;
            return (
              <motion.button
                key={type.id}
                className={`type-card ${isSelected ? 'active' : ''}`}
                onClick={() => handleTypeSelect(type.id)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ borderColor: isSelected ? type.color : 'var(--twitter-border)' }}
              >
                <div className="type-card-header">
                  <div className="type-icon" style={{ background: isSelected ? type.color : 'var(--twitter-light-gray)', borderColor: isSelected ? type.color : 'var(--twitter-border)' }}>
                    <IconComponent size={22} color={isSelected ? 'white' : type.color} />
                  </div>
                  <span className="type-name" style={{ color: isSelected ? type.color : 'var(--twitter-black)' }}>{type.name}</span>
                </div>
                <p className="type-desc">{type.description}</p>
                <div className="type-chips">
                  {type.examples.map((example, idx) => (
                    <span key={idx} className="type-chip" style={{ color: isSelected ? type.color : 'var(--twitter-dark-gray)', background: isSelected ? (type.color + '20') : 'var(--twitter-light-gray)' }}>{example}</span>
                  ))}
                </div>
                {isSelected && (
                  <motion.div className="type-selected" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <Shield size={12} color="white" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h3 className="card-title">Tips</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--twitter-dark-gray)' }}>
            Clear categories help responders act faster. Choose the closest match – you can add details on the next screen.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ContributionType;
