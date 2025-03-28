// Migration: 001_initial_schema.js
// Dit script voert de eerste migratie uit om het basisschema op te zetten
// Het gebruikt de Supabase RPC functie om SQL op de database uit te voeren

const initialSchema = async (supabase) => {
  console.log('Uitvoeren migratie 001: Initieel schema...');
  
  // Aanroepen van een stored procedure op Supabase
  const { error } = await supabase.rpc('run_migration_001');
  
  if (error) {
    console.error('Migratie 001 fout:', error);
    throw error;
  }
  
  console.log('Migratie 001 succesvol uitgevoerd');
  return true;
};

module.exports = initialSchema;