import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { PageTransition } from '@/components/layout/PageTransition'
import { SetlistCard } from '@/components/setlist/SetlistCard'
import { useSetlistStore } from '@/store/setlistStore'

export function SetlistsPage() {
  const navigate = useNavigate()
  const setlists = useSetlistStore((s) => s.setlists)

  return (
    <PageTransition>
      {/* Header */}
      <div className="screen-header">
        <h1 className="screen-title">Setlists</h1>
        <div className="header-actions">
          <button className="icon-btn accent" aria-label="New setlist" onClick={() => navigate('/setlists/new')}>
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="scroll-content" style={{ paddingTop: 8 }}>
        {setlists.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">No setlists yet</div>
            <div className="empty-state-desc">
              Tap + to create your first setlist and start building your show.
            </div>
          </div>
        ) : (
          setlists.map((setlist) => (
            <SetlistCard key={setlist.id} setlist={setlist} />
          ))
        )}
      </div>


    </PageTransition>
  )
}
