-- BrasserieBot Database Optimalisatie Query
-- Voer deze query rechtstreeks uit in de Supabase SQL Editor
-- Dashboard: https://app.supabase.com/project/yucpwawshjmonwsgvsfq/sql

-- Maak migratie tracking tabel aan
CREATE TABLE IF NOT EXISTS migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Registreer deze migratie
INSERT INTO migrations (name) 
VALUES ('002_optimize_indexes')
ON CONFLICT (name) DO NOTHING;

-- Samengestelde indexen voor reserveringen
CREATE INDEX IF NOT EXISTS reservations_restaurant_date_idx 
ON reservations (restaurant_id, reservation_date);

-- Volledige tekstzoek index voor klantnamen
CREATE INDEX IF NOT EXISTS reservations_customer_search_idx 
ON reservations USING gin(to_tsvector('english', customer_name));

-- Samengestelde indexen voor orders
CREATE INDEX IF NOT EXISTS orders_restaurant_status_idx 
ON orders (restaurant_id, status);

CREATE INDEX IF NOT EXISTS orders_restaurant_created_idx 
ON orders (restaurant_id, created_at);

-- Samengestelde indexen voor supplier payments
CREATE INDEX IF NOT EXISTS payments_supplier_status_idx 
ON supplier_payments (supplier_id, status);

-- Verifieer welke indexen nu bestaan
SELECT
    tablename,
    indexname,
    indexdef
FROM
    pg_indexes
WHERE
    schemaname = 'public' AND 
    (tablename = 'reservations' OR tablename = 'orders' OR tablename = 'supplier_payments')
ORDER BY
    tablename, indexname;