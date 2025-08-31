import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Send, Trash2, User } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

interface Comment {
  _id: string
  author: string
  comment: string
  createdAt: string
  userId: string
}

interface CommentSectionProps {
  postId: string
  onClose: () => void
}

const CommentSection = ({ postId, onClose }: CommentSectionProps) => {
  const { isDark } = useTheme()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentUserId = localStorage.getItem('user_id')

  const fetchComments = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/comments/${postId}`)
      const data = await response.json()
      
      if (data.success) {
        setComments(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setIsLoading(false)
    }
  }, [postId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newComment.trim()) return

    const token = localStorage.getItem('access_token')
    if (!token) {
      alert('Please login to comment')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          postId,
          comment: newComment.trim()
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setComments([data.data, ...comments])
        setNewComment('')
      } else {
        alert(data.message || 'Failed to add comment')
      }
    } catch (error) {
      console.error('Failed to add comment:', error)
      alert('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    const token = localStorage.getItem('access_token')
    if (!token) return

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (data.success) {
        setComments(comments.filter(c => c._id !== commentId))
      } else {
        alert(data.message || 'Failed to delete comment')
      }
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'flex-end',
      zIndex: 1000
    }}>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        style={{
          width: '100%',
          maxHeight: '80vh',
          backgroundColor: isDark ? '#111' : '#fff',
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
          padding: 'var(--spacing-lg)',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--spacing-lg)',
          paddingBottom: 'var(--spacing-md)',
          borderBottom: `1px solid ${isDark ? '#333' : '#eee'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            <MessageCircle size={20} style={{ color: '#1d9bf0' }} />
            <h3 style={{ color: isDark ? '#fff' : '#000', margin: 0 }}>
              Comments ({comments.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              color: isDark ? '#888' : '#666',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>

        {/* Comment Form */}
        <form onSubmit={handleSubmit} style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              style={{
                flex: 1,
                padding: 'var(--spacing-md)',
                border: `2px solid ${isDark ? '#333' : '#e1e8ed'}`,
                borderRadius: 'var(--radius-md)',
                backgroundColor: isDark ? '#0a0a0a' : '#f9f9f9',
                color: isDark ? '#fff' : '#000',
                fontSize: '0.9rem',
                resize: 'vertical'
              }}
            />
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              style={{
                padding: 'var(--spacing-sm)',
                backgroundColor: '#1d9bf0',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting || !newComment.trim() ? 0.6 : 1,
                alignSelf: 'flex-start'
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: isDark ? '#888' : '#666' }}>
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: isDark ? '#888' : '#666' }}>
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment._id}
                style={{
                  padding: 'var(--spacing-md)',
                  borderBottom: `1px solid ${isDark ? '#333' : '#eee'}`,
                  marginBottom: 'var(--spacing-sm)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-sm)' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#1d9bf0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <User size={16} style={{ color: '#fff' }} />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                      <span style={{ 
                        fontWeight: '600', 
                        color: isDark ? '#fff' : '#000',
                        fontSize: '0.9rem'
                      }}>
                        {comment.author}
                      </span>
                      <span style={{ 
                        fontSize: '0.8rem', 
                        color: isDark ? '#888' : '#666' 
                      }}>
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                      {comment.userId === currentUserId && (
                        <button
                          onClick={() => handleDelete(comment._id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#f4212e'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <p style={{ 
                      color: isDark ? '#ccc' : '#666',
                      margin: 0,
                      fontSize: '0.9rem'
                    }}>
                      {comment.comment}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default CommentSection
