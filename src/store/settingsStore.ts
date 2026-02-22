import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  bandName: string
  setBandName: (name: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      bandName: 'The Velvet Echo',
      setBandName: (name) => set({ bandName: name }),
    }),
    { name: 'setlist-studio-settings' }
  )
)
