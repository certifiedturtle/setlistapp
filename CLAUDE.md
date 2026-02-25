# Setlist Studio - Project Memory

## Project
- **Repo:** `certifiedturtle/setlistapp` on GitHub
- **Branch:** `dev` (deploys to Vercel preview)
- **Stack:** Vite + React + TypeScript + Supabase (auth + DB)
- **Auth:** Google OAuth via Supabase with PKCE flow

## Current Status (2026-02-24)

### Ongoing Issue: Google OAuth 401 after redirect
We've been debugging a Google OAuth sign-in issue across 5 rounds:

| Round | Commit | Fix Attempted | Result |
|-------|--------|--------------|--------|
| 1 | `1b0e12b` | Set `flowType: 'pkce'` in Supabase client | Spinner stuck |
| 2 | `f049477` | Error logging, PKCE diagnostics, auth guard | Spinner stuck |
| 3 | `a7c8e77` | Let Supabase handle PKCE exchange automatically | Spinner stuck |
| 4 | `513e9db` / `8da0c96` | Replace `getSession()` with `onAuthStateChange` to avoid auth lock deadlock | 401 error |
| 5 | `302082d` | Added diagnostic logging to `src/lib/supabase.ts` to check if env vars reach build | **Awaiting results** |

### What we know
- Login page loads fine (Supabase client initializes OK locally)
- After Google sign-in redirect back, a **401 "No API key found in request"** appears
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in Vercel dashboard
- The 401 means `apikey` header is absent, which only happens if `createClient()` got an empty key
- **Hypothesis:** Env vars exist in Vercel but aren't injected into the Vite build (scope mismatch, need redeploy, or whitespace)

### Next Steps
1. Open incognito browser on Vercel deployment
2. Check console for `[Supabase] URL defined:` and `[Supabase] Key defined:` logs
3. If both `true` -> investigate further (env vars are fine, 401 has another cause)
4. If either `false`/`MISSING` -> fix Vercel env var config:
   - Ensure env vars are scoped to Preview (not just Production)
   - Check for whitespace in values
   - Trigger manual redeploy after confirming

### Key Files
- `src/lib/supabase.ts` - Supabase client init (has diagnostic logs currently)
- `src/components/AuthCallback.tsx` - OAuth callback handler (uses `onAuthStateChange`)
- `src/contexts/AuthContext.tsx` - Auth state management

### Notes
- The diagnostic `console.log` lines in `supabase.ts` should be removed once the issue is resolved
- Full conversation transcript: `/Users/michael.tempestini/.claude/projects/-Users-michael-tempestini/d4ccc23e-481f-4d40-8af8-fa838a1a8506.jsonl`
