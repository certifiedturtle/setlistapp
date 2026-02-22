import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Zap, Clock, Music } from 'lucide-react'
import { PageTransition } from '@/components/layout/PageTransition'
import { useSongStore } from '@/store/songStore'
import clsx from 'clsx'

const ENERGY_LABELS = { high: 'High Energy', mid: 'Mid Energy', low: 'Low / Chill' }

export function SongDetailPage() {
  const { songId } = useParams<{ songId: string }>()
  const navigate = useNavigate()
  const song = useSongStore((s) => s.songs.find((s) => s.id === songId))
  const [lyricsExpanded, setLyricsExpanded] = useState(false)

  if (!song) {
    return (
      <PageTransition>
        <div className="empty-state" style={{ height: '100%' }}>
          <div className="empty-state-title">Song not found</div>
          <button className="back-btn" onClick={() => navigate(-1)} style={{ marginTop: 12 }}>
            Go back
          </button>
        </div>
      </PageTransition>
    )
  }

  const lyrics = song.lyrics ?? 'No lyrics added yet.'
  const lyricsPreview = lyrics.split('\n').slice(0, 6).join('\n')
  const hasMore = lyrics.split('\n').length > 6

  return (
    <PageTransition>
      {/* Header */}
      <div className="back-header">
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <ChevronLeft size={18} />
          Library
        </button>
        <button className="edit-btn" aria-label="Edit song" onClick={() => navigate(`/library/song/${songId}/edit`)}>
          Edit
        </button>
      </div>

      {/* Hero card */}
      <div className="song-hero-card">
        <div className="hero-tag-row">
          <span className={clsx('hero-type-tag', song.type)}>
            {song.type === 'cover' ? 'Cover' : 'Original'}
          </span>
        </div>
        <div className="hero-title">{song.title}</div>
        <div className="hero-artist">
          {song.artist}
          {song.year ? ` · ${song.year}` : ''}
        </div>

        <div className="detail-pills">
          <div className="detail-pill key-pill">
            <Music size={13} />
            Key of {song.key}
          </div>
          <div className="detail-pill">
            <Clock size={13} />
            {song.duration}
          </div>
          <div className="detail-pill">
            <Zap size={13} />
            {ENERGY_LABELS[song.energy]}
          </div>
        </div>
      </div>

      {/* Tone Notes */}
      {song.toneNotes && (
        <div className="detail-section">
          <div className="detail-section-title">Gear / Tone Notes</div>
          <div className="tone-notes-box">{song.toneNotes}</div>
        </div>
      )}

      {/* Lyrics */}
      <div className="detail-section">
        <div className="detail-section-title">Lyrics Snippet</div>
        <div className="lyrics-box" onClick={() => hasMore && setLyricsExpanded((v) => !v)}>
          {lyricsExpanded ? lyrics : lyricsPreview}
          {hasMore && !lyricsExpanded && (
            <div className="lyrics-expand-btn">Tap to expand full lyrics →</div>
          )}
          {hasMore && lyricsExpanded && (
            <div className="lyrics-expand-btn">Tap to collapse ↑</div>
          )}
        </div>
      </div>

      {/* Bottom action row */}
      <div style={{ height: 80 }} />
      <div
        className="song-action-row"
        style={{ position: 'sticky', bottom: 0, background: 'var(--bg)' }}
      >
        <button className="btn-secondary">Add to Set</button>
        <button className="btn-primary" onClick={() => navigate(`/library/song/${songId}/edit`)}>Edit Song</button>
      </div>
    </PageTransition>
  )
}
