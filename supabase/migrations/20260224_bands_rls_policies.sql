-- Nuclear cleanup: drop ALL existing policies on both tables
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'bands' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.bands', pol.policyname);
  END LOOP;
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'band_members' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.band_members', pol.policyname);
  END LOOP;
END $$;

-- Drop old helper that caused the cycle
DROP FUNCTION IF EXISTS public.get_owned_band_ids();

-- Enable RLS (idempotent)
ALTER TABLE public.bands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.band_members ENABLE ROW LEVEL SECURITY;

-- Helper: get band IDs for current user (bands → band_members direction)
CREATE OR REPLACE FUNCTION public.get_my_band_ids()
RETURNS TABLE(band_id uuid)
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE
AS $$ SELECT band_id FROM public.band_members WHERE user_id = auth.uid() $$;

ALTER FUNCTION public.get_my_band_ids() OWNER TO postgres;

-- Helper: check if current user owns a band (band_members → band_members only)
CREATE OR REPLACE FUNCTION public.is_band_owner(check_band_id uuid)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.band_members
    WHERE band_id = check_band_id AND user_id = auth.uid() AND role = 'owner'
  )
$$;

ALTER FUNCTION public.is_band_owner(uuid) OWNER TO postgres;

-- === bands policies ===

CREATE POLICY "bands_select_member" ON public.bands FOR SELECT
  USING (owner_id = auth.uid() OR id IN (SELECT band_id FROM public.get_my_band_ids()));

CREATE POLICY "bands_insert_own" ON public.bands FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "bands_update_owner" ON public.bands FOR UPDATE
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "bands_delete_owner" ON public.bands FOR DELETE
  USING (auth.uid() = owner_id);

-- === band_members policies (NO reference to bands table) ===

CREATE POLICY "band_members_select_member" ON public.band_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR band_id IN (SELECT band_id FROM public.get_my_band_ids())
  );

CREATE POLICY "band_members_insert_owner" ON public.band_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "band_members_delete_owner" ON public.band_members FOR DELETE
  USING (user_id = auth.uid() OR public.is_band_owner(band_id));
