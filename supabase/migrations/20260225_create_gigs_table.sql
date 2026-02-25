CREATE TABLE IF NOT EXISTS gigs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  band_id     UUID NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
  created_by  UUID NOT NULL REFERENCES auth.users(id),
  name        TEXT NOT NULL,
  date        DATE,
  venue       TEXT,
  notes       TEXT,
  setlist_id  UUID REFERENCES setlists(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE gigs ENABLE ROW LEVEL SECURITY;

-- Any band member can read gigs for their band
CREATE POLICY "band_members_select_gigs" ON gigs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM band_members
      WHERE band_id = gigs.band_id AND user_id = auth.uid()
    )
  );

-- Any band member can insert gigs
CREATE POLICY "band_members_insert_gigs" ON gigs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM band_members
      WHERE band_id = gigs.band_id AND user_id = auth.uid()
    )
  );

-- Any band member can update gigs
CREATE POLICY "band_members_update_gigs" ON gigs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM band_members
      WHERE band_id = gigs.band_id AND user_id = auth.uid()
    )
  );

-- Any band member can delete gigs
CREATE POLICY "band_members_delete_gigs" ON gigs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM band_members
      WHERE band_id = gigs.band_id AND user_id = auth.uid()
    )
  );
