import { useEffect, useRef, useState } from 'react'
import { useLocation, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { App as CapApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
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
import { GigDetailPage } from '@/pages/Gigs/GigDetailPage'
import { SettingsPage } from '@/pages/Settings/SettingsPage'
import { LoginPage } from '@/pages/Login/LoginPage'
import { JoinBandModal } from '@/components/modals/JoinBandModal'
import { useAuth } from '@/contexts/AuthContext'
import { useUiStore } from '@/store/uiStore'
import { supabase } from '@/lib/supabase'

function AuthCallback() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const navigatedRef = useRef(false)
  const [error, setError] = useState<string | null>(null)

  // Explicit PKCE exchange — detectSessionInUrl is false so this is the only
  // place the exchange happens, making it deterministic and debuggable.
  useEffect(() => {
    console.log('[AuthCallback] mounted, href:', window.location.href)
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const errorParam = params.get('error')
    const verifierKeys = Object.keys(localStorage).filter(k => k.includes('code_verifier'))
    console.log('[AuthCallback] code present:', !!code)
    console.log('[AuthCallback] error param:', errorParam)
    console.log('[AuthCallback] code_verifier keys in localStorage:', verifierKeys)

    if (errorParam) {
      console.error('[AuthCallback] OAuth error param:', errorParam)
      setError(`OAuth error: ${errorParam}`)
      return
    }

    if (!code) {
      console.error('[AuthCallback] No code in URL')
      setError('No authorization code found in callback URL.')
      return
    }

    supabase.auth.exchangeCodeForSession(code).then(({ data, error: exchErr }) => {
      console.log('[AuthCallback] exchangeCodeForSession result:', {
        hasSession: !!data?.session,
        userId: data?.session?.user?.id,
        error: exchErr?.message,
      })
      if (exchErr) {
        setError(`Authentication failed: ${exchErr.message}`)
      }
      // On success, SIGNED_IN fires → AuthContext sets user → navigation effect runs
    })
  }, [])

  // Navigate when AuthContext surfaces a user (after exchange fires SIGNED_IN)
  useEffect(() => {
    if (user && !navigatedRef.current) {
      navigatedRef.current = true
      navigate('/library', { replace: true })
    }
  }, [user, navigate])

  // 10s safety timeout
  useEffect(() => {
    const id = setTimeout(() => {
      if (!navigatedRef.current) {
        console.warn('[AuthCallback] 10s timeout — no user surfaced')
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
  const navigate = useNavigate()
  const { pendingInviteToken, isJoinBandModalOpen } = useUiStore()

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    const listenerPromise = CapApp.addListener('appUrlOpen', async ({ url }) => {
      console.log('[appUrlOpen] received:', url)
      const urlObj = new URL(url)

      // Handle invite deep links
      if (urlObj.host === 'invite') {
        const token = urlObj.searchParams.get('token')
        if (token) {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            useUiStore.getState().setPendingInviteToken(token)
            useUiStore.getState().setJoinBandModalOpen(true)
          } else {
            sessionStorage.setItem('pendingInviteToken', token)
            navigate('/login')
          }
          return
        }
      }

      const code = urlObj.searchParams.get('code')
      const errorParam = urlObj.searchParams.get('error')

      if (errorParam) {
        console.error('[appUrlOpen] OAuth error:', errorParam)
        return
      }
      if (!code) {
        console.error('[appUrlOpen] No code in deep-link URL')
        return
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        console.error('[appUrlOpen] exchangeCodeForSession error:', error.message)
      }
      // onAuthStateChange in AuthContext will fire SIGNED_IN → navigation to /library
    })

    return () => { listenerPromise.then(l => l.remove()) }
  }, [navigate])

  return (
    <>
    <JoinBandModal
      isOpen={isJoinBandModalOpen}
      token={pendingInviteToken}
      onClose={() => {
        useUiStore.getState().setPendingInviteToken(null)
        useUiStore.getState().setJoinBandModalOpen(false)
      }}
    />
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
                <Route path="/gigs/:gigId" element={<GigDetailPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </AnimatePresence>
          </AppShell>
        </ProtectedRoute>
      } />
    </Routes>
    </>
  )
}
