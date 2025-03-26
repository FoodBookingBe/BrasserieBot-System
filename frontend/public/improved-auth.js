// Verbeterde authenticatie en gebruikersbeheer voor BrasserieBot Dashboard

// Beveiligingsniveau verhoogd, maar nog steeds client-side demo
// In een echte productie-omgeving zou alle authenticatie via een beveiligde backend moeten verlopen

// Gebruikersdatabase (alleen voor demo)
// Wachtwoorden zijn gehashed (SHA-256) - in productie zou je bcrypt of Argon2 gebruiken
const userDatabase = {
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
};

// Helper functie voor wachtwoord hashing
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Authenticatie functie
async function authenticate(username, password) {
    // Controleer of gebruiker bestaat
    const user = userDatabase[username];
    if (!user) {
        return null; // Gebruiker niet gevonden
    }

    // Hash het ingevoerde wachtwoord
    const passwordHash = await hashPassword(password);
    
    // Vergelijk de hashes
    if (passwordHash !== user.passwordHash) {
        return null; // Wachtwoord komt niet overeen
    }

    // Gebruiker geauthenticeerd, maak een gebruikersobject
    const authenticatedUser = {
        username: username,
        role: user.role,
        restaurantName: user.restaurantName,
        lastLogin: new Date().toISOString(),
        // Een eenvoudige token genereren voor sessie validatie
        token: btoa(username + ":" + Math.random().toString(36).substring(2) + ":" + Date.now())
    };

    // Sla gebruikersinformatie op
    localStorage.setItem('brasseriebot_user', JSON.stringify(authenticatedUser));
    localStorage.setItem('brasseriebot_auth_time', Date.now());
    
    return authenticatedUser;
}

// Check of gebruiker is ingelogd
function checkAuth() {
    const user = getUserInfo();
    
    // Als geen gebruiker gevonden, redirecten naar login
    if (!user) {
        window.location.href = 'login.html';
        return null;
    }
    
    // Controleer sessie verlopen (24 uur)
    const authTime = localStorage.getItem('brasseriebot_auth_time');
    if (authTime && (Date.now() - parseInt(authTime)) > 24 * 60 * 60 * 1000) {
        logout(); // Sessie verlopen, uitloggen
        return null;
    }
    
    return user;
}

// Gebruikersinformatie ophalen
function getUserInfo() {
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
}

// UI updaten op basis van gebruikersrol en informatie
function updateUIForUser(user) {
    if (!user) return;
    
    // Welkomstbericht updaten
    const welcomeText = document.querySelector('.welcome-text span');
    if (welcomeText) {
        welcomeText.textContent = `Welkom, ${user.username}`;
    }
    
    // Gebruikers avatar en details in sidebar updaten
    const userAvatar = document.querySelector('.user-avatar span');
    if (userAvatar) {
        // Initialen van gebruikersnaam
        const initials = user.username.substring(0, 2).toUpperCase();
        userAvatar.textContent = initials;
    }
    
    const userName = document.querySelector('.user-name');
    if (userName) {
        userName.textContent = user.restaurantName || user.username;
    }
    
    const userEmail = document.querySelector('.user-email');
    if (userEmail) {
        userEmail.textContent = user.username + '@brasseriebot.com';
    }
    
    // UI aanpassen op basis van gebruikersrol
    if (user.role === 'admin') {
        // Alle admin functies tonen
        document.querySelectorAll('[data-role="admin"]').forEach(el => {
            el.style.display = 'block';
        });
    } else {
        // Admin-specifieke functies verbergen
        document.querySelectorAll('[data-role="admin"]').forEach(el => {
            el.style.display = 'none';
        });
    }
}

// Uitloggen
function logout() {
    localStorage.removeItem('brasseriebot_user');
    localStorage.removeItem('brasseriebot_auth_time');
    window.location.href = 'login.html';
}

// Functies exporteren
window.BrasserieBotAuth = {
    authenticate,
    checkAuth,
    getUserInfo,
    updateUIForUser,
    logout
};