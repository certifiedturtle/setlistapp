import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

interface SettingsState {
  bandName: string
  userId: string | null

  initialize: (userId: string) => Promise<void>
  reset: () => void
  setBandName: (name: string) => Promise<void>
}

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  bandName: 'My Band',
  userId: null,

  initialize: async (userId: string) => {
    set({ userId })
    const { data, error } = await supabase
      .from('profiles')
      .select('band_name')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Failed to fetch profile:', error)
      return
    }

    if (data?.band_name) {
      set({ bandName: data.band_name })
    } else {
      // Migrate band name from localStorage
      try {
        const raw = localStorage.getItem('setlist-studio-settings')
        if (raw) {
          const parsed = JSON.parse(raw)
          const localBandName: string = parsed?.state?.bandName
          if (localBandName) {
            set({ bandName: localBandName })
            await supabase
              .from('profiles')
              .upsert({ id: userId, band_name: localBandName })
            localStorage.removeItem('setlist-studio-settings')
          }
        }
      } catch {
        // ignore migration errors
      }
    }
  },

  reset: () => set({ bandName: 'My Band', userId: null }),

  setBandName: async (name: string) => {
    set({ bandName: name })
    const userId = get().userId
    if (userId) {
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: userId, band_name: name })
      if (error) console.error('Failed to update band name:', error)
    }
  },
}))
