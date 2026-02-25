import { useEffect, useState } from 'react'
import { BottomSheet } from '@/components/modals/BottomSheet'
import { useBandStore } from '@/store/bandStore'
import { useSongStore } from '@/store/songStore'
import { useSetlistStore } from '@/store/setlistStore'
import { supabase } from '@/lib/supabase'

interface CreateBandModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateBandModal({ isOpen, onClose }: CreateBandModalProps) {
  const { createBand } = useBandStore()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset input every time the sheet opens
  useEffect(() => {
    if (isOpen) {
      setName('')
      setError(null)
    }
  }, [isOpen])

  async function handleCreate() {
    const trimmed = name.trim()
    if (!trimmed) return
    setLoading(true)
    setError(null)
    const bandId = await createBand(trimmed)
    if (!bandId) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
      return
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      useSongStore.setState({ initialized: false })
      useSetlistStore.setState({ initialized: false })
      await useSongStore.getState().initialize(user.id, bandId)
      await useSetlistStore.getState().initialize(user.id, bandId)
    }
    setLoading(false)
    onClose()
  }

  function handleClose() {
    setError(null)
    onClose()
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose}>
      <div className="sheet-header">
        <button className="sheet-cancel" onClick={handleClose} disabled={loading}>
          Cancel
        </button>
        <span className="sheet-title">Name Your Band</span>
        <button
          className="sheet-confirm"
          onClick={handleCreate}
          disabled={!name.trim() || loading}
        >
          {loading ? 'Saving…' : 'Save'}
        </button>
      </div>
      <div className="sheet-content" style={{ padding: '16px' }}>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
          placeholder="Band name"
          style={{
            width: '100%',
            fontSize: 16,
            color: 'var(--text-primary)',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)',
            padding: '10px 12px',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        {error && (
          <p style={{ fontSize: 14, color: 'var(--accent-2)', margin: '8px 0 0', textAlign: 'center' }}>
            {error}
          </p>
        )}
      </div>
    </BottomSheet>
  )
}
