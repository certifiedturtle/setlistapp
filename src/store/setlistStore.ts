import { create } from 'zustand'
import { arrayMove } from '@dnd-kit/sortable'
import { Setlist, SetlistSong } from '@/types'
import { supabase } from '@/lib/supabase'

interface SetlistState {
  setlists: Setlist[]
  initialized: boolean
  currentBandId: string | null
  currentUserId: string | null

  initialize: (userId: string, bandId?: string | null) => Promise<void>
  reset: () => void
  addSetlist: (setlist: Setlist) => Promise<void>
  updateSetlist: (id: string, updates: Partial<Setlist>) => Promise<void>
  deleteSetlist: (id: string) => Promise<void>
  addSongsToSetlist: (setlistId: string, songIds: string[]) => Promise<void>
  removeSongFromSetlist: (setlistId: string, songId: string) => Promise<void>
  reorderSongs: (setlistId: string, activeId: string, overId: string) => Promise<void>
  renameSetlist: (setlistId: string, name: string) => Promise<void>
}

function rowToSetlist(row: Record<string, unknown>): Setlist {
  const songsOrder = (row.songs_order as SetlistSong[]) ?? []
  return {
    id: row.id as string,
    name: row.name as string,
    date: row.date as string | undefined,
    time: row.time as string | undefined,
    venue: row.venue as string | undefined,
    songs: songsOrder,
    targetDuration: (row.target_duration as number) ?? 3600,
  }
}

function setlistToRow(setlist: Setlist, userId: string) {
  return {
    id: setlist.id,
    user_id: userId,
    name: setlist.name,
    date: setlist.date ?? null,
    time: setlist.time ?? null,
    venue: setlist.venue ?? null,
    target_duration: setlist.targetDuration,
    songs_order: setlist.songs,
  }
}

async function persistSongsOrder(setlistId: string, songs: SetlistSong[]) {
  const { error } = await supabase
    .from('setlists')
    .update({ songs_order: songs })
    .eq('id', setlistId)
  if (error) console.error('Failed to update setlist songs_order:', error)
}

export const useSetlistStore = create<SetlistState>()((set, get) => ({
  setlists: [],
  initialized: false,
  currentBandId: null,
  currentUserId: null,

  initialize: async (userId: string, bandId?: string | null) => {
    if (get().initialized) return
    set({ currentBandId: bandId ?? null, currentUserId: userId })

    let query = supabase.from('setlists').select('*')
    if (bandId) {
      query = query.eq('band_id', bandId)
    } else {
      query = query.eq('user_id', userId).is('band_id', null)
    }
    const { data, error } = await query.order('created_at', { ascending: true })

    if (error) {
      console.error('Failed to fetch setlists:', error)
      return
    }

    if (data.length === 0) {
      // Migrate from localStorage
      try {
        const raw = localStorage.getItem('setlist-studio-setlists')
        if (raw) {
          const parsed = JSON.parse(raw)
          const localSetlists: Setlist[] = parsed?.state?.setlists ?? []
          if (localSetlists.length > 0) {
            const rows = localSetlists.map((sl) => setlistToRow(sl, userId))
            const { error: insertError } = await supabase.from('setlists').insert(rows)
            if (!insertError) {
              localStorage.removeItem('setlist-studio-setlists')
              set({ setlists: localSetlists, initialized: true })
              return
            }
          }
        }
      } catch {
        // ignore migration errors
      }
    }

    set({ setlists: data.map(rowToSetlist), initialized: true })
  },

  reset: () => set({ setlists: [], initialized: false, currentBandId: null, currentUserId: null }),

  addSetlist: async (setlist: Setlist) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { currentBandId } = get()
    set((s) => ({ setlists: [...s.setlists, setlist] }))
    const record = { ...setlistToRow(setlist, user.id), band_id: currentBandId ?? null }
    const { error } = await supabase.from('setlists').insert(record)
    if (error) {
      console.error('Failed to add setlist:', error)
      set((s) => ({ setlists: s.setlists.filter((x) => x.id !== setlist.id) }))
    }
  },

  updateSetlist: async (id: string, updates: Partial<Setlist>) => {
    set((s) => ({
      setlists: s.setlists.map((sl) => (sl.id === id ? { ...sl, ...updates } : sl)),
    }))
    const dbUpdates: Record<string, unknown> = {}
    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.date !== undefined) dbUpdates.date = updates.date
    if (updates.time !== undefined) dbUpdates.time = updates.time
    if (updates.venue !== undefined) dbUpdates.venue = updates.venue
    if (updates.targetDuration !== undefined) dbUpdates.target_duration = updates.targetDuration
    if (updates.songs !== undefined) dbUpdates.songs_order = updates.songs
    const { error } = await supabase.from('setlists').update(dbUpdates).eq('id', id)
    if (error) console.error('Failed to update setlist:', error)
  },

  deleteSetlist: async (id: string) => {
    set((s) => ({ setlists: s.setlists.filter((sl) => sl.id !== id) }))
    const { error } = await supabase.from('setlists').delete().eq('id', id)
    if (error) console.error('Failed to delete setlist:', error)
  },

  addSongsToSetlist: async (setlistId: string, songIds: string[]) => {
    let updatedSongs: SetlistSong[] = []
    set((s) => ({
      setlists: s.setlists.map((sl) => {
        if (sl.id !== setlistId) return sl
        const existingIds = new Set(sl.songs.map((s) => s.songId))
        const newSongs: SetlistSong[] = songIds
          .filter((id) => !existingIds.has(id))
          .map((id, i) => ({ songId: id, order: sl.songs.length + i }))
        updatedSongs = [...sl.songs, ...newSongs]
        return { ...sl, songs: updatedSongs }
      }),
    }))
    await persistSongsOrder(setlistId, updatedSongs)
  },

  removeSongFromSetlist: async (setlistId: string, songId: string) => {
    let updatedSongs: SetlistSong[] = []
    set((s) => ({
      setlists: s.setlists.map((sl) => {
        if (sl.id !== setlistId) return sl
        const filtered = sl.songs
          .filter((s) => s.songId !== songId)
          .map((s, i) => ({ ...s, order: i }))
        updatedSongs = filtered
        return { ...sl, songs: filtered }
      }),
    }))
    await persistSongsOrder(setlistId, updatedSongs)
  },

  reorderSongs: async (setlistId: string, activeId: string, overId: string) => {
    let updatedSongs: SetlistSong[] = []
    set((s) => ({
      setlists: s.setlists.map((sl) => {
        if (sl.id !== setlistId) return sl
        const oldIndex = sl.songs.findIndex((s) => s.songId === activeId)
        const newIndex = sl.songs.findIndex((s) => s.songId === overId)
        if (oldIndex === -1 || newIndex === -1) return sl
        const reordered = arrayMove(sl.songs, oldIndex, newIndex).map((s, i) => ({
          ...s,
          order: i,
        }))
        updatedSongs = reordered
        return { ...sl, songs: reordered }
      }),
    }))
    await persistSongsOrder(setlistId, updatedSongs)
  },

  renameSetlist: async (setlistId: string, name: string) => {
    set((s) => ({
      setlists: s.setlists.map((sl) => (sl.id === setlistId ? { ...sl, name } : sl)),
    }))
    const { error } = await supabase.from('setlists').update({ name }).eq('id', setlistId)
    if (error) console.error('Failed to rename setlist:', error)
  },
}))
