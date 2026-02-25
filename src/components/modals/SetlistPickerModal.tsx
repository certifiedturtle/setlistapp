import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Link2, Plus, Unlink } from 'lucide-react'
import { useSetlistStore } from '@/store/setlistStore'

interface Props {
  isOpen: boolean
  onClose: () => void
  linkedSetlistId: string | undefined
  onSelect: (setlistId: string | null) => void
  onCreateNew: () => void
}

export function SetlistPickerModal({ isOpen, onClose, linkedSetlistId, onSelect, onCreateNew }: Props) {
  const setlists = useSetlistStore((s) => s.setlists)

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
            style={{ maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0,
            }}>
              <span style={{
                fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16,
                color: 'var(--text-primary)',
              }}>
                Link Setlist
              </span>
              <button
                onClick={onClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-secondary)', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable list */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {/* Remove link row */}
              {linkedSetlistId && (
                <button
                  onClick={() => { onSelect(null); onClose() }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '14px 16px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    borderBottom: '1px solid var(--border)',
                    color: 'var(--accent-2, #e74c3c)',
                  }}
                >
                  <Unlink size={16} />
                  <span style={{ fontSize: 15, fontWeight: 600 }}>Remove link</span>
                </button>
              )}

              {setlists.length === 0 ? (
                <div style={{ padding: '20px 16px', fontSize: 14, color: 'var(--text-muted)', textAlign: 'center' }}>
                  No setlists yet
                </div>
              ) : (
                setlists.map((sl) => {
                  const isLinked = sl.id === linkedSetlistId
                  return (
                    <button
                      key={sl.id}
                      onClick={() => { onSelect(sl.id); onClose() }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        width: '100%', padding: '14px 16px',
                        background: 'none', border: 'none', cursor: 'pointer',
                        borderBottom: '1px solid var(--border)',
                        textAlign: 'left',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                          {sl.name}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                          {sl.songs.length} song{sl.songs.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      {isLinked && <Check size={18} color="var(--accent)" />}
                    </button>
                  )
                })
              )}
            </div>

            {/* Create new row */}
            <div style={{ borderTop: '1px solid var(--border)', flexShrink: 0 }}>
              <button
                onClick={() => { onCreateNew(); onClose() }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '14px 16px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--accent)',
                }}
              >
                <Plus size={16} />
                <span style={{ fontSize: 15, fontWeight: 600 }}>Create new setlist</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
