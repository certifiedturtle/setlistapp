import { useRef, useState } from 'react'
import { PageTransition } from '@/components/layout/PageTransition'
import { useSettingsStore } from '@/store/settingsStore'

const STATIC_SETTINGS = [
  { label: 'Default Target Duration', value: '60 min' },
  { label: 'Default Song Key', value: 'C' },
  { label: 'App Theme', value: 'Dark' },
]

export function SettingsPage() {
  const { bandName, setBandName } = useSettingsStore()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function startEditing() {
    setDraft(bandName)
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function commitEdit() {
    setBandName(draft.trim() || bandName)
    setEditing(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') commitEdit()
    if (e.key === 'Escape') setEditing(false)
  }

  return (
    <PageTransition>
      <div className="screen-header">
        <h1 className="screen-title">Settings</h1>
      </div>

      <div style={{ padding: '8px 0' }}>
        <div style={{ margin: '0 16px 8px' }}>
          <div className="section-label">Band</div>
        </div>
        <div
          style={{
            margin: '0 16px 24px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-lg)',
            overflow: 'hidden',
          }}
        >
          {/* Band Name — editable row */}
          <div
            onClick={!editing ? startEditing : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderBottom: '1px solid var(--border)',
              cursor: editing ? 'default' : 'pointer',
            }}
          >
            <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>Band Name</span>
            {editing ? (
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={handleKeyDown}
                style={{
                  fontSize: 14,
                  color: 'var(--text-primary)',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--accent)',
                  outline: 'none',
                  textAlign: 'right',
                  width: 160,
                  padding: '0 0 2px',
                }}
              />
            ) : (
              <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{bandName}</span>
            )}
          </div>

          {/* Static rows */}
          {STATIC_SETTINGS.map((item, i) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderBottom: i < STATIC_SETTINGS.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{item.label}</span>
              <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{item.value}</span>
            </div>
          ))}
        </div>

        <div style={{ margin: '0 16px 8px' }}>
          <div className="section-label">App Info</div>
        </div>
        <div
          style={{
            margin: '0 16px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-lg)',
            overflow: 'hidden',
          }}
        >
          {[
            { label: 'Version', value: '0.1.0' },
            { label: 'Build', value: 'Setlist Studio' },
          ].map((item, i) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderBottom: i === 0 ? '1px solid var(--border)' : 'none',
              }}
            >
              <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{item.label}</span>
              <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
