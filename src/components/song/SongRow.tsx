import { Check } from 'lucide-react'
import { Song } from '@/types'
import clsx from 'clsx'

interface SongRowProps {
  song: Song
  index: number
  selected?: boolean
  onSelect?: () => void
  onClick?: () => void
  showEnergyDot?: boolean
}

export function SongRow({ song, index, selected, onSelect, onClick, showEnergyDot }: SongRowProps) {
  const handleClick = () => {
    if (onSelect) onSelect()
    else if (onClick) onClick()
  }

  const highlightKey = ['C#', 'F#', 'Bb', 'D#', 'G#', 'A#', 'Eb', 'Ab', 'Db', 'Gb'].includes(song.key)

  return (
    <div className="song-row" onClick={handleClick} role="button" tabIndex={0}>
      <div className={clsx('song-number-box', { selected })}>
        {selected ? <Check size={14} strokeWidth={3} /> : <span>{index + 1}</span>}
      </div>

      <div className="song-row-content">
        <div className="song-row-title">{song.title}</div>
        <div className="song-row-meta">
          <span className={clsx('song-type-tag', song.type)}>
            {song.type === 'cover' ? 'Cover' : 'Original'}
          </span>
          <span className="song-row-duration">{song.duration}</span>
          <span className="song-row-artist">{song.artist}</span>
          {showEnergyDot && <span className={clsx('energy-dot', song.energy)} />}
        </div>
      </div>

      <div className={clsx('key-badge', { highlight: highlightKey })}>{song.key}</div>
    </div>
  )
}
