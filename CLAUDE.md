# Setlist Studio - Project Memory

## Project
- **Repo:** `certifiedturtle/setlistapp` on GitHub
- **Branches:** `dev` (Vercel preview), `main` (production)
- **Stack:** Vite + React + TypeScript + Supabase (auth + DB)
- **Auth:** Google OAuth via Supabase with PKCE flow

---

## Current Status (2026-02-25)

### Recently Shipped (this session — commit `23aaa27`, merged to main `696a77c`)

#### Gigs Feature (full implementation)
- **GigsPage** — list of gigs sorted by date, with create modal (`CreateGigModal.tsx`)
- **GigDetailPage** — full editing: venue, schedule (load-in, sound check, doors, set start/end, load-out), location, contact name/phone, ticket link (opens in Capacitor in-app browser), notes, equipment checklist
- **Save button** with dirty-state detection and saved/error feedback
- **Setlist linking** — link/unlink a setlist from Gig Details via `SetlistPickerModal`
  - Tap the linked setlist name → navigates to Setlist Builder
  - "Create new setlist" shortcut returns to the gig after creation (`?returnToGig=<id>`)
- **Smart back button** — Setlist Builder shows "Gig Details" when navigated from a gig (via `location.state.from === 'gig'`), "Setlists" otherwise
- **gigStore** — Zustand + Supabase CRUD (createGig, updateGig, deleteGig, fetchGigs)
- **Supabase migrations:**
  - `20260225_create_gigs_table.sql` — gigs table with RLS
  - `20260225_add_gig_detail_fields.sql` — extended detail columns
- **New types:** `Gig` added to `src/types/index.ts`
- **New CSS utilities:** `.chip`, `.chip.active`, `.back-header`

#### Also on main (from prior dev sessions)
- Band creation modal, join band modal, band store + RLS policies
- Settings page with log out + band management
- Google OAuth deep-link support (custom URL scheme) for iOS
- PKCE auth flow debugging (see OAuth section below)

---

## Ongoing Issue: Google OAuth 401 after redirect

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
- The 401 means `apikey` header is absent — only happens if `createClient()` got an empty key
- **Hypothesis:** Env vars exist in Vercel but aren't injected into the Vite build (scope mismatch, need redeploy, or whitespace)

### Next Steps for OAuth
1. Open incognito browser on Vercel deployment
2. Check console for `[Supabase] URL defined:` and `[Supabase] Key defined:` logs
3. If both `true` → investigate further (env vars are fine, 401 has another cause)
4. If either `false`/`MISSING` → fix Vercel env var config:
   - Ensure env vars are scoped to Preview (not just Production)
   - Check for whitespace in values
   - Trigger manual redeploy after confirming

### Key Auth Files
- `src/lib/supabase.ts` — Supabase client init (has diagnostic logs — remove once resolved)
- `src/components/AuthCallback.tsx` — OAuth callback handler (uses `onAuthStateChange`)
- `src/contexts/AuthContext.tsx` — Auth state management

---

## Pending / Next Up
- Delete Gig functionality (was planned but deferred — commit was requested first)
- Delete Setlist functionality (likely paired with above)
- Remove diagnostic `console.log` lines from `src/lib/supabase.ts` once OAuth is confirmed working
