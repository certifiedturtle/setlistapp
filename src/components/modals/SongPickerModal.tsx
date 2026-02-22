import { useState, useMemo } from 'react'
import { Search, Check, ArrowRight } from 'lucide-react'
import { BottomSheet } from './BottomSheet'
import { useUiStore } from '@/store/uiStore'
import { useSetlistStore } from '@/store/setlistStore'
import { useSongStore } from '@/store/songStore'
import { secsToDisplay } from '@/utils/formatDuration'
import clsx from 'clsx'

interface SongPickerModalProps {
  setlistId: string
}

type PickerFilter = 'all' | 'high' | 'mid' | 'low'

export function SongPickerModal({ setlistId }: SongPickerModalProps) {
  const closeSongPicker = useUiStore((s) => s.closeSongPicker)
  const addSongsToSetlist = useSetlistStore((s) => s.addSongsToSetlist)
  const setlist = useSetlistStore((s) => s.setlists.find((sl) => sl.id === setlistId))
  const allSongs = useSongStore((s) => s.songs)

  const existingIds = useMemo(
    () => new Set(setlist?.songs.map((ss) => ss.songId) ?? []),
    [setlist]
  )

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<PickerFilter>('all')

  const filteredSongs = useMemo(() => {
    const q = search.toLowerCase()
    return allSongs.filter((song) => {
      const matchesSearch =
        !q || song.title.toLowerCase().includes(q) || song.artist.toLowerCase().includes(q)
      const matchesFilter =
        filter === 'all' || song.energy === filter
      return matchesSearch && matchesFilter
    })
  }, [allSongs, search, filter])

  const toggleSong = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectedCount = selected.size
  const addedSecs = Array.from(selected).reduce((acc, id) => {
    const song = allSongs.find((s) => s.id === id)
    return acc + (song?.durationSecs ?? 0)
  }, 0)

  const handleConfirm = () => {
    if (selected.size > 0) {
      addSongsToSetlist(setlistId, Array.from(selected))
    }
    closeSongPicker()
  }

  const pickerFilters: { key: PickerFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'high', label: 'High Energy' },
    { key: 'mid', label: 'Mid Energy' },
    { key: 'low', label: 'Low/Chill' },
  ]

  return (
    <BottomSheet isOpen={true} onClose={closeSongPicker}>
      {/* Header */}
      <div className="sheet-header">
        <button className="sheet-cancel" onClick={closeSongPicker}>
          Cancel
        </button>
        <span className="sheet-title">Add Songs</span>
        <button
          className="sheet-confirm"
          onClick={handleConfirm}
          disabled={selectedCount === 0}
        >
          Add {selectedCount > 0 ? selectedCount : ''}
        </button>
      </div>

      {/* Search */}
      <div className="search-bar-wrap">
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search songs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
          />
        </div>
      </div>

      {/* Filter chips */}
      <div className="filter-chips">
        {pickerFilters.map((f) => (
          <button
            key={f.key}
            className={clsx('chip', { active: filter === f.key })}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Song list */}
      <div className="sheet-content">
        {filteredSongs.map((song) => {
          const isSelected = selected.has(song.id)
          const isExisting = existingIds.has(song.id)
          return (
            <div
              key={song.id}
              className={clsx('song-row', { 'opacity-40': isExisting })}
              onClick={() => !isExisting && toggleSong(song.id)}
              role="checkbox"
              aria-checked={isSelected}
              tabIndex={0}
              style={{ opacity: isExisting ? 0.4 : 1, cursor: isExisting ? 'default' : 'pointer' }}
            >
              <div className={clsx('song-number-box', { selected: isSelected })}>
                {isSelected ? (
                  <Check size={14} strokeWidth={3} />
                ) : (
                  <span>{isExisting ? '✓' : ''}</span>
                )}
              </div>

              <div className="song-row-content">
                <div className="song-row-title">{song.title}</div>
                <div className="song-row-meta">
                  <span className={clsx('song-type-tag', song.type)}>
                    {song.type === 'cover' ? 'Cover' : 'Original'}
                  </span>
                  <span className="song-row-duration">{song.duration}</span>
                  <span className={clsx('energy-dot', song.energy)} />
                </div>
              </div>

              <div className="key-badge">{song.key}</div>
            </div>
          )
        })}
      </div>

      {/* Sticky bottom */}
      {selectedCount > 0 && (
        <div className="sheet-sticky-bottom">
          <div className="sheet-selection-info">
            {selectedCount} song{selectedCount !== 1 ? 's' : ''} selected · +{secsToDisplay(addedSecs)} added
          </div>
          <button className="add-to-setlist-btn" onClick={handleConfirm}>
            Add to Setlist
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </BottomSheet>
  )
}
