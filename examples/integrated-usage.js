// BrasserieBot Geïntegreerd Voorbeeld
// Dit bestand demonstreert de geïntegreerde werking van:
// 1. MCP Servers (GitHub, Supabase, Netlify)
// 2. Geoptimaliseerde Database Toegang
// 3. Geavanceerde Error Handling

import { safeSupabase } from '../utils/supabase-client.js';
import { handleSupabaseError, ERROR_CODES } from '../utils/error-handler.js';

// -------------------------------------------
// Voorbeeld 1: Veilig ophalen van reserveringen
// -------------------------------------------
async function getRestaurantReservations(restaurantId, date) {
  try {
    console.log(`Ophalen reserveringen voor restaurant ${restaurantId} op ${date}...`);
    
    // Gebruik van de veilige Supabase client
    const { data, error } = await safeSupabase
      .from('reservations')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('reservation_date', date)
      .order('reservation_date', { ascending: true });
    
    // Error handling automatisch afgehandeld door safeSupabase
    
    console.log(`Aantal reserveringen gevonden: ${data?.length || 0}`);
    return data || [];
    
  } catch (error) {
    // Centrale error handling
    console.error('Fout bij ophalen reserveringen:', error.message);
    
    // Voorbeeld van error fallback
    if (error.code === ERROR_CODES.RLS_PERMISSION_DENIED) {
      console.log('Geen toegangsrechten voor deze reserveringen. Toon alleen beschikbare tijdslots.');
      return getAvailableTimeSlots(restaurantId, date);
    }
    
    // Return lege array als fallback
    return [];
  }
}

// Voorbeeld helper functie
async function getAvailableTimeSlots(restaurantId, date) {
  // Fallback functionaliteit
  return [
    { time: '18:00', available: true },
    { time: '18:30', available: true },
    { time: '19:00', available: false },
    { time: '19:30', available: true }
  ];
}

// -------------------------------------------
// Voorbeeld 2: Integratie met GitHub MCP
// -------------------------------------------
async function syncMenuWithGitHub(restaurantId) {
  try {
    console.log(`Synchroniseren menu's met GitHub voor restaurant ${restaurantId}...`);
    
    // In een echte applicatie zou dit een MCP Tool aanroep zijn:
    // const result = await useMcpTool('github-server', 'sync_repository', {
    //   restaurantId,
    //   repositoryName: `menu-${restaurantId}`
    // });
    
    // Simulatie van MCP GitHub integratie
    const menuItems = await safeSupabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurantId);
    
    console.log(`Menu gesynchroniseerd met ${menuItems.data?.length || 0} items`);
    return {
      success: true,
      message: "Menu's succesvol gesynchroniseerd met GitHub repository",
      items: menuItems.data
    };
    };
    
  } catch (error) {
    // Gestructureerde error handling
    handleSupabaseError(error, {
      context: 'GitHub.syncMenu', 
      showToast: true,
      fallbackAction: () => {
        // Fallback actie, bijvoorbeeld lokaal opslaan
        console.log('Fallback: Menu lokaal opgeslagen');
      }
    });
    
    return {
      success: false,
      message: 'Kon menu niet synchroniseren met GitHub'
    };
  }
}

// -------------------------------------------
// Voorbeeld 3: Reservering toevoegen met optimale indexering
// -------------------------------------------
async function createReservation(reservationData) {
  try {
    console.log('Nieuwe reservering aanmaken...');
    
    // Validatie
    if (!reservationData.restaurant_id || !reservationData.reservation_date) {
      throw new Error('Ontbrekende verplichte velden voor reservering');
    }
    
    // Gebruik van de geoptimaliseerde database structuur
    const { data, error } = await safeSupabase
      .from('reservations')
      .insert([{
        restaurant_id: reservationData.restaurant_id,
        customer_name: reservationData.customer_name,
        customer_email: reservationData.customer_email,
        customer_phone: reservationData.customer_phone,
        party_size: reservationData.party_size,
        reservation_date: reservationData.reservation_date,
        status: 'CONFIRMED'
      }])
      .select();
    
    console.log('Reservering succesvol aangemaakt:', data);
    
    // Notificatie via Netlify functie (voorbeeld van MCP integratie)
    // await useMcpTool('netlify-server', 'send_notification', {
    //   type: 'new_reservation',
    //   restaurantId: reservationData.restaurant_id,
    //   reservationId: data[0].id
    // });
    
    return {
      success: true,
      reservation: data[0]
    };
    
  } catch (error) {
    handleSupabaseError(error, {
      context: 'Reservations.create', 
      showToast: true
    });
    
    return {
      success: false,
      message: 'Kon reservering niet aanmaken'
    };
  }
}

// -------------------------------------------
// Voorbeeld 4: Volledige tekst zoekfunctionaliteit (met GIN index)
// -------------------------------------------
async function searchCustomers(searchTerm, restaurantId) {
  try {
    console.log(`Zoeken naar klanten met term: "${searchTerm}"`);
    
    // Gebruik maken van de GIN index voor full-text search
    const { data, error } = await safeSupabase.rpc('search_customers', {
      search_term: searchTerm,
      restaurant: restaurantId
    });
    
    console.log(`Zoekresultaten: ${data?.length || 0} klanten gevonden`);
    return data || [];
    
  } catch (error) {
    handleSupabaseError(error, {
      context: 'Customers.search', 
      showToast: true
    });
    
    // Fallback naar eenvoudige ILIKE search
    try {
      const { data } = await safeSupabase
        .from('reservations')
        .select('customer_name, customer_email, customer_phone')
        .eq('restaurant_id', restaurantId)
        .ilike('customer_name', `%${searchTerm}%`)
        .limit(10);
      
      console.log('Fallback zoekresultaten:', data?.length);
      return data || [];
      
    } catch (fallbackError) {
      console.error('Ook fallback zoekmethode faalde:', fallbackError);
      return [];
    }
  }
}

// -------------------------------------------
// Gebruiksvoorbeelden
// -------------------------------------------

// Example usage:
async function runExamples() {
  // Voorbeeld 1: Reserveringen ophalen
  const reservations = await getRestaurantReservations(123, '2025-03-29');
  console.log('Reserveringen:', reservations);
  
  // Voorbeeld 2: GitHub synchronisatie
  const syncResult = await syncMenuWithGitHub(123);
  console.log('GitHub Sync Resultaat:', syncResult);
  
  // Voorbeeld 3: Reservering aanmaken
  const newReservation = await createReservation({
    restaurant_id: 123,
    customer_name: 'Jan Jansen',
    customer_email: 'jan@example.com',
    customer_phone: '+31612345678',
    party_size: 4,
    reservation_date: new Date('2025-03-30T19:00:00')
  });
  console.log('Nieuwe Reservering:', newReservation);
  
  // Voorbeeld 4: Klantenzoekfunctie
  const customers = await searchCustomers('jans', 123);
  console.log('Gevonden klanten:', customers);
}

// Voer de voorbeelden uit als dit bestand direct wordt uitgevoerd
if (typeof require !== 'undefined' && require.main === module) {
  runExamples().catch(console.error);
}

// Exporteer de functies voor gebruik in andere bestanden
export {
  getRestaurantReservations,
  syncMenuWithGitHub,
  createReservation,
  searchCustomers
};