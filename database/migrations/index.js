// Database Migration System
// Centraal systeem voor het uitvoeren van geordende database migraties
// Houdt bij welke migraties al uitgevoerd zijn en voert nieuwe migraties sequentieel uit

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: __dirname + '/../.env' });

// Migratie scripts importeren
const initialSchema = require('./001_initial_schema');
const optimizeIndexes = require('./002_optimize_indexes');

// Ensure migration table exists
const ensureMigrationTable = async (supabase) => {
  const { error } = await supabase.rpc('ensure_migrations_table', {
    sql: `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  });
  
  if (error) {
    console.error('Fout bij aanmaken migraties tabel:', error);
    throw error;
  }
};

// Check which migrations have been executed
const getExecutedMigrations = async (supabase) => {
  const { data, error } = await supabase
    .from('migrations')
    .select('name')
    .order('id', { ascending: true });
    
  if (error) {
    console.error('Fout bij ophalen uitgevoerde migraties:', error);
    throw error;
  }
  
  return (data || []).map(row => row.name);
};

// Register a migration as executed
const registerMigration = async (supabase, name) => {
  const { error } = await supabase
    .from('migrations')
    .insert({ name });
    
  if (error) {
    console.error(`Fout bij registreren migratie ${name}:`, error);
    throw error;
  }
};

// Main migration function
const runMigrations = async () => {
  console.log('Database migratie systeem starten...');
  
  // Initialiseer Supabase client
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL of SUPABASE_KEY environment variabelen ontbreken');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Configureer migratie tabel
    await ensureMigrationTable(supabase);
    
    // Controleer uitgevoerde migraties
    const executedMigrations = await getExecutedMigrations(supabase);
    console.log('Reeds uitgevoerde migraties:', executedMigrations);
    
    // Definieer alle migraties in volgorde
    const migrations = [
      { name: '001_initial_schema', run: initialSchema },
      { name: '002_optimize_indexes', run: optimizeIndexes },
      // Voeg hier nieuwe migraties toe bij uitbreiding
    ];
    
    // Filter en voer nog niet uitgevoerde migraties uit
    for (const migration of migrations) {
      if (!executedMigrations.includes(migration.name)) {
        console.log(`Migratie uitvoeren: ${migration.name}`);
        await migration.run(supabase);
        await registerMigration(supabase, migration.name);
        console.log(`Migratie ${migration.name} succesvol uitgevoerd en geregistreerd`);
      } else {
        console.log(`Migratie ${migration.name} is al uitgevoerd, skippen`);
      }
    }
    
    console.log('Alle migraties succesvol uitgevoerd!');
  } catch (error) {
    console.error('Kritieke fout in migratie systeem:', error);
    process.exit(1);
  }
};

// Uitvoeren als direct aangeroepen
if (require.main === module) {
  runMigrations().catch(err => {
    console.error('Migratie fout:', err);
    process.exit(1);
  });
}

module.exports = { runMigrations };