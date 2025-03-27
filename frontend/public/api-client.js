/**
 * BrasserieBot API Client
 * Een robuuste client voor communicatie met de BrasserieBot API
 * Met automatische foutafhandeling en fallback naar lokale data
 */

const BrasserieBotAPI = (function() {
    // Configuratie
    const API_BASE_URL = 'https://brasserie-bot-api.onrender.com';
    const API_TIMEOUT = 8000; // 8 seconden timeout
    const ENABLE_LOGGING = true;
    const USE_DEMO_DATA = true; // Gebruik demo data als API niet beschikbaar is

    // Private variabelen
    let _authToken = null;
    let _cachedData = {};
    let _offlineMode = false;

    // Logger functie
    const log = (type, message, data = null) => {
        if (!ENABLE_LOGGING) return;
        
        switch(type) {
            case 'error':
                console.error(`BrasserieBot API: ${message}`, data);
                break;
            case 'warn':
                console.warn(`BrasserieBot API: ${message}`, data);
                break;
            case 'info':
            default:
                console.log(`BrasserieBot API: ${message}`, data);
        }
    };

    // Helper functies
    const handleApiError = (endpoint, error) => {
        log('error', `API request error: ${endpoint}`, error);
        _offlineMode = true;
        return null;
    };

    // Basis fetch functie met timeout en foutafhandeling
    const fetchWithTimeout = async (url, options = {}, timeout = API_TIMEOUT) => {
        const endpoint = url.replace(API_BASE_URL, '');
        
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeout);
            
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': _authToken ? `Bearer ${_authToken}` : '',
                    ...options.headers
                }
            });
            
            clearTimeout(id);
            
            if (!response.ok) {
                return handleApiError(endpoint, new Error(`HTTP error ${response.status}: ${response.statusText}`));
            }
            
            return await response.json();
        } catch (error) {
            if (error.name === 'AbortError') {
                return handleApiError(endpoint, new Error('Request timeout'));
            }
            return handleApiError(endpoint, error);
        }
    };

    // Genereer demo data
    const generateDemoData = (type) => {
        switch(type) {
            case 'reservations':
                return [
                    { id: 1, name: 'Jan Janssen', guests: 4, time: '18:00', date: new Date().toISOString().split('T')[0], phone: '+32 478 123456', status: 'confirmed', notes: 'Tafel bij het raam gewenst' },
                    { id: 2, name: 'Marie Peeters', guests: 2, time: '19:00', date: new Date().toISOString().split('T')[0], phone: '+32 495 654321', status: 'confirmed', notes: 'Vegetarische opties gewenst' },
                    { id: 3, name: 'Alex De Vries', guests: 6, time: '20:30', date: new Date().toISOString().split('T')[0], phone: '+32 470 987654', status: 'pending', notes: 'Verjaardag' },
                    { id: 4, name: 'Sophie Maes', guests: 3, time: '19:30', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], phone: '+32 498 567890', status: 'confirmed', notes: '' },
                    { id: 5, name: 'Thomas Lambert', guests: 2, time: '20:00', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], phone: '+32 474 345678', status: 'confirmed', notes: 'Allergie voor noten' }
                ];
            case 'menu':
                return [
                    { id: 1, name: 'Stoofvlees met frieten', category: 'Hoofdgerecht', price: 18.50, description: 'Traditioneel Belgisch stoofvlees met frietjes en salade', available: true, popular: true, image: 'https://via.placeholder.com/150' },
                    { id: 2, name: 'Vol-au-vent', category: 'Hoofdgerecht', price: 19.50, description: 'Klassieker met kip, champignons en een romige saus', available: true, popular: true, image: 'https://via.placeholder.com/150' },
                    { id: 3, name: 'Tomatensoep', category: 'Voorgerecht', price: 7.50, description: 'Huisgemaakte tomatensoep met balletjes', available: true, popular: false, image: 'https://via.placeholder.com/150' },
                    { id: 4, name: 'Dame Blanche', category: 'Dessert', price: 8.50, description: 'Vanille-ijs met warme chocoladesaus', available: true, popular: true, image: 'https://via.placeholder.com/150' },
                    { id: 5, name: 'Spaghetti Bolognese', category: 'Hoofdgerecht', price: 16.50, description: 'Huisgemaakte pasta met klassieke Bolognesesaus', available: true, popular: false, image: 'https://via.placeholder.com/150' },
                    { id: 6, name: 'Crème Brûlée', category: 'Dessert', price: 9.00, description: 'Klassieke Franse crème brûlée', available: true, popular: false, image: 'https://via.placeholder.com/150' },
                    { id: 7, name: 'Garnaalkroketten', category: 'Voorgerecht', price: 14.50, description: 'Kroketten gevuld met Noordzeegarnalen', available: true, popular: true, image: 'https://via.placeholder.com/150' },
                    { id: 8, name: 'Steak Béarnaise', category: 'Hoofdgerecht', price: 24.50, description: 'Belgische rundersteak met béarnaisesaus en frietjes', available: true, popular: true, image: 'https://via.placeholder.com/150' }
                ];
            case 'customers':
                return [
                    { id: 1, name: 'Jan Janssen', email: 'jan.janssen@email.com', phone: '+32 478 123456', visits: 8, lastVisit: '2025-03-20', preferences: 'Tafel bij het raam' },
                    { id: 2, name: 'Marie Peeters', email: 'marie.peeters@email.com', phone: '+32 495 654321', visits: 5, lastVisit: '2025-03-18', preferences: 'Vegetarisch' },
                    { id: 3, name: 'Alex De Vries', email: 'alex.devries@email.com', phone: '+32 470 987654', visits: 3, lastVisit: '2025-03-15', preferences: 'Allergisch voor lactose' },
                    { id: 4, name: 'Sophie Maes', email: 'sophie.maes@email.com', phone: '+32 498 567890', visits: 12, lastVisit: '2025-03-25', preferences: 'VIP klant' },
                    { id: 5, name: 'Thomas Lambert', email: 'thomas.lambert@email.com', phone: '+32 474 345678', visits: 1, lastVisit: '2025-03-24', preferences: 'Allergie voor noten' }
                ];
            case 'orders':
                return [
                    { id: 1, tableNumber: 5, customerName: 'Jan Janssen', items: [{ id: 1, name: 'Stoofvlees met frieten', quantity: 2, price: 18.50 }, { id: 4, name: 'Dame Blanche', quantity: 2, price: 8.50 }], total: 54.00, status: 'served', timestamp: '2025-03-26T13:45:00', paymentMethod: 'card' },
                    { id: 2, tableNumber: 3, customerName: 'Marie Peeters', items: [{ id: 3, name: 'Tomatensoep', quantity: 2, price: 7.50 }, { id: 5, name: 'Spaghetti Bolognese', quantity: 2, price: 16.50 }], total: 48.00, status: 'preparing', timestamp: '2025-03-26T14:15:00', paymentMethod: 'pending' },
                    { id: 3, tableNumber: 8, customerName: 'Alex De Vries', items: [{ id: 7, name: 'Garnaalkroketten', quantity: 2, price: 14.50 }, { id: 8, name: 'Steak Béarnaise', quantity: 2, price: 24.50 }, { id: 4, name: 'Dame Blanche', quantity: 2, price: 8.50 }], total: 95.00, status: 'ordered', timestamp: '2025-03-26T14:30:00', paymentMethod: 'pending' }
                ];
            default:
                return [];
        }
    };

    // API endpoints
    return {
        // Initialisatie
        init: () => {
            log('info', 'Initialiseren BrasserieBot API client');
            // Token ophalen uit localStorage als beschikbaar
            _authToken = localStorage.getItem('brasseriebot_token');
            
            // Netwerk status controleren
            if (navigator.onLine === false) {
                _offlineMode = true;
                log('warn', 'Offline modus geactiveerd - netwerk niet beschikbaar');
            }
            
            // Demo data alvast laden in cache voor offline gebruik
            if (USE_DEMO_DATA) {
                _cachedData.reservations = generateDemoData('reservations');
                _cachedData.menu = generateDemoData('menu');
                _cachedData.customers = generateDemoData('customers');
                _cachedData.orders = generateDemoData('orders');
                log('info', 'Demo data geladen in cache');
            }
        },
        
        // Authenticatie
        auth: {
            login: async (username, password) => {
                try {
                    log('info', 'Authenticatie via API');
                    const data = await fetchWithTimeout(`${API_BASE_URL}/auth/login`, {
                        method: 'POST',
                        body: JSON.stringify({ username, password })
                    });
                    
                    if (data && data.token) {
                        _authToken = data.token;
                        localStorage.setItem('brasseriebot_token', data.token);
                        return data.user;
                    }
                    
                    return null;
                } catch (error) {
                    log('warn', 'API authenticatie mislukt, terugvallen op lokale authenticatie', error);
                    log('info', 'Authenticatie via lokale database (fallback)');
                    
                    // Demo login
                    if (USE_DEMO_DATA) {
                        if (username === 'admin' && password === 'admin123') {
                            return { id: 1, username: 'admin', role: 'admin', firstName: 'Admin', lastName: 'User' };
                        } else if (username === 'user' && password === 'user123') {
                            return { id: 2, username: 'user', role: 'user', firstName: 'Demo', lastName: 'User' };
                        }
                    }
                    
                    return null;
                }
            },
            
            logout: () => {
                _authToken = null;
                localStorage.removeItem('brasseriebot_token');
                localStorage.removeItem('brasseriebot_user');
                localStorage.removeItem('brasseriebot_auth_time');
                log('info', 'Gebruiker uitgelogd');
            }
        },
        
        // Reserveringen
        reservations: {
            getAll: async (date = null) => {
                try {
                    if (_offlineMode) throw new Error('Offline modus actief');
                    
                    const queryParams = date ? `?date=${date}` : '';
                    const data = await fetchWithTimeout(`${API_BASE_URL}/reservations${queryParams}`);
                    
                    // Cache de resultaten
                    _cachedData.reservations = data;
                    return data;
                } catch (error) {
                    log('warn', 'Fout bij laden reserveringen, gebruik demo data', error);
                    return _cachedData.reservations || generateDemoData('reservations');
                }
            },
            
            getById: async (id) => {
                try {
                    if (_offlineMode) throw new Error('Offline modus actief');
                    
                    return await fetchWithTimeout(`${API_BASE_URL}/reservations/${id}`);
                } catch (error) {
                    log('warn', 'Fout bij laden reservering, gebruik demo data', error);
                    
                    // Zoek in cache of genereer demo data
                    if (_cachedData.reservations) {
                        return _cachedData.reservations.find(r => r.id === id) || null;
                    }
                    
                    const demoData = generateDemoData('reservations');
                    return demoData.find(r => r.id === id) || null;
                }
            },
            
            create: async (reservationData) => {
                try {
                    if (_offlineMode) throw new Error('Offline modus actief');
                    
                    return await fetchWithTimeout(`${API_BASE_URL}/reservations`, {
                        method: 'POST',
                        body: JSON.stringify(reservationData)
                    });
                } catch (error) {
                    log('error', 'Kan reservering niet aanmaken', error);
                    
                    // In demo modus simuleren we een succesvolle aanmaak
                    if (USE_DEMO_DATA) {
                        const newReservation = {
                            id: Math.floor(Math.random() * 1000) + 10,
                            ...reservationData,
                            status: 'pending'
                        };
                        
                        if (_cachedData.reservations) {
                            _cachedData.reservations.push(newReservation);
                        }
                        
                        return newReservation;
                    }
                    
                    return null;
                }
            },
            
            update: async (id, reservationData) => {
                try {
                    if (_offlineMode) throw new Error('Offline modus actief');
                    
                    return await fetchWithTimeout(`${API_BASE_URL}/reservations/${id}`, {
                        method: 'PUT',
                        body: JSON.stringify(reservationData)
                    });
                } catch (error) {
                    log('error', 'Kan reservering niet bijwerken', error);
                    
                    // In demo modus simuleren we een succesvolle update
                    if (USE_DEMO_DATA && _cachedData.reservations) {
                        const index = _cachedData.reservations.findIndex(r => r.id === id);
                        
                        if (index !== -1) {
                            _cachedData.reservations[index] = {
                                ..._cachedData.reservations[index],
                                ...reservationData
                            };
                            
                            return _cachedData.reservations[index];
                        }
                    }
                    
                    return null;
                }
            },
            
            delete: async (id) => {
                try {
                    if (_offlineMode) throw new Error('Offline modus actief');
                    
                    await fetchWithTimeout(`${API_BASE_URL}/reservations/${id}`, {
                        method: 'DELETE'
                    });
                    
                    return true;
                } catch (error) {
                    log('error', 'Kan reservering niet verwijderen', error);
                    
                    // In demo modus simuleren we een succesvolle verwijdering
                    if (USE_DEMO_DATA && _cachedData.reservations) {
                        _cachedData.reservations = _cachedData.reservations.filter(r => r.id !== id);
                        return true;
                    }
                    
                    return false;
                }
            }
        },
        
        // Menu items
        menu: {
            getAll: async (category = null) => {
                try {
                    if (_offlineMode) throw new Error('Offline modus actief');
                    
                    const queryParams = category ? `?category=${category}` : '';
                    const data = await fetchWithTimeout(`${API_BASE_URL}/menu${queryParams}`);
                    
                    // Cache de resultaten
                    _cachedData.menu = data;
                    return data;
                } catch (error) {
                    log('warn', 'Fout bij laden menu items, gebruik demo data', error);
                    return _cachedData.menu || generateDemoData('menu');
                }
            },
            
            getById: async (id) => {
                try {
                    if (_offlineMode) throw new Error('Offline modus actief');
                    
                    return await fetchWithTimeout(`${API_BASE_URL}/menu/${id}`);
                } catch (error) {
                    log('warn', 'Fout bij laden menu item, gebruik demo data', error);
                    
                    // Zoek in cache of genereer demo data
                    if (_cachedData.menu) {
                        return _cachedData.menu.find(m => m.id === id) || null;
                    }
                    
                    const demoData = generateDemoData('menu');
                    return demoData.find(m => m.id === id) || null;
                }
            }
        },
        
        // Klanten
        customers: {
            getAll: async () => {
                try {
                    if (_offlineMode) throw new Error('Offline modus actief');
                    
                    const data = await fetchWithTimeout(`${API_BASE_URL}/customers`);
                    
                    // Cache de resultaten
                    _cachedData.customers = data;
                    return data;
                } catch (error) {
                    log('warn', 'Fout bij laden klanten, gebruik demo data', error);
                    return _cachedData.customers || generateDemoData('customers');
                }
            },
            
            getById: async (id) => {
                try {
                    if (_offlineMode) throw new Error('Offline modus actief');
                    
                    return await fetchWithTimeout(`${API_BASE_URL}/customers/${id}`);
                } catch (error) {
                    log('warn', 'Fout bij laden klant, gebruik demo data', error);
                    
                    // Zoek in cache of genereer demo data
                    if (_cachedData.customers) {
                        return _cachedData.customers.find(c => c.id === id) || null;
                    }
                    
                    const demoData = generateDemoData('customers');
                    return demoData.find(c => c.id === id) || null;
                }
            }
        },
        
        // Bestellingen
        orders: {
            getAll: async (date = null) => {
                try {
                    if (_offlineMode) throw new Error('Offline modus actief');
                    
                    const queryParams = date ? `?date=${date}` : '';
                    const data = await fetchWithTimeout(`${API_BASE_URL}/orders${queryParams}`);
                    
                    // Cache de resultaten
                    _cachedData.orders = data;
                    return data;
                } catch (error) {
                    log('warn', 'Fout bij laden bestellingen, gebruik demo data', error);
                    return _cachedData.orders || generateDemoData('orders');
                }
            },
            
            getById: async (id) => {
                try {
                    if (_offlineMode) throw new Error('Offline modus actief');
                    
                    return await fetchWithTimeout(`${API_BASE_URL}/orders/${id}`);
                } catch (error) {
                    log('warn', 'Fout bij laden bestelling, gebruik demo data', error);
                    
                    // Zoek in cache of genereer demo data
                    if (_cachedData.orders) {
                        return _cachedData.orders.find(o => o.id === id) || null;
                    }
                    
                    const demoData = generateDemoData('orders');
                    return demoData.find(o => o.id === id) || null;
                }
            },
            
            create: async (orderData) => {
                try {
                    if (_offlineMode) throw new Error('Offline modus actief');
                    
                    return await fetchWithTimeout(`${API_BASE_URL}/orders`, {
                        method: 'POST',
                        body: JSON.stringify(orderData)
                    });
                } catch (error) {
                    log('error', 'Kan bestelling niet aanmaken', error);
                    
                    // In demo modus simuleren we een succesvolle aanmaak
                    if (USE_DEMO_DATA) {
                        const newOrder = {
                            id: Math.floor(Math.random() * 1000) + 10,
                            ...orderData,
                            status: 'ordered',
                            timestamp: new Date().toISOString(),
                            paymentMethod: 'pending'
                        };
                        
                        if (_cachedData.orders) {
                            _cachedData.orders.push(newOrder);
                        }
                        
                        return newOrder;
                    }
                    
                    return null;
                }
            },
            
            updateStatus: async (id, status) => {
                try {
                    if (_offlineMode) throw new Error('Offline modus actief');
                    
                    return await fetchWithTimeout(`${API_BASE_URL}/orders/${id}/status`, {
                        method: 'PATCH',
                        body: JSON.stringify({ status })
                    });
                } catch (error) {
                    log('error', 'Kan bestelling status niet bijwerken', error);
                    
                    // In demo modus simuleren we een succesvolle update
                    if (USE_DEMO_DATA && _cachedData.orders) {
                        const index = _cachedData.orders.findIndex(o => o.id === id);
                        
                        if (index !== -1) {
                            _cachedData.orders[index].status = status;
                            return _cachedData.orders[index];
                        }
                    }
                    
                    return null;
                }
            }
        },
        
        // Helpers
        getOfflineMode: () => _offlineMode,
        setOfflineMode: (mode) => {
            _offlineMode = !!mode;
            log('info', `Offline modus ${_offlineMode ? 'geactiveerd' : 'gedeactiveerd'}`);
        },
        clearCache: () => {
            _cachedData = {};
            log('info', 'Cache gewist');
        }
    };
})();

// Automatisch initialiseren wanneer het script geladen wordt
document.addEventListener('DOMContentLoaded', function() {
    BrasserieBotAPI.init();
    console.log('BrasserieBot API Client geladen');
});