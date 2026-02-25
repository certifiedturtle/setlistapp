ALTER TABLE gigs
  ADD COLUMN IF NOT EXISTS load_in_time    TIME,
  ADD COLUMN IF NOT EXISTS sound_check_time TIME,
  ADD COLUMN IF NOT EXISTS doors_time      TIME,
  ADD COLUMN IF NOT EXISTS set_start_time  TIME,
  ADD COLUMN IF NOT EXISTS set_end_time    TIME,
  ADD COLUMN IF NOT EXISTS load_out_time   TIME,
  ADD COLUMN IF NOT EXISTS location        TEXT,
  ADD COLUMN IF NOT EXISTS contact_name    TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone   TEXT,
  ADD COLUMN IF NOT EXISTS ticket_link     TEXT,
  ADD COLUMN IF NOT EXISTS equipment       JSONB;
