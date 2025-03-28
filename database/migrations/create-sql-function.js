// Aanmaken van SQL exec functie in Supabase
// Dit script maakt de execute_sql functie aan

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function createSqlFunction() {
  console.log('Verbinding maken met Supabase...');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL of SUPABASE_KEY environment variabelen ontbreken');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('Aanmaken van SQL execution functie in Supabase...');
    
    // Directe SQL uitvoering via Supabase REST API
    const { data, error } = await supabase
      .from('_rpc')
      .select('*')
      .then(() => {
        return supabase.rpc('create_sql_function', {
          sql: `
            CREATE OR REPLACE FUNCTION execute_sql(sql text)
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
      });
    
    if (error) {
      console.error('Fout bij het aanmaken van execute_sql functie:', error.message);
      console.log('Probeer alternatieve methode via direct SQL...');
      
      // Probeer via directe SQL in de Supabase interface
      console.log(`
        Log in op Supabase dashboard: https://app.supabase.com/project/yucpwawshjmonwsgvsfq/
        Ga naar de SQL Editor en voer uit:

        CREATE OR REPLACE FUNCTION execute_sql(sql text)
        RETURNS void
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          EXECUTE sql;
        END;
        $$;
      `);
    } else {
      console.log('execute_sql functie succesvol aangemaakt!');
      console.log(data);
    }
    
  } catch (error) {
    console.error('Algemene fout tijdens uitvoering:', error.message);
    throw error;
  }
}

// Voer het script uit
createSqlFunction().catch(err => {
  console.error('Kritieke fout:', err);
  process.exit(1);
});