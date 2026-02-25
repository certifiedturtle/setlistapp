import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGigStore } from '@/store/gigStore'

interface CreateGigModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  bandId: string
}

export function CreateGigModal({ isOpen, onClose, userId, bandId }: CreateGigModalProps) {
  const { addGig } = useGigStore()
  const [venue, setVenue] = useState('')
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) { setVenue(''); setDate(''); setError(null) }
  }, [isOpen])

  async function handleCreate() {
    if (!venue.trim() || !date) return
    setLoading(true)
    setError(null)
    const ok = await addGig(userId, bandId, venue.trim(), date)
    if (!ok) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
      return
    }
    setLoading(false)
    onClose()
  }

  const canSave = venue.trim().length > 0 && date.length > 0

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-dialog"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sheet-header">
              <button className="sheet-cancel" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <span className="sheet-title">New Gig</span>
              <button className="sheet-confirm" onClick={handleCreate} disabled={!canSave || loading}>
                {loading ? 'Saving…' : 'Save'}
              </button>
            </div>
            <div style={{ padding: '12px 16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                autoFocus
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
                placeholder="Venue name"
                style={inputStyle}
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={inputStyle}
              />
              {error && (
                <p style={{ fontSize: 14, color: 'var(--accent-2)', margin: 0, textAlign: 'center' }}>
                  {error}
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  fontSize: 16,
  color: 'var(--text-primary)',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--r-md)',
  padding: '10px 12px',
  outline: 'none',
  boxSizing: 'border-box',
}
