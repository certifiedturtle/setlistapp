import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { Capacitor } from '@capacitor/core'
import { supabase } from '@/lib/supabase'
import { useSongStore } from '@/store/songStore'
import { useSetlistStore } from '@/store/setlistStore'
import { useSettingsStore } from '@/store/settingsStore'

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // onAuthStateChange is the single source of truth for auth state — it does
    // not go through Supabase's internal session lock, so it never deadlocks.
    // We deliberately avoid calling getSession() here: on refresh, Supabase
    // runs a token refresh that holds the internal lock; any concurrent
    // getSession() call queues behind that lock, and the DB query inside
    // initialize() also needs the lock for auth headers — causing a deadlock
    // where neither ever resolves.
    // Callback must be synchronous (no async) so Supabase does not await it
    // while holding the internal auth lock. The auth lock serializes token
    // refresh; DB queries inside initialize() call getSession() which also
    // acquires the same lock — deadlocking if called from within the callback.
    // setTimeout(0) defers store initialization until after the lock releases.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      if ((event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        const userId = session.user.id
        setTimeout(() => {
          useSongStore.getState().initialize(userId)
          useSetlistStore.getState().initialize(userId)
          useSettingsStore.getState().initialize(userId)
        }, 0)
      }

      if (event === 'SIGNED_OUT') {
        useSongStore.getState().reset()
        useSetlistStore.getState().reset()
        useSettingsStore.getState().reset()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    const redirectTo = Capacitor.isNativePlatform()
      ? 'com.certifiedturtle.setlistbuddy://auth/callback'
      : `${window.location.origin}/auth/callback`
    console.log('[Auth] signInWithGoogle redirectTo:', redirectTo)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
