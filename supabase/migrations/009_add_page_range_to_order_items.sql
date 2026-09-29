-- ============================================================
-- 009: Add page_range column to order_items table
-- ============================================================

ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS page_range TEXT DEFAULT 'all';

COMMENT ON COLUMN public.order_items.page_range IS 'Custom page range to print: "all" or specific pages like "1-5, 8, 12-15"';
