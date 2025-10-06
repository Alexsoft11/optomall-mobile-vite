-- Supabase schema for products table
-- Run this in the Supabase SQL editor to create the products table and seed sample data

CREATE TABLE IF NOT EXISTS products (
  id serial PRIMARY KEY,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  images jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- Seed sample products
INSERT INTO products (name, description, price, images) VALUES
('Minimalist Watch', 'A sleek minimalist watch with leather strap.', 129.99, '["https://picsum.photos/seed/watch/600/600"]'),
('Noise-Cancelling Headphones', 'Over-ear headphones with active noise cancellation.', 249.00, '["https://picsum.photos/seed/headphones/600/600"]'),
('Ceramic Mug', 'Handmade ceramic mug, 350ml capacity.', 18.50, '["https://picsum.photos/seed/mug/600/600"]'),
('Running Shoes', 'Lightweight running shoes with breathable mesh.', 89.99, '["https://picsum.photos/seed/shoes/600/600"]'),
('Wireless Charger', 'Fast wireless charger compatible with Qi devices.', 39.95, '["https://picsum.photos/seed/charger/600/600"]'),
('Bluetooth Speaker', 'Portable Bluetooth speaker with 12h battery life.', 59.99, '["https://picsum.photos/seed/speaker/600/600"]');
