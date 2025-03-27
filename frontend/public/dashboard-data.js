/**
 * BrasserieBot Dashboard Data Controller
 * Verantwoordelijk voor het beheren van alle data die getoond wordt in het dashboard
 * Handelt API calls, foutafhandeling en gebruikersinteractie
 */

const DashboardDataController = (function() {
    // Configuratie
    const USE_API = true; // Als false, dan alleen demo data gebruiken
    const ENABLE_LOGGING = true;
    const AUTO_REFRESH = true;
    const REFRESH_INTERVAL = 60000; // Ververs elke minuut

    // Private variabelen
    let _initialized = false;
    let _currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD formaat
    let _refreshTimer = null;
    
    // Datasets
    let _reservations = [];
    let _menu = [];
    let _customers = [];
    let _orders = [];
    
    // DOM elementen
    let _elements = {
        // Dashboard stats
        reservationCount: null,
        revenueToday: null,
        customerCount: null,
        lowStockCount: null,
        
        // Reservaties
        reservationList: null,
        reservationForm: null,
        
        // Menu
        menuList: null,
        menuForm: null,
        
        // Klanten
        customerList: null,
        customerDetails: null,
        
        // Bestellingen
        orderList: null,
        orderDetails: null
    };
    
    // Logger functie
    const log = (type, message, data = null) => {
        if (!ENABLE_LOGGING) return;
        
        const prefix = 'DashboardDataController';
        switch(type) {
            case 'error':
                console.error(`${prefix}: ${message}`, data);
                break;
            case 'warn':
                console.warn(`${prefix}: ${message}`, data);
                break;
            case 'info':
            default:
                console.log(`${prefix}: ${message}`, data);
        }
    };
    
    // Helpers
    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('nl-BE', options);
    };
    
    const formatTime = (timeString) => {
        const options = { hour: '2-digit', minute: '2-digit' };
        if (timeString.includes('T')) {
            // ISO datumstring
            return new Date(timeString).toLocaleTimeString('nl-BE', options);
        } else {
            // Alleen tijd (bijv. "18:30")
            const dummyDate = new Date();
            const [hours, minutes] = timeString.split(':');
            dummyDate.setHours(hours);
            dummyDate.setMinutes(minutes);
            return dummyDate.toLocaleTimeString('nl-BE', options);
        }
    };
    
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(amount);
    };
    
    // Initialiseer elementen en event listeners
    const initElements = () => {
        // Vind dashboard stats elementen
        _elements.reservationCount = document.querySelector('.stat-card:nth-child(1) .stat-value');
        _elements.revenueToday = document.querySelector('.stat-card:nth-child(2) .stat-value');
        _elements.customerCount = document.querySelector('.stat-card:nth-child(3) .stat-value');
        _elements.lowStockCount = document.querySelector('.stat-card:nth-child(4) .stat-value');
        
        // Vind reservaties elementen
        _elements.reservationList = document.getElementById('reservation-list');
        _elements.reservationForm = document.getElementById('reservation-form');
        
        // Vind menu elementen
        _elements.menuList = document.getElementById('menu-list');
        _elements.menuForm = document.getElementById('menu-form');
        
        // Vind klanten elementen
        _elements.customerList = document.getElementById('customer-list');
        _elements.customerDetails = document.getElementById('customer-details');
        
        // Vind bestellingen elementen
        _elements.orderList = document.getElementById('order-list');
        _elements.orderDetails = document.getElementById('order-details');
        
        // Initialiseer datepickers voor reservaties
        const datePickers = document.querySelectorAll('.date-picker');
        if (datePickers.length > 0) {
            datePickers.forEach(picker => {
                picker.valueAsDate = new Date();
                picker.addEventListener('change', function() {
                    _currentDate = this.value;
                    loadDashboardData();
                });
            });
        }
    };
    
    // Data laad functies
    const loadDashboardData = async () => {
        log('info', 'Laden dashboard data...');
        
        try {
            // Laad reservaties voor vandaag
            if (USE_API && window.BrasserieBotAPI) {
                _reservations = await BrasserieBotAPI.reservations.getAll(_currentDate);
                _menu = await BrasserieBotAPI.menu.getAll();
                _customers = await BrasserieBotAPI.customers.getAll();
                _orders = await BrasserieBotAPI.orders.getAll(_currentDate);
            } else {
                // Fallback naar demo data
                log('info', 'API niet beschikbaar, gebruik demo data');
                
                // Genereer demo data
                _reservations = [
                    { id: 1, name: 'Jan Janssen', guests: 4, time: '18:00', date: _currentDate, phone: '+32 478 123456', status: 'confirmed', notes: 'Tafel bij het raam gewenst' },
                    { id: 2, name: 'Marie Peeters', guests: 2, time: '19:00', date: _currentDate, phone: '+32 495 654321', status: 'confirmed', notes: 'Vegetarische opties gewenst' },
                    { id: 3, name: 'Alex De Vries', guests: 6, time: '20:30', date: _currentDate, phone: '+32 470 987654', status: 'pending', notes: 'Verjaardag' },
                    { id: 4, name: 'Sophie Maes', guests: 3, time: '19:30', date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0], phone: '+32 498 567890', status: 'confirmed', notes: '' },
                    { id: 5, name: 'Thomas Lambert', guests: 2, time: '20:00', date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0], phone: '+32 474 345678', status: 'confirmed', notes: 'Allergie voor noten' }
                ];
                
                _menu = [
                    { id: 1, name: 'Stoofvlees met frieten', category: 'Hoofdgerecht', price: 18.50, description: 'Traditioneel Belgisch stoofvlees met frietjes en salade', available: true, popular: true, image: 'https://via.placeholder.com/150' },
                    { id: 2, name: 'Vol-au-vent', category: 'Hoofdgerecht', price: 19.50, description: 'Klassieker met kip, champignons en een romige saus', available: true, popular: true, image: 'https://via.placeholder.com/150' },
                    { id: 3, name: 'Tomatensoep', category: 'Voorgerecht', price: 7.50, description: 'Huisgemaakte tomatensoep met balletjes', available: true, popular: false, image: 'https://via.placeholder.com/150' },
                    { id: 4, name: 'Dame Blanche', category: 'Dessert', price: 8.50, description: 'Vanille-ijs met warme chocoladesaus', available: true, popular: true, image: 'https://via.placeholder.com/150' },
                    { id: 5, name: 'Spaghetti Bolognese', category: 'Hoofdgerecht', price: 16.50, description: 'Huisgemaakte pasta met klassieke Bolognesesaus', available: true, popular: false, image: 'https://via.placeholder.com/150' },
                    { id: 6, name: 'Crème Brûlée', category: 'Dessert', price: 9.00, description: 'Klassieke Franse crème brûlée', available: true, popular: false, image: 'https://via.placeholder.com/150' },
                    { id: 7, name: 'Garnaalkroketten', category: 'Voorgerecht', price: 14.50, description: 'Kroketten gevuld met Noordzeegarnalen', available: true, popular: true, image: 'https://via.placeholder.com/150' },
                    { id: 8, name: 'Steak Béarnaise', category: 'Hoofdgerecht', price: 24.50, description: 'Belgische rundersteak met béarnaisesaus en frietjes', available: true, popular: true, image: 'https://via.placeholder.com/150' }
                ];
                
                _customers = [
                    { id: 1, name: 'Jan Janssen', email: 'jan.janssen@email.com', phone: '+32 478 123456', visits: 8, lastVisit: '2025-03-20', preferences: 'Tafel bij het raam' },
                    { id: 2, name: 'Marie Peeters', email: 'marie.peeters@email.com', phone: '+32 495 654321', visits: 5, lastVisit: '2025-03-18', preferences: 'Vegetarisch' },
                    { id: 3, name: 'Alex De Vries', email: 'alex.devries@email.com', phone: '+32 470 987654', visits: 3, lastVisit: '2025-03-15', preferences: 'Allergisch voor lactose' },
                    { id: 4, name: 'Sophie Maes', email: 'sophie.maes@email.com', phone: '+32 498 567890', visits: 12, lastVisit: '2025-03-25', preferences: 'VIP klant' },
                    { id: 5, name: 'Thomas Lambert', email: 'thomas.lambert@email.com', phone: '+32 474 345678', visits: 1, lastVisit: '2025-03-24', preferences: 'Allergie voor noten' }
                ];
                
                _orders = [
                    { id: 1, tableNumber: 5, customerName: 'Jan Janssen', items: [{ id: 1, name: 'Stoofvlees met frieten', quantity: 2, price: 18.50 }, { id: 4, name: 'Dame Blanche', quantity: 2, price: 8.50 }], total: 54.00, status: 'served', timestamp: `${_currentDate}T13:45:00`, paymentMethod: 'card' },
                    { id: 2, tableNumber: 3, customerName: 'Marie Peeters', items: [{ id: 3, name: 'Tomatensoep', quantity: 2, price: 7.50 }, { id: 5, name: 'Spaghetti Bolognese', quantity: 2, price: 16.50 }], total: 48.00, status: 'preparing', timestamp: `${_currentDate}T14:15:00`, paymentMethod: 'pending' },
                    { id: 3, tableNumber: 8, customerName: 'Alex De Vries', items: [{ id: 7, name: 'Garnaalkroketten', quantity: 2, price: 14.50 }, { id: 8, name: 'Steak Béarnaise', quantity: 2, price: 24.50 }, { id: 4, name: 'Dame Blanche', quantity: 2, price: 8.50 }], total: 95.00, status: 'ordered', timestamp: `${_currentDate}T14:30:00`, paymentMethod: 'pending' }
                ];
            }
            
            // Update UI
            updateDashboardUI();
            
            // Stel auto-refresh in als nodig
            if (AUTO_REFRESH && !_refreshTimer) {
                _refreshTimer = setInterval(loadDashboardData, REFRESH_INTERVAL);
            }
        } catch (error) {
            log('error', 'Fout bij het laden van dashboard data', error);
        }
    };
    
    // UI update functies
    const updateDashboardUI = () => {
        log('info', 'Updaten dashboard UI...');
        
        // Update dashboard statistieken
        if (_elements.reservationCount) {
            const todayReservations = _reservations.filter(r => r.date === _currentDate).length;
            _elements.reservationCount.textContent = todayReservations;
        }
        
        if (_elements.revenueToday) {
            const todayRevenue = _orders
                .filter(o => o.timestamp.includes(_currentDate) && o.status !== 'cancelled')
                .reduce((sum, order) => sum + order.total, 0);
            _elements.revenueToday.textContent = formatCurrency(todayRevenue);
        }
        
        if (_elements.customerCount) {
            // Tel het aantal unieke klanten (bij bestellingen) of neem het totaal aantal gasten voor reserveringen
            const customerCount = _reservations
                .filter(r => r.date === _currentDate && r.status !== 'cancelled')
                .reduce((sum, res) => sum + res.guests, 0);
            _elements.customerCount.textContent = customerCount;
        }
        
        if (_elements.lowStockCount) {
            // Simuleer voorraadprobleem met een willekeurig aantal items
            const lowStockCount = Math.floor(Math.random() * 10) + 1;
            _elements.lowStockCount.textContent = lowStockCount;
        }
        
        // Update reservatie lijst (indien zichtbaar)
        updateReservationList();
        
        // Update menu lijst (indien zichtbaar)
        updateMenuList();
        
        // Update klanten lijst (indien zichtbaar)
        updateCustomerList();
        
        // Update bestellingen lijst (indien zichtbaar)
        updateOrderList();
    };
    
    // Specifieke updates per sectie
    const updateReservationList = () => {
        const reservationList = document.getElementById('reservation-list');
        if (!reservationList) return;
        
        // Alleen huidige datum reserveringen tonen
        const filteredReservations = _reservations.filter(r => r.date === _currentDate);
        
        if (filteredReservations.length === 0) {
            reservationList.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="calendar"></i>
                    <h3>Geen reserveringen</h3>
                    <p>Er zijn geen reserveringen gevonden voor deze datum</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }
        
        // Sorteer op tijd
        filteredReservations.sort((a, b) => a.time.localeCompare(b.time));
        
        // Maak HTML voor elke reservering
        let html = '';
        
        filteredReservations.forEach(res => {
            const statusClass = res.status === 'confirmed' ? 'status-confirmed' : 
                              res.status === 'pending' ? 'status-pending' : 
                              res.status === 'cancelled' ? 'status-cancelled' : '';
            
            html += `
                <div class="reservation-item" data-id="${res.id}">
                    <div class="reservation-header">
                        <div class="reservation-time">${formatTime(res.time)}</div>
                        <div class="reservation-status ${statusClass}">${res.status}</div>
                    </div>
                    <div class="reservation-details">
                        <h3 class="reservation-name">${res.name}</h3>
                        <div class="reservation-info">
                            <span class="reservation-guests"><i data-lucide="users"></i> ${res.guests} gasten</span>
                            <span class="reservation-phone"><i data-lucide="phone"></i> ${res.phone}</span>
                        </div>
                        ${res.notes ? `<p class="reservation-notes">${res.notes}</p>` : ''}
                    </div>
                    <div class="reservation-actions">
                        <button class="icon-btn" data-action="edit" title="Bewerk reservering"><i data-lucide="edit"></i></button>
                        <button class="icon-btn" data-action="cancel" title="Annuleer reservering"><i data-lucide="x"></i></button>
                    </div>
                </div>
            `;
        });
        
        reservationList.innerHTML = html;
        
        // Initialiseer iconen
        lucide.createIcons();
        
        // Voeg event listeners toe
        const editButtons = reservationList.querySelectorAll('[data-action="edit"]');
        const cancelButtons = reservationList.querySelectorAll('[data-action="cancel"]');
        
        editButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const resItem = this.closest('.reservation-item');
                const resId = parseInt(resItem.dataset.id);
                editReservation(resId);
            });
        });
        
        cancelButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const resItem = this.closest('.reservation-item');
                const resId = parseInt(resItem.dataset.id);
                cancelReservation(resId);
            });
        });
    };
    
    const updateMenuList = () => {
        const menuList = document.getElementById('menu-list');
        if (!menuList) return;
        
        if (_menu.length === 0) {
            menuList.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="utensils"></i>
                    <h3>Geen menu items</h3>
                    <p>Er zijn geen menu items gevonden</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }
        
        // Sorteer op categorie en dan op naam
        _menu.sort((a, b) => {
            if (a.category === b.category) {
                return a.name.localeCompare(b.name);
            }
            return a.category.localeCompare(b.category);
        });
        
        // Maak HTML voor elk menu item
        let html = '';
        let currentCategory = '';
        
        _menu.forEach(item => {
            // Als we een nieuwe categorie tegenkomen, toon een header
            if (item.category !== currentCategory) {
                currentCategory = item.category;
                html += `<h3 class="menu-category">${currentCategory}</h3>`;
            }
            
            html += `
                <div class="menu-item" data-id="${item.id}">
                    <div class="menu-item-image">
                        <img src="${item.image}" alt="${item.name}">
                        ${item.popular ? '<span class="popular-badge">Populair</span>' : ''}
                    </div>
                    <div class="menu-item-details">
                        <h4 class="menu-item-name">${item.name}</h4>
                        <p class="menu-item-description">${item.description}</p>
                        <div class="menu-item-footer">
                            <span class="menu-item-price">${formatCurrency(item.price)}</span>
                            <span class="menu-item-status ${item.available ? 'available' : 'unavailable'}">
                                ${item.available ? 'Beschikbaar' : 'Niet beschikbaar'}
                            </span>
                        </div>
                    </div>
                    <div class="menu-item-actions">
                        <button class="icon-btn" data-action="edit" title="Bewerk menu item"><i data-lucide="edit"></i></button>
                        <button class="icon-btn" data-action="toggle" title="${item.available ? 'Markeer als niet beschikbaar' : 'Markeer als beschikbaar'}">
                            <i data-lucide="${item.available ? 'eye-off' : 'eye'}"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        menuList.innerHTML = html;
        
        // Initialiseer iconen
        lucide.createIcons();
        
        // Voeg event listeners toe
        const editButtons = menuList.querySelectorAll('[data-action="edit"]');
        const toggleButtons = menuList.querySelectorAll('[data-action="toggle"]');
        
        editButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const menuItem = this.closest('.menu-item');
                const itemId = parseInt(menuItem.dataset.id);
                editMenuItem(itemId);
            });
        });
        
        toggleButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const menuItem = this.closest('.menu-item');
                const itemId = parseInt(menuItem.dataset.id);
                toggleMenuItemAvailability(itemId);
            });
        });
    };
    
    const updateCustomerList = () => {
        const customerList = document.getElementById('customer-list');
        if (!customerList) return;
        
        if (_customers.length === 0) {
            customerList.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="users"></i>
                    <h3>Geen klanten</h3>
                    <p>Er zijn geen klanten gevonden</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }
        
        // Sorteer op naam
        _customers.sort((a, b) => a.name.localeCompare(b.name));
        
        // Maak HTML voor elke klant
        let html = '';
        
        _customers.forEach(customer => {
            html += `
                <div class="customer-item" data-id="${customer.id}">
                    <div class="customer-avatar">
                        ${customer.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div class="customer-details">
                        <h3 class="customer-name">${customer.name}</h3>
                        <div class="customer-info">
                            <span class="customer-contact"><i data-lucide="mail"></i> ${customer.email}</span>
                            <span class="customer-contact"><i data-lucide="phone"></i> ${customer.phone}</span>
                        </div>
                        <div class="customer-stats">
                            <span class="customer-visits"><i data-lucide="calendar"></i> ${customer.visits} bezoeken</span>
                            <span class="customer-last-visit"><i data-lucide="clock"></i> Laatste: ${formatDate(customer.lastVisit)}</span>
                        </div>
                    </div>
                    <div class="customer-actions">
                        <button class="icon-btn" data-action="view" title="Bekijk klantdetails"><i data-lucide="eye"></i></button>
                        <button class="icon-btn" data-action="edit" title="Bewerk klantgegevens"><i data-lucide="edit"></i></button>
                    </div>
                </div>
            `;
        });
        
        customerList.innerHTML = html;
        
        // Initialiseer iconen
        lucide.createIcons();
        
        // Voeg event listeners toe
        const viewButtons = customerList.querySelectorAll('[data-action="view"]');
        const editButtons = customerList.querySelectorAll('[data-action="edit"]');
        
        viewButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const customerItem = this.closest('.customer-item');
                const customerId = parseInt(customerItem.dataset.id);
                viewCustomerDetails(customerId);
            });
        });
        
        editButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const customerItem = this.closest('.customer-item');
                const customerId = parseInt(customerItem.dataset.id);
                editCustomer(customerId);
            });
        });
    };
    
    const updateOrderList = () => {
        const orderList = document.getElementById('order-list');
        if (!orderList) return;
        
        // Alleen huidige datum orders tonen
        const filteredOrders = _orders.filter(o => o.timestamp.includes(_currentDate));
        
        if (filteredOrders.length === 0) {
            orderList.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="shopping-bag"></i>
                    <h3>Geen bestellingen</h3>
                    <p>Er zijn geen bestellingen gevonden voor deze datum</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }
        
        // Sorteer op timestamp (meest recent bovenaan)
        filteredOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Maak HTML voor elke bestelling
        let html = '';
        
        filteredOrders.forEach(order => {
            const statusClass = order.status === 'served' ? 'status-completed' : 
                             order.status === 'preparing' ? 'status-in-progress' : 
                             order.status === 'ordered' ? 'status-pending' : 
                             order.status === 'cancelled' ? 'status-cancelled' : '';
            
            html += `
                <div class="order-item" data-id="${order.id}">
                    <div class="order-header">
                        <div class="order-time">${formatTime(order.timestamp)}</div>
                        <div class="order-status ${statusClass}">${order.status}</div>
                    </div>
                    <div class="order-details">
                        <div class="order-customer">
                            <span class="order-table"><i data-lucide="coffee"></i> Tafel ${order.tableNumber}</span>
                            <h3 class="order-name">${order.customerName}</h3>
                        </div>
                        <div class="order-summary">
                            <span class="order-items-count"><i data-lucide="package"></i> ${order.items.reduce((sum, item) => sum + item.quantity, 0)} items</span>
                            <span class="order-total"><i data-lucide="credit-card"></i> ${formatCurrency(order.total)}</span>
                        </div>
                    </div>
                    <div class="order-actions">
                        <button class="icon-btn" data-action="view" title="Bekijk bestelling"><i data-lucide="eye"></i></button>
                        <button class="icon-btn" data-action="status" title="Wijzig status"><i data-lucide="refresh-cw"></i></button>
                    </div>
                </div>
            `;
        });
        
        orderList.innerHTML = html;
        
        // Initialiseer iconen
        lucide.createIcons();
        
        // Voeg event listeners toe
        const viewButtons = orderList.querySelectorAll('[data-action="view"]');
        const statusButtons = orderList.querySelectorAll('[data-action="status"]');
        
        viewButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const orderItem = this.closest('.order-item');
                const orderId = parseInt(orderItem.dataset.id);
                viewOrderDetails(orderId);
            });
        });
        
        statusButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const orderItem = this.closest('.order-item');
                const orderId = parseInt(orderItem.dataset.id);
                changeOrderStatus(orderId);
            });
        });
    };
    
    // CRUD operaties
    // Reserveringen
    const editReservation = (id) => {
        const reservation = _reservations.find(r => r.id === id);
        if (!reservation) return;
        
        // In een echte applicatie: toon modal of navigeer naar bewerkingsformulier
        // Voor nu: log alleen informatie
        log('info', `Bewerken reservering: ${id}`, reservation);
        alert(`Reservering bewerken: ${reservation.name} (${reservation.time})`);
    };
    
    const cancelReservation = (id) => {
        const reservation = _reservations.find(r => r.id === id);
        if (!reservation) return;
        
        // In een echte applicatie: bevestiging vragen en API call
        const confirmed = confirm(`Weet u zeker dat u de reservering van ${reservation.name} wilt annuleren?`);
        
        if (confirmed) {
            // Update lokale staat (in een echte applicatie zou dit een API call zijn)
            reservation.status = 'cancelled';
            
            // Update UI
            updateReservationList();
            
            log('info', `Geannuleerde reservering: ${id}`, reservation);
        }
    };
    
    // Menu items
    const editMenuItem = (id) => {
        const menuItem = _menu.find(m => m.id === id);
        if (!menuItem) return;
        
        // In een echte applicatie: toon modal of navigeer naar bewerkingsformulier
        log('info', `Bewerken menu item: ${id}`, menuItem);
        alert(`Menu item bewerken: ${menuItem.name} (${formatCurrency(menuItem.price)})`);
    };
    
    const toggleMenuItemAvailability = (id) => {
        const menuItem = _menu.find(m => m.id === id);
        if (!menuItem) return;
        
        // Toggle beschikbaarheid
        menuItem.available = !menuItem.available;
        
        // Update UI
        updateMenuList();
        
        log('info', `Beschikbaarheid gewijzigd voor menu item: ${id}`, menuItem);
    };
    
    // Klanten
    const viewCustomerDetails = (id) => {
        const customer = _customers.find(c => c.id === id);
        if (!customer) return;
        
        // In een echte applicatie: navigeer naar detail pagina of toon modal
        log('info', `Bekijk klantdetails: ${id}`, customer);
        alert(`Klantdetails: ${customer.name}\nE-mail: ${customer.email}\nTelefoon: ${customer.phone}\nBezoeken: ${customer.visits}\nVoorkeuren: ${customer.preferences}`);
    };
    
    const editCustomer = (id) => {
        const customer = _customers.find(c => c.id === id);
        if (!customer) return;
        
        // In een echte applicatie: toon modal of navigeer naar bewerkingsformulier
        log('info', `Bewerken klant: ${id}`, customer);
        alert(`Klant bewerken: ${customer.name}`);
    };
    
    // Bestellingen
    const viewOrderDetails = (id) => {
        const order = _orders.find(o => o.id === id);
        if (!order) return;
        
        // In een echte applicatie: navigeer naar detail pagina of toon modal
        log('info', `Bekijk besteldetails: ${id}`, order);
        
        let itemsList = 'Bestelde items:\n';
        order.items.forEach(item => {
            itemsList += `- ${item.quantity}x ${item.name} (${formatCurrency(item.price * item.quantity)})\n`;
        });
        
        alert(`Bestelling: Tafel ${order.tableNumber}\nKlant: ${order.customerName}\nTijd: ${formatTime(order.timestamp)}\nStatus: ${order.status}\n\n${itemsList}\nTotaal: ${formatCurrency(order.total)}`);
    };
    
    const changeOrderStatus = (id) => {
        const order = _orders.find(o => o.id === id);
        if (!order) return;
        
        // In een echte applicatie: toon dropdown of opties
        // Voor nu: cyclisch door statussen
        const statuses = ['ordered', 'preparing', 'served', 'cancelled'];
        const currentIndex = statuses.indexOf(order.status);
        const nextIndex = (currentIndex + 1) % statuses.length;
        
        order.status = statuses[nextIndex];
        
        // Update UI
        updateOrderList();
        
        log('info', `Status gewijzigd voor bestelling: ${id}`, order);
    };
    
    // Publieke API
    return {
        init: function() {
            if (_initialized) return;
            
            log('info', 'Initialiseren DashboardDataController...');
            
            // Haal gebruikersgegevens op
            const userJson = localStorage.getItem('brasseriebot_user');
            if (userJson) {
                // Gebruiker is ingelogd, controleer sessieduur
                const authTime = localStorage.getItem('brasseriebot_auth_time');
                if (authTime && (Date.now() - parseInt(authTime)) < 24 * 60 * 60 * 1000) {
                    // Sessie is geldig
                } else {
                    // Sessie verlopen, stuur door naar login
                    window.location.href = 'login.html';
                    return;
                }
            } else {
                // Geen gebruiker gevonden, stuur door naar login
                window.location.href = 'login.html';
                return;
            }
            
            // Initialiseer DOM elementen en event listeners
            initElements();
            
            // Laad initiële data
            loadDashboardData();
            
            _initialized = true;
        },
        
        // Helper om een andere pagina te tonen
        showPage: function(pageId) {
            window.showPage(pageId); // Ga ervan uit dat er een globale showPage functie is
            
            // Update de juiste sectie van het dashboard
            setTimeout(() => {
                switch(pageId) {
                    case 'reservations':
                        updateReservationList();
                        break;
                    case 'menu':
                        updateMenuList();
                        break;
                    case 'customers':
                        updateCustomerList();
                        break;
                    case 'orders':
                        updateOrderList();
                        break;
                }
            }, 100);
        },
        
        // API toegang voor debugging
        getReservations: () => _reservations,
        getMenu: () => _menu,
        getCustomers: () => _customers,
        getOrders: () => _orders,
        
        // Datum selector
        setDate: function(date) {
            _currentDate = date;
            loadDashboardData();
        },
        
        getCurrentDate: () => _currentDate,
        
        // Handmatige refresh
        refresh: loadDashboardData
    };
})();

// Initialiseer controller wanneer het document geladen is
document.addEventListener('DOMContentLoaded', function() {
    DashboardDataController.init();
});