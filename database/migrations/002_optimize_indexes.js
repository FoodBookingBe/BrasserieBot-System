// Migration: 002_optimize_indexes.js
// Dit script voert indexoptimalisaties uit voor betere databaseprestaties
// Implementeert samengestelde en partiële indexen voor veelgebruikte query's

const optimizeIndexes = async (supabase) => {
  console.log('Uitvoeren migratie 002: Indexoptimalisaties...');
  
  try {
    // SQL index optimalisaties direct uitvoeren met SQL query
    const { error } = await supabase.rpc('run_migration_002', {
      sql: `
        -- Optimized composite indexes for Orders table
        CREATE INDEX IF NOT EXISTS orders_restaurant_status_idx ON public.orders (restaurant_id, status);
        CREATE INDEX IF NOT EXISTS orders_restaurant_created_idx ON public.orders (restaurant_id, created_at);
        
        -- Optimized composite indexes for Reservations table 
        CREATE INDEX IF NOT EXISTS reservations_restaurant_date_idx ON public.reservations (restaurant_id, reservation_date);
        
        -- Text search indexes for customer search functionality
        CREATE INDEX IF NOT EXISTS reservations_customer_search_idx ON public.reservations USING gin(to_tsvector('dutch', customer_name));
        
        -- Optimized index for supplier payments
        CREATE INDEX IF NOT EXISTS payments_supplier_status_idx ON public.supplier_payments (supplier_id, status);
      `
    });
    
    if (error) {
      console.error('Migratie 002 fout:', error);
      throw error;
    }
    
    console.log('Migratie 002 succesvol uitgevoerd');
    return true;
  } catch (err) {
    console.error('Fout bij uitvoeren migratie 002:', err);
    throw err;
  }
};

module.exports = optimizeIndexes;