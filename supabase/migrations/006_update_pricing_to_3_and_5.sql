-- ============================================================
-- 006: Update pricing configuration to ₹3 B&W and ₹5 Colour
-- ============================================================

-- Update table column defaults
ALTER TABLE public.pricing_config 
  ALTER COLUMN bw_price_per_page SET DEFAULT 3.00,
  ALTER COLUMN colour_price_per_page SET DEFAULT 5.00;

-- Update existing active pricing records
UPDATE public.pricing_config 
SET bw_price_per_page = 3.00, 
    colour_price_per_page = 5.00, 
    updated_at = NOW();

-- Insert default row if table is empty
INSERT INTO public.pricing_config (bw_price_per_page, colour_price_per_page)
SELECT 3.00, 5.00
WHERE NOT EXISTS (SELECT 1 FROM public.pricing_config);
