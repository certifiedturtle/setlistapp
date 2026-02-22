import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { PageTransition } from '@/components/layout/PageTransition'
import { useSetlistStore } from '@/store/setlistStore'
import { useSongStore } from '@/store/songStore'
import { getTotalDurationDisplay, formatSetlistDate } from '@/utils/setlistUtils'
import { Song } from '@/types'
import clsx from 'clsx'

const EXPORT_OPTIONS = [
  { id: 'order', label: 'Song order', defaultOn: true },
  { id: 'keys', label: 'Keys', defaultOn: true },
  { id: 'lyrics', label: 'Lyrics', defaultOn: false },
  { id: 'tone', label: 'Tone notes', defaultOn: false },
]

const SHARE_TILES = [
  { id: 'link', icon: '🔗', label: 'Copy Link', featured: false },
  { id: 'pdf', icon: '📄', label: 'Export PDF', featured: false },
  { id: 'messages', icon: '💬', label: 'Messages', featured: false },
  { id: 'band', icon: '👥', label: 'Band Members', featured: true },
]

export function SharePage() {
  const { setlistId } = useParams<{ setlistId: string }>()
  const navigate = useNavigate()

  const setlist = useSetlistStore((s) => s.setlists.find((sl) => sl.id === setlistId))
  const allSongs = useSongStore((s) => s.songs)
  const songMap = Object.fromEntries(allSongs.map((s) => [s.id, s])) as Record<string, Song>

  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(EXPORT_OPTIONS.map((o) => [o.id, o.defaultOn]))
  )

  if (!setlist) {
    return (
      <PageTransition>
        <div className="empty-state">
          <div className="empty-state-title">Setlist not found</div>
        </div>
      </PageTransition>
    )
  }

  const totalDuration = getTotalDurationDisplay(setlist, songMap)

  const toggle = (id: string) => {
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <PageTransition>
      {/* Header */}
      <div className="back-header">
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <ChevronLeft size={18} />
          Back
        </button>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16 }}>
          Share
        </span>
        <div style={{ width: 70 }} />
      </div>

      {/* Hero summary */}
      <div className="share-hero">
        <div className="share-hero-name">{setlist.name}</div>
        <div className="share-hero-meta">
          <div className="share-meta-item">
            Songs: <span className="share-meta-value">{setlist.songs.length}</span>
          </div>
          <div className="share-meta-item">
            Duration: <span className="share-meta-value">{totalDuration}</span>
          </div>
          {setlist.date && (
            <div className="share-meta-item">
              Date: <span className="share-meta-value">{formatSetlistDate(setlist.date, setlist.time)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Section label */}
      <div style={{ padding: '0 16px 10px' }}>
        <div className="section-label">Include in export</div>
      </div>

      {/* Toggle list */}
      <div className="toggle-list">
        {EXPORT_OPTIONS.map((opt) => (
          <div key={opt.id} className="toggle-item">
            <span className="toggle-label">{opt.label}</span>
            <button
              className={clsx('toggle-switch', { on: toggles[opt.id] })}
              onClick={() => toggle(opt.id)}
              role="switch"
              aria-checked={toggles[opt.id]}
              aria-label={opt.label}
            />
          </div>
        ))}
      </div>

      {/* Section label */}
      <div style={{ padding: '16px 16px 10px' }}>
        <div className="section-label">Share via</div>
      </div>

      {/* Share grid */}
      <div className="share-grid">
        {SHARE_TILES.map((tile) => (
          <button
            key={tile.id}
            className={clsx('share-tile', { featured: tile.featured })}
            aria-label={tile.label}
          >
            <span className="share-tile-icon">{tile.icon}</span>
            <span className="share-tile-label">{tile.label}</span>
          </button>
        ))}
      </div>
    </PageTransition>
  )
}
