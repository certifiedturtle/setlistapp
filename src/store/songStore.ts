import { create } from 'zustand'
import { Song, EnergyLevel, SongType } from '@/types'
import { supabase } from '@/lib/supabase'

interface SongFilters {
  genre: string | null
  type: SongType | null
  energy: EnergyLevel | null
}

interface SongState {
  songs: Song[]
  loading: boolean
  initialized: boolean
  searchQuery: string
  activeFilter: string // 'all' | 'covers' | 'originals' | genre name
  filters: SongFilters

  initialize: (userId: string) => Promise<void>
  reset: () => void
  addSong: (song: Song) => Promise<void>
  updateSong: (id: string, updates: Partial<Song>) => Promise<void>
  deleteSong: (id: string) => Promise<void>
  setSearchQuery: (q: string) => void
  setActiveFilter: (filter: string) => void
}

function rowToSong(row: Record<string, unknown>): Song {
  return {
    id: row.id as string,
    title: row.title as string,
    artist: (row.artist as string) ?? '',
    key: (row.key as Song['key']) ?? 'C',
    duration: (row.duration as string) ?? '0:00',
    durationSecs: (row.duration_secs as number) ?? 0,
    type: (row.type as SongType) ?? 'cover',
    genre: (row.genre as string) ?? '',
    energy: (row.energy as EnergyLevel) ?? 'mid',
    lyrics: row.lyrics as string | undefined,
    toneNotes: row.tone_notes as string | undefined,
    stageName: row.stage_name as string | undefined,
    tags: (row.tags as string[]) ?? [],
    year: row.year as number | undefined,
  }
}

function songToRow(song: Song, userId: string) {
  return {
    id: song.id,
    user_id: userId,
    title: song.title,
    artist: song.artist,
    key: song.key,
    duration: song.duration,
    duration_secs: song.durationSecs,
    type: song.type,
    genre: song.genre,
    energy: song.energy,
    lyrics: song.lyrics ?? null,
    tone_notes: song.toneNotes ?? null,
    stage_name: song.stageName ?? null,
    tags: song.tags,
    year: song.year ?? null,
  }
}

export const useSongStore = create<SongState>()((set, get) => ({
  songs: [],
  loading: false,
  initialized: false,
  searchQuery: '',
  activeFilter: 'all',
  filters: { genre: null, type: null, energy: null },

  initialize: async (userId: string) => {
    if (get().initialized) return
    set({ loading: true })

    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Failed to fetch songs:', error)
      set({ loading: false })
      return
    }

    if (data.length === 0) {
      // Migrate from localStorage
      try {
        const raw = localStorage.getItem('setlist-studio-songs')
        if (raw) {
          const parsed = JSON.parse(raw)
          const localSongs: Song[] = parsed?.state?.songs ?? []
          if (localSongs.length > 0) {
            const rows = localSongs.map((s) => songToRow(s, userId))
            const { error: insertError } = await supabase.from('songs').insert(rows)
            if (!insertError) {
              localStorage.removeItem('setlist-studio-songs')
              set({ songs: localSongs, loading: false, initialized: true })
              return
            }
          }
        }
      } catch {
        // ignore migration errors
      }
    }

    set({ songs: data.map(rowToSong), loading: false, initialized: true })
  },

  reset: () => set({ songs: [], loading: false, initialized: false, searchQuery: '', activeFilter: 'all' }),

  addSong: async (song: Song) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    // Optimistic
    set((s) => ({ songs: [...s.songs, song] }))
    const { error } = await supabase.from('songs').insert(songToRow(song, user.id))
    if (error) {
      console.error('Failed to add song:', error)
      // Rollback
      set((s) => ({ songs: s.songs.filter((x) => x.id !== song.id) }))
    }
  },

  updateSong: async (id: string, updates: Partial<Song>) => {
    // Optimistic
    set((s) => ({
      songs: s.songs.map((song) => (song.id === id ? { ...song, ...updates } : song)),
    }))
    const dbUpdates: Record<string, unknown> = {}
    if (updates.title !== undefined) dbUpdates.title = updates.title
    if (updates.artist !== undefined) dbUpdates.artist = updates.artist
    if (updates.key !== undefined) dbUpdates.key = updates.key
    if (updates.duration !== undefined) dbUpdates.duration = updates.duration
    if (updates.durationSecs !== undefined) dbUpdates.duration_secs = updates.durationSecs
    if (updates.type !== undefined) dbUpdates.type = updates.type
    if (updates.genre !== undefined) dbUpdates.genre = updates.genre
    if (updates.energy !== undefined) dbUpdates.energy = updates.energy
    if (updates.lyrics !== undefined) dbUpdates.lyrics = updates.lyrics
    if (updates.toneNotes !== undefined) dbUpdates.tone_notes = updates.toneNotes
    if (updates.stageName !== undefined) dbUpdates.stage_name = updates.stageName
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags
    if (updates.year !== undefined) dbUpdates.year = updates.year
    const { error } = await supabase.from('songs').update(dbUpdates).eq('id', id)
    if (error) console.error('Failed to update song:', error)
  },

  deleteSong: async (id: string) => {
    // Optimistic
    set((s) => ({ songs: s.songs.filter((song) => song.id !== id) }))
    const { error } = await supabase.from('songs').delete().eq('id', id)
    if (error) console.error('Failed to delete song:', error)
  },

  setSearchQuery: (q) => set({ searchQuery: q }),
  setActiveFilter: (filter) => set({ activeFilter: filter }),
}))

export const useFilteredSongs = () =>
  useSongStore((state) => {
    const { songs, searchQuery, activeFilter } = state
    return songs.filter((song) => {
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        !q ||
        song.title.toLowerCase().includes(q) ||
        song.artist.toLowerCase().includes(q) ||
        song.key.toLowerCase().includes(q) ||
        song.genre.toLowerCase().includes(q)

      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'covers' && song.type === 'cover') ||
        (activeFilter === 'originals' && song.type === 'original') ||
        song.genre.toLowerCase() === activeFilter.toLowerCase()

      return matchesSearch && matchesFilter
    })
  })
