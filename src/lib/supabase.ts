import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// Diagnostic: confirm env vars are present in the build
console.log('[Supabase] URL defined:', !!url, url ? url.substring(0, 20) + '...' : 'MISSING')
console.log('[Supabase] Key defined:', !!key, key ? key.substring(0, 50) + '...' : 'MISSING')

if (!url || !key) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment')
}

export const supabase = createClient(url, key, {
  auth: {
    flowType: 'pkce',
    // Disable automatic URL-based exchange so AuthCallback owns the one explicit
    // exchangeCodeForSession call. Without this, initialize() races the exchange
    // before onAuthStateChange subscribers are registered, failing silently.
    detectSessionInUrl: false,
  },
})
