import { useEffect } from 'react'
import { useLocation, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AppShell } from '@/components/layout/AppShell'
import { LibraryPage } from '@/pages/Library/LibraryPage'
import { SongDetailPage } from '@/pages/SongDetail/SongDetailPage'
import { AddSongPage } from '@/pages/Library/AddSongPage'
import { EditSongPage } from '@/pages/Library/EditSongPage'
import { SetlistsPage } from '@/pages/Setlists/SetlistsPage'
import { CreateSetlistPage } from '@/pages/Setlists/CreateSetlistPage'
import { SetlistBuilderPage } from '@/pages/Setlists/SetlistBuilderPage'
import { SharePage } from '@/pages/Share/SharePage'
import { GigsPage } from '@/pages/Gigs/GigsPage'
import { SettingsPage } from '@/pages/Settings/SettingsPage'
import { LoginPage } from '@/pages/Login/LoginPage'
import { useAuth } from '@/contexts/AuthContext'

function AuthCallback() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading) {
      if (user) {
        navigate('/library', { replace: true })
      } else {
        navigate('/login', { replace: true })
      }
    }
  }, [user, loading, navigate])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100svh', background: '#0c0c0f',
    }}>
      <div style={{
        width: 32, height: 32, border: '2px solid #2a2a38',
        borderTopColor: '#e8ff47', borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100svh',
        background: '#0c0c0f',
      }}>
        <div style={{
          width: 32,
          height: 32,
          border: '2px solid #2a2a38',
          borderTopColor: '#e8ff47',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export function App() {
  const location = useLocation()

  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <AppShell>
            <AnimatePresence mode="wait" initial={false}>
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Navigate to="/library" replace />} />
                <Route path="/library" element={<LibraryPage />} />
                <Route path="/library/add" element={<AddSongPage />} />
                <Route path="/library/song/:songId" element={<SongDetailPage />} />
                <Route path="/library/song/:songId/edit" element={<EditSongPage />} />
                <Route path="/setlists" element={<SetlistsPage />} />
                <Route path="/setlists/new" element={<CreateSetlistPage />} />
                <Route path="/setlists/:setlistId" element={<SetlistBuilderPage />} />
                <Route path="/setlists/:setlistId/share" element={<SharePage />} />
                <Route path="/gigs" element={<GigsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </AnimatePresence>
          </AppShell>
        </ProtectedRoute>
      } />
    </Routes>
  )
}
