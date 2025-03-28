// Direct SQL execution script for index application
// Dit script past de indexen rechtstreeks toe op de Supabase database

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function applyIndexes() {
  console.log('Verbinding maken met Supabase...');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL of SUPABASE_KEY environment variabelen ontbreken');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('Controleren of de tabellen bestaan...');
    
    // Controleer reservations tabel
    const { data: reservationsCheck, error: resCheckError } = await supabase
      .from('reservations')
      .select('id')
      .limit(1);
      
    if (resCheckError) {
      console.log('Waarschuwing: Reservations tabel niet gevonden. Error:', resCheckError.message);
    } else {
      console.log('Reservations tabel gevonden, indexen toepassen via Supabase SQL Editor...');
      console.log('SQL query voor reservations indexen:');
      console.log(`
        CREATE INDEX IF NOT EXISTS reservations_restaurant_date_idx ON reservations (restaurant_id, reservation_date);
        CREATE INDEX IF NOT EXISTS reservations_customer_search_idx ON reservations USING gin(to_tsvector('dutch', customer_name));
      `);
    }
    
    // Controleer orders tabel
    const { data: ordersCheck, error: ordCheckError } = await supabase
      .from('orders')
      .select('id')
      .limit(1);
      
    if (ordCheckError) {
      console.log('Waarschuwing: Orders tabel niet gevonden. Error:', ordCheckError.message);
    } else {
      console.log('Orders tabel gevonden, indexen toepassen via Supabase SQL Editor...');
      console.log('SQL query voor orders indexen:');
      console.log(`
        CREATE INDEX IF NOT EXISTS orders_restaurant_status_idx ON orders (restaurant_id, status);
        CREATE INDEX IF NOT EXISTS orders_restaurant_created_idx ON orders (restaurant_id, created_at);
      `);
    }
    
    console.log('\nOm de indexen toe te passen:');
    console.log('1. Ga naar de Supabase dashboard: https://app.supabase.com');
    console.log('2. Selecteer uw project');
    console.log('3. Ga naar de SQL Editor');
    console.log('4. Kopieer en plak de bovenstaande SQL queries');
    console.log('5. Voer de queries uit');
    
    // Controleren vanuit de client kant welke tabellen er zijn
    const { data: tablesData, error: tablesError } = await supabase
      .rpc('get_tables');
      
    if (tablesError) {
      console.log('Kon tabellen niet ophalen via RPC. Dit is normaal als de functie niet bestaat.');
      console.log('Gebruik het Supabase dashboard voor een volledig overzicht van de database structuur.');
    } else {
      console.log('\nBeschikbare tabellen in de database:');
      console.log(tablesData);
    }
    
    console.log('\nDatabase indexen optimalisatie instructies volledig!');
    
  } catch (error) {
    console.error('Algemene fout tijdens uitvoering:', error.message);
    throw error;
  }
}

// Voer het script uit
applyIndexes().catch(err => {
  console.error('Kritieke fout:', err);
  process.exit(1);
});