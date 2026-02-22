import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Search, Check, ArrowRight } from 'lucide-react'
import { PageTransition } from '@/components/layout/PageTransition'
import { useSongStore } from '@/store/songStore'
import { useSetlistStore } from '@/store/setlistStore'
import { secsToDisplay } from '@/utils/formatDuration'
import { Setlist, EnergyLevel } from '@/types'
import clsx from 'clsx'

type PickerFilter = 'all' | 'high' | 'mid' | 'low'

function computeTargetDuration(startTime: string, endTime: string): number {
  const [startH, startM] = startTime.split(':').map(Number)
  const [endH, endM] = endTime.split(':').map(Number)
  let startMins = startH * 60 + startM
  let endMins = endH * 60 + endM
  if (endMins <= startMins) endMins += 24 * 60
  return (endMins - startMins) * 60
}

function formatTimeForDisplay(time24: string): string {
  const [h, m] = time24.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`
}

const stepVariants = {
  enterRight: { x: '100%', opacity: 0 },
  enterLeft: { x: '-100%', opacity: 0 },
  center: { x: 0, opacity: 1 },
  exitLeft: { x: '-100%', opacity: 0 },
  exitRight: { x: '100%', opacity: 0 },
}

const stepTransition = { type: 'spring' as const, stiffness: 350, damping: 35, mass: 0.8 }

const PICKER_FILTERS: { key: PickerFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'high', label: 'High Energy' },
  { key: 'mid', label: 'Mid Energy' },
  { key: 'low', label: 'Low/Chill' },
]

const fieldStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--r-md)',
  padding: '12px 14px',
  fontSize: 14,
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-body)',
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--text-muted)',
  marginBottom: 6,
  display: 'block',
  fontFamily: 'var(--font-heading)',
}

export function CreateSetlistPage() {
  const navigate = useNavigate()
  const addSetlist = useSetlistStore((s) => s.addSetlist)
  const allSongs = useSongStore((s) => s.songs)

  // Wizard step
  const [step, setStep] = useState<1 | 2>(1)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')

  // Step 1 fields
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  // Step 2 fields
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<PickerFilter>('all')

  const canProceed = title.trim().length > 0

  const goToStep2 = () => {
    setDirection('forward')
    setStep(2)
  }

  const goToStep1 = () => {
    setDirection('back')
    setStep(1)
  }

  const filteredSongs = useMemo(() => {
    const q = search.toLowerCase()
    return allSongs.filter((song) => {
      const matchesSearch =
        !q || song.title.toLowerCase().includes(q) || song.artist.toLowerCase().includes(q)
      const matchesFilter = filter === 'all' || song.energy === filter
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

  const handleCreate = () => {
    const id = crypto.randomUUID()
    const targetDuration =
      startTime && endTime ? computeTargetDuration(startTime, endTime) : 3600

    const newSetlist: Setlist = {
      id,
      name: title.trim(),
      date: date || undefined,
      time: startTime ? formatTimeForDisplay(startTime) : undefined,
      songs: Array.from(selected).map((songId, i) => ({ songId, order: i })),
      targetDuration,
    }

    addSetlist(newSetlist)
    navigate(`/setlists/${id}`, { replace: true })
  }

  return (
    <PageTransition>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <AnimatePresence mode="wait" initial={false}>
          {step === 1 && (
            <motion.div
              key="step1"
              initial={direction === 'back' ? stepVariants.enterLeft : stepVariants.enterRight}
              animate={stepVariants.center}
              exit={stepVariants.exitLeft}
              transition={stepTransition}
              style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'auto' }}
            >
              {/* Header */}
              <div className="back-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                  <ChevronLeft size={18} />
                  Setlists
                </button>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
                  New Setlist
                </span>
                <div style={{ width: 70 }} />
              </div>

              {/* Step indicator */}
              <div className="step-indicator">
                <div className="step-dot active" />
                <div className="step-dot" />
              </div>

              {/* Form */}
              <div style={{ padding: '8px 20px', display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
                <div>
                  <label style={labelStyle}>Setlist Name *</label>
                  <input
                    style={fieldStyle}
                    type="text"
                    placeholder="e.g. Saturday Night Set"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    autoFocus
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label style={labelStyle}>Date of Show</label>
                  <input
                    style={{ ...fieldStyle, colorScheme: 'dark' }}
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Set Start Time</label>
                    <input
                      style={{ ...fieldStyle, colorScheme: 'dark' }}
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Set End Time</label>
                    <input
                      style={{ ...fieldStyle, colorScheme: 'dark' }}
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>

                {startTime && endTime && (
                  <div style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
                    Target set duration: {secsToDisplay(computeTargetDuration(startTime, endTime))}
                  </div>
                )}
              </div>

              {/* Bottom CTA */}
              <div className="create-sticky-bottom">
                <button
                  className="btn-primary"
                  onClick={goToStep2}
                  disabled={!canProceed}
                  style={{
                    width: '100%',
                    padding: 14,
                    fontSize: 15,
                    opacity: canProceed ? 1 : 0.4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  Choose Songs
                  <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={direction === 'forward' ? stepVariants.enterRight : stepVariants.enterLeft}
              animate={stepVariants.center}
              exit={stepVariants.exitRight}
              transition={stepTransition}
              style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}
            >
              {/* Header */}
              <div className="back-header">
                <button className="back-btn" onClick={goToStep1}>
                  <ChevronLeft size={18} />
                  Details
                </button>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
                  Pick Songs
                </span>
                <button
                  onClick={handleCreate}
                  style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '6px 10px' }}
                >
                  Skip
                </button>
              </div>

              {/* Step indicator */}
              <div className="step-indicator">
                <div className="step-dot active" />
                <div className="step-dot active" />
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
                {PICKER_FILTERS.map((f) => (
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
              <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
                {filteredSongs.map((song) => {
                  const isSelected = selected.has(song.id)
                  return (
                    <div
                      key={song.id}
                      className="song-row"
                      onClick={() => toggleSong(song.id)}
                      role="checkbox"
                      aria-checked={isSelected}
                      tabIndex={0}
                    >
                      <div className={clsx('song-number-box', { selected: isSelected })}>
                        {isSelected ? <Check size={14} strokeWidth={3} /> : null}
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
              <div className="create-sticky-bottom">
                {selectedCount > 0 && (
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10, textAlign: 'center' }}>
                    {selectedCount} song{selectedCount !== 1 ? 's' : ''} selected · {secsToDisplay(addedSecs)}
                  </div>
                )}
                <button
                  className="add-to-setlist-btn"
                  onClick={handleCreate}
                  style={{ width: '100%' }}
                >
                  {selectedCount > 0 ? `Create with ${selectedCount} Song${selectedCount !== 1 ? 's' : ''}` : 'Create Empty Setlist'}
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}
