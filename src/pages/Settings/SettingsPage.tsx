import { Settings } from 'lucide-react'
import { PageTransition } from '@/components/layout/PageTransition'

const SETTINGS_ITEMS = [
  { label: 'Band Name', value: 'The Velvet Echo' },
  { label: 'Default Target Duration', value: '60 min' },
  { label: 'Default Song Key', value: 'C' },
  { label: 'App Theme', value: 'Dark' },
]

export function SettingsPage() {
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
          {SETTINGS_ITEMS.map((item, i) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderBottom:
                  i < SETTINGS_ITEMS.length - 1 ? '1px solid var(--border)' : 'none',
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
