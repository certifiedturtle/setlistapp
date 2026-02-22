import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Song, EnergyLevel, SongType } from '@/types'
import { seedSongs } from '@/data/seed'

interface SongFilters {
  genre: string | null
  type: SongType | null
  energy: EnergyLevel | null
}

interface SongState {
  songs: Song[]
  searchQuery: string
  activeFilter: string // 'all' | 'covers' | 'originals' | genre name
  filters: SongFilters

  addSong: (song: Song) => void
  updateSong: (id: string, updates: Partial<Song>) => void
  deleteSong: (id: string) => void
  setSearchQuery: (q: string) => void
  setActiveFilter: (filter: string) => void
}

export const useSongStore = create<SongState>()(
  persist(
    (set) => ({
      songs: seedSongs,
      searchQuery: '',
      activeFilter: 'all',
      filters: { genre: null, type: null, energy: null },

      addSong: (song) => set((s) => ({ songs: [...s.songs, song] })),
      updateSong: (id, updates) =>
        set((s) => ({
          songs: s.songs.map((song) => (song.id === id ? { ...song, ...updates } : song)),
        })),
      deleteSong: (id) => set((s) => ({ songs: s.songs.filter((song) => song.id !== id) })),
      setSearchQuery: (q) => set({ searchQuery: q }),
      setActiveFilter: (filter) => set({ activeFilter: filter }),
    }),
    { name: 'setlist-studio-songs' }
  )
)

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
