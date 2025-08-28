'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Eye, Brain, Shield, Clock, Image, MessageSquare } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

interface VisionAnalysis {
  labels: Array<{ name: string; confidence: number }>
  objects_detected: number
  text_detected: boolean
  safety_rating: string
  processing_time: number
}

interface CredibilityPopupProps {
  isOpen: boolean
  onClose: () => void
  data: {
    confidence_score: number
    ai_score: number
    vision_score?: number | null
    status: string
    vision_analysis?: VisionAnalysis | null
    user_credibility_updated?: number | null
  }
}

const CredibilityPopup = ({ isOpen, onClose, data }: CredibilityPopupProps) => {
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'vision'>('overview')

  if (!isOpen) return null

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#00ba7c'
    if (score >= 60) return '#ffd400'
    return '#f4212e'
  }

  const getStatusIcon = (status: string) => {
    return status === 'verified' ? 
      <CheckCircle size={18} style={{ color: '#00ba7c' }} /> : 
      <AlertCircle size={18} style={{ color: '#ffd400' }} />
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'flex-end', // Mobile: slide from bottom
            justifyContent: 'center',
            zIndex: 1000,
            padding: '0'
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ 
              type: "spring", 
              damping: 30, 
              stiffness: 400,
              mass: 0.8
            }}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: isDark ? '#111' : '#fff',
              borderRadius: '20px 20px 0 0', // Mobile: rounded top corners only
              width: '100%',
              maxWidth: '100vw',
              maxHeight: '85vh', // Mobile: don't cover entire screen
              overflow: 'hidden',
              boxShadow: isDark 
                ? '0 -8px 32px rgba(255, 255, 255, 0.1)' 
                : '0 -8px 32px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Mobile Header with Handle */}
            <div style={{
              padding: '8px 0',
              display: 'flex',
              justifyContent: 'center',
              backgroundColor: isDark ? '#111' : '#fff'
            }}>
              <div style={{
                width: '40px',
                height: '4px',
                backgroundColor: isDark ? '#333' : '#ddd',
                borderRadius: '2px'
              }} />
            </div>

            {/* Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: `1px solid ${isDark ? '#333' : '#eee'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: isDark 
                ? 'linear-gradient(135deg, #1d9bf0, #0066cc)' 
                : 'linear-gradient(135deg, #1d9bf0, #0066cc)'
            }}>
              <div style={{ color: '#fff', flex: 1 }}>
                <h2 style={{ 
                  margin: 0, 
                  fontSize: '1.2rem', // Smaller for mobile
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Brain size={20} />
                  AI Analysis
                </h2>
                <p style={{ 
                  margin: '4px 0 0 0', 
                  fontSize: '0.8rem', 
                  opacity: 0.9 
                }}>
                  Multi-AI verification complete
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#fff'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Mobile-Optimized Tabs */}
            <div style={{
              display: 'flex',
              borderBottom: `1px solid ${isDark ? '#333' : '#eee'}`,
              backgroundColor: isDark ? '#111' : '#fff'
            }}>
              {[
                { id: 'overview', name: 'Overview', icon: CheckCircle },
                { id: 'details', name: 'AI Details', icon: Brain },
                { id: 'vision', name: 'Vision', icon: Eye }
              ].map((tab) => {
                const IconComponent = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    style={{
                      flex: 1,
                      padding: '12px 8px',
                      border: 'none',
                      backgroundColor: isActive 
                        ? (isDark ? '#222' : '#f7f9fa') 
                        : 'transparent',
                      borderBottom: isActive ? '3px solid #1d9bf0' : '3px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      fontSize: '0.8rem',
                      fontWeight: isActive ? '600' : '400',
                      color: isActive 
                        ? '#1d9bf0' 
                        : (isDark ? '#888' : '#666')
                    }}
                  >
                    <IconComponent size={16} />
                    <span>{tab.name}</span>
                  </button>
                )
              })}
            </div>

            {/* Scrollable Content */}
            <div style={{ 
              flex: 1,
              overflow: 'auto',
              backgroundColor: isDark ? '#111' : '#fff'
            }}>
              <div style={{ padding: '20px' }}>
                {activeTab === 'overview' && (
                  <div>
                    {/* Mobile-Optimized Overall Score */}
                    <div style={{
                      textAlign: 'center',
                      marginBottom: '24px'
                    }}>
                      <div style={{
                        fontSize: '2.5rem', // Smaller for mobile
                        fontWeight: 'bold',
                        color: getScoreColor(data.confidence_score),
                        marginBottom: '8px'
                      }}>
                        {data.confidence_score}%
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: isDark ? '#fff' : '#333'
                      }}>
                        {getStatusIcon(data.status)}
                        Post {data.status === 'verified' ? 'Verified' : 'Under Review'}
                      </div>
                    </div>

                    {/* Mobile Score Breakdown */}
                    <div style={{ marginBottom: '20px' }}>
                      <h3 style={{ 
                        fontSize: '1rem', 
                        marginBottom: '16px',
                        color: isDark ? '#fff' : '#333'
                      }}>
                        Analysis Breakdown
                      </h3>
                      
                      {/* Gemini AI Score */}
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '8px'
                        }}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            fontSize: '0.9rem',
                            color: isDark ? '#ccc' : '#666'
                          }}>
                            <Brain size={16} />
                            Gemini AI
                          </div>
                          <span style={{ 
                            fontWeight: '600',
                            color: isDark ? '#fff' : '#333'
                          }}>
                            {data.ai_score}%
                          </span>
                        </div>
                        <div style={{
                          height: '8px',
                          backgroundColor: isDark ? '#333' : '#f0f0f0',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${data.ai_score}%`,
                            backgroundColor: getScoreColor(data.ai_score),
                            borderRadius: '4px',
                            transition: 'width 0.5s ease-out'
                          }} />
                        </div>
                      </div>

                      {/* Vision AI Score */}
                      {data.vision_score && (
                        <div style={{ marginBottom: '16px' }}>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '8px'
                          }}>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '8px',
                              fontSize: '0.9rem',
                              color: isDark ? '#ccc' : '#666'
                            }}>
                              <Eye size={16} />
                              Vision AI
                            </div>
                            <span style={{ 
                              fontWeight: '600',
                              color: isDark ? '#fff' : '#333'
                            }}>
                              {data.vision_score}%
                            </span>
                          </div>
                          <div style={{
                            height: '8px',
                            backgroundColor: isDark ? '#333' : '#f0f0f0',
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              height: '100%',
                              width: `${data.vision_score}%`,
                              backgroundColor: getScoreColor(data.vision_score),
                              borderRadius: '4px',
                              transition: 'width 0.5s ease-out'
                            }} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Mobile User Credibility Update */}
                    {data.user_credibility_updated && (
                      <div style={{
                        padding: '16px',
                        backgroundColor: isDark ? '#1a2b3d' : '#e8f4f8',
                        borderRadius: '12px',
                        border: `1px solid ${isDark ? '#1d9bf040' : '#1d9bf020'}`
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          marginBottom: '8px'
                        }}>
                          <Shield size={16} style={{ color: '#1d9bf0' }} />
                          <span style={{ 
                            fontWeight: '600', 
                            color: '#1d9bf0',
                            fontSize: '0.9rem'
                          }}>
                            Profile Updated
                          </span>
                        </div>
                        <p style={{ 
                          fontSize: '0.9rem', 
                          color: isDark ? '#ccc' : '#666', 
                          margin: 0,
                          lineHeight: 1.4
                        }}>
                          Your credibility score: {data.user_credibility_updated}%
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'details' && (
                  <div>
                    <div style={{
                      padding: '16px',
                      backgroundColor: isDark ? '#1a1a1a' : '#f9f9f9',
                      borderRadius: '12px',
                      border: `1px solid ${isDark ? '#333' : '#eee'}`
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '12px'
                      }}>
                        <Brain size={18} style={{ color: '#1d9bf0' }} />
                        <h3 style={{ 
                          fontSize: '1rem', 
                          margin: 0,
                          color: isDark ? '#fff' : '#333'
                        }}>
                          Gemini AI Assessment
                        </h3>
                      </div>
                      
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px'
                      }}>
                        <span style={{ 
                          fontWeight: '600',
                          color: isDark ? '#ccc' : '#666'
                        }}>
                          Credibility Score
                        </span>
                        <span style={{ 
                          fontSize: '1.4rem',
                          fontWeight: 'bold',
                          color: getScoreColor(data.ai_score)
                        }}>
                          {data.ai_score}%
                        </span>
                      </div>
                      
                      <p style={{ 
                        fontSize: '0.9rem', 
                        color: isDark ? '#aaa' : '#666', 
                        margin: 0,
                        lineHeight: 1.5
                      }}>
                        AI analysis of content quality, location relevance, 
                        description detail, and overall plausibility.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'vision' && (
                  <div>
                    {data.vision_analysis ? (
                      <>
                        {/* Mobile Vision Stats Grid */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '12px',
                          marginBottom: '20px'
                        }}>
                          <div style={{
                            padding: '16px',
                            backgroundColor: isDark ? '#1a1a1a' : '#f9f9f9',
                            borderRadius: '12px',
                            textAlign: 'center',
                            border: `1px solid ${isDark ? '#333' : '#eee'}`
                          }}>
                            <div style={{ 
                              fontSize: '1.4rem', 
                              fontWeight: 'bold',
                              color: getScoreColor(data.vision_score || 0),
                              marginBottom: '4px'
                            }}>
                              {data.vision_score}%
                            </div>
                            <div style={{ 
                              fontSize: '0.8rem', 
                              color: isDark ? '#888' : '#666' 
                            }}>
                              Vision Score
                            </div>
                          </div>
                          
                          <div style={{
                            padding: '16px',
                            backgroundColor: isDark ? '#1a1a1a' : '#f9f9f9',
                            borderRadius: '12px',
                            textAlign: 'center',
                            border: `1px solid ${isDark ? '#333' : '#eee'}`
                          }}>
                            <div style={{ 
                              fontSize: '1.4rem', 
                              fontWeight: 'bold',
                              color: '#1d9bf0',
                              marginBottom: '4px'
                            }}>
                              {data.vision_analysis.objects_detected}
                            </div>
                            <div style={{ 
                              fontSize: '0.8rem', 
                              color: isDark ? '#888' : '#666' 
                            }}>
                              Objects
                            </div>
                          </div>
                        </div>

                        {/* Mobile Labels */}
                        <div style={{ marginBottom: '20px' }}>
                          <h4 style={{ 
                            fontSize: '0.9rem', 
                            marginBottom: '12px',
                            color: isDark ? '#fff' : '#333'
                          }}>
                            Detected Elements
                          </h4>
                          <div style={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: '8px' 
                          }}>
                            {data.vision_analysis.labels.slice(0, 6).map((label, index) => (
                              <span
                                key={index}
                                style={{
                                  padding: '6px 10px',
                                  backgroundColor: isDark ? '#1d9bf020' : '#e8f4f8',
                                  color: '#1d9bf0',
                                  borderRadius: '16px',
                                  fontSize: '0.8rem',
                                  fontWeight: '500',
                                  border: `1px solid ${isDark ? '#1d9bf040' : '#1d9bf020'}`
                                }}
                              >
                                {label.name} ({label.confidence}%)
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Mobile Analysis Details */}
                        <div style={{
                          padding: '16px',
                          backgroundColor: isDark ? '#0a1a0a' : '#f0f8ff',
                          borderRadius: '12px',
                          border: `1px solid ${isDark ? '#00ba7c20' : '#e0f0ff'}`
                        }}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            marginBottom: '8px'
                          }}>
                            <Shield size={16} style={{ color: '#00ba7c' }} />
                            <span style={{ 
                              fontWeight: '600', 
                              color: '#00ba7c',
                              fontSize: '0.9rem'
                            }}>
                              Safety: {data.vision_analysis.safety_rating}
                            </span>
                          </div>
                          
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            marginBottom: '8px'
                          }}>
                            <Clock size={16} style={{ color: isDark ? '#888' : '#666' }} />
                            <span style={{ 
                              fontSize: '0.9rem', 
                              color: isDark ? '#888' : '#666' 
                            }}>
                              Processed in {data.vision_analysis.processing_time}ms
                            </span>
                          </div>
                          
                          {data.vision_analysis.text_detected && (
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '8px'
                            }}>
                              <MessageSquare size={16} style={{ color: '#1d9bf0' }} />
                              <span style={{ 
                                fontSize: '0.9rem', 
                                color: '#1d9bf0' 
                              }}>
                                Text detected in image
                              </span>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                        color: isDark ? '#888' : '#666'
                      }}>
                        <Image size={48} style={{ 
                          marginBottom: '16px',
                          color: isDark ? '#444' : '#ccc'
                        }} />
                        <p style={{ 
                          margin: 0,
                          fontSize: '0.9rem'
                        }}>
                          No image uploaded for Vision AI analysis
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Footer */}
            <div style={{
              padding: '16px 20px 20px',
              backgroundColor: isDark ? '#111' : '#f9f9f9',
              borderTop: `1px solid ${isDark ? '#333' : '#eee'}`
            }}>
              <button
                onClick={onClose}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: '#1d9bf0',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                Continue to Home
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CredibilityPopup
