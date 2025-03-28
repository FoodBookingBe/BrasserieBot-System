-- Initial database schema for BrasserieBot
-- Run this against your Supabase database to create the necessary tables

-- Enable RLS (Row Level Security)
alter database postgres set anon.jwt.exp_claims_check = '(exp > extract(epoch from now())::integer)';

-- Create migrations table to track applied migrations
CREATE TABLE IF NOT EXISTS migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create restaurant_staff table to link users to restaurants
CREATE TABLE IF NOT EXISTS restaurant_staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'staff', -- admin, manager, staff
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(restaurant_id, user_id)
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50),
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),
  party_size INTEGER NOT NULL,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  special_requests TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, canceled, completed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'open', -- open, in_progress, completed, canceled
  total_amount DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_at_time DECIMAL(10, 2) NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Set up Row Level Security policies

-- Restaurants: allow all users to view, only authenticated to modify
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view restaurants"
  ON restaurants FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert restaurants"
  ON restaurants FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Restaurant staff can update their restaurant"
  ON restaurants FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_staff
      WHERE restaurant_id = restaurants.id
      AND user_id = auth.uid()
    )
  );

-- Restaurant Staff: only staff and above can view
ALTER TABLE restaurant_staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view their restaurant"
  ON restaurant_staff FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM restaurant_staff rs
      WHERE rs.restaurant_id = restaurant_staff.restaurant_id
      AND rs.user_id = auth.uid()
      AND rs.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can manage staff"
  ON restaurant_staff FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_staff rs
      WHERE rs.restaurant_id = restaurant_staff.restaurant_id
      AND rs.user_id = auth.uid()
      AND rs.role = 'admin'
    )
  );

-- Record initial migration
INSERT INTO migrations (name) VALUES ('initial-schema');