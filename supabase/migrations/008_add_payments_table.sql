-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 008 · Add payments table for PhonePe PG integration
-- ─────────────────────────────────────────────────────────────────────────────

-- Payment status type
CREATE TYPE payment_status AS ENUM (
  'initiated',
  'pending',
  'success',
  'failed',
  'cancelled'
);

-- Payments table
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

-- Add payment_status to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'unpaid'
  CHECK (payment_status IN ('unpaid', 'paid', 'failed', 'refunded'));

-- Indexes
CREATE INDEX IF NOT EXISTS payments_order_id_idx     ON payments (order_id);
CREATE INDEX IF NOT EXISTS payments_student_id_idx   ON payments (student_id);
CREATE INDEX IF NOT EXISTS payments_merchant_txn_idx ON payments (merchant_transaction_id);
CREATE INDEX IF NOT EXISTS payments_status_idx       ON payments (status);

-- RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students_read_own_payments"
  ON payments FOR SELECT
  USING (auth.uid() = student_id);

-- Updated-at trigger
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
