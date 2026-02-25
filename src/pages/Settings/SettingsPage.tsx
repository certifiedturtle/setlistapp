import { useRef, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { PageTransition } from '@/components/layout/PageTransition'
import { useSettingsStore } from '@/store/settingsStore'
import { useAuth } from '@/contexts/AuthContext'
import { useBandStore } from '@/store/bandStore'
import { BottomSheet } from '@/components/modals/BottomSheet'

const STATIC_SETTINGS = [
  { label: 'Default Target Duration', value: '60 min' },
  { label: 'Default Song Key', value: 'C' },
  { label: 'App Theme', value: 'Dark' },
]

export function SettingsPage() {
  const { bandName, setBandName } = useSettingsStore()
  const { signOut, user } = useAuth()
  const { band, generateInvite } = useBandStore()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Owner = no band yet (solo user about to create one) OR band owner
  const isOwner = !band || band.owner_id === user?.id

  async function handleGenerateInvite() {
    const invite = await generateInvite()
    if (!invite) return
    const link = `com.certifiedturtle.setlistbuddy://invite?token=${invite.id}`
    const text = `Join my band on Setlist Studio!\n\n${link}`
    if (Capacitor.isNativePlatform()) {
      const { Share } = await import('@capacitor/share')
      await Share.share({ title: 'Join my band on Setlist Studio', text, dialogTitle: 'Invite Band Member' })
    } else {
      await navigator.clipboard.writeText(text)
    }
  }

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

        <div style={{ margin: '24px 16px 8px' }}>
          <div className="section-label">Account</div>
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
          {isOwner && (
            <div
              onClick={handleGenerateInvite}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderBottom: '1px solid var(--border)',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>Invite Band Member</span>
              <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>›</span>
            </div>
          )}
          <div
            onClick={() => setShowLogoutConfirm(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '14px 16px',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 14, color: 'var(--accent-2)' }}>Log Out</span>
          </div>
        </div>
      </div>

      <BottomSheet isOpen={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)}>
        <div className="sheet-header">
          <button className="sheet-cancel" onClick={() => setShowLogoutConfirm(false)}>No</button>
          <span className="sheet-title">Log Out?</span>
          <button
            className="sheet-confirm"
            style={{ color: 'var(--accent-2)' }}
            onClick={async () => {
              setShowLogoutConfirm(false)
              await signOut()
            }}
          >
            Yes
          </button>
        </div>
        <div className="sheet-content" style={{ padding: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
            Are you sure you want to log out?
          </p>
        </div>
      </BottomSheet>
    </PageTransition>
  )
}
