import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Link2, X, Pencil } from 'lucide-react'
import { Browser } from '@capacitor/browser'
import { PageTransition } from '@/components/layout/PageTransition'
import { useGigStore } from '@/store/gigStore'
import { useSetlistStore } from '@/store/setlistStore'
import { SetlistPickerModal } from '@/components/modals/SetlistPickerModal'
import clsx from 'clsx'

const EQUIPMENT_ITEMS = [
  'Lead Amp',
  'Rhythm Amp',
  'Bass Amp',
  'Full Drum Set',
  'Drum Throne',
  'Snare Drum',
  'Breakables',
  'Microphone',
  'In-Ear Monitors',
]

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  color: 'var(--text-secondary)',
  marginBottom: 8,
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

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)',
  marginBottom: 16,
}

export function GigDetailPage() {
  const { gigId } = useParams<{ gigId: string }>()
  const navigate = useNavigate()
  const gig = useGigStore((s) => s.gigs.find((g) => g.id === gigId))
  const updateGig = useGigStore((s) => s.updateGig)

  const setlists = useSetlistStore((s) => s.setlists)

  const [venue, setVenue] = useState(gig?.venue ?? '')
  const [linkedSetlistId, setLinkedSetlistId] = useState<string | undefined>(gig?.setlistId)
  const [showSetlistPicker, setShowSetlistPicker] = useState(false)

  const linkedSetlist = setlists.find((sl) => sl.id === linkedSetlistId)

  const [times, setTimes] = useState({
    loadIn:     gig?.loadInTime     ?? '',
    soundCheck: gig?.soundCheckTime ?? '',
    doors:      gig?.doorsTime      ?? '',
    setStart:   gig?.setStartTime   ?? '',
    setEnd:     gig?.setEndTime     ?? '',
    loadOut:    gig?.loadOutTime    ?? '',
  })
  const [location, setLocation]       = useState(gig?.location     ?? '')
  const [contactName, setContactName] = useState(gig?.contactName  ?? '')
  const [contactPhone, setContactPhone] = useState(gig?.contactPhone ?? '')
  const [ticketLink, setTicketLink]   = useState(gig?.ticketLink   ?? '')
  const [notes, setNotes]             = useState(gig?.notes        ?? '')
  const [equipment, setEquipment]     = useState<{ items: string[]; otherText: string }>({
    items:     gig?.equipment?.items    ?? [],
    otherText: gig?.equipment?.otherText ?? '',
  })
  type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')

  const isDirty = useMemo(() => {
    if (times.loadIn      !== (gig?.loadInTime      ?? '')) return true
    if (times.soundCheck  !== (gig?.soundCheckTime  ?? '')) return true
    if (times.doors       !== (gig?.doorsTime       ?? '')) return true
    if (times.setStart    !== (gig?.setStartTime    ?? '')) return true
    if (times.setEnd      !== (gig?.setEndTime      ?? '')) return true
    if (times.loadOut     !== (gig?.loadOutTime     ?? '')) return true
    if (location          !== (gig?.location        ?? '')) return true
    if (contactName       !== (gig?.contactName     ?? '')) return true
    if (contactPhone      !== (gig?.contactPhone    ?? '')) return true
    if (ticketLink        !== (gig?.ticketLink      ?? '')) return true
    if (venue             !== (gig?.venue           ?? '')) return true
    if (notes             !== (gig?.notes           ?? '')) return true
    if (JSON.stringify(equipment.items) !== JSON.stringify(gig?.equipment?.items ?? [])) return true
    if (equipment.otherText             !== (gig?.equipment?.otherText ?? ''))           return true
    return false
  }, [times, venue, location, contactName, contactPhone, ticketLink, notes, equipment, gig])

  if (!gig) {
    return (
      <PageTransition>
        <div className="empty-state">
          <div className="empty-state-title">Gig not found</div>
        </div>
      </PageTransition>
    )
  }

  const venueName = gig.venue ?? 'Unnamed Gig'

  const formattedDate = gig.date
    ? new Date(gig.date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
      })
    : null

  const handleSave = async () => {
    setSaveStatus('saving')
    const equipmentPayload = equipment.items.length === 0 && !equipment.otherText
      ? undefined
      : { items: equipment.items, otherText: equipment.otherText || undefined }

    const ok = await updateGig(gig.id, {
      venue:          venue.trim()     || undefined,
      loadInTime:     times.loadIn     || undefined,
      soundCheckTime: times.soundCheck || undefined,
      doorsTime:      times.doors      || undefined,
      setStartTime:   times.setStart   || undefined,
      setEndTime:     times.setEnd     || undefined,
      loadOutTime:    times.loadOut    || undefined,
      location:       location.trim()  || undefined,
      contactName:    contactName.trim() || undefined,
      contactPhone:   contactPhone.trim() || undefined,
      ticketLink:     ticketLink.trim() || undefined,
      notes:          notes.trim()     || undefined,
      equipment:      equipmentPayload,
    })

    if (ok) {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } else {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }
  }

  const handleSetlistSelect = async (setlistId: string | null) => {
    const ok = await updateGig(gig.id, { setlistId: setlistId ?? undefined })
    if (ok) setLinkedSetlistId(setlistId ?? undefined)
  }

  const handleOpenLink = async () => {
    if (!ticketLink.trim()) return
    await Browser.open({ url: ticketLink.trim() })
  }

  const toggleEquipmentItem = (item: string) => {
    setEquipment((prev) => {
      const has = prev.items.includes(item)
      return { ...prev, items: has ? prev.items.filter((i) => i !== item) : [...prev.items, item] }
    })
  }

  const otherChecked = equipment.items.includes('Other')

  return (
    <PageTransition>
      {/* Back header with Save button */}
      <div className="back-header" style={{ justifyContent: 'space-between' }}>
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={16} />
          Gigs
        </button>
        <button
          onClick={handleSave}
          disabled={!isDirty || saveStatus === 'saving' || saveStatus === 'saved'}
          style={{
            padding: '8px 16px',
            background: saveStatus === 'error'
              ? '#c0392b'
              : (!isDirty || saveStatus === 'saved' || saveStatus === 'saving')
                ? 'var(--surface)'
                : 'var(--accent)',
            color: saveStatus === 'error'
              ? '#fff'
              : (!isDirty || saveStatus === 'saved' || saveStatus === 'saving')
                ? 'var(--text-secondary)'
                : '#000',
            border: '1px solid var(--border)',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            cursor: (!isDirty || saveStatus === 'saving' || saveStatus === 'saved') ? 'default' : 'pointer',
            opacity: saveStatus === 'saving' ? 0.6 : 1,
          }}
        >
          {saveStatus === 'saving' ? 'Saving…'
            : saveStatus === 'saved' ? 'Saved!'
            : saveStatus === 'error' ? 'Save Failed'
            : 'Save'}
        </button>
      </div>

      {/* Title block */}
      <div style={{ padding: '4px 20px 20px' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 800,
          color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          Gig Details
        </div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700,
          color: 'var(--accent)', marginTop: 2 }}>
          {venueName}
        </div>
        {formattedDate && (
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            {formattedDate}
          </div>
        )}
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 48 }}>

        {/* VENUE & SETLIST */}
        <div>
          <div style={sectionTitleStyle}>Venue &amp; Setlist</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Venue</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Venue name…"
                autoComplete="off"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Setlist</label>
              {linkedSetlist ? (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '12px 16px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                }}>
                  <button
                    onClick={() => navigate(`/setlists/${linkedSetlistId}`, { state: { from: 'gig' } })}
                    style={{
                      flex: 1, background: 'none', border: 'none', cursor: 'pointer',
                      textAlign: 'left', padding: 0,
                      fontWeight: 700, fontSize: 15, color: 'var(--accent)',
                    }}
                  >
                    {linkedSetlist.name}
                  </button>
                  <button
                    onClick={() => setShowSetlistPicker(true)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-secondary)', padding: 4 }}
                    title="Change setlist"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleSetlistSelect(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-secondary)', padding: 4 }}
                    title="Remove link"
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSetlistPicker(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', padding: '12px 16px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    fontSize: 15,
                  }}
                >
                  <Link2 size={16} />
                  Link a setlist…
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SCHEDULE */}
        <div>
          <div style={sectionTitleStyle}>Schedule</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {(
              [
                { label: 'Load-in',     key: 'loadIn'     },
                { label: 'Sound Check', key: 'soundCheck' },
                { label: 'Doors',       key: 'doors'      },
                { label: 'Set Start',   key: 'setStart'   },
                { label: 'Set End',     key: 'setEnd'     },
                { label: 'Load-out',    key: 'loadOut'    },
              ] as { label: string; key: keyof typeof times }[]
            ).map(({ label, key }) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                <input
                  type="time"
                  value={times[key]}
                  onChange={(e) => setTimes((prev) => ({ ...prev, [key]: e.target.value }))}
                  style={inputStyle}
                />
              </div>
            ))}
          </div>
        </div>

        {/* LOCATION & CONTACT */}
        <div>
          <div style={sectionTitleStyle}>Location &amp; Contact</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Address or city…"
                autoComplete="off"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Contact</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Name…"
                autoComplete="off"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value.slice(0, 13))}
                placeholder="+1 555 000 0000"
                autoComplete="off"
                maxLength={13}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* TICKET LINK */}
        <div>
          <div style={sectionTitleStyle}>Ticket Link</div>
          <input
            type="text"
            value={ticketLink}
            onChange={(e) => setTicketLink(e.target.value)}
            placeholder="https://…"
            autoComplete="off"
            style={inputStyle}
          />
          {ticketLink.trim() && (
            <button
              onClick={handleOpenLink}
              style={{
                marginTop: 10,
                padding: '10px 16px',
                background: 'var(--surface)',
                color: 'var(--accent)',
                border: '1px solid var(--accent)',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Open Link →
            </button>
          )}
        </div>

        {/* NOTES */}
        <div>
          <div style={sectionTitleStyle}>Notes</div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any gig notes…"
            rows={4}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
          />
        </div>

        {/* EQUIPMENT NEEDED */}
        <div>
          <div style={sectionTitleStyle}>Equipment Needed</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {EQUIPMENT_ITEMS.map((item) => (
              <button
                key={item}
                onClick={() => toggleEquipmentItem(item)}
                className={clsx('chip', { active: equipment.items.includes(item) })}
                style={{ justifyContent: 'flex-start', width: '100%', textAlign: 'left' }}
              >
                {item}
              </button>
            ))}
            {/* Other */}
            <button
              onClick={() => toggleEquipmentItem('Other')}
              className={clsx('chip', { active: otherChecked })}
              style={{ justifyContent: 'flex-start', width: '100%', textAlign: 'left' }}
            >
              Other
            </button>
            {otherChecked && (
              <input
                type="text"
                value={equipment.otherText}
                onChange={(e) =>
                  setEquipment((prev) => ({ ...prev, otherText: e.target.value.slice(0, 30) }))
                }
                placeholder="Describe other equipment…"
                maxLength={30}
                autoComplete="off"
                style={{ ...inputStyle, marginTop: 4 }}
              />
            )}
          </div>
        </div>

      </div>

      <SetlistPickerModal
        isOpen={showSetlistPicker}
        onClose={() => setShowSetlistPicker(false)}
        linkedSetlistId={linkedSetlistId}
        onSelect={async (id) => {
          await handleSetlistSelect(id)
          setShowSetlistPicker(false)
        }}
        onCreateNew={() => {
          setShowSetlistPicker(false)
          navigate(`/setlists/new?returnToGig=${gig.id}`)
        }}
      />
    </PageTransition>
  )
}
