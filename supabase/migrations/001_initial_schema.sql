-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  kcc_id TEXT UNIQUE NOT NULL,
  class_name TEXT NOT NULL,
  year TEXT NOT NULL,
  section TEXT NOT NULL,
  room_number TEXT NOT NULL,
  id_card_photo_path TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRICING CONFIG
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pricing_config (
  id SERIAL PRIMARY KEY,
  bw_price_per_page NUMERIC(10, 2) NOT NULL DEFAULT 3.00,
  colour_price_per_page NUMERIC(10, 2) NOT NULL DEFAULT 5.00,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Insert default pricing if empty
INSERT INTO public.pricing_config (bw_price_per_page, colour_price_per_page)
SELECT 3.00, 5.00
WHERE NOT EXISTS (SELECT 1 FROM public.pricing_config);

-- ============================================================
-- ADMIN USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ORDERS
-- ============================================================
DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM (
    'pending',
    'accepted',
    'printing',
    'ready',
    'completed',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  status public.order_status NOT NULL DEFAULT 'pending',
  total_amount NUMERIC(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-generate order number sequence and function
CREATE SEQUENCE IF NOT EXISTS public.order_seq START 1000;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'KAI-' || LPAD(NEXTVAL('public.order_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_order_number ON public.orders;
CREATE TRIGGER set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_order_number();

-- ============================================================
-- ORDER ITEMS
-- ============================================================
DO $$ BEGIN
  CREATE TYPE public.colour_mode AS ENUM ('bw', 'colour');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.page_count_source AS ENUM ('auto', 'manual', 'estimated');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  page_count INTEGER,
  page_count_source public.page_count_source DEFAULT 'auto',
  colour_mode public.colour_mode NOT NULL DEFAULT 'bw',
  copies INTEGER NOT NULL DEFAULT 1,
  price_per_page NUMERIC(10, 2) NOT NULL,
  item_total NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Students can view own profile" ON public.profiles;
CREATE POLICY "Students can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Students can update own profile" ON public.profiles;
CREATE POLICY "Students can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
CREATE POLICY "Admin can view all profiles"
  ON public.profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- Orders policies
DROP POLICY IF EXISTS "Students can view own orders" ON public.orders;
CREATE POLICY "Students can view own orders"
  ON public.orders FOR SELECT
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Students can create orders" ON public.orders;
CREATE POLICY "Students can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Admin can view all orders" ON public.orders;
CREATE POLICY "Admin can view all orders"
  ON public.orders FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Admin can update orders" ON public.orders;
CREATE POLICY "Admin can update orders"
  ON public.orders FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- Order Items policies
DROP POLICY IF EXISTS "Students can view own order items" ON public.order_items;
CREATE POLICY "Students can view own order items"
  ON public.order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.student_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Students can create order items" ON public.order_items;
CREATE POLICY "Students can create order items"
  ON public.order_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.student_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Admin can view all order items" ON public.order_items;
CREATE POLICY "Admin can view all order items"
  ON public.order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- Pricing policies
DROP POLICY IF EXISTS "Anyone can read pricing" ON public.pricing_config;
CREATE POLICY "Anyone can read pricing"
  ON public.pricing_config FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin can update pricing" ON public.pricing_config;
CREATE POLICY "Admin can update pricing"
  ON public.pricing_config FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- Admin users policy
DROP POLICY IF EXISTS "Admin can view admin_users" ON public.admin_users;
CREATE POLICY "Admin can view admin_users"
  ON public.admin_users FOR SELECT
  USING (id = auth.uid());

-- Storage Buckets instructions:
-- In Supabase Storage, create two private buckets:
-- 1. 'id-cards' (private)
-- 2. 'print-files' (private)
