-- ============================================================
-- 007: Add print_side column to order_items table
-- ============================================================

ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS print_side TEXT DEFAULT 'separate_pages';

COMMENT ON COLUMN public.order_items.print_side IS 'Print layout preference: separate_pages (single-sided) or both_sides (double-sided duplex)';
