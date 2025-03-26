/**
 * BrasserieBot Fallback Script
 * 
 * Dit script zorgt ervoor dat de website blijft werken, zelfs als er andere scripts niet geladen worden.
 * Het bevat basisfunctionaliteit voor navigatie en auth, en verzekert dat gebruikers niet vast komen te zitten.
 */

// Onmiddellijk uitvoeren om te verzekeren dat de functies beschikbaar zijn
(function() {
    console.log('BrasserieBot Fallback script geladen');
    
    // Controleer of de auth module aanwezig is, zo niet, maak een minimale versie
    if (!window.BrasserieBotAuth) {
        console.log('Fallback: Auth module niet gevonden, fallback versie wordt gebruikt');
        
        // Minimale authenticatie functionaliteit
        window.BrasserieBotAuth = {
            // Lokale gebruikers data voor authenticatie
            userDatabase: {
                "admin": {
                    passwordHash: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9", // admin123
                    role: "admin",
                    restaurantName: "Demo Restaurant"
                },
                "user": {
                    passwordHash: "9b8769a4a742959a2d0298c36fb70623f2dfacda8436237df08d8dfd5b37374c", // user123
                    role: "user", 
                    restaurantName: "Test Brasserie"
                }
            },
            
            // Eenvoudige authenticatie functie
            authenticate: async function(username, password) {
                console.log('Fallback authenticatie gebruikt');
                
                // Controleer admin gebruiker
                if (username === 'admin' && password === 'admin123') {
                    const user = {
                        username: 'admin',
                        role: 'admin',
                        restaurantName: 'Demo Restaurant',
                        lastLogin: new Date().toISOString()
                    };
                    
                    localStorage.setItem('brasseriebot_user', JSON.stringify(user));
                    localStorage.setItem('brasseriebot_auth_time', Date.now());
                    return user;
                }
                
                // Controleer standaard gebruiker
                if (username === 'user' && password === 'user123') {
                    const user = {
                        username: 'user',
                        role: 'user',
                        restaurantName: 'Test Brasserie',
                        lastLogin: new Date().toISOString()
                    };
                    
                    localStorage.setItem('brasseriebot_user', JSON.stringify(user));
                    localStorage.setItem('brasseriebot_auth_time', Date.now());
                    return user;
                }
                
                // Authenticatie mislukt
                return null;
            },
            
            // Controleer of gebruiker ingelogd is
            checkAuth: function() {
                const userJson = localStorage.getItem('brasseriebot_user');
                if (!userJson) {
                    window.location.href = 'login.html';
                    return null;
                }
                
                // Controleer sessie verlopen
                const authTime = localStorage.getItem('brasseriebot_auth_time');
                if (authTime && (Date.now() - parseInt(authTime)) > 24 * 60 * 60 * 1000) {
                    this.logout();
                    return null;
                }
                
                try {
                    return JSON.parse(userJson);
                } catch (e) {
                    console.error('Fout bij parsen gebruikersdata:', e);
                    return null;
                }
            },
            
            // Haal gebruikersinfo op
            getUserInfo: function() {
                const userJson = localStorage.getItem('brasseriebot_user');
                if (!userJson) {
                    return null;
                }
                
                try {
                    return JSON.parse(userJson);
                } catch (e) {
                    console.error('Fout bij parsen gebruikersdata:', e);
                    return null;
                }
            },
            
            // Update UI op basis van gebruiker
            updateUIForUser: function(user) {
                if (!user) return;
                
                // Welkomstbericht updaten
                const welcomeText = document.querySelector('.welcome-text span');
                if (welcomeText) {
                    welcomeText.textContent = `Welkom, ${user.username}`;
                }
                
                // Gebruikers avatar en details in sidebar updaten
                const userAvatar = document.querySelector('.user-avatar span');
                if (userAvatar) {
                    const initials = user.username.substring(0, 2).toUpperCase();
                    userAvatar.textContent = initials;
                }
                
                const userName = document.querySelector('.user-name');
                if (userName) {
                    userName.textContent = user.restaurantName || user.username;
                }
                
                const userEmail = document.querySelector('.user-email');
                if (userEmail) {
                    userEmail.textContent = user.email || user.username + '@brasseriebot.com';
                }
                
                // UI aanpassen op basis van gebruikersrol
                if (user.role === 'admin' || user.role === 'ADMIN') {
                    document.querySelectorAll('[data-role="admin"]').forEach(el => {
                        el.style.display = 'block';
                    });
                } else {
                    document.querySelectorAll('[data-role="admin"]').forEach(el => {
                        el.style.display = 'none';
                    });
                }
            },
            
            // Uitloggen
            logout: function() {
                localStorage.removeItem('brasseriebot_user');
                localStorage.removeItem('brasseriebot_auth_time');
                window.location.href = 'login.html';
            }
        };
    }

    // Voeg basisfunctionaliteit toe aan de pagina zodra HTML geladen is
    document.addEventListener('DOMContentLoaded', function() {
        // Controleer welke pagina we bekijken
        const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
        
        // Login pagina functionaliteit
        if (currentPage === 'login' || !currentPage) {
            setupLoginPage();
        }
        
        // Dashboard pagina functionaliteit
        if (currentPage === 'dashboard' || currentPage === 'dashboard-fixed') {
            setupDashboardPage();
        }
    });

    // Setup login pagina
    function setupLoginPage() {
        const loginForm = document.getElementById('login-form');
        if (!loginForm) return;
        
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorMessage = document.getElementById('error-message');
            
            const user = await window.BrasserieBotAuth.authenticate(username, password);
            
            if (user) {
                window.location.href = 'dashboard.html';
            } else {
                if (errorMessage) {
                    errorMessage.classList.add('show');
                }
                
                if (document.getElementById('password')) {
                    document.getElementById('password').value = '';
                }
            }
        });
    }
    
    // Setup dashboard pagina
    function setupDashboardPage() {
        // Controleer authenticatie
        const user = window.BrasserieBotAuth.checkAuth();
        if (!user) return;
        
        // Update UI voor gebruiker
        window.BrasserieBotAuth.updateUIForUser(user);
        
        // Zoekbalk functionaliteit
        setupSearchFunctionality();
        
        // Navigatie functionaliteit
        setupNavigation();
    }
    
    // Setup zoekfunctionaliteit
    function setupSearchFunctionality() {
        const searchInput = document.querySelector('.search-input');
        if (!searchInput) return;
        
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase();
            // Hier zou je zoekfunctionaliteit kunnen implementeren
            console.log('Zoeken naar:', query);
        });
    }
    
    // Setup navigatie
    function setupNavigation() {
        const navLinks = document.querySelectorAll('.sidebar-nav a');
        if (!navLinks.length) return;
        
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const target = this.getAttribute('href').substring(1);
                const contentSections = document.querySelectorAll('.content');
                
                // Verberg alle secties
                contentSections.forEach(section => {
                    section.classList.add('hidden');
                });
                
                // Toon de geselecteerde sectie
                const targetContent = document.getElementById(target + '-content');
                if (targetContent) {
                    targetContent.classList.remove('hidden');
                }
                
                // Update active klasse
                navLinks.forEach(navLink => {
                    navLink.parentElement.classList.remove('active');
                });
                
                this.parentElement.classList.add('active');
                
                // Sluit mobiel menu indien nodig
                const sidebar = document.querySelector('.sidebar');
                const sidebarOverlay = document.getElementById('sidebar-overlay');
                
                if (window.innerWidth <= 991 && sidebar && sidebarOverlay) {
                    sidebar.classList.remove('mobile-active');
                    sidebarOverlay.classList.remove('active');
                }
            });
        });
        
        // Mobiel menu toggle
        const menuToggle = document.getElementById('menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        const sidebarOverlay = document.getElementById('sidebar-overlay');
        
        if (menuToggle && sidebar && sidebarOverlay) {
            menuToggle.addEventListener('click', function() {
                sidebar.classList.toggle('mobile-active');
                sidebarOverlay.classList.toggle('active');
            });
            
            sidebarOverlay.addEventListener('click', function() {
                sidebar.classList.remove('mobile-active');
                sidebarOverlay.classList.remove('active');
            });
        }
    }
})();