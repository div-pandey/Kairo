-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 008 · Add payments table for PhonePe PG integration
-- Safe to re-run: all statements are idempotent
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Create payment_status ENUM only if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM (
      'initiated',
      'pending',
      'success',
      'failed',
      'cancelled'
    );
  END IF;
END $$;

-- 2. Payments table
CREATE TABLE IF NOT EXISTS payments (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id                uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  student_id              uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant_transaction_id text NOT NULL UNIQUE,
  phonepe_transaction_id  text,
  amount                  integer NOT NULL,
  status                  payment_status NOT NULL DEFAULT 'initiated',
  initiated_at            timestamptz NOT NULL DEFAULT now(),
  completed_at            timestamptz,
  initiate_response       jsonb,
  callback_payload        jsonb,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

-- 3. Add payment_status column to orders (idempotent via IF NOT EXISTS)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'unpaid'
  CHECK (payment_status IN ('unpaid', 'paid', 'failed', 'refunded'));

-- 4. Indexes
CREATE INDEX IF NOT EXISTS payments_order_id_idx     ON payments (order_id);
CREATE INDEX IF NOT EXISTS payments_student_id_idx   ON payments (student_id);
CREATE INDEX IF NOT EXISTS payments_merchant_txn_idx ON payments (merchant_transaction_id);
CREATE INDEX IF NOT EXISTS payments_status_idx       ON payments (status);

-- 5. RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'payments' AND policyname = 'students_read_own_payments'
  ) THEN
    CREATE POLICY "students_read_own_payments"
      ON payments FOR SELECT
      USING (auth.uid() = student_id);
  END IF;
END $$;

-- 6. Updated-at trigger function (self-contained, safe to re-create)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Attach trigger to payments table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_payments_updated_at'
  ) THEN
    CREATE TRIGGER set_payments_updated_at
      BEFORE UPDATE ON payments
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

