import { create } from 'zustand'
import { Gig } from '@/types'
import { supabase } from '@/lib/supabase'

interface GigState {
  gigs: Gig[]
  loading: boolean
  initialized: boolean

  initialize: (userId: string, bandId: string) => Promise<void>
  addGig: (userId: string, bandId: string, venue: string, date: string) => Promise<boolean>
  updateGig: (id: string, updates: Partial<Gig>) => Promise<boolean>
  reset: () => void
}

function rowToGig(row: Record<string, unknown>): Gig {
  return {
    id: row.id as string,
    bandId: row.band_id as string,
    createdBy: row.created_by as string,
    name: row.name as string,
    date: row.date as string | undefined,
    venue: row.venue as string | undefined,
    notes: row.notes as string | undefined,
    setlistId: row.setlist_id as string | undefined,
    createdAt: row.created_at as string,
    loadInTime:     row.load_in_time as string | undefined,
    soundCheckTime: row.sound_check_time as string | undefined,
    doorsTime:      row.doors_time as string | undefined,
    setStartTime:   row.set_start_time as string | undefined,
    setEndTime:     row.set_end_time as string | undefined,
    loadOutTime:    row.load_out_time as string | undefined,
    location:       row.location as string | undefined,
    contactName:    row.contact_name as string | undefined,
    contactPhone:   row.contact_phone as string | undefined,
    ticketLink:     row.ticket_link as string | undefined,
    equipment:      row.equipment as Gig['equipment'] | undefined,
  }
}

export const useGigStore = create<GigState>()((set, get) => ({
  gigs: [],
  loading: false,
  initialized: false,

  initialize: async (_userId: string, bandId: string) => {
    if (get().initialized) return
    set({ loading: true })

    const { data, error } = await supabase
      .from('gigs')
      .select('*')
      .eq('band_id', bandId)
      .order('date', { ascending: true })

    if (error) {
      console.error('Failed to fetch gigs:', error)
      set({ loading: false })
      return
    }

    set({ gigs: (data ?? []).map(rowToGig), loading: false, initialized: true })
  },

  addGig: async (userId, bandId, venue, date) => {
    const { data, error } = await supabase
      .from('gigs')
      .insert({
        band_id: bandId,
        created_by: userId,
        name: venue,
        venue,
        date,
      })
      .select()
      .single()

    if (error || !data) {
      console.error('Failed to create gig:', error)
      return false
    }

    const newGig = rowToGig(data)
    set((state) => {
      const updated = [...state.gigs, newGig].sort((a, b) =>
        (a.date ?? '').localeCompare(b.date ?? '')
      )
      return { gigs: updated }
    })
    return true
  },

  updateGig: async (id, updates) => {
    const payload: Record<string, unknown> = {}
    if ('venue' in updates)        payload.venue           = updates.venue ?? null
    if ('setlistId' in updates)    payload.setlist_id      = updates.setlistId ?? null
    if ('notes' in updates)        payload.notes           = updates.notes ?? null
    if ('loadInTime' in updates)   payload.load_in_time    = updates.loadInTime ?? null
    if ('soundCheckTime' in updates) payload.sound_check_time = updates.soundCheckTime ?? null
    if ('doorsTime' in updates)    payload.doors_time      = updates.doorsTime ?? null
    if ('setStartTime' in updates) payload.set_start_time  = updates.setStartTime ?? null
    if ('setEndTime' in updates)   payload.set_end_time    = updates.setEndTime ?? null
    if ('loadOutTime' in updates)  payload.load_out_time   = updates.loadOutTime ?? null
    if ('location' in updates)     payload.location        = updates.location ?? null
    if ('contactName' in updates)  payload.contact_name    = updates.contactName ?? null
    if ('contactPhone' in updates) payload.contact_phone   = updates.contactPhone ?? null
    if ('ticketLink' in updates)   payload.ticket_link     = updates.ticketLink ?? null
    if ('equipment' in updates)    payload.equipment       = updates.equipment ?? null

    const { error } = await supabase
      .from('gigs')
      .update(payload)
      .eq('id', id)

    if (error) {
      console.error('Failed to update gig:', error)
      return false
    }

    set((s) => ({ gigs: s.gigs.map((g) => g.id === id ? { ...g, ...updates } : g) }))
    return true
  },

  reset: () => set({ gigs: [], loading: false, initialized: false }),
}))
