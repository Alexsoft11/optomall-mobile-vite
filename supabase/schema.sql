-- Supabase schema for Optomall
-- Tables: products, external_products, sellers, orders, payments, shipments, admins, audit_logs
-- RLS policies assume Supabase Auth with a JWT claim: { role: "admin" } for admin users

-- Enable uuid generation and necessary extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------
-- Sellers
-- -----------------------------
CREATE TABLE IF NOT EXISTS sellers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  contact JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sellers_name ON sellers (lower(name));

-- -----------------------------
-- Products
-- -----------------------------
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  seller_id BIGINT REFERENCES sellers(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  images JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active',
  category_id BIGINT,
  is_external BOOLEAN DEFAULT false,
  external_id TEXT,
  cached_at TIMESTAMPTZ,
  qr_code_url TEXT,
  qr_data JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_name ON products (lower(name));
CREATE INDEX IF NOT EXISTS idx_products_external ON products (is_external, external_id);

-- -----------------------------
-- External Products (raw API cache)
-- -----------------------------
CREATE TABLE IF NOT EXISTS external_products (
  id BIGSERIAL PRIMARY KEY,
  provider TEXT NOT NULL, -- e.g., taobao, 1688, pinduoduo
  external_id TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  cached_at TIMESTAMPTZ DEFAULT now(),
  last_fetch TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (provider, external_id)
);

CREATE INDEX IF NOT EXISTS idx_external_provider ON external_products (provider);

-- -----------------------------
-- Orders
-- -----------------------------
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT, -- auth.uid() from Supabase
  seller_id BIGINT REFERENCES sellers(id) ON DELETE SET NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb, -- array of { product_id, qty, price, currency }
  subtotal NUMERIC(12,2) DEFAULT 0,
  shipping NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'new', -- new, paid, shipped, delivered, cancelled
  address JSONB DEFAULT '{}'::jsonb,
  qr_code_url TEXT,
  qr_data JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);

-- -----------------------------
-- Payments
-- -----------------------------
CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- click, payme, stripe, etc
  provider_payment_id TEXT,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending', -- pending, succeeded, failed, refunded
  raw_payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_order ON payments (order_id);

-- -----------------------------
-- Shipments
-- -----------------------------
CREATE TABLE IF NOT EXISTS shipments (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- pending, ready, shipped, delivered, cancelled
  tracking_number TEXT,
  carrier TEXT,
  warehouse TEXT,
  documents JSONB DEFAULT '[]'::jsonb,
  photos JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shipments_order ON shipments (order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments (status);

-- -----------------------------
-- Admins mapping (optional convenience table)
-- -----------------------------
CREATE TABLE IF NOT EXISTS admins (
  id BIGSERIAL PRIMARY KEY,
  auth_uid TEXT UNIQUE, -- references auth.uid() from Supabase Auth
  role TEXT DEFAULT 'admin',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admins_uid ON admins (auth_uid);

-- -----------------------------
-- Audit logs (triggered on mutating tables)
-- -----------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  performed_by TEXT, -- auth.uid() or service account
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_table ON audit_logs (table_name);

-- -----------------------------
-- Helper: automatic updated_at timestamp
-- -----------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach triggers for tables to keep updated_at current
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'products_set_updated_at') THEN
    CREATE TRIGGER products_set_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'external_products_set_updated_at') THEN
    CREATE TRIGGER external_products_set_updated_at
    BEFORE UPDATE ON external_products
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'orders_set_updated_at') THEN
    CREATE TRIGGER orders_set_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'payments_set_updated_at') THEN
    CREATE TRIGGER payments_set_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'shipments_set_updated_at') THEN
    CREATE TRIGGER shipments_set_updated_at
    BEFORE UPDATE ON shipments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END;
$$;

-- -----------------------------
-- Audit trigger: record INSERT/UPDATE/DELETE into audit_logs
-- -----------------------------
CREATE OR REPLACE FUNCTION audit_if_admin()
RETURNS TRIGGER AS $$
DECLARE
  _performed_by TEXT;
BEGIN
  -- Attempt to capture the acting user from JWT claims
  BEGIN
    _performed_by := (current_setting('jwt.claims', true))::jsonb ->> 'sub';
  EXCEPTION WHEN others THEN
    _performed_by := NULL;
  END;

  IF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_logs(action, table_name, record_id, performed_by, payload)
    VALUES ('INSERT', TG_TABLE_NAME, NEW.id::text, _performed_by, row_to_json(NEW)::jsonb);
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO audit_logs(action, table_name, record_id, performed_by, payload)
    VALUES ('UPDATE', TG_TABLE_NAME, NEW.id::text, _performed_by, json_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW)));
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO audit_logs(action, table_name, record_id, performed_by, payload)
    VALUES ('DELETE', TG_TABLE_NAME, OLD.id::text, _performed_by, row_to_json(OLD)::jsonb);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Attach audit trigger to key tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_products') THEN
    CREATE TRIGGER audit_products
    AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW EXECUTE FUNCTION audit_if_admin();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_orders') THEN
    CREATE TRIGGER audit_orders
    AFTER INSERT OR UPDATE OR DELETE ON orders
    FOR EACH ROW EXECUTE FUNCTION audit_if_admin();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_payments') THEN
    CREATE TRIGGER audit_payments
    AFTER INSERT OR UPDATE OR DELETE ON payments
    FOR EACH ROW EXECUTE FUNCTION audit_if_admin();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_shipments') THEN
    CREATE TRIGGER audit_shipments
    AFTER INSERT OR UPDATE OR DELETE ON shipments
    FOR EACH ROW EXECUTE FUNCTION audit_if_admin();
  END IF;
END;
$$;

-- -----------------------------
-- Row Level Security (RLS) Policies
-- -----------------------------
-- Notes: These policies rely on Supabase JWT containing a 'role' claim set to 'admin' for admin users.
-- The expression (current_setting('jwt.claims', true)::json ->> 'role') extracts the claim. Adjust if your JWT shape is different.

-- Enable RLS on mutable tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;

-- Helper boolean expression for admin check
-- Use: (current_setting('jwt.claims', true)::json ->> 'role') = 'admin'

-- PRODUCTS policies
-- Public read access to products
CREATE POLICY "public_select_products" ON products FOR SELECT USING (true);

-- Only admins can INSERT/UPDATE/DELETE products
CREATE POLICY "admin_write_products" ON products FOR ALL USING (
  (current_setting('jwt.claims', true)::json ->> 'role') = 'admin'
) WITH CHECK (
  (current_setting('jwt.claims', true)::json ->> 'role') = 'admin'
);

-- EXTERNAL PRODUCTS policies
CREATE POLICY "public_select_external_products" ON external_products FOR SELECT USING (true);
CREATE POLICY "admin_write_external_products" ON external_products FOR ALL USING (
  (current_setting('jwt.claims', true)::json ->> 'role') = 'admin'
) WITH CHECK (
  (current_setting('jwt.claims', true)::json ->> 'role') = 'admin'
);

-- SELLERS policies
-- Public can read seller info
CREATE POLICY "public_select_sellers" ON sellers FOR SELECT USING (true);
-- Admins can modify sellers
CREATE POLICY "admin_write_sellers" ON sellers FOR ALL USING (
  (current_setting('jwt.claims', true)::json ->> 'role') = 'admin'
) WITH CHECK (
  (current_setting('jwt.claims', true)::json ->> 'role') = 'admin'
);

-- ORDERS policies
-- Allow users to INSERT orders on their own behalf (ensure new.user_id = auth.uid())
CREATE POLICY "insert_orders_authenticated" ON orders FOR INSERT WITH CHECK (
  (current_setting('jwt.claims', true)::json ->> 'sub') IS NOT NULL
  AND (NEW.user_id = current_setting('jwt.claims', true)::json ->> 'sub')
);

-- Allow users to SELECT their own orders or admins to select all
CREATE POLICY "select_orders_users_or_admin" ON orders FOR SELECT USING (
  (current_setting('jwt.claims', true)::json ->> 'role') = 'admin'
  OR (orders.user_id = current_setting('jwt.claims', true)::json ->> 'sub')
);

-- Only admins can UPDATE or DELETE orders
CREATE POLICY "admin_write_orders" ON orders FOR UPDATE, DELETE USING (
  (current_setting('jwt.claims', true)::json ->> 'role') = 'admin'
) WITH CHECK (
  (current_setting('jwt.claims', true)::json ->> 'role') = 'admin'
);

-- PAYMENTS policies
-- Payments are sensitive: only admins can read/write (or the payment webhook service account)
CREATE POLICY "admin_payments" ON payments FOR ALL USING (
  (current_setting('jwt.claims', true)::json ->> 'role') = 'admin'
) WITH CHECK (
  (current_setting('jwt.claims', true)::json ->> 'role') = 'admin'
);

-- SHIPMENTS policies
-- Admins can manage shipments; users can view shipments related to their orders
CREATE POLICY "select_shipments_users_or_admin" ON shipments FOR SELECT USING (
  (current_setting('jwt.claims', true)::json ->> 'role') = 'admin'
  OR (EXISTS (SELECT 1 FROM orders WHERE orders.id = shipments.order_id AND orders.user_id = current_setting('jwt.claims', true)::json ->> 'sub'))
);

CREATE POLICY "admin_write_shipments" ON shipments FOR ALL USING (
  (current_setting('jwt.claims', true)::json ->> 'role') = 'admin'
) WITH CHECK (
  (current_setting('jwt.claims', true)::json ->> 'role') = 'admin'
);

-- ADMINS table: only service or DB owner can insert; select allowed for admins
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_admins_for_admins" ON admins FOR SELECT USING (
  (current_setting('jwt.claims', true)::json ->> 'role') = 'admin'
);
CREATE POLICY "admin_write_admins" ON admins FOR ALL USING (
  (current_setting('jwt.claims', true)::json ->> 'role') = 'admin'
) WITH CHECK (
  (current_setting('jwt.claims', true)::json ->> 'role') = 'admin'
);

-- Audit logs: only admins can read
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_read_audit" ON audit_logs FOR SELECT USING (
  (current_setting('jwt.claims', true)::json ->> 'role') = 'admin'
);

-- -----------------------------
-- Initial seeds (optional): sample seller and product
-- -----------------------------
INSERT INTO sellers (name, contact) VALUES ('Default Seller', '{"phone": "+998901234567"}') ON CONFLICT DO NOTHING;

INSERT INTO products (seller_id, name, description, price, images, status)
VALUES (
  (SELECT id FROM sellers LIMIT 1),
  'Sample Product',
  'This is a sample product',
  19.99,
  '["https://picsum.photos/seed/sample/600/600"]',
  'active'
) ON CONFLICT DO NOTHING;

-- End of schema
