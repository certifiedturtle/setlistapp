-- Fix: Recreate handle_new_user trigger function with SECURITY DEFINER
--
-- Without SECURITY DEFINER, the trigger runs as the invoking role (supabase_auth_admin)
-- rather than postgres. At signup time, auth.uid() is not yet set, so the RLS policy
-- on profiles blocks the INSERT, causing the trigger to throw an error and rolling back
-- the entire user creation — resulting in "Database error saving new user".
--
-- Changes:
--   - SECURITY DEFINER: runs as function owner (postgres), bypassing RLS
--   - SET search_path = public: prevents search_path injection (security best practice)
--   - ON CONFLICT (id) DO NOTHING: prevents duplicate-key errors on retries

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- If band_name is NOT NULL without a default, uncomment the line below:
-- ALTER TABLE public.profiles ALTER COLUMN band_name SET DEFAULT 'My Band';
