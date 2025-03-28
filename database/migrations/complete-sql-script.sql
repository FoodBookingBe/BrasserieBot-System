-- Volledig SQL Script voor Supabase Dashboard
-- URL: https://app.supabase.com/project/yucpwawshjmonwsgvsfq/sql
-- Kopieer en plak dit volledige script in de SQL Editor en klik op "Run"

-- Stap 1: Maak SQL execute functie aan (voor toekomstige migraties)
-- Deze functie maakt het mogelijk om SQL uit te voeren vanuit andere SQL statements
CREATE OR REPLACE FUNCTION execute_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

-- Voeg rechten toe voor toegang tot de functie
GRANT EXECUTE ON FUNCTION execute_sql(text) TO anon, authenticated, service_role;

-- Stap 2: Maak migrations tabel aan (als die nog niet bestaat)
CREATE TABLE IF NOT EXISTS migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Registreer huidige migratie
INSERT INTO migrations (name) 
VALUES 
  ('001_initial_schema'),
  ('002_optimize_indexes'),
  ('003_enhanced_rls_policies')
ON CONFLICT (name) DO NOTHING;

-- Stap 3: Maak restaurant_staff tabel aan (als die nog niet bestaat)
CREATE TABLE IF NOT EXISTS restaurant_staff (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  restaurant_id INT NOT NULL REFERENCES restaurants(id),
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, restaurant_id)
);

-- Stap 4: Creëer alle benodigde indexen

-- Optimized composite indexes for Orders table
CREATE INDEX IF NOT EXISTS orders_restaurant_status_idx ON orders (restaurant_id, status);
CREATE INDEX IF NOT EXISTS orders_restaurant_created_idx ON orders (restaurant_id, created_at);

-- Optimized composite indexes for Reservations table 
CREATE INDEX IF NOT EXISTS reservations_restaurant_date_idx ON reservations (restaurant_id, reservation_date);

-- Index voor staff lookups
CREATE INDEX IF NOT EXISTS staff_user_restaurant_idx ON restaurant_staff (user_id, restaurant_id);

-- Text search indexes for customer search functionality
-- Gebruik English als fallback als Dutch niet beschikbaar is
CREATE INDEX IF NOT EXISTS reservations_customer_search_idx ON reservations USING gin(to_tsvector('english', customer_name));

-- Optimized index for supplier payments
CREATE INDEX IF NOT EXISTS payments_supplier_status_idx ON supplier_payments (supplier_id, status);

-- Stap 5: Schakel Row Level Security in

-- Enablen van RLS op reservations
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Enablen van RLS op orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Enablen van RLS op menu_items
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Enablen van RLS op restaurants
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

-- Stap 6: Creëer RLS policies voor restaurants

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

-- Stap 7: Creëer RLS policies voor reserveringen

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

-- Stap 8: Creëer RLS policies voor orders

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

-- Stap 9: Creëer RLS policies voor menu items

-- Restaurant medewerkers kunnen menu items zien
CREATE POLICY "Restaurant medewerkers kunnen menu items zien" 
ON public.menu_items FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM restaurant_staff rs
    JOIN menus m ON m.restaurant_id = rs.restaurant_id
    WHERE menu_items.menu_id = m.id
    AND rs.user_id = auth.uid()
  )
);

-- Alleen managers en eigenaren kunnen menu items toevoegen of wijzigen
CREATE POLICY "Alleen managers kunnen menu items wijzigen" 
ON public.menu_items FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM restaurant_staff rs
    JOIN menus m ON m.restaurant_id = rs.restaurant_id
    WHERE menu_items.menu_id = m.id
    AND rs.user_id = auth.uid()
    AND rs.role IN ('OWNER', 'MANAGER')
  )
);

-- Stap 10: Functie voor full-text zoeken op klantnamen
CREATE OR REPLACE FUNCTION search_customers(search_term TEXT, restaurant INT)
RETURNS SETOF reservations
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT DISTINCT r.*
  FROM reservations r
  WHERE r.restaurant_id = restaurant
  AND (
    to_tsvector('english', r.customer_name) @@ plainto_tsquery('english', search_term)
    OR r.customer_name ILIKE '%' || search_term || '%'
    OR r.customer_email ILIKE '%' || search_term || '%'
  )
  ORDER BY r.reservation_date DESC
  LIMIT 20;
$$;

-- Grant toegang tot de zoekfunctie
GRANT EXECUTE ON FUNCTION search_customers(TEXT, INT) TO authenticated;

-- Stap 11: Verificatie van alle aangebrachte wijzigingen

-- Controleer migrations tabel
SELECT * FROM migrations ORDER BY id;

-- Controleer indexen
SELECT
    tablename,
    indexname,
    indexdef
FROM
    pg_indexes
WHERE
    schemaname = 'public' AND 
    (tablename = 'reservations' OR tablename = 'orders' OR tablename = 'supplier_payments' OR tablename = 'restaurant_staff')
ORDER BY
    tablename, indexname;

-- Controleer RLS policies
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM 
    pg_policies
WHERE
    schemaname = 'public'
ORDER BY 
    tablename, policyname;