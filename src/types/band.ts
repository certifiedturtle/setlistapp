export interface Band {
  id: string; name: string; owner_id: string; created_at: string;
}
export interface BandMember {
  id: string; band_id: string; user_id: string;
  role: 'owner' | 'member'; joined_at: string;
}
export interface BandInvite {
  id: string; band_id: string; created_by: string;
  used_by: string | null; used_at: string | null;
  created_at: string; expires_at: string;
}
export type AcceptInviteResult =
  | { success: true; band_id: string; band_name: string; owner_id: string }
  | { error: 'not_authenticated' | 'invite_not_found' | 'invite_already_used'
             | 'invite_expired' | 'already_in_band' };
