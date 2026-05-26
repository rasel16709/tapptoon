-- ============================================================
-- RLS Policies for Tappytoon
-- Run this AFTER supabase_schema.sql is already applied.
-- Apply in Supabase dashboard → SQL editor.
-- ============================================================

-- 1. Enable RLS on all public tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manhwas    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters   ENABLE ROW LEVEL SECURITY;

-- 2. Drop any pre-existing policies (idempotent re-runs)
DROP POLICY IF EXISTS "categories_public_read" ON public.categories;
DROP POLICY IF EXISTS "categories_admin_write" ON public.categories;
DROP POLICY IF EXISTS "manhwas_public_read"    ON public.manhwas;
DROP POLICY IF EXISTS "manhwas_admin_write"    ON public.manhwas;
DROP POLICY IF EXISTS "chapters_public_read"   ON public.chapters;
DROP POLICY IF EXISTS "chapters_admin_write"   ON public.chapters;

-- 3. Public read access for everyone (including anonymous visitors)
CREATE POLICY "categories_public_read"
  ON public.categories
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "manhwas_public_read"
  ON public.manhwas
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "chapters_public_read"
  ON public.chapters
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 4. Write access restricted to authenticated admins only.
--    Any logged-in Supabase auth user is treated as an admin here.
--    If you later need finer roles, switch the USING clause to
--    something like `auth.jwt() ->> 'role' = 'admin'` and assign
--    that role via Supabase Auth → Users → user metadata.
CREATE POLICY "categories_admin_write"
  ON public.categories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "manhwas_admin_write"
  ON public.manhwas
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "chapters_admin_write"
  ON public.chapters
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- Notes:
-- • The anon key (NEXT_PUBLIC_SUPABASE_ANON_KEY) can now only read.
-- • All mutations must go through a logged-in Supabase session
--   (set by /admin/login via the @supabase/ssr cookie flow).
-- • To create the first admin user run, in SQL editor:
--      INSERT INTO auth.users (id, email, encrypted_password, ...)
--   …or use the Supabase dashboard → Authentication → Add user.
-- ============================================================
