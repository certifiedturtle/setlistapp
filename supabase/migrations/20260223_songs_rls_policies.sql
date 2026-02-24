-- Enable RLS on songs (safe to run if already enabled)
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own songs
CREATE POLICY "songs_select_own"
  ON public.songs FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own songs
CREATE POLICY "songs_insert_own"
  ON public.songs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own songs
CREATE POLICY "songs_update_own"
  ON public.songs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own songs
CREATE POLICY "songs_delete_own"
  ON public.songs FOR DELETE
  USING (auth.uid() = user_id);
