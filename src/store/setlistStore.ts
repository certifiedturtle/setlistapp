import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { arrayMove } from '@dnd-kit/sortable'
import { Setlist, SetlistSong } from '@/types'
import { seedSetlists } from '@/data/seed'

interface SetlistState {
  setlists: Setlist[]

  addSetlist: (setlist: Setlist) => void
  updateSetlist: (id: string, updates: Partial<Setlist>) => void
  deleteSetlist: (id: string) => void
  addSongsToSetlist: (setlistId: string, songIds: string[]) => void
  removeSongFromSetlist: (setlistId: string, songId: string) => void
  reorderSongs: (setlistId: string, activeId: string, overId: string) => void
  renameSetlist: (setlistId: string, name: string) => void
}

export const useSetlistStore = create<SetlistState>()(
  persist(
    (set) => ({
      setlists: seedSetlists,

      addSetlist: (setlist) =>
        set((s) => ({ setlists: [...s.setlists, setlist] })),

      updateSetlist: (id, updates) =>
        set((s) => ({
          setlists: s.setlists.map((sl) => (sl.id === id ? { ...sl, ...updates } : sl)),
        })),

      deleteSetlist: (id) =>
        set((s) => ({ setlists: s.setlists.filter((sl) => sl.id !== id) })),

      addSongsToSetlist: (setlistId, songIds) =>
        set((s) => ({
          setlists: s.setlists.map((sl) => {
            if (sl.id !== setlistId) return sl
            const existingIds = new Set(sl.songs.map((s) => s.songId))
            const newSongs: SetlistSong[] = songIds
              .filter((id) => !existingIds.has(id))
              .map((id, i) => ({ songId: id, order: sl.songs.length + i }))
            return { ...sl, songs: [...sl.songs, ...newSongs] }
          }),
        })),

      removeSongFromSetlist: (setlistId, songId) =>
        set((s) => ({
          setlists: s.setlists.map((sl) => {
            if (sl.id !== setlistId) return sl
            const filtered = sl.songs
              .filter((s) => s.songId !== songId)
              .map((s, i) => ({ ...s, order: i }))
            return { ...sl, songs: filtered }
          }),
        })),

      reorderSongs: (setlistId, activeId, overId) =>
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
            return { ...sl, songs: reordered }
          }),
        })),

      renameSetlist: (setlistId, name) =>
        set((s) => ({
          setlists: s.setlists.map((sl) => (sl.id === setlistId ? { ...sl, name } : sl)),
        })),
    }),
    { name: 'setlist-studio-setlists' }
  )
)
