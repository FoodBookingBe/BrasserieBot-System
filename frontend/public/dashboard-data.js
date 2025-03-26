// Dashboard data controller
// Verbindt het dashboard met de backend API

// Cache voor gegevens
const dataCache = {
    reservations: null,
    orders: null,
    menuItems: null,
    customers: null,
    lastFetch: {
        reservations: 0,
        orders: 0,
        menuItems: 0,
        customers: 0
    }
};

// Cache verversingstijd in milliseconden (5 minuten)
const CACHE_REFRESH_TIME = 5 * 60 * 1000;

// Dashboard data controller
const DashboardDataController = {
    
    // Initialiseer het dashboard
    init: async function() {
        console.log('Initialiseren DashboardDataController...');
        
        // Controleer authenticatie
        const user = BrasserieBotAuth.checkAuth();
        if (!user) return;
        
        try {
            // Laad initiële data
            await this.loadDashboardData();
            
            // Refresh timer instellen (elke 5 minuten)
            setInterval(() => this.loadDashboardData(), CACHE_REFRESH_TIME);
            
            console.log('DashboardDataController geïnitialiseerd');
        } catch (error) {
            console.error('Fout bij initialiseren dashboard data:', error);
            this.showOfflineData(); // Toon offline data als fallback
        }
    },
    
    // Laad alle dashboardgegevens
    loadDashboardData: async function() {
        console.log('Laden dashboard data...');
        
        try {
            // Parallel data laden voor betere prestaties
            await Promise.all([
                this.loadReservations(),
                this.loadOrders(),
                this.loadMenuItems(),
                this.loadCustomers()
            ]);
            
            // Update UI met nieuwe gegevens
            this.updateDashboardUI();
            
            return true;
        } catch (error) {
            console.error('Fout bij laden dashboard data:', error);
            return false;
        }
    },
    
    // Laad reserveringen
    loadReservations: async function() {
        try {
            // Check of we de API client beschikbaar hebben
            if (window.BrasserieBotAPI && window.BrasserieBotAPI.client) {
                // API aanroepen
                const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
                const response = await window.BrasserieBotAPI.client.get(`${API_CONFIG.endpoints.reservations}?date=${today}`);
                
                // Update cache
                dataCache.reservations = response;
                dataCache.lastFetch.reservations = Date.now();
                return response;
            } else {
                throw new Error('API client niet beschikbaar');
            }
        } catch (error) {
            console.warn('Fout bij laden reserveringen, gebruik demo data:', error);
            // Gebruik demo data als fallback
            if (!dataCache.reservations) {
                dataCache.reservations = this.getDemoReservations();
            }
            return dataCache.reservations;
        }
    },
    
    // Laad bestellingen
    loadOrders: async function() {
        try {
            // Check of we de API client beschikbaar hebben
            if (window.BrasserieBotAPI && window.BrasserieBotAPI.orders) {
                // API aanroepen
                const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
                const response = await window.BrasserieBotAPI.orders.getOrders(null, {date: today});
                
                // Update cache
                dataCache.orders = response;
                dataCache.lastFetch.orders = Date.now();
                return response;
            } else {
                throw new Error('Orders API client niet beschikbaar');
            }
        } catch (error) {
            console.warn('Fout bij laden bestellingen, gebruik demo data:', error);
            // Gebruik demo data als fallback
            if (!dataCache.orders) {
                dataCache.orders = this.getDemoOrders();
            }
            return dataCache.orders;
        }
    },
    
    // Laad menu-items
    loadMenuItems: async function() {
        try {
            // Check of we de API client beschikbaar hebben
            if (window.BrasserieBotAPI && window.BrasserieBotAPI.client) {
                // API aanroepen
                const response = await window.BrasserieBotAPI.client.get(API_CONFIG.endpoints.menu);
                
                // Update cache
                dataCache.menuItems = response;
                dataCache.lastFetch.menuItems = Date.now();
                return response;
            } else {
                throw new Error('API client niet beschikbaar');
            }
        } catch (error) {
            console.warn('Fout bij laden menu items, gebruik demo data:', error);
            // Gebruik demo data als fallback
            if (!dataCache.menuItems) {
                dataCache.menuItems = this.getDemoMenuItems();
            }
            return dataCache.menuItems;
        }
    },
    
    // Laad klanten
    loadCustomers: async function() {
        try {
            // Check of we de API client beschikbaar hebben
            if (window.BrasserieBotAPI && window.BrasserieBotAPI.client) {
                // API aanroepen
                const response = await window.BrasserieBotAPI.client.get(API_CONFIG.endpoints.customers);
                
                // Update cache
                dataCache.customers = response;
                dataCache.lastFetch.customers = Date.now();
                return response;
            } else {
                throw new Error('API client niet beschikbaar');
            }
        } catch (error) {
            console.warn('Fout bij laden klanten, gebruik demo data:', error);
            // Gebruik demo data als fallback
            if (!dataCache.customers) {
                dataCache.customers = this.getDemoCustomers();
            }
            return dataCache.customers;
        }
    },
    
    // Update het dashboard met de geladen gegevens
    updateDashboardUI: function() {
        console.log('Updaten dashboard UI...');
        
        // Update reserveringen teller
        this.updateReservationsCounter();
        
        // Update omzet vandaag
        this.updateRevenueToday();
        
        // Update klantenbezoeken
        this.updateCustomerVisits();
        
        // Update recente activiteiten tabel
        this.updateRecentActivities();
    },
    
    // Update reserveringen teller
    updateReservationsCounter: function() {
        const reservationsCountElement = document.querySelector('.stat-card:nth-child(1) .stat-value');
        if (!reservationsCountElement) return;
        
        // Tel aantal reserveringen voor vandaag
        const reservationsCount = dataCache.reservations ? dataCache.reservations.length : 0;
        reservationsCountElement.textContent = reservationsCount;
        
        // Update vergelijking
        const comparisonElement = document.querySelector('.stat-card:nth-child(1) .stat-change');
        if (comparisonElement) {
            comparisonElement.innerHTML = '<span class="positive">+12%</span> t.o.v. vorige week';
        }
    },
    
    // Update omzet vandaag
    updateRevenueToday: function() {
        const revenueElement = document.querySelector('.stat-card:nth-child(2) .stat-value');
        if (!revenueElement) return;
        
        // Bereken totale omzet van bestellingen
        let totalRevenue = 0;
        if (dataCache.orders && dataCache.orders.length) {
            totalRevenue = dataCache.orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        } else {
            totalRevenue = 1254; // Demo bedrag
        }
        
        // Format als eurobedrag
        revenueElement.textContent = '€' + totalRevenue.toLocaleString('nl-NL', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
        
        // Update vergelijking
        const comparisonElement = document.querySelector('.stat-card:nth-child(2) .stat-change');
        if (comparisonElement) {
            comparisonElement.innerHTML = '<span class="positive">+8%</span> t.o.v. vorige week';
        }
    },
    
    // Update klantenbezoeken
    updateCustomerVisits: function() {
        const customersElement = document.querySelector('.stat-card:nth-child(3) .stat-value');
        if (!customersElement) return;
        
        // Tel aantal klanten (reserveringen * gemiddelde groepsgrootte + losse bestellingen)
        let customerCount = 0;
        if (dataCache.reservations && dataCache.reservations.length) {
            // Tel personen uit reserveringen
            customerCount += dataCache.reservations.reduce((sum, res) => sum + (res.partySize || 0), 0);
        }
        
        // Voeg extra bezoekers toe van bestellingen zonder reservering
        if (dataCache.orders && dataCache.orders.length) {
            // Schatting van 1.5 persoon per bestelling zonder reservering
            const orderCustomers = Math.floor(dataCache.orders.length * 1.5);
            customerCount += orderCustomers;
        }
        
        // Als beide tellingen 0 zijn, gebruik demogetal
        if (customerCount === 0) {
            customerCount = 86; // Demo aantal
        }
        
        customersElement.textContent = customerCount;
        
        // Update vergelijking
        const comparisonElement = document.querySelector('.stat-card:nth-child(3) .stat-change');
        if (comparisonElement) {
            comparisonElement.innerHTML = '<span class="positive">+5%</span> t.o.v. vorige week';
        }
    },
    
    // Update recente activiteiten
    updateRecentActivities: function() {
        const activitiesTable = document.querySelector('#dashboard-content .data-table tbody');
        if (!activitiesTable) return;
        
        // Combineer recente reserveringen en bestellingen
        const activities = [];
        
        // Voeg reserveringen toe
        if (dataCache.reservations && dataCache.reservations.length) {
            dataCache.reservations.forEach(res => {
                activities.push({
                    time: new Date(res.createdAt || new Date()),
                    type: 'reservation',
                    description: `Nieuwe reservering voor ${res.partySize} personen`,
                    status: res.status || 'CONFIRMED'
                });
            });
        }
        
        // Voeg bestellingen toe
        if (dataCache.orders && dataCache.orders.length) {
            dataCache.orders.forEach((order, index) => {
                activities.push({
                    time: new Date(order.createdAt || new Date()),
                    type: 'order',
                    description: `Nieuwe online bestelling #ORD-${1234 + index}`,
                    status: order.status || 'PENDING'
                });
            });
        }
        
        // Sorteer op tijd (nieuwste eerst)
        activities.sort((a, b) => b.time - a.time);
        
        // Beperk tot 5 activiteiten
        const recentActivities = activities.slice(0, 5);
        
        // Als er geen activiteiten zijn, gebruik demogegevens
        if (recentActivities.length === 0) {
            recentActivities.push(
                { time: new Date(Date.now() - 15 * 60000), type: 'order', description: 'Nieuwe online bestelling #ORD-1237', status: 'PENDING' },
                { time: new Date(Date.now() - 30 * 60000), type: 'order', description: 'Nieuwe online bestelling #ORD-1236', status: 'PENDING' },
                { time: new Date(Date.now() - 38 * 60000), type: 'order', description: 'Nieuwe online bestelling #ORD-1235', status: 'PENDING' },
                { time: new Date(Date.now() - 45 * 60000), type: 'order', description: 'Nieuwe online bestelling #ORD-1234', status: 'PENDING' },
                { time: new Date(Date.now() - 90 * 60000), type: 'reservation', description: 'Nieuwe reservering voor 4 personen', status: 'CONFIRMED' }
            );
        }
        
        // Leeg de tabel
        activitiesTable.innerHTML = '';
        
        // Vul de tabel met activiteiten
        recentActivities.forEach(activity => {
            const row = document.createElement('tr');
            
            // Tijd formatteren (HH:MM)
            const timeFormatted = activity.time.toLocaleTimeString('nl-NL', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
            
            // Status bepalen
            let statusClass = 'badge-info';
            let statusText = 'Nieuw';
            
            if (activity.status === 'CONFIRMED') {
                statusClass = 'badge-success';
                statusText = 'Bevestigd';
            } else if (activity.status === 'CANCELLED') {
                statusClass = 'badge-danger';
                statusText = 'Geannuleerd';
            } else if (activity.status === 'COMPLETED') {
                statusClass = 'badge-success';
                statusText = 'Voltooid';
            }
            
            row.innerHTML = `
                <td>${timeFormatted}</td>
                <td>${activity.description}</td>
                <td><span class="badge ${statusClass}">${statusText}</span></td>
            `;
            
            activitiesTable.appendChild(row);
        });
    },
    
    // Toon offline demo data
    showOfflineData: function() {
        console.log('Tonen offline demo data...');
        
        // Gebruik demo data voor alle componenten
        dataCache.reservations = this.getDemoReservations();
        dataCache.orders = this.getDemoOrders();
        dataCache.menuItems = this.getDemoMenuItems();
        dataCache.customers = this.getDemoCustomers();
        
        // Update UI met demo data
        this.updateDashboardUI();
    },
    
    // Demo data generatoren
    getDemoReservations: function() {
        return [
            { id: 1, partySize: 4, customerName: 'Janssens', status: 'CONFIRMED', createdAt: new Date(Date.now() - 30 * 60000) },
            { id: 2, partySize: 2, customerName: 'Peeters', status: 'CONFIRMED', createdAt: new Date(Date.now() - 60 * 60000) },
            { id: 3, partySize: 6, customerName: 'Maes', status: 'CONFIRMED', createdAt: new Date(Date.now() - 90 * 60000) },
            { id: 4, partySize: 3, customerName: 'Willems', status: 'PENDING', createdAt: new Date(Date.now() - 120 * 60000) }
        ];
    },
    
    getDemoOrders: function() {
        return [
            { id: 1, totalAmount: 354, status: 'PENDING', createdAt: new Date(Date.now() - 15 * 60000) },
            { id: 2, totalAmount: 210, status: 'PENDING', createdAt: new Date(Date.now() - 30 * 60000) },
            { id: 3, totalAmount: 175, status: 'PENDING', createdAt: new Date(Date.now() - 38 * 60000) },
            { id: 4, totalAmount: 245, status: 'PENDING', createdAt: new Date(Date.now() - 45 * 60000) },
            { id: 5, totalAmount: 270, status: 'COMPLETED', createdAt: new Date(Date.now() - 120 * 60000) }
        ];
    },
    
    getDemoMenuItems: function() {
        return [
            { id: 1, name: 'Carpaccio', price: 14.5, description: 'Rundscarpaccio met parmezaan' },
            { id: 2, name: 'Pasta Bolognese', price: 16, description: 'Huisgemaakte pastasaus' },
            { id: 3, name: 'Tiramisu', price: 8, description: 'Italiaans dessert' },
            { id: 4, name: 'Steak', price: 24, description: 'Gegrild met seizoensgroenten' }
        ];
    },
    
    getDemoCustomers: function() {
        return [
            { id: 1, name: 'Jan Janssens', email: 'jan.janssens@example.com', visits: 5 },
            { id: 2, name: 'Petra Peeters', email: 'petra@example.com', visits: 3 },
            { id: 3, name: 'Marc Maes', email: 'marc@example.com', visits: 8 },
            { id: 4, name: 'Wendy Willems', email: 'wendy@example.com', visits: 2 }
        ];
    }
};

// Initialiseer het dashboard wanneer de pagina geladen is
document.addEventListener('DOMContentLoaded', () => {
    // Controleer authenticatie met auth module
    if (window.BrasserieBotAuth) {
        const user = window.BrasserieBotAuth.checkAuth();
        if (user) {
            // Start dashboard data controller
            DashboardDataController.init();
        }
    } else {
        console.error('Auth module niet geladen!');
    }
});