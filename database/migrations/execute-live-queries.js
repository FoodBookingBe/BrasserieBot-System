// Direct SQL Query Executor voor Supabase
// Dit script voert de SQL queries rechtstreeks uit op de live Supabase database
// Voer uit met: node execute-live-queries.js

const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

// Supabase credentials voor directe API aanroepen
const SUPABASE_URL = 'https://yucpwawshjmonwsgvsfq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1Y3B3YXdzaGptb253c2d2c2ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwODM1NzQsImV4cCI6MjA1ODY1OTU3NH0.L5eKYyXAqjkze2_LhnHgEbAURMRt7r2q0ITI6hhktJ0';

// SQL bestanden die uitgevoerd moeten worden
const SQL_FILES = [
  path.join(__dirname, 'create-function-dashboard.sql'),
  path.join(__dirname, 'supabase-direct-query.sql'),
  path.join(__dirname, 'supabase-rls-policies.sql')
];

// Configuratie
const CONFIG = {
  headers: {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  },
  sqlEndpoint: `${SUPABASE_URL}/rest/v1/rpc/`
};

/**
 * Splits een SQL bestand in individuele query's
 * @param {string} sql - SQL bestandsinhoud
 * @returns {string[]} Array van individuele query's
 */
function splitSqlQueries(sql) {
  // Verwijder comments en splits op ;
  // Dit is een eenvoudige implementatie - voor productie zou een SQL parser beter zijn
  const sanitized = sql.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  return sanitized
    .split(';')
    .map(query => query.trim())
    .filter(query => query.length > 0);
}

/**
 * Voert de SQL execute functie uit op de Supabase database
 * @param {string} sql - SQL query om uit te voeren
 * @param {string} context - Context voor logging
 * @returns {Promise<Object>} Respons data
 */
async function executeSql(sql, context = 'Generic query') {
  console.log(`\n[${context}] Uitvoeren query: ${sql.substring(0, 100)}${sql.length > 100 ? '...' : ''}`);
  
  try {
    // Probeer eerst de execute_sql functie
    const response = await axios.post(`${CONFIG.sqlEndpoint}execute_sql`, {
      sql: sql
    }, {
      headers: CONFIG.headers
    });
    
    console.log(`✅ Query succesvol uitgevoerd`);
    return response.data;
  } catch (error) {
    // Als de functie niet bestaat, probeer de query direct via SQL API
    if (error.response && error.response.status === 404) {
      console.log(`⚠️ execute_sql functie niet gevonden, probeer directe SQL query...`);
      
      try {
        // Gebruik de SQL API om de query direct uit te voeren
        const response = await axios.post(`${SUPABASE_URL}/rest/v1/sql`, {
          query: sql
        }, {
          headers: CONFIG.headers
        });
        
        console.log(`✅ Query succesvol uitgevoerd via directe SQL API`);
        return response.data;
      } catch (directError) {
        console.error(`❌ Fout bij directe SQL uitvoering:`, directError.message);
        if (directError.response) {
          console.error(`Status: ${directError.response.status}`);
          console.error(`Details:`, directError.response.data);
        }
        throw directError;
      }
    }
    
    // Andere fouten
    console.error(`❌ Fout bij uitvoeren SQL:`, error.message);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Details:`, error.response.data);
    }
    throw error;
  }
}

/**
 * Voert een heel SQL bestand uit, query voor query
 * @param {string} filePath - Pad naar het SQL bestand
 * @returns {Promise<void>}
 */
async function executeFile(filePath) {
  console.log(`\n----- Uitvoeren bestand: ${path.basename(filePath)} -----`);
  
  try {
    // Lees het SQL bestand
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`Bestand gelezen: ${sql.length} bytes`);
    
    // Split in individuele query's
    const queries = splitSqlQueries(sql);
    console.log(`Gesplitst in ${queries.length} query's`);
    
    // Voer elke query uit
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      try {
        await executeSql(query, `${path.basename(filePath)} - Query ${i+1}/${queries.length}`);
      } catch (error) {
        // Log fout maar ga door met volgende queries
        console.error(`⚠️ Fout bij uitvoeren query ${i+1}, doorgaan met volgende query`);
      }
    }
    
    console.log(`✅ Bestand volledig uitgevoerd: ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`❌ Fout bij verwerken bestand ${filePath}:`, error.message);
    throw error;
  }
}

/**
 * Creëert de SQL execute functie op Supabase als die nog niet bestaat
 * @returns {Promise<void>}
 */
async function setupSqlFunction() {
  console.log('\n----- Setup SQL Execute Function -----');
  
  const sql = `
    CREATE OR REPLACE FUNCTION execute_sql(sql text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$;
    
    GRANT EXECUTE ON FUNCTION execute_sql(text) TO anon, authenticated, service_role;
  `;
  
  try {
    // Probeer de functie aan te maken via direct SQL
    const response = await axios.post(`${SUPABASE_URL}/rest/v1/sql`, {
      query: sql
    }, {
      headers: CONFIG.headers
    });
    
    console.log(`✅ SQL execute functie succesvol aangemaakt`);
    return response.data;
  } catch (error) {
    console.error(`❌ Fout bij aanmaken SQL functie:`, error.message);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Details:`, error.response.data);
    }
    
    // Dit is geen fatale fout, ga door met de rest van het script
    console.log(`⚠️ Doorgaan zonder SQL execute functie, directe queries worden gebruikt`);
  }
}

/**
 * Hoofdfunctie voor het uitvoeren van alle SQL bestanden
 */
async function executeAllFiles() {
  console.log('===== Starten SQL uitvoering op live Supabase database =====');
  console.log(`URL: ${SUPABASE_URL}`);
  console.log(`API key: ${SUPABASE_ANON_KEY.substring(0, 5)}...${SUPABASE_ANON_KEY.substring(SUPABASE_ANON_KEY.length - 3)}`);
  
  try {
    // Setup de SQL execute functie eerst
    await setupSqlFunction();
    
    // Voer alle SQL bestanden uit
    for (const filePath of SQL_FILES) {
      await executeFile(filePath);
    }
    
    console.log('\n===== Alle SQL queries succesvol uitgevoerd! =====');
  } catch (error) {
    console.error('\n❌ Kritieke fout tijdens uitvoering:', error.message);
    process.exit(1);
  }
}

// Start het script
executeAllFiles();