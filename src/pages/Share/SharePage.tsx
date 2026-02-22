import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Share2, Copy, Mail } from 'lucide-react'
import { PageTransition } from '@/components/layout/PageTransition'
import { useSetlistStore } from '@/store/setlistStore'
import { useSongStore } from '@/store/songStore'
import { getTotalDurationDisplay, formatSetlistDate } from '@/utils/setlistUtils'
import { Song } from '@/types'

export function SharePage() {
  const { setlistId } = useParams<{ setlistId: string }>()
  const navigate = useNavigate()

  const setlist = useSetlistStore((s) => s.setlists.find((sl) => sl.id === setlistId))
  const allSongs = useSongStore((s) => s.songs)
  const songMap = Object.fromEntries(allSongs.map((s) => [s.id, s])) as Record<string, Song>

  const [copied, setCopied] = useState(false)

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
  const sortedSongs = [...setlist.songs].sort((a, b) => a.order - b.order)

  const buildShareText = () => {
    const lines = sortedSongs.map((ss, i) => `${i + 1}. ${songMap[ss.songId]?.title ?? 'Unknown'}`)
    return `${setlist.name}\n\n${lines.join('\n')}`
  }

  const handleShare = async () => {
    if (!navigator.share) {
      alert('Native sharing is only available on mobile browsers.')
      return
    }
    const text = buildShareText()
    await navigator.share({ title: setlist.name, text })
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(buildShareText())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEmail = () => {
    const text = buildShareText()
    const subject = encodeURIComponent(setlist.name)
    const body = encodeURIComponent(text)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
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
      <div style={{ padding: '16px 16px 10px' }}>
        <div className="section-label">Share via</div>
      </div>

      {/* Share grid */}
      <div className="share-grid">
        <button className="share-tile" onClick={handleShare} aria-label="Share setlist">
          <span className="share-tile-icon"><Share2 size={24} /></span>
          <span className="share-tile-label">Share</span>
        </button>
        <button className="share-tile" onClick={handleCopy} aria-label="Copy to clipboard">
          <span className="share-tile-icon"><Copy size={24} /></span>
          <span className="share-tile-label">{copied ? 'Copied!' : 'Copy'}</span>
        </button>
        <button className="share-tile" onClick={handleEmail} aria-label="Send via email">
          <span className="share-tile-icon"><Mail size={24} /></span>
          <span className="share-tile-label">Email</span>
        </button>
      </div>
    </PageTransition>
  )
}
