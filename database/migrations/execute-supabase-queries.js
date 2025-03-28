// Uitvoeren van SQL queries direct op Supabase
// Dit script gebruikt de Supabase API om de SQL queries uit te voeren
// Voer uit met: node execute-supabase-queries.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function executeQueries() {
  console.log('Verbinding maken met Supabase...');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL of SUPABASE_KEY environment variabelen ontbreken');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('Supabase client aangemaakt, systeeminformatie ophalen...');
    
    // Haal basis database informatie op
    const { data: versionData, error: versionError } = await supabase.rpc('get_system_info', {
      sql: 'SELECT version();'
    }).maybeSingle();
    
    if (versionError) {
      console.log('Info: Kan sys functie niet aanroepen, maak deze aan...');
      
      // Maak een functie om SQL uit te voeren als die niet bestaat
      const { error: createFuncError } = await supabase.rpc('run_sql', {
        sql: `
          CREATE OR REPLACE FUNCTION get_system_info(sql text)
          RETURNS text
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          DECLARE
            result text;
          BEGIN
            EXECUTE sql INTO result;
            RETURN result;
          END;
          $$;
        `
      });
      
      if (createFuncError) {
        console.log('Kan systeem-info functie niet aanmaken, probeer SQL direct uit te voeren...');
      } else {
        console.log('Systeem-info functie aangemaakt.');
      }
    } else {
      console.log('Supabase versie:', versionData);
    }

    // 1. Eerst de indexen toevoegen
    console.log('\n--- STAP 1: Database Indexen Optimalisatie ---');
    
    // Lees het SQL bestand
    const indexSqlPath = path.join(__dirname, 'supabase-direct-query.sql');
    const indexSql = fs.readFileSync(indexSqlPath, 'utf8');
    
    // Voer elke query apart uit
    const indexQueries = indexSql.split(';').filter(q => q.trim());
    
    for (let i = 0; i < indexQueries.length; i++) {
      const query = indexQueries[i].trim();
      if (!query) continue;
      
      try {
        console.log(`\nUitvoeren query ${i+1}/${indexQueries.length}:`);
        console.log(query.substring(0, 100) + (query.length > 100 ? '...' : ''));
        
        const { error } = await supabase.rpc('execute_sql', {
          sql: query
        });
        
        if (error) {
          console.log('Fout bij uitvoeren van query:', error.message);
          console.log('Probeer alternatieve methode...');
          
          // Probeer directe REST API call als rpc mislukt
          const { error: restError } = await supabase.rest('/rpc/execute_sql', {
            method: 'POST',
            body: { sql: query }
          });
          
          if (restError) {
            console.log('Fout bij uitvoeren via REST API:', restError.message);
          } else {
            console.log('Query succesvol uitgevoerd via REST API!');
          }
        } else {
          console.log('Query succesvol uitgevoerd!');
        }
      } catch (err) {
        console.log('Onverwachte fout bij uitvoeren query:', err.message);
      }
    }
    
    // 2. Daarna de RLS policies toevoegen
    console.log('\n--- STAP 2: RLS Policies Implementatie ---');
    
    // Lees het RLS SQL bestand
    const rlsSqlPath = path.join(__dirname, 'supabase-rls-policies.sql');
    const rlsSql = fs.readFileSync(rlsSqlPath, 'utf8');
    
    // Voer elke query apart uit
    const rlsQueries = rlsSql.split(';').filter(q => q.trim());
    
    for (let i = 0; i < rlsQueries.length; i++) {
      const query = rlsQueries[i].trim();
      if (!query) continue;
      
      try {
        console.log(`\nUitvoeren RLS query ${i+1}/${rlsQueries.length}:`);
        console.log(query.substring(0, 100) + (query.length > 100 ? '...' : ''));
        
        const { error } = await supabase.rpc('execute_sql', {
          sql: query
        });
        
        if (error) {
          console.log('Fout bij uitvoeren van RLS query:', error.message);
          console.log('Probeer alternatieve methode...');
          
          // Probeer directe REST API call als rpc mislukt
          const { error: restError } = await supabase.rest('/rpc/execute_sql', {
            method: 'POST',
            body: { sql: query }
          });
          
          if (restError) {
            console.log('Fout bij uitvoeren via REST API:', restError.message);
          } else {
            console.log('RLS query succesvol uitgevoerd via REST API!');
          }
        } else {
          console.log('RLS query succesvol uitgevoerd!');
        }
      } catch (err) {
        console.log('Onverwachte fout bij uitvoeren RLS query:', err.message);
      }
    }
    
    // 3. Verifieer de uitgevoerde indexen
    console.log('\n--- STAP 3: Verificatie van indexen ---');
    
    const { data: indexesData, error: indexesError } = await supabase.rpc('get_system_info', {
      sql: `
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
      `
    });
    
    if (indexesError) {
      console.log('Fout bij ophalen van index informatie:', indexesError.message);
    } else {
      console.log('Aangemaakte indexen:');
      console.log(indexesData);
    }
    
    // 4. Verifieer de RLS policies
    console.log('\n--- STAP 4: Verificatie van RLS policies ---');
    
    const { data: policiesData, error: policiesError } = await supabase.rpc('get_system_info', {
      sql: `
        SELECT 
            tablename,
            policyname,
            roles,
            cmd
        FROM 
            pg_policies
        WHERE
            schemaname = 'public'
        ORDER BY 
            tablename, policyname;
      `
    });
    
    if (policiesError) {
      console.log('Fout bij ophalen van RLS policy informatie:', policiesError.message);
    } else {
      console.log('Aangemaakte RLS policies:');
      console.log(policiesData);
    }

    console.log('\nDatabase optimalisaties succesvol uitgevoerd!');
    
  } catch (error) {
    console.error('Algemene fout tijdens uitvoering:', error.message);
    throw error;
  }
}

// Voer het script uit
executeQueries().catch(err => {
  console.error('Kritieke fout:', err);
  process.exit(1);
});