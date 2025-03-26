// Authentication and user management for BrasserieBot Dashboard

// Check if user is logged in
function checkAuth() {
    const user = getUserInfo();
    
    // If no user is found, redirect to login page
    if (!user) {
        window.location.href = 'login.html';
        return null;
    }
    
    return user;
}

// Get user information from localStorage
function getUserInfo() {
    const userJson = localStorage.getItem('brasseriebot_user');
    if (!userJson) {
        return null;
    }
    
    try {
        return JSON.parse(userJson);
    } catch (e) {
        console.error('Error parsing user data:', e);
        return null;
    }
}

// Update UI based on user role and information
function updateUIForUser(user) {
    if (!user) return;
    
    // Update welcome message
    const welcomeText = document.querySelector('.welcome-text span');
    if (welcomeText) {
        welcomeText.textContent = `Welkom, ${user.username}`;
    }
    
    // Update user avatar and details in sidebar
    const userAvatar = document.querySelector('.user-avatar span');
    if (userAvatar) {
        // Get initials from username
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
    
    // Adjust UI based on user role
    if (user.role === 'admin') {
        // Show all admin features
        document.querySelectorAll('[data-role="admin"]').forEach(el => {
            el.style.display = 'block';
        });
    } else {
        // Hide admin-only features
        document.querySelectorAll('[data-role="admin"]').forEach(el => {
            el.style.display = 'none';
        });
    }
}

// Handle logout
function logout() {
    localStorage.removeItem('brasseriebot_user');
    window.location.href = 'login.html';
}

// Export functions
window.BrasserieBotAuth = {
    checkAuth,
    getUserInfo,
    updateUIForUser,
    logout
};