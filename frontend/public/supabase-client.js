/**
 * BrasserieBot Supabase Client
 * Verantwoordelijk voor alle interacties met de Supabase backend
 */

// Initialiseer de Supabase client
const supabaseClient = (function() {
    // Configuratie (deze waarden worden ingesteld door Netlify via process-html.js)
    // De waarden tussen {{}} worden vervangen tijdens het build proces
    const SUPABASE_DATABASE_URL = "{{SUPABASE_DATABASE_URL}}";
    const SUPABASE_ANON_KEY = "{{SUPABASE_ANON_KEY}}";
    
    // Privévariabelen
    let _initialized = false;
    let _client = null;
    let _user = null;
    
    // Tabelnamen
    const TABLES = {
        RESERVATIONS: 'reservations',
        CUSTOMERS: 'customers',
        MENU_ITEMS: 'menu_items',
        ORDERS: 'orders',
        USERS: 'users',
        SETTINGS: 'settings'
    };
    
    // Privémethoden
    const _initClient = () => {
        if (!_initialized) {
            try {
                // Check of de supabase-js library is geladen
                if (typeof supabase === 'undefined') {
                    console.error('Supabase client library is niet geladen');
                    return false;
                }
                
                // Initialiseer client met de omgevingsvariabelen
                const supabaseUrl = window.ENV && window.ENV.SUPABASE_DATABASE_URL ?
                    window.ENV.SUPABASE_DATABASE_URL : SUPABASE_DATABASE_URL;
                const supabaseKey = window.ENV && window.ENV.SUPABASE_ANON_KEY ?
                    window.ENV.SUPABASE_ANON_KEY : SUPABASE_ANON_KEY;
                
                console.log('Initializing Supabase client with URL:', supabaseUrl);
                
                if (supabaseKey === "{{SUPABASE_ANON_KEY}}" || supabaseKey === "your-anon-key") {
                    console.warn('WARNING: Using placeholder SUPABASE_ANON_KEY. Netlify environment variables may not be configured correctly.');
                }
                
                _client = supabase.createClient(supabaseUrl, supabaseKey);
                _initialized = true;
                
                // Setup auth state listener
                _setupAuthListener();
                
                console.log('Supabase client succesvol geïnitialiseerd');
                return true;
            } catch (error) {
                console.error('Fout bij initialiseren Supabase client:', error);
                return false;
            }
        }
        return true;
    };
    
    const _setupAuthListener = () => {
        if (!_client) return;
        
        // Luister naar auth veranderingen
        _client.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                _user = session.user;
                // Sla user info op in localStorage voor app gebruik
                localStorage.setItem('brasseriebot_user', JSON.stringify({
                    id: _user.id,
                    email: _user.email,
                    username: _user.email.split('@')[0],
                    role: _user.user_metadata.role || 'user',
                    restaurantName: _user.user_metadata.restaurantName || 'BrasserieBot Restaurant'
                }));
                localStorage.setItem('brasseriebot_auth_time', Date.now().toString());
                localStorage.setItem('brasseriebot_token', session.access_token);
                
                console.log('Gebruiker ingelogd:', _user.email);
            } else if (event === 'SIGNED_OUT') {
                _user = null;
                // Verwijder user info uit localStorage
                localStorage.removeItem('brasseriebot_user');
                localStorage.removeItem('brasseriebot_auth_time');
                localStorage.removeItem('brasseriebot_token');
                
                console.log('Gebruiker uitgelogd');
            }
        });
    };
    
    // Realtime abonnement starten
    const _setupRealtimeSubscription = (table, callback) => {
        if (!_client) return null;
        
        try {
            const subscription = _client
                .channel(`public:${table}`)
                .on('postgres_changes', {
                    event: '*', 
                    schema: 'public',
                    table: table
                }, (payload) => {
                    callback(payload);
                })
                .subscribe();
                
            return subscription;
        } catch (error) {
            console.error(`Fout bij opzetten realtime abonnement voor ${table}:`, error);
            return null;
        }
    };
    
    // Publieke API
    return {
        /**
         * Initialiseer de Supabase client
         * @returns {boolean} True als initialisatie succesvol was
         */
        init: function() {
            return _initClient();
        },
        
        /**
         * Haal de huidige Supabase client op
         * @returns {Object|null} De Supabase client of null als niet geïnitialiseerd
         */
        getClient: function() {
            if (!_initialized) {
                _initClient();
            }
            return _client;
        },
        
        /**
         * Controleer of Supabase beschikbaar is
         * @returns {boolean} True als Supabase beschikbaar is
         */
        isAvailable: function() {
            return _initialized && _client !== null;
        },
        
        /**
         * Authenticatie functies
         */
        auth: {
            /**
             * Login met email en wachtwoord
             * @param {string} email Gebruikers email
             * @param {string} password Gebruikers wachtwoord
             * @returns {Promise} Promise met login resultaat
             */
            loginWithPassword: async function(email, password) {
                if (!_initClient()) {
                    return { error: { message: 'Supabase client niet geïnitialiseerd' } };
                }
                
                try {
                    const { data, error } = await _client.auth.signInWithPassword({
                        email,
                        password
                    });
                    
                    if (error) throw error;
                    return { data };
                } catch (error) {
                    console.error('Login fout:', error);
                    return { error };
                }
            },
            
            /**
             * Registreer een nieuwe gebruiker
             * @param {string} email Gebruikers email
             * @param {string} password Gebruikers wachtwoord
             * @param {Object} metadata Extra gebruikersgegevens
             * @returns {Promise} Promise met registratie resultaat
             */
            registerWithPassword: async function(email, password, metadata = {}) {
                if (!_initClient()) {
                    return { error: { message: 'Supabase client niet geïnitialiseerd' } };
                }
                
                try {
                    const { data, error } = await _client.auth.signUp({
                        email,
                        password,
                        options: {
                            data: metadata
                        }
                    });
                    
                    if (error) throw error;
                    return { data };
                } catch (error) {
                    console.error('Registratie fout:', error);
                    return { error };
                }
            },
            
            /**
             * Stuur een wachtwoord reset e-mail
             * @param {string} email E-mailadres om reset link naar te sturen
             * @param {Object} options Opties zoals redirectTo URL
             * @returns {Promise} Promise met reset resultaat
             */
            resetPasswordForEmail: async function(email, options = {}) {
                if (!_initClient()) {
                    return { error: { message: 'Supabase client niet geïnitialiseerd' } };
                }
                
                try {
                    const { data, error } = await _client.auth.resetPasswordForEmail(email, options);
                    
                    if (error) throw error;
                    return { data };
                } catch (error) {
                    console.error('Wachtwoord reset fout:', error);
                    return { error };
                }
            },
            
            /**
             * Uitloggen
             * @returns {Promise} Promise met uitlog resultaat
             */
            logout: async function() {
                if (!_initClient()) {
                    return { error: { message: 'Supabase client niet geïnitialiseerd' } };
                }
                
                try {
                    const { error } = await _client.auth.signOut();
                    if (error) throw error;
                    return { success: true };
                } catch (error) {
                    console.error('Uitloggen fout:', error);
                    return { error };
                }
            },
            
            /**
             * Controleer of een gebruiker is ingelogd
             * @returns {boolean} True als een gebruiker is ingelogd
             */
            isLoggedIn: function() {
                return _user !== null;
            },
            
            /**
             * Haal de huidige gebruiker op
             * @returns {Object|null} De huidige gebruiker of null als niet ingelogd
             */
            getCurrentUser: async function() {
                if (!_initClient()) {
                    return null;
                }
                
                try {
                    const { data, error } = await _client.auth.getUser();
                    if (error) throw error;
                    _user = data.user;
                    return _user;
                } catch (error) {
                    console.error('Fout bij ophalen gebruiker:', error);
                    return null;
                }
            }
        },
        
        /**
         * Database functies
         */
        db: {
            /**
             * Haal alle records op uit een tabel
             * @param {string} table Tabelnaam
             * @param {Object} options Query opties (filters, sortering, etc.)
             * @returns {Promise} Promise met query resultaat
             */
            getAll: async function(table, options = {}) {
                if (!_initClient()) {
                    return { error: { message: 'Supabase client niet geïnitialiseerd' } };
                }
                
                try {
                    let query = _client.from(table).select('*');
                    
                    // Voeg filters toe
                    if (options.filters) {
                        for (const [column, value] of Object.entries(options.filters)) {
                            query = query.eq(column, value);
                        }
                    }
                    
                    // Voeg sortering toe
                    if (options.orderBy) {
                        query = query.order(options.orderBy, { ascending: options.ascending !== false });
                    }
                    
                    // Voeg limiet toe
                    if (options.limit) {
                        query = query.limit(options.limit);
                    }
                    
                    const { data, error } = await query;
                    if (error) throw error;
                    return { data };
                } catch (error) {
                    console.error(`Fout bij ophalen ${table}:`, error);
                    return { error };
                }
            },
            
            /**
             * Haal een specifiek record op uit een tabel
             * @param {string} table Tabelnaam
             * @param {string|number} id Record ID
             * @returns {Promise} Promise met query resultaat
             */
            getById: async function(table, id) {
                if (!_initClient()) {
                    return { error: { message: 'Supabase client niet geïnitialiseerd' } };
                }
                
                try {
                    const { data, error } = await _client
                        .from(table)
                        .select('*')
                        .eq('id', id)
                        .single();
                    
                    if (error) throw error;
                    return { data };
                } catch (error) {
                    console.error(`Fout bij ophalen ${table} met id ${id}:`, error);
                    return { error };
                }
            },
            
            /**
             * Maak een nieuw record aan in een tabel
             * @param {string} table Tabelnaam
             * @param {Object} record Record data
             * @returns {Promise} Promise met insert resultaat
             */
            create: async function(table, record) {
                if (!_initClient()) {
                    return { error: { message: 'Supabase client niet geïnitialiseerd' } };
                }
                
                try {
                    const { data, error } = await _client
                        .from(table)
                        .insert([record])
                        .select()
                        .single();
                    
                    if (error) throw error;
                    return { data };
                } catch (error) {
                    console.error(`Fout bij aanmaken ${table}:`, error);
                    return { error };
                }
            },
            
            /**
             * Update een bestaand record in een tabel
             * @param {string} table Tabelnaam
             * @param {string|number} id Record ID
             * @param {Object} updates Updates voor het record
             * @returns {Promise} Promise met update resultaat
             */
            update: async function(table, id, updates) {
                if (!_initClient()) {
                    return { error: { message: 'Supabase client niet geïnitialiseerd' } };
                }
                
                try {
                    const { data, error } = await _client
                        .from(table)
                        .update(updates)
                        .eq('id', id)
                        .select()
                        .single();
                    
                    if (error) throw error;
                    return { data };
                } catch (error) {
                    console.error(`Fout bij updaten ${table} met id ${id}:`, error);
                    return { error };
                }
            },
            
            /**
             * Verwijder een record uit een tabel
             * @param {string} table Tabelnaam
             * @param {string|number} id Record ID
             * @returns {Promise} Promise met delete resultaat
             */
            delete: async function(table, id) {
                if (!_initClient()) {
                    return { error: { message: 'Supabase client niet geïnitialiseerd' } };
                }
                
                try {
                    const { error } = await _client
                        .from(table)
                        .delete()
                        .eq('id', id);
                    
                    if (error) throw error;
                    return { success: true };
                } catch (error) {
                    console.error(`Fout bij verwijderen ${table} met id ${id}:`, error);
                    return { error };
                }
            }
        },
        
        /**
         * Realtime functies
         */
        realtime: {
            /**
             * Abonneer op realtime updates voor een tabel
             * @param {string} table Tabelnaam
             * @param {Function} callback Functie die wordt aangeroepen bij updates
             * @returns {Object|null} Subscription object of null bij fout
             */
            subscribe: function(table, callback) {
                if (!_initClient()) {
                    console.error('Kan niet abonneren: Supabase client niet geïnitialiseerd');
                    return null;
                }
                
                return _setupRealtimeSubscription(table, callback);
            },
            
            /**
             * Annuleer een realtime abonnement
             * @param {Object} subscription Het subscription object
             */
            unsubscribe: function(subscription) {
                if (!subscription) return;
                
                try {
                    _client.removeChannel(subscription);
                } catch (error) {
                    console.error('Fout bij annuleren abonnement:', error);
                }
            }
        },
        
        /**
         * Tabelnamen constanten
         */
        TABLES: TABLES
    };
})();

// Auto-initialisatie wanneer het script is geladen
document.addEventListener('DOMContentLoaded', function() {
    // Controleer of de supabase-js library geladen is
    if (typeof supabase !== 'undefined') {
        supabaseClient.init();
    } else {
        console.warn('Supabase JS library is niet geladen. Laad eerst de Supabase JS library.');
    }
});