import { useState, KeyboardEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, X } from 'lucide-react'
import { PageTransition } from '@/components/layout/PageTransition'
import { useSongStore } from '@/store/songStore'
import { SongKey, SongType, EnergyLevel } from '@/types'
import clsx from 'clsx'

const SONG_KEYS: SongKey[] = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E',
  'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
]

function parseDurationToSecs(duration: string): number {
  const parts = duration.split(':')
  if (parts.length !== 2) return 0
  const mins = parseInt(parts[0], 10)
  const secs = parseInt(parts[1], 10)
  if (isNaN(mins) || isNaN(secs)) return 0
  return mins * 60 + secs
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  color: 'var(--text)',
  fontSize: 15,
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  color: 'var(--text-secondary)',
  marginBottom: 8,
}

export function EditSongPage() {
  const { songId } = useParams<{ songId: string }>()
  const navigate = useNavigate()
  const song = useSongStore((s) => s.songs.find((s) => s.id === songId))
  const updateSong = useSongStore((s) => s.updateSong)
  const deleteSong = useSongStore((s) => s.deleteSong)

  const [title, setTitle] = useState(song?.title ?? '')
  const [artist, setArtist] = useState(song?.artist ?? '')
  const [type, setType] = useState<SongType>(song?.type ?? 'cover')
  const [key, setKey] = useState<SongKey>(song?.key ?? 'C')
  const [duration, setDuration] = useState(song?.duration ?? '0:00')
  const [energy, setEnergy] = useState<EnergyLevel>(song?.energy ?? 'mid')
  const [genre, setGenre] = useState(song?.genre ?? '')
  const [year, setYear] = useState<string>(song?.year !== undefined ? String(song.year) : '')
  const [tags, setTags] = useState<string[]>(song?.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const [toneNotes, setToneNotes] = useState(song?.toneNotes ?? '')
  const [lyrics, setLyrics] = useState(song?.lyrics ?? '')

  if (!song) {
    return (
      <PageTransition>
        <div className="empty-state" style={{ height: '100%' }}>
          <div className="empty-state-title">Song not found</div>
          <button className="back-btn" onClick={() => navigate('/library')} style={{ marginTop: 12 }}>
            Go to Library
          </button>
        </div>
      </PageTransition>
    )
  }

  const handleAddTag = () => {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
    }
    setTagInput('')
  }

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleSave = () => {
    if (!title.trim()) return
    const durationSecs = parseDurationToSecs(duration)
    updateSong(song.id, {
      title: title.trim(),
      artist: artist.trim(),
      type,
      key,
      duration: duration.trim(),
      durationSecs,
      energy,
      genre: genre.trim(),
      year: year ? parseInt(year, 10) : undefined,
      tags,
      toneNotes: toneNotes.trim() || undefined,
      lyrics: lyrics.trim() || undefined,
    })
    navigate(`/library/song/${song.id}`)
  }

  const handleDelete = () => {
    if (window.confirm('Delete this song from your library?')) {
      deleteSong(song.id)
      navigate('/library')
    }
  }

  return (
    <PageTransition>
      {/* Header */}
      <div className="screen-header">
        <button className="back-btn" onClick={() => navigate(`/library/song/${song.id}`)}>
          <ChevronLeft size={20} />
        </button>
        <h1 className="screen-title">Edit Song</h1>
        <div style={{ width: 32 }} />
      </div>

      {/* Form */}
      <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>

        {/* Title */}
        <div>
          <label style={labelStyle}>Song Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoComplete="off"
            style={inputStyle}
          />
        </div>

        {/* Artist */}
        <div>
          <label style={labelStyle}>Artist</label>
          <input
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            autoComplete="off"
            style={inputStyle}
          />
        </div>

        {/* Type */}
        <div>
          <label style={labelStyle}>Type</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className={clsx('chip', { active: type === 'cover' })}
              onClick={() => setType('cover')}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Cover
            </button>
            <button
              className={clsx('chip', { active: type === 'original' })}
              onClick={() => setType('original')}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Original
            </button>
          </div>
        </div>

        {/* Key */}
        <div>
          <label style={labelStyle}>Key</label>
          <select
            value={key}
            onChange={(e) => setKey(e.target.value as SongKey)}
            style={{ ...inputStyle, appearance: 'none' }}
          >
            {SONG_KEYS.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>

        {/* Duration */}
        <div>
          <label style={labelStyle}>Duration (m:ss)</label>
          <input
            type="text"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="3:42"
            autoComplete="off"
            style={inputStyle}
          />
        </div>

        {/* Energy */}
        <div>
          <label style={labelStyle}>Energy</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['high', 'mid', 'low'] as EnergyLevel[]).map((level) => (
              <button
                key={level}
                className={clsx('chip', { active: energy === level })}
                onClick={() => setEnergy(level)}
                style={{ flex: 1, justifyContent: 'center', textTransform: 'capitalize' }}
              >
                {level === 'high' ? 'High' : level === 'mid' ? 'Mid' : 'Low'}
              </button>
            ))}
          </div>
        </div>

        {/* Genre */}
        <div>
          <label style={labelStyle}>Genre</label>
          <input
            type="text"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            autoComplete="off"
            style={inputStyle}
          />
        </div>

        {/* Year */}
        <div>
          <label style={labelStyle}>Year (optional)</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="2024"
            min={1900}
            max={2099}
            style={inputStyle}
          />
        </div>

        {/* Tags */}
        <div>
          <label style={labelStyle}>Tags</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: tags.length ? 12 : 0 }}>
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleRemoveTag(tag)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '6px 12px',
                  background: 'var(--accent)',
                  color: '#000',
                  border: 'none',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {tag}
                <X size={12} />
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Add tag…"
              autoComplete="off"
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              onClick={handleAddTag}
              disabled={!tagInput.trim()}
              style={{
                padding: '12px 16px',
                background: tagInput.trim() ? 'var(--accent)' : 'var(--surface)',
                color: tagInput.trim() ? '#000' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                cursor: tagInput.trim() ? 'pointer' : 'default',
                whiteSpace: 'nowrap',
              }}
            >
              Add
            </button>
          </div>
        </div>

        {/* Tone Notes */}
        <div>
          <label style={labelStyle}>Gear / Tone Notes</label>
          <textarea
            value={toneNotes}
            onChange={(e) => setToneNotes(e.target.value)}
            placeholder="Amp settings, effects, gear notes…"
            rows={4}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
          />
        </div>

        {/* Lyrics */}
        <div>
          <label style={labelStyle}>Lyrics</label>
          <textarea
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            placeholder="Paste lyrics here…"
            rows={8}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
          />
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={!title.trim()}
          style={{
            padding: '14px 0',
            background: title.trim() ? 'var(--accent)' : 'var(--surface)',
            color: title.trim() ? '#000' : 'var(--text-secondary)',
            border: 'none',
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 600,
            cursor: title.trim() ? 'pointer' : 'default',
          }}
        >
          Save Changes
        </button>

        {/* Delete button */}
        <button
          onClick={handleDelete}
          style={{
            padding: '14px 0',
            background: 'transparent',
            color: '#ef4444',
            border: '1px solid #ef4444',
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Delete Song
        </button>
      </div>
    </PageTransition>
  )
}
