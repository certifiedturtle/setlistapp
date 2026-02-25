import { create } from 'zustand'

interface UiState {
  songPickerSetlistId: string | null
  pendingInviteToken: string | null
  isJoinBandModalOpen: boolean
  isCreateBandModalOpen: boolean
  openSongPicker: (setlistId: string) => void
  closeSongPicker: () => void
  setPendingInviteToken: (token: string | null) => void
  setJoinBandModalOpen: (open: boolean) => void
  setCreateBandModalOpen: (open: boolean) => void
}

export const useUiStore = create<UiState>()((set) => ({
  songPickerSetlistId: null,
  pendingInviteToken: null,
  isJoinBandModalOpen: false,
  isCreateBandModalOpen: false,
  openSongPicker: (setlistId) => set({ songPickerSetlistId: setlistId }),
  closeSongPicker: () => set({ songPickerSetlistId: null }),
  setPendingInviteToken: (token) => set({ pendingInviteToken: token }),
  setJoinBandModalOpen: (open) => set({ isJoinBandModalOpen: open }),
  setCreateBandModalOpen: (open) => set({ isCreateBandModalOpen: open }),
}))
