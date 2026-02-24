import { useEffect, useRef, useState } from 'react'
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
import { supabase } from '@/lib/supabase'

function AuthCallback() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const navigatedRef = useRef(false)
  const exchangedRef = useRef(false)
  const [error, setError] = useState<string | null>(null)

  // Explicitly trigger the PKCE exchange on mount.
  // detectSessionInUrl is false so Supabase will NOT do this automatically.
  useEffect(() => {
    if (exchangedRef.current) return
    exchangedRef.current = true

    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    // Diagnostic: log PKCE code_verifier presence before exchange
    const storageKeys = Object.keys(localStorage)
    const verifierKeys = storageKeys.filter(k => k.includes('code_verifier'))
    console.log('[AuthCallback] origin:', window.location.origin)
    console.log('[AuthCallback] code param present:', !!code)
    console.log('[AuthCallback] PKCE code_verifier keys in localStorage:', verifierKeys)

    if (!code) {
      console.warn('[AuthCallback] No code param — redirecting to /login')
      navigatedRef.current = true
      navigate('/login', { replace: true })
      return
    }

    supabase.auth.exchangeCodeForSession(code).then(({ error: exchangeError }) => {
      if (exchangeError) {
        console.error('[AuthCallback] exchangeCodeForSession failed:', exchangeError.message)
        setError(exchangeError.message)
        // Give user time to see the error before redirecting
        setTimeout(() => {
          if (!navigatedRef.current) {
            navigatedRef.current = true
            navigate('/login', { replace: true })
          }
        }, 5000)
      } else {
        console.log('[AuthCallback] Code exchange succeeded, waiting for session...')
      }
      // On success: onAuthStateChange fires SIGNED_IN → setUser() →
      // the effect below detects user and navigates to /library.
    })
  }, [navigate])

  // Navigate to /library as soon as SIGNED_IN fires and user is set.
  useEffect(() => {
    if (user && !navigatedRef.current) {
      console.log('[AuthCallback] User set — navigating to /library')
      navigatedRef.current = true
      navigate('/library', { replace: true })
    }
  }, [user, navigate])

  // Safety fallback: if auth hasn't resolved in 10s, show timeout message then redirect.
  useEffect(() => {
    const id = setTimeout(() => {
      if (!navigatedRef.current) {
        console.warn('[AuthCallback] 10s timeout — redirecting to /login')
        setError('Authentication timed out. Redirecting to login...')
        setTimeout(() => {
          if (!navigatedRef.current) {
            navigatedRef.current = true
            navigate('/login', { replace: true })
          }
        }, 3000)
      }
    }, 10000)
    return () => clearTimeout(id)
  }, [navigate])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 16,
      height: '100svh', background: '#0c0c0f', color: '#fff',
    }}>
      {error ? (
        <>
          <div style={{ color: '#ff6b6b', fontSize: 14, textAlign: 'center', maxWidth: 360, padding: '0 16px' }}>
            {error}
          </div>
          <div style={{ color: '#888', fontSize: 12 }}>Redirecting to login...</div>
        </>
      ) : (
        <div style={{
          width: 32, height: 32, border: '2px solid #2a2a38',
          borderTopColor: '#e8ff47', borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
      )}
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
