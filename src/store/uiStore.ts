import { create } from 'zustand'

interface UiState {
  songPickerSetlistId: string | null
  openSongPicker: (setlistId: string) => void
  closeSongPicker: () => void
}

export const useUiStore = create<UiState>()((set) => ({
  songPickerSetlistId: null,
  openSongPicker: (setlistId) => set({ songPickerSetlistId: setlistId }),
  closeSongPicker: () => set({ songPickerSetlistId: null }),
}))
