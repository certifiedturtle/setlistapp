import { useState } from 'react'
import { BottomSheet } from '@/components/modals/BottomSheet'
import { useBandStore } from '@/store/bandStore'
import { useSongStore } from '@/store/songStore'
import { useSetlistStore } from '@/store/setlistStore'
import { supabase } from '@/lib/supabase'

const ERRORS: Record<string, string> = {
  invite_not_found:    'This invite link is invalid.',
  invite_already_used: 'This invite link has already been used.',
  invite_expired:      'This invite has expired. Ask the band admin for a new one.',
  already_in_band:     'You are already a member of a band.',
  not_authenticated:   'Please sign in to join a band.',
}

interface JoinBandModalProps {
  isOpen: boolean
  token: string | null
  onClose: () => void
}

export function JoinBandModal({ isOpen, token, onClose }: JoinBandModalProps) {
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { acceptInvite } = useBandStore()

  async function handleJoin() {
    if (!token) return
    setLoading(true)
    setErrorMessage(null)

    const result = await acceptInvite(token)

    if ('error' in result) {
      setErrorMessage(ERRORS[result.error] ?? 'Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    // Reload song and setlist stores with the new band
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      useSongStore.setState({ initialized: false })
      useSetlistStore.setState({ initialized: false })
      await useSongStore.getState().initialize(user.id, result.band_id)
      await useSetlistStore.getState().initialize(user.id, result.band_id)
    }

    setLoading(false)
    onClose()
  }

  function handleDecline() {
    setErrorMessage(null)
    onClose()
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={handleDecline}>
      <div className="sheet-header">
        <button className="sheet-cancel" onClick={handleDecline} disabled={loading}>
          Decline
        </button>
        <span className="sheet-title">Join Band</span>
        <button
          className="sheet-confirm"
          onClick={handleJoin}
          disabled={loading || !token}
        >
          {loading ? 'Joining…' : 'Join Band'}
        </button>
      </div>
      <div className="sheet-content" style={{ padding: '16px', textAlign: 'center' }}>
        {errorMessage ? (
          <p style={{ fontSize: 14, color: 'var(--accent-2)', margin: 0 }}>
            {errorMessage}
          </p>
        ) : (
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
            You've been invited to join a band on Setlist Studio.
          </p>
        )}
      </div>
    </BottomSheet>
  )
}
