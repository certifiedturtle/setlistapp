import { useRef, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { PageTransition } from '@/components/layout/PageTransition'
import { useAuth } from '@/contexts/AuthContext'
import { useBandStore } from '@/store/bandStore'
import { useUiStore } from '@/store/uiStore'
import { BottomSheet } from '@/components/modals/BottomSheet'
import { CreateBandModal } from '@/components/modals/CreateBandModal'

const STATIC_SETTINGS = [
  { label: 'Default Target Duration', value: '60 min' },
  { label: 'Default Song Key', value: 'C' },
  { label: 'App Theme', value: 'Dark' },
]

export function SettingsPage() {
  const { signOut, user } = useAuth()
  const { band, generateInvite, updateBandName } = useBandStore()
  const { isCreateBandModalOpen, setCreateBandModalOpen } = useUiStore()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showComingSoon, setShowComingSoon] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const isOwner = !band || band.owner_id === user?.id
  const displayedBandName = band?.name ?? ''

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

  function handleCreateBandTap() {
    if (band) {
      setShowComingSoon(true)
    } else {
      setCreateBandModalOpen(true)
    }
  }

  function startEditing() {
    if (!band || !isOwner) return
    setDraft(band.name)
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function commitEdit() {
    if (!band) return
    const trimmed = draft.trim() || band.name
    updateBandName(trimmed)
    setEditing(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') commitEdit()
    if (e.key === 'Escape') setEditing(false)
  }

  const canEditBandName = !!band && isOwner

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
          {/* Row 1: Band Name */}
          <div
            onClick={!editing && canEditBandName ? startEditing : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderBottom: '1px solid var(--border)',
              cursor: editing ? 'default' : canEditBandName ? 'pointer' : 'default',
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
              <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{displayedBandName}</span>
            )}
          </div>

          {/* Row 2: Create Band */}
          <div
            onClick={handleCreateBandTap}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderBottom: '1px solid var(--border)',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>Create Band</span>
            {!band && <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>›</span>}
          </div>

          {/* Row 3: Invite Band Member (owners only) */}
          {isOwner && (
            <div
              onClick={band ? handleGenerateInvite : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderBottom: '1px solid var(--border)',
                cursor: band ? 'pointer' : 'default',
                opacity: band ? 1 : 0.4,
              }}
            >
              <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>Invite Band Member</span>
              {band && <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>›</span>}
            </div>
          )}

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

      <CreateBandModal
        isOpen={isCreateBandModalOpen}
        onClose={() => setCreateBandModalOpen(false)}
      />

      <BottomSheet isOpen={showComingSoon} onClose={() => setShowComingSoon(false)}>
        <div className="sheet-header">
          <button className="sheet-cancel" onClick={() => setShowComingSoon(false)}>Close</button>
          <span className="sheet-title">Multiple Bands</span>
          <span style={{ width: 60 }} />
        </div>
        <div className="sheet-content" style={{ padding: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
            Multiple bands support coming soon!
          </p>
        </div>
      </BottomSheet>

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
