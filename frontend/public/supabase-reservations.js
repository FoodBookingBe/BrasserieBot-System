/**
 * BrasserieBot Supabase Reservations Handler
 * 
 * Dit bestand biedt functionaliteit voor het beheren van reserveringen
 * met Supabase als backend en een fallback naar lokale opslag indien Supabase niet beschikbaar is.
 */

// Supabase Reserveringen Handler
class SupabaseReservationsHandler {
    constructor() {
        this.supabase = window.supabaseClient;
        this.connected = false;
        this.tableName = 'reservations';
        this.localStorageKey = 'brasseriebot_reservations';
        
        // Initialiseer verbinding en test deze
        this.initialize();
    }
    
    async initialize() {
        try {
            // Test de verbinding door een eenvoudige query uit te voeren
            const { error } = await this.supabase
                .from(this.tableName)
                .select('count(*)', { count: 'exact' })
                .limit(1);
                
            if (error) {
                throw new Error('Supabase verbindingsfout: ' + error.message);
            }
            
            this.connected = true;
            console.log('Supabase reserveringen verbinding succesvol!');
            
            // Update UI status indicator (als die bestaat)
            this.updateConnectionStatus(true);
            
            // Synchroniseer lokale data met Supabase als we weer online zijn
            this.syncLocalWithRemote();
        } catch (err) {
            console.warn('Supabase reserveringen verbinding mislukt, gebruik lokale opslag:', err.message);
            this.connected = false;
            
            // Update UI status indicator (als die bestaat)
            this.updateConnectionStatus(false);
        }
    }
    
    updateConnectionStatus(isConnected) {
        const statusEl = document.getElementById('reservations-connection-status');
        if (statusEl) {
            statusEl.textContent = isConnected ? 'Verbonden met Supabase' : 'Offline modus (lokale opslag)';
            
            const indicatorEl = document.querySelector('.status-indicator');
            if (indicatorEl) {
                indicatorEl.classList.toggle('connected', isConnected);
                indicatorEl.classList.toggle('disconnected', !isConnected);
            }
        }
    }
    
    // Haal reserveringen op, gefilterd op datum indien opgegeven
    async getReservations(filter = {}) {
        if (this.connected) {
            try {
                let query = this.supabase.from(this.tableName).select('*');
                
                // Pas filter toe indien aanwezig
                if (filter.date) {
                    query = query.eq('date', filter.date);
                } else if (filter.dateStart && filter.dateEnd) {
                    query = query.gte('date', filter.dateStart).lte('date', filter.dateEnd);
                } else if (filter.status) {
                    query = query.eq('status', filter.status);
                }
                
                // Voer de query uit
                const { data, error } = await query.order('date', { ascending: true });
                
                if (error) throw error;
                return data || [];
            } catch (err) {
                console.error('Fout bij ophalen reserveringen van Supabase:', err);
                // Fallback naar lokale opslag bij fout
                return this.getLocalReservations(filter);
            }
        } else {
            // Gebruik lokale opslag als we niet verbonden zijn
            return this.getLocalReservations(filter);
        }
    }
    
    // Filter lokale reserveringen
    getLocalReservations(filter = {}) {
        try {
            // Haal reserveringen op uit localStorage
            const reservationsJson = localStorage.getItem(this.localStorageKey);
            let reservations = reservationsJson ? JSON.parse(reservationsJson) : [];
            
            // Pas filter toe indien opgegeven
            if (filter.date) {
                reservations = reservations.filter(r => r.date === filter.date);
            } else if (filter.dateStart && filter.dateEnd) {
                reservations = reservations.filter(r => 
                    r.date >= filter.dateStart && r.date <= filter.dateEnd
                );
            } else if (filter.status) {
                reservations = reservations.filter(r => r.status === filter.status);
            }
            
            // Sorteer op datum
            reservations.sort((a, b) => {
                if (a.date === b.date) {
                    return a.time.localeCompare(b.time);
                }
                return a.date.localeCompare(b.date);
            });
            
            return reservations;
        } catch (err) {
            console.error('Fout bij ophalen lokale reserveringen:', err);
            return [];
        }
    }
    
    // Voeg een nieuwe reservering toe
    async addReservation(reservation) {
        if (!reservation.id) {
            reservation.id = this.generateUUID();
        }
        
        if (this.connected) {
            try {
                const { data, error } = await this.supabase
                    .from(this.tableName)
                    .insert(reservation)
                    .select();
                    
                if (error) throw error;
                
                console.log('Reservering succesvol toegevoegd aan Supabase');
                return data[0] || reservation;
            } catch (err) {
                console.error('Fout bij toevoegen reservering aan Supabase:', err);
                // Store locally as fallback
                this.addLocalReservation(reservation);
                return reservation;
            }
        } else {
            // Store in localStorage when offline
            this.addLocalReservation(reservation);
            return reservation;
        }
    }
    
    // Voeg een reservering toe aan lokale opslag
    addLocalReservation(reservation) {
        try {
            const reservationsJson = localStorage.getItem(this.localStorageKey);
            const reservations = reservationsJson ? JSON.parse(reservationsJson) : [];
            
            // Voeg de nieuwe reservering toe
            reservations.push(reservation);
            
            // Sla de bijgewerkte lijst op
            localStorage.setItem(this.localStorageKey, JSON.stringify(reservations));
            console.log('Reservering lokaal opgeslagen');
            
            // Flag dat er ongesynchroniseerde wijzigingen zijn
            localStorage.setItem('brasseriebot_sync_needed', 'true');
            
            return reservation;
        } catch (err) {
            console.error('Fout bij lokaal opslaan van reservering:', err);
            return reservation;
        }
    }
    
    // Update een bestaande reservering
    async updateReservation(id, updates) {
        if (this.connected) {
            try {
                const { data, error } = await this.supabase
                    .from(this.tableName)
                    .update(updates)
                    .eq('id', id)
                    .select();
                    
                if (error) throw error;
                
                console.log('Reservering succesvol bijgewerkt in Supabase');
                return data[0];
            } catch (err) {
                console.error('Fout bij bijwerken reservering in Supabase:', err);
                // Update locally as fallback
                return this.updateLocalReservation(id, updates);
            }
        } else {
            // Update in localStorage when offline
            return this.updateLocalReservation(id, updates);
        }
    }
    
    // Update een reservering in lokale opslag
    updateLocalReservation(id, updates) {
        try {
            const reservationsJson = localStorage.getItem(this.localStorageKey);
            let reservations = reservationsJson ? JSON.parse(reservationsJson) : [];
            
            // Zoek de reservering op basis van ID
            const index = reservations.findIndex(r => r.id === id);
            
            if (index !== -1) {
                // Update de reservering
                reservations[index] = { ...reservations[index], ...updates };
                
                // Sla de bijgewerkte lijst op
                localStorage.setItem(this.localStorageKey, JSON.stringify(reservations));
                console.log('Reservering lokaal bijgewerkt');
                
                // Flag dat er ongesynchroniseerde wijzigingen zijn
                localStorage.setItem('brasseriebot_sync_needed', 'true');
                
                return reservations[index];
            }
            
            return null;
        } catch (err) {
            console.error('Fout bij lokaal bijwerken van reservering:', err);
            return null;
        }
    }
    
    // Verwijder een reservering
    async deleteReservation(id) {
        if (this.connected) {
            try {
                const { error } = await this.supabase
                    .from(this.tableName)
                    .delete()
                    .eq('id', id);
                    
                if (error) throw error;
                
                console.log('Reservering succesvol verwijderd uit Supabase');
                return true;
            } catch (err) {
                console.error('Fout bij verwijderen reservering uit Supabase:', err);
                // Delete locally as fallback
                return this.deleteLocalReservation(id);
            }
        } else {
            // Delete from localStorage when offline
            return this.deleteLocalReservation(id);
        }
    }
    
    // Verwijder een reservering uit lokale opslag
    deleteLocalReservation(id) {
        try {
            const reservationsJson = localStorage.getItem(this.localStorageKey);
            let reservations = reservationsJson ? JSON.parse(reservationsJson) : [];
            
            // Filter de te verwijderen reservering eruit
            const filteredReservations = reservations.filter(r => r.id !== id);
            
            // Als er een reservering verwijderd is
            if (filteredReservations.length < reservations.length) {
                // Sla de bijgewerkte lijst op
                localStorage.setItem(this.localStorageKey, JSON.stringify(filteredReservations));
                console.log('Reservering lokaal verwijderd');
                
                // Flag dat er ongesynchroniseerde wijzigingen zijn
                localStorage.setItem('brasseriebot_sync_needed', 'true');
                
                return true;
            }
            
            return false;
        } catch (err) {
            console.error('Fout bij lokaal verwijderen van reservering:', err);
            return false;
        }
    }
    
    // Synchroniseer lokale wijzigingen met Supabase
    async syncLocalWithRemote() {
        // Controleer of synchronisatie nodig is
        const syncNeeded = localStorage.getItem('brasseriebot_sync_needed') === 'true';
        
        if (!syncNeeded || !this.connected) {
            return;
        }
        
        try {
            console.log('Synchroniseren van lokale reserveringen met Supabase...');
            
            const reservationsJson = localStorage.getItem(this.localStorageKey);
            const localReservations = reservationsJson ? JSON.parse(reservationsJson) : [];
            
            // Haal bestaande reserveringen op uit Supabase
            const { data: remoteReservations, error } = await this.supabase
                .from(this.tableName)
                .select('id');
                
            if (error) throw error;
            
            const remoteIds = remoteReservations.map(r => r.id);
            
            // Verwerk elke lokale reservering
            for (const reservation of localReservations) {
                if (remoteIds.includes(reservation.id)) {
                    // Update bestaande reservering
                    await this.supabase
                        .from(this.tableName)
                        .update(reservation)
                        .eq('id', reservation.id);
                } else {
                    // Voeg nieuwe reservering toe
                    await this.supabase
                        .from(this.tableName)
                        .insert(reservation);
                }
            }
            
            // Reset synchronisatie flag
            localStorage.removeItem('brasseriebot_sync_needed');
            console.log('Synchronisatie met Supabase voltooid');
        } catch (err) {
            console.error('Fout bij synchroniseren met Supabase:', err);
        }
    }
    
    // Hulpfunctie om een UUID te genereren
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    // Verschillende helpers voor statistieken
    
    // Haal aantal reserveringen op voor vandaag
    async getTodayReservationsCount() {
        const today = new Date().toISOString().split('T')[0];
        const reservations = await this.getReservations({ date: today });
        return reservations.length;
    }
    
    // Haal aantal reserveringen op voor morgen
    async getTomorrowReservationsCount() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        const reservations = await this.getReservations({ date: tomorrowStr });
        return reservations.length;
    }
    
    // Haal aantal reserveringen op voor deze week
    async getThisWeekReservationsCount() {
        const today = new Date();
        const startOfWeek = new Date(today);
        const endOfWeek = new Date(today);
        
        // Bepaal start en eind van de week (maandag-zondag)
        const dayOfWeek = today.getDay(); // 0 = zondag, 1 = maandag, etc.
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        
        startOfWeek.setDate(diff);
        endOfWeek.setDate(diff + 6);
        
        const startStr = startOfWeek.toISOString().split('T')[0];
        const endStr = endOfWeek.toISOString().split('T')[0];
        
        const reservations = await this.getReservations({ 
            dateStart: startStr,
            dateEnd: endStr
        });
        
        return reservations.length;
    }
}

// Initialiseer de Supabase reserveringen handler wanneer het document geladen is
document.addEventListener('DOMContentLoaded', function() {
    // Wacht tot de Supabase client beschikbaar is
    if (window.supabaseClient) {
        window.BrasserieBotSupabaseReservations = new SupabaseReservationsHandler();
    } else {
        console.warn('Supabase client niet beschikbaar, kan reserveringen niet initialiseren');
    }
});