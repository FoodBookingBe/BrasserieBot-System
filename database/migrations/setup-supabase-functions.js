// Setup Supabase SQL Functions
// Dit script maakt de benodigde stored procedures aan in Supabase
// Deze functies zijn nodig om SQL rechtstreeks uit te voeren

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function setupFunctions() {
  console.log('Verbinding maken met Supabase...');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL of SUPABASE_KEY environment variabelen ontbreken');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('Aanmaken van SQL execution functie in Supabase...');
    
    // Maak een generieke SQL uitvoerfunctie aan
    const { error: createFuncError } = await supabase
      .from('_pgrpc')  // Speciale tabel voor RPC registratie
      .insert({
        name: 'run_sql',
        definition: `
          CREATE OR REPLACE FUNCTION run_sql(sql text)
          RETURNS void
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          BEGIN
            EXECUTE sql;
          END;
          $$;
        `
      });
      
    if (createFuncError) {
      console.error('Fout bij het aanmaken van run_sql functie:', createFuncError.message);
      console.log('De functie bestaat mogelijk al of is er een permissie probleem.');
    } else {
      console.log('run_sql functie succesvol aangemaakt');
    }
    
    // Maak index creatie functie
    const { error: createIndexFuncError } = await supabase
      .from('_pgrpc')
      .insert({
        name: 'create_indexes',
        definition: `
          CREATE OR REPLACE FUNCTION create_indexes(sql text)
          RETURNS void
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          BEGIN
            EXECUTE sql;
          END;
          $$;
        `
      });
      
    if (createIndexFuncError) {
      console.error('Fout bij het aanmaken van create_indexes functie:', createIndexFuncError.message);
      console.log('De functie bestaat mogelijk al of is er een permissie probleem.');
    } else {
      console.log('create_indexes functie succesvol aangemaakt');
    }
    
    console.log('Setup van Supabase functies voltooid!');
    
  } catch (error) {
    console.error('Algemene fout tijdens uitvoering:', error.message);
    throw error;
  }
}

// Voer het script uit
setupFunctions().catch(err => {
  console.error('Kritieke fout:', err);
  process.exit(1);
});