-- ============================================================
-- 005: Add phone_number column to profiles table
-- ============================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;

COMMENT ON COLUMN public.profiles.phone_number IS 'Student 10-digit mobile number with +91 country prefix';
