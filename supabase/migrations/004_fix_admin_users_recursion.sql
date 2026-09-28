-- ==============================================================================
-- KAIRO — FIX ADMIN_USERS RLS INFINITE RECURSION (004)
-- Run this in your Supabase SQL Editor.
-- 
-- Fixes:
-- "ERROR: infinite recursion detected in policy for relation admin_users"
-- Root cause: admin_users SELECT policy was querying admin_users inside itself.
-- ==============================================================================

-- ── 1. Create a secure, non-recursive SECURITY DEFINER helper ────────────────
-- This function runs with elevated privileges, bypassing RLS to check admin status
-- without triggering recursive policy lookups.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE id = auth.uid()
  );
$$;

-- Grant execution to all authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ── 2. Fix the recursive policy on public.admin_users ────────────────────────
-- The policy must check (id = auth.uid()) directly instead of subquerying admin_users
DROP POLICY IF EXISTS "Admin can view admin_users" ON public.admin_users;
CREATE POLICY "Admin can view admin_users"
  ON public.admin_users FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR public.is_admin());

-- ── 3. Upgrade all dependent table policies to use public.is_admin() ─────────

-- Profiles
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
CREATE POLICY "Admin can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Orders
DROP POLICY IF EXISTS "Admin can view all orders" ON public.orders;
CREATE POLICY "Admin can view all orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can update orders" ON public.orders;
CREATE POLICY "Admin can update orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- Order Items
DROP POLICY IF EXISTS "Admin can view all order items" ON public.order_items;
CREATE POLICY "Admin can view all order items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Pricing Config
DROP POLICY IF EXISTS "Admin can update pricing" ON public.pricing_config;
CREATE POLICY "Admin can update pricing"
  ON public.pricing_config FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- ── 4. Storage Policies (Clean & Fast) ────────────────────────────────────────
DROP POLICY IF EXISTS "Admins have full access to id-cards" ON storage.objects;
CREATE POLICY "Admins have full access to id-cards"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'id-cards' AND
    public.is_admin()
  );

DROP POLICY IF EXISTS "Admins have full access to print-files" ON storage.objects;
CREATE POLICY "Admins have full access to print-files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'print-files' AND
    public.is_admin()
  );

-- ── 5. Storage Bucket 100MB & Office MIME Types Upgrade ──────────────────────
UPDATE storage.buckets
SET 
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
WHERE id = 'print-files';

-- ── 6. Ensure All Registered Student Profiles Are Marked Verified ─────────────
UPDATE public.profiles
SET is_verified = true
WHERE is_verified = false;

