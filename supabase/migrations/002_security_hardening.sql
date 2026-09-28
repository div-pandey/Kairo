-- ==============================================================================
-- KAIRO — SECURITY HARDENING MIGRATION (002)
-- Run this in your Supabase SQL Editor to enforce strict storage RLS,
-- bucket privacy, and query authorization constraints.
-- ==============================================================================

-- ── 1. Create Private Storage Buckets (if not exist) ──────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('id-cards', 'id-cards', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/jpg']),
  ('print-files', 'print-files', false, 104857600, ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ])
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ── 2. Admin Helper & Recursion Protection ───────────────────────────────────
-- Creates a SECURITY DEFINER helper to prevent infinite recursion on admin_users
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

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Fix recursive policy on public.admin_users
DROP POLICY IF EXISTS "Admin can view admin_users" ON public.admin_users;
CREATE POLICY "Admin can view admin_users"
  ON public.admin_users FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR public.is_admin());

-- Fix admin view on profiles
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
CREATE POLICY "Admin can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Fix admin view on orders
DROP POLICY IF EXISTS "Admin can view all orders" ON public.orders;
CREATE POLICY "Admin can view all orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ── 3. Storage Row-Level Security Policies ────────────────────────────────────
-- Note: storage.objects already has RLS enabled by default in Supabase.
-- Clean existing policies for idempotency
DROP POLICY IF EXISTS "Students can upload own ID card" ON storage.objects;
DROP POLICY IF EXISTS "Students can view own ID card" ON storage.objects;
DROP POLICY IF EXISTS "Students can upload own print files" ON storage.objects;
DROP POLICY IF EXISTS "Students can view own print files" ON storage.objects;
DROP POLICY IF EXISTS "Admins have full access to id-cards" ON storage.objects;
DROP POLICY IF EXISTS "Admins have full access to print-files" ON storage.objects;

-- ID Cards: Students can only upload to their own user-id folder
CREATE POLICY "Students can upload own ID card"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'id-cards' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ID Cards: Students can only view their own uploaded ID card
CREATE POLICY "Students can view own ID card"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'id-cards' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Print Files: Students can only upload to their own user-id folder
CREATE POLICY "Students can upload own print files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'print-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Print Files: Students can only access their own uploaded print files
CREATE POLICY "Students can view own print files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'print-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Admins: Authorized staff can view all student ID cards and print files
CREATE POLICY "Admins have full access to id-cards"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'id-cards' AND
  public.is_admin()
);

CREATE POLICY "Admins have full access to print-files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'print-files' AND
  public.is_admin()
);

-- ── 3. Performance & Security Indexes ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_orders_student_id ON public.orders(student_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_profiles_kcc_id ON public.profiles(kcc_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);

-- ── 4. Revoke Public Execution on Helper Triggers ────────────────────────────
REVOKE EXECUTE ON FUNCTION public.generate_order_number() FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM public, anon;
