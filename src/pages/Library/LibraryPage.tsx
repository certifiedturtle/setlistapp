import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, ArrowUpDown } from 'lucide-react'
import { PageTransition } from '@/components/layout/PageTransition'
import { SongRow } from '@/components/song/SongRow'
import { useSongStore, useFilteredSongs } from '@/store/songStore'
import { useSettingsStore } from '@/store/settingsStore'
import clsx from 'clsx'

const FILTER_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'covers', label: 'Covers' },
  { id: 'originals', label: 'Originals' },
  { id: 'rock', label: 'Rock' },
  { id: 'indie', label: 'Indie' },
  { id: 'alternative', label: 'Alt' },
]

export function LibraryPage() {
  const navigate = useNavigate()
  const [showSearch, setShowSearch] = useState(false)
  const bandName = useSettingsStore((s) => s.bandName)
  const title = `${bandName} Library`
  const fontSize = title.length <= 20 ? 26 : title.length <= 26 ? 22 : title.length <= 32 ? 18 : 15
  const searchQuery = useSongStore((s) => s.searchQuery)
  const activeFilter = useSongStore((s) => s.activeFilter)
  const setSearchQuery = useSongStore((s) => s.setSearchQuery)
  const setActiveFilter = useSongStore((s) => s.setActiveFilter)
  const allSongs = useSongStore((s) => s.songs)
  const filteredSongs = useFilteredSongs()

  const getFilterCount = (filterId: string) => {
    if (filterId === 'all') return allSongs.length
    if (filterId === 'covers') return allSongs.filter((s) => s.type === 'cover').length
    if (filterId === 'originals') return allSongs.filter((s) => s.type === 'original').length
    return allSongs.filter((s) => s.genre.toLowerCase() === filterId.toLowerCase()).length
  }

  return (
    <PageTransition>
      {/* Header */}
      <div className="screen-header">
        <h1
          className="screen-title"
          style={{
            fontSize,
            flex: 1,
            minWidth: 0,
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            overflow: 'hidden',
          }}
        >
          {title}
        </h1>
        <div className="header-actions">
          <button
            className="icon-btn"
            onClick={() => setShowSearch((v) => !v)}
            aria-label="Search"
          >
            <Search size={20} />
          </button>
          <button className="icon-btn accent" aria-label="Add song" onClick={() => navigate('/library/add')}>
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div className="search-bar-wrap">
          <div className="search-bar">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search songs, artists, keys…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              autoComplete="off"
            />
          </div>
        </div>
      )}

      {/* Filter chips */}
      <div className="filter-chips">
        {FILTER_OPTIONS.map((f) => {
          const count = getFilterCount(f.id)
          return (
            <button
              key={f.id}
              className={clsx('chip', { active: activeFilter === f.id })}
              onClick={() => setActiveFilter(f.id)}
            >
              {f.label}
              <span className="chip-count">{count}</span>
            </button>
          )
        })}
      </div>

      {/* Section label */}
      <div className="section-label-row">
        <span className="section-label">Recent</span>
        <button className="sort-btn">
          <ArrowUpDown size={11} />
          Sort
        </button>
      </div>

      {/* Song list */}
      <div className="scroll-content">
        {filteredSongs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">No songs found</div>
            <div className="empty-state-desc">Try adjusting your search or filters.</div>
          </div>
        ) : (
          filteredSongs.map((song, i) => (
            <SongRow
              key={song.id}
              song={song}
              index={i}
              onClick={() => navigate(`/library/song/${song.id}`)}
            />
          ))
        )}
      </div>


    </PageTransition>
  )
}
