// API client voor BrasserieBot
// Verbindt de frontend met de NestJS backend

// Configuratie
const API_CONFIG = {
    baseUrl: 'https://brasserie-bot-api.onrender.com', // API endpoint (kan aangepast worden per omgeving)
    endpoints: {
        auth: {
            login: '/auth/login',
            register: '/auth/register',
            profile: '/auth/profile'
        },
        reservations: '/reservations',
        menu: '/menu',
        orders: '/orders',
        customers: '/customers',
        restaurants: '/restaurants'
    },
    defaultHeaders: {
        'Content-Type': 'application/json'
    }
};

// API Client Class
class ApiClient {
    constructor(config) {
        this.config = config;
        this.token = localStorage.getItem('brasseriebot_token') || null;
    }

    // Privé methode voor het maken van de headers
    _getHeaders(customHeaders = {}) {
        const headers = { ...this.config.defaultHeaders, ...customHeaders };
        
        // Voeg de authorization token toe als beschikbaar
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // Privé methode om de volledige URL te bouwen
    _buildUrl(endpoint) {
        return `${this.config.baseUrl}${endpoint}`;
    }

    // Generieke request methode
    async _request(endpoint, method = 'GET', data = null, customHeaders = {}) {
        const url = this._buildUrl(endpoint);
        const headers = this._getHeaders(customHeaders);
        
        const options = {
            method,
            headers,
            credentials: 'include', // Voor cookies indien nodig
            mode: 'cors' // CORS ondersteuning
        };
        
        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            options.body = JSON.stringify(data);
        }
        
        try {
            const response = await fetch(url, options);
            
            // Check voor server errors
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Server error: ${response.status}`);
            }
            
            // Parse het antwoord als JSON als er content is
            if (response.status !== 204) { // 204 betekent No Content
                return await response.json();
            }
            
            return null; // Geen content
            
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('brasseriebot_token', token);
        } else {
            localStorage.removeItem('brasseriebot_token');
        }
    }

    // CRUD operaties
    async get(endpoint, customHeaders = {}) {
        return this._request(endpoint, 'GET', null, customHeaders);
    }
    
    async post(endpoint, data, customHeaders = {}) {
        return this._request(endpoint, 'POST', data, customHeaders);
    }
    
    async put(endpoint, data, customHeaders = {}) {
        return this._request(endpoint, 'PUT', data, customHeaders);
    }
    
    async patch(endpoint, data, customHeaders = {}) {
        return this._request(endpoint, 'PATCH', data, customHeaders);
    }
    
    async delete(endpoint, customHeaders = {}) {
        return this._request(endpoint, 'DELETE', null, customHeaders);
    }
}

// Gespecialiseerde Auth API Client
class AuthApiClient extends ApiClient {
    constructor(config) {
        super(config);
    }
    
    // Login methode
    async login(email, password) {
        try {
            const response = await this.post(this.config.endpoints.auth.login, { email, password });
            
            if (response && response.access_token) {
                this.setToken(response.access_token);
                return response.user;
            }
            
            throw new Error('Login mislukt: token ontbreekt in response');
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }
    
    // Registratie methode
    async register(userData) {
        return this.post(this.config.endpoints.auth.register, userData);
    }
    
    // Haal gebruikersprofiel op
    async getProfile() {
        return this.get(this.config.endpoints.auth.profile);
    }
    
    // Logout methode
    logout() {
        this.setToken(null);
        // Verwijder alle gebruikersgegevens
        localStorage.removeItem('brasseriebot_user');
        localStorage.removeItem('brasseriebot_auth_time');
    }
    
    // Check of de gebruiker is ingelogd
    isAuthenticated() {
        return !!this.token;
    }
}

// Gespecialiseerde Reservations API Client
class ReservationsApiClient extends ApiClient {
    constructor(config) {
        super(config);
    }
    
    // Haal alle reserveringen op
    async getReservations(restaurantId, queryParams = {}) {
        const queryString = new URLSearchParams(queryParams).toString();
        const endpoint = `${this.config.endpoints.reservations}${restaurantId ? `/${restaurantId}` : ''}${queryString ? `?${queryString}` : ''}`;
        return this.get(endpoint);
    }
    
    // Haal een specifieke reservering op
    async getReservation(id) {
        return this.get(`${this.config.endpoints.reservations}/${id}`);
    }
    
    // Maak een nieuwe reservering
    async createReservation(reservationData) {
        return this.post(this.config.endpoints.reservations, reservationData);
    }
    
    // Update een reservering
    async updateReservation(id, reservationData) {
        return this.put(`${this.config.endpoints.reservations}/${id}`, reservationData);
    }
    
    // Wijzig reserveringsstatus
    async updateReservationStatus(id, status) {
        return this.patch(`${this.config.endpoints.reservations}/${id}/status`, { status });
    }
    
    // Verwijder een reservering
    async deleteReservation(id) {
        return this.delete(`${this.config.endpoints.reservations}/${id}`);
    }
}

// Gespecialiseerde Orders API Client
class OrdersApiClient extends ApiClient {
    constructor(config) {
        super(config);
    }
    
    // Haal bestellingen op
    async getOrders(restaurantId, queryParams = {}) {
        const queryString = new URLSearchParams(queryParams).toString();
        const endpoint = `${this.config.endpoints.orders}${restaurantId ? `/${restaurantId}` : ''}${queryString ? `?${queryString}` : ''}`;
        return this.get(endpoint);
    }
    
    // Haal een specifieke bestelling op
    async getOrder(id) {
        return this.get(`${this.config.endpoints.orders}/${id}`);
    }
    
    // Maak een nieuwe bestelling
    async createOrder(orderData) {
        return this.post(this.config.endpoints.orders, orderData);
    }
    
    // Update een bestelling
    async updateOrder(id, orderData) {
        return this.put(`${this.config.endpoints.orders}/${id}`, orderData);
    }
    
    // Wijzig bestellingsstatus
    async updateOrderStatus(id, status) {
        return this.patch(`${this.config.endpoints.orders}/${id}/status`, { status });
    }
}

// BrasserieBot API Repository (client instanties voor gebruik)
const BrasserieBotAPI = {
    auth: new AuthApiClient(API_CONFIG),
    reservations: new ReservationsApiClient(API_CONFIG),
    orders: new OrdersApiClient(API_CONFIG),
    
    // Basis API client voor andere endpoints
    client: new ApiClient(API_CONFIG)
};

// Exporteer de API voor gebruik in andere bestanden
window.BrasserieBotAPI = BrasserieBotAPI;