-- Supabase SQL Editor Query
-- Maak een functie aan voor het uitvoeren van SQL
-- URL: https://app.supabase.com/project/yucpwawshjmonwsgvsfq/sql

-- Stap 1: Maak de execute_sql functie aan
CREATE OR REPLACE FUNCTION execute_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

-- Stap 2: Voeg toegangsrechten toe
GRANT EXECUTE ON FUNCTION execute_sql(text) TO anon, authenticated, service_role;

-- Stap 3: Test de functie met een eenvoudige query
DO $$ 
BEGIN
  PERFORM execute_sql('
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    INSERT INTO migrations (name) 
    VALUES (''init_execute_sql'')
    ON CONFLICT (name) DO NOTHING;
  ');
END $$;

-- Controleer of het is gelukt
SELECT * FROM migrations;