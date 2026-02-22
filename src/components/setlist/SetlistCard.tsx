import { useNavigate } from 'react-router-dom'
import { Share2 } from 'lucide-react'
import { Setlist, Song } from '@/types'
import { getTotalDurationDisplay, getProgress, formatSetlistDate, isUpcoming } from '@/utils/setlistUtils'
import { useSongStore } from '@/store/songStore'

interface SetlistCardProps {
  setlist: Setlist
}

export function SetlistCard({ setlist }: SetlistCardProps) {
  const navigate = useNavigate()
  const songs = useSongStore((s) => s.songs)
  const songMap = Object.fromEntries(songs.map((s) => [s.id, s])) as Record<string, Song>

  const totalDuration = getTotalDurationDisplay(setlist, songMap)
  const progress = getProgress(setlist, songMap)
  const upcoming = isUpcoming(setlist.date)

  const previewSongs = setlist.songs.slice(0, 3)
  const extraCount = setlist.songs.length - 3

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/setlists/${setlist.id}/share`)
  }

  return (
    <div className="setlist-card" onClick={() => navigate(`/setlists/${setlist.id}`)}>
      <div className="setlist-card-header">
        <div className="setlist-card-name">{setlist.name}</div>
        {upcoming && <span className="upcoming-badge">UPCOMING</span>}
      </div>

      <div className="setlist-card-date">
        {setlist.venue && <span>{setlist.venue} · </span>}
        {formatSetlistDate(setlist.date, setlist.time)}
      </div>

      <div className="setlist-song-chips">
        {previewSongs.map((ss) => {
          const song = songMap[ss.songId]
          if (!song) return null
          return (
            <span key={ss.songId} className="song-chip">
              {song.title}
            </span>
          )
        })}
        {extraCount > 0 && (
          <span className="song-chip more">+{extraCount} more</span>
        )}
      </div>

      <div className="setlist-card-footer">
        <span className="setlist-meta">
          {setlist.songs.length} songs · {totalDuration}
        </span>
        <button className="share-btn" onClick={handleShareClick} aria-label="Share setlist">
          <Share2 size={13} />
          Share
        </button>
      </div>

      <div className="progress-bar-wrap">
        <div
          className="progress-bar-fill"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
    </div>
  )
}
