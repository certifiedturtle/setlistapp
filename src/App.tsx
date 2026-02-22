import { useLocation, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AppShell } from '@/components/layout/AppShell'
import { LibraryPage } from '@/pages/Library/LibraryPage'
import { SongDetailPage } from '@/pages/SongDetail/SongDetailPage'
import { AddSongPage } from '@/pages/Library/AddSongPage'
import { SetlistsPage } from '@/pages/Setlists/SetlistsPage'
import { CreateSetlistPage } from '@/pages/Setlists/CreateSetlistPage'
import { SetlistBuilderPage } from '@/pages/Setlists/SetlistBuilderPage'
import { SharePage } from '@/pages/Share/SharePage'
import { GigsPage } from '@/pages/Gigs/GigsPage'
import { SettingsPage } from '@/pages/Settings/SettingsPage'

export function App() {
  const location = useLocation()

  return (
    <AppShell>
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Navigate to="/library" replace />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/library/add" element={<AddSongPage />} />
          <Route path="/library/song/:songId" element={<SongDetailPage />} />
          <Route path="/setlists" element={<SetlistsPage />} />
          <Route path="/setlists/new" element={<CreateSetlistPage />} />
          <Route path="/setlists/:setlistId" element={<SetlistBuilderPage />} />
          <Route path="/setlists/:setlistId/share" element={<SharePage />} />
          <Route path="/gigs" element={<GigsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </AnimatePresence>
    </AppShell>
  )
}
