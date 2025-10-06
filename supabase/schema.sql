-- Run this in the Supabase SQL editor to create the products table and seed sample data

CREATE TABLE IF NOT EXISTS products (
  id serial PRIMARY KEY,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  images jsonb DEFAULT '[]',
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- If products table already exists without status, ensure column exists
ALTER TABLE products ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Seed sample products
INSERT INTO products (name, description, price, images) VALUES
('Minimalist Watch', 'A sleek minimalist watch with leather strap.', 129.99, '["https://picsum.photos/seed/watch/600/600"]'),
('Noise-Cancelling Headphones', 'Over-ear headphones with active noise cancellation.', 249.00, '["https://picsum.photos/seed/headphones/600/600"]'),
('Ceramic Mug', 'Handmade ceramic mug, 350ml capacity.', 18.50, '["https://picsum.photos/seed/mug/600/600"]'),
('Running Shoes', 'Lightweight running shoes with breathable mesh.', 89.99, '["https://picsum.photos/seed/shoes/600/600"]'),
('Wireless Charger', 'Fast wireless charger compatible with Qi devices.', 39.95, '["https://picsum.photos/seed/charger/600/600"]'),
('Bluetooth Speaker', 'Portable Bluetooth speaker with 12h battery life.', 59.99, '["https://picsum.photos/seed/speaker/600/600"]');

-- Sessions table to persist cart/favorites for guest sessions
CREATE TABLE IF NOT EXISTS sessions (
  session_key text PRIMARY KEY,
  cart jsonb DEFAULT '[]',
  favorites jsonb DEFAULT '[]',
  updated_at timestamptz DEFAULT now()
);

-- Index to speed up session lookups
CREATE INDEX IF NOT EXISTS idx_sessions_session_key ON sessions (session_key);

-- Shipments table for admin management
CREATE TABLE IF NOT EXISTS shipments (
  id serial PRIMARY KEY,
  order_id text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  tracking_number text,
  warehouse text,
  carrier text,
  documents jsonb DEFAULT '[]',
  photos jsonb DEFAULT '[]',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Seed sample shipment
INSERT INTO shipments (order_id, status, tracking_number, warehouse, carrier, documents, photos, notes) VALUES
('ORD-1001', 'ready', 'TRK123456', 'Main Warehouse', 'DHL', '[]', '[]', 'Ready for pickup'),
('ORD-1002', 'shipped', 'TRK123457', 'Main Warehouse', 'UPS', '[]', '[]', 'Left warehouse');

-- Example upsert for sessions
-- INSERT INTO sessions (session_key, cart, favorites) VALUES ('guest-123', '[]', '[]') ON CONFLICT (session_key) DO UPDATE SET cart = EXCLUDED.cart, favorites = EXCLUDED.favorites, updated_at = now();
