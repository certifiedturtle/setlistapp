import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Link2 } from 'lucide-react'
import { PageTransition } from '@/components/layout/PageTransition'
import { useAuth } from '@/contexts/AuthContext'
import { useBandStore } from '@/store/bandStore'
import { useGigStore } from '@/store/gigStore'
import { useSetlistStore } from '@/store/setlistStore'
import { CreateGigModal } from '@/components/modals/CreateGigModal'
import { Gig } from '@/types'

function GigRow({ gig }: { gig: Gig }) {
  const navigate = useNavigate()
  const setlists = useSetlistStore((s) => s.setlists)
  const linked = setlists.find((sl) => sl.id === gig.setlistId)

  const formattedDate = gig.date
    ? new Date(gig.date + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : null

  return (
    <div className="setlist-card" onClick={() => navigate(`/gigs/${gig.id}`)}>
      {/* Line 1: venue + date */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
          {gig.venue ?? gig.name}
        </div>
        {formattedDate && (
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', flexShrink: 0, marginLeft: 8 }}>
            {formattedDate}
          </div>
        )}
      </div>
      {/* Line 2: linked setlist name or placeholder */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12,
        color: linked ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
        <Link2 size={12} />
        {linked ? linked.name : 'No setlist linked'}
      </div>
    </div>
  )
}

export function GigsPage() {
  const { user } = useAuth()
  const { band } = useBandStore()
  const { gigs, loading, initialized, initialize } = useGigStore()
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    if (band && user && !initialized) {
      initialize(user.id, band.id)
    }
  }, [band, user, initialized, initialize])

  return (
    <PageTransition>
      <div className="screen-header">
        <h1 className="screen-title">Gigs</h1>
        {band && (
          <button
            onClick={() => setModalOpen(true)}
            className="icon-btn accent"
            style={{ width: 'auto', padding: '0 14px', fontSize: 14, fontWeight: 700 }}
          >
            New
          </button>
        )}
      </div>

      {!band ? (
        <div className="stub-page">
          <div className="stub-icon"><Calendar size={64} /></div>
          <div className="stub-title">No band yet</div>
          <div className="stub-desc">
            No band created yet! Add your band to start managing gigs.
          </div>
        </div>
      ) : loading ? (
        <div className="empty-state">
          <div className="empty-state-title">Loading…</div>
        </div>
      ) : gigs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">No gigs yet</div>
          <div className="empty-state-desc">
            Tap New to add your first show.
          </div>
        </div>
      ) : (
        <div className="scroll-content">
          {gigs.map((gig) => <GigRow key={gig.id} gig={gig} />)}
        </div>
      )}

      <CreateGigModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        userId={user!.id}
        bandId={band!.id}
      />
    </PageTransition>
  )
}
