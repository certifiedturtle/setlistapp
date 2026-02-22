import { ReactNode } from 'react'
import { BottomNav } from './BottomNav'
import { SongPickerModal } from '@/components/modals/SongPickerModal'
import { useUiStore } from '@/store/uiStore'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const songPickerSetlistId = useUiStore((s) => s.songPickerSetlistId)

  return (
    <div className="app-shell">
      <div className="page-container">
        {children}
        {songPickerSetlistId && <SongPickerModal setlistId={songPickerSetlistId} />}
      </div>
      <BottomNav />
    </div>
  )
}
