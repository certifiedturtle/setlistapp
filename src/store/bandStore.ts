import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { Band, BandMember, BandInvite, AcceptInviteResult } from '@/types/band'

interface BandState {
  band: Band | null
  members: BandMember[]
  invites: BandInvite[]
  loading: boolean

  initializeBand: (userId: string) => Promise<string | null>
  generateInvite: () => Promise<BandInvite | null>
  acceptInvite: (token: string) => Promise<AcceptInviteResult>
  resetBand: () => void
}

export const useBandStore = create<BandState>()((set, get) => ({
  band: null,
  members: [],
  invites: [],
  loading: false,

  initializeBand: async (userId: string) => {
    set({ loading: true })

    const { data: memberRow } = await supabase
      .from('band_members')
      .select('band_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (!memberRow) {
      set({ band: null, members: [], invites: [], loading: false })
      return null
    }

    const bandId = memberRow.band_id

    const [bandResult, membersResult, invitesResult] = await Promise.all([
      supabase.from('bands').select('*').eq('id', bandId).single(),
      supabase.from('band_members').select('*').eq('band_id', bandId),
      supabase.from('band_invites').select('*').eq('band_id', bandId).is('used_at', null),
    ])

    const band = bandResult.data as Band | null
    const members = (membersResult.data ?? []) as BandMember[]
    // Only surface invites if the current user is the owner
    const invites = band?.owner_id === userId
      ? (invitesResult.data ?? []) as BandInvite[]
      : []

    set({ band, members, invites, loading: false })
    return bandId
  },

  generateInvite: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    let { band } = get()

    if (!band) {
      // Lazily create the band using the user's band_name from profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('band_name')
        .eq('id', user.id)
        .single()

      const bandName = profile?.band_name ?? 'My Band'

      const { data: newBand, error: bandError } = await supabase
        .from('bands')
        .insert({ name: bandName, owner_id: user.id })
        .select()
        .single()

      if (bandError || !newBand) {
        console.error('Failed to create band:', bandError)
        return null
      }

      band = newBand as Band

      // Insert owner into band_members
      const { error: memberError } = await supabase
        .from('band_members')
        .insert({ band_id: band.id, user_id: user.id, role: 'owner' })

      if (memberError) {
        console.error('Failed to add owner to band_members:', memberError)
        return null
      }

      // Migrate owner's existing songs/setlists into the band
      await supabase
        .from('songs')
        .update({ band_id: band.id })
        .eq('user_id', user.id)
        .is('band_id', null)

      await supabase
        .from('setlists')
        .update({ band_id: band.id })
        .eq('user_id', user.id)
        .is('band_id', null)

      // Reload full band state
      await get().initializeBand(user.id)
      band = get().band!
    }

    const { data: invite, error: inviteError } = await supabase
      .from('band_invites')
      .insert({ band_id: band.id, created_by: user.id })
      .select()
      .single()

    if (inviteError || !invite) {
      console.error('Failed to create invite:', inviteError)
      return null
    }

    set((s) => ({ invites: [...s.invites, invite as BandInvite] }))
    return invite as BandInvite
  },

  acceptInvite: async (token: string) => {
    const { data, error } = await supabase.rpc('accept_band_invite', { invite_token: token })

    if (error) {
      console.error('accept_band_invite RPC error:', error)
      return { error: 'invite_not_found' } as AcceptInviteResult
    }

    const result = data as AcceptInviteResult

    if ('success' in result && result.success) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) await get().initializeBand(user.id)
    }

    return result
  },

  resetBand: () => set({ band: null, members: [], invites: [], loading: false }),
}))
