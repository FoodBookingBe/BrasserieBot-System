-- BrasserieBot Geavanceerde RLS Policies
-- Voer deze query rechtstreeks uit in de Supabase SQL Editor
-- Dashboard: https://app.supabase.com/project/yucpwawshjmonwsgvsfq/sql

-- Registreer deze migratie
INSERT INTO migrations (name) 
VALUES ('003_enhanced_rls_policies')
ON CONFLICT (name) DO NOTHING;

-- Eerst controleren of restaurant_staff tabel bestaat, anders aanmaken
CREATE TABLE IF NOT EXISTS restaurant_staff (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  restaurant_id INT NOT NULL REFERENCES restaurants(id),
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, restaurant_id)
);

-- Index voor restaurant_staff tabel
CREATE INDEX IF NOT EXISTS staff_user_restaurant_idx ON restaurant_staff (user_id, restaurant_id);

-- 1. Enable Row Level Security op alle tabellen

-- Enablen van RLS op reservations
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Enablen van RLS op orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Enablen van RLS op menu_items
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Enablen van RLS op restaurants
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

-- 2. Geavanceerde RLS policies voor different gebruikersrollen

-- RESTAURANTS tabel policies

-- Restaurant eigenaren kunnen alleen hun eigen restaurants zien
CREATE POLICY "Restaurant eigenaren kunnen hun restaurants zien" 
ON public.restaurants FOR SELECT 
USING (
  auth.uid() IN (
    SELECT user_id FROM restaurant_staff 
    WHERE restaurant_id = restaurants.id AND role = 'OWNER'
  )
);

-- Restaurant eigenaren kunnen alleen hun eigen restaurants wijzigen
CREATE POLICY "Restaurant eigenaren kunnen hun restaurants wijzigen" 
ON public.restaurants FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id FROM restaurant_staff 
    WHERE restaurant_id = restaurants.id AND role = 'OWNER'
  )
);

-- RESERVATIONS tabel policies

-- Restaurant medewerkers kunnen alle reserveringen zien van hun restaurant
CREATE POLICY "Restaurant medewerkers kunnen reserveringen zien" 
ON public.reservations FOR SELECT 
USING (
  auth.uid() IN (
    SELECT user_id FROM restaurant_staff 
    WHERE restaurant_id = reservations.restaurant_id
  )
);

-- Alleen restaurant managers en eigenaren kunnen reserveringen wijzigen
CREATE POLICY "Alleen managers en eigenaren kunnen reserveringen wijzigen" 
ON public.reservations FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id FROM restaurant_staff 
    WHERE 
      restaurant_id = reservations.restaurant_id AND 
      role IN ('OWNER', 'MANAGER')
  )
);

-- Alleen restaurant managers en eigenaren kunnen reserveringen verwijderen
CREATE POLICY "Alleen managers en eigenaren kunnen reserveringen verwijderen" 
ON public.reservations FOR DELETE
USING (
  auth.uid() IN (
    SELECT user_id FROM restaurant_staff 
    WHERE 
      restaurant_id = reservations.restaurant_id AND 
      role IN ('OWNER', 'MANAGER')
  )
);

-- Klanten kunnen alleen hun eigen reserveringen zien
CREATE POLICY "Klanten kunnen alleen eigen reserveringen zien" 
ON public.reservations FOR SELECT 
USING (
  reservations.customer_email = auth.email()
);

-- ORDERS tabel policies

-- Restaurant medewerkers kunnen alle orders zien van hun restaurant
CREATE POLICY "Restaurant medewerkers kunnen orders zien" 
ON public.orders FOR SELECT 
USING (
  auth.uid() IN (
    SELECT user_id FROM restaurant_staff 
    WHERE restaurant_id = orders.restaurant_id
  )
);

-- Keukenmedewerkers en servers kunnen orders bijwerken maar niet verwijderen
CREATE POLICY "Keukenmedewerkers en servers kunnen orders bijwerken" 
ON public.orders FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id FROM restaurant_staff 
    WHERE 
      restaurant_id = orders.restaurant_id AND 
      role IN ('STAFF', 'KITCHEN')
  )
);

-- Alleen managers en eigenaren kunnen orders verwijderen
CREATE POLICY "Alleen managers en eigenaren kunnen orders verwijderen" 
ON public.orders FOR DELETE
USING (
  auth.uid() IN (
    SELECT user_id FROM restaurant_staff 
    WHERE 
      restaurant_id = orders.restaurant_id AND 
      role IN ('OWNER', 'MANAGER')
  )
);

-- MENU_ITEMS tabel policies

-- Restaurant medewerkers kunnen menu items zien
CREATE POLICY "Restaurant medewerkers kunnen menu items zien" 
ON public.menu_items FOR SELECT 
USING (
  auth.uid() IN (
    SELECT rs.user_id FROM restaurant_staff rs
    JOIN menus m ON m.restaurant_id = rs.restaurant_id
    WHERE menu_items.menu_id = m.id
  )
);

-- Alleen managers en eigenaren kunnen menu items toevoegen of wijzigen
CREATE POLICY "Alleen managers kunnen menu items wijzigen" 
ON public.menu_items FOR ALL
USING (
  auth.uid() IN (
    SELECT rs.user_id FROM restaurant_staff rs
    JOIN menus m ON m.restaurant_id = rs.restaurant_id
    WHERE menu_items.menu_id = m.id AND rs.role IN ('OWNER', 'MANAGER')
  )
);

-- Verificatie van gecreëerde RLS policies
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM 
    pg_policies
WHERE
    schemaname = 'public'
ORDER BY 
    tablename, policyname;