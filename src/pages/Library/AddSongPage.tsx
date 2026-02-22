import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { PageTransition } from '@/components/layout/PageTransition'
import { useSongStore } from '@/store/songStore'
import { SongType } from '@/types'
import clsx from 'clsx'

export function AddSongPage() {
  const navigate = useNavigate()
  const addSong = useSongStore((s) => s.addSong)
  const [title, setTitle] = useState('')
  const [type, setType] = useState<SongType>('cover')

  const handleConfirm = () => {
    if (!title.trim()) return

    addSong({
      id: crypto.randomUUID(),
      title: title.trim(),
      artist: '',
      key: 'C',
      energy: 'mid',
      genre: 'Rock',
      type,
      duration: '0:00',
      durationSecs: 0,
      tags: [],
    })

    navigate('/library')
  }

  return (
    <PageTransition>
      {/* Header */}
      <div className="screen-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={20} />
        </button>
        <h1 className="screen-title">Add Song</h1>
        <div style={{ width: 32 }} />
      </div>

      {/* Form */}
      <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Song title */}
        <div>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
            Song Title
          </label>
          <input
            type="text"
            placeholder="Enter song name…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            autoComplete="off"
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              color: 'var(--text)',
              fontSize: 15,
              outline: 'none',
            }}
          />
        </div>

        {/* Type toggle */}
        <div>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
            Type
          </label>
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

        {/* Confirm button */}
        <button
          onClick={handleConfirm}
          disabled={!title.trim()}
          style={{
            marginTop: 16,
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
          Add to Library
        </button>
      </div>
    </PageTransition>
  )
}
