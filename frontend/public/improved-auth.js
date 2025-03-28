/**
 * BrasserieBot Authentication System
 * Integrates with Supabase for user authentication and management
 */

// BrasserieBot Auth namespace
const BrasserieBotAuth = {
    // Current user
    currentUser: null,
    
    /**
     * Initialize authentication
     * @returns {Promise<void>}
     */
    async init() {
        try {
            console.log('Initializing BrasserieBot Auth system...');
            
            // Wait for Supabase client to be ready
            if (typeof supabaseClient === 'undefined') {
                console.error('Supabase client not available. Make sure supabase-client.js is loaded.');
                return;
            }
            
            // Initialize Supabase if needed
            if (!supabaseClient.isAvailable()) {
                await supabaseClient.init();
            }
            
            // Check for existing session
            await this.refreshUser();
            
            console.log('Auth system initialized');
        } catch (error) {
            console.error('Error initializing auth system:', error);
        }
    },
    
    /**
     * Get the current authenticated user
     * @returns {Object|null} User object or null if not authenticated
     */
    async refreshUser() {
        try {
            // First, check local storage for compatibility with old system
            const storedUser = localStorage.getItem('brasseriebot_user');
            let legacyUser = null;
            
            if (storedUser) {
                try {
                    legacyUser = JSON.parse(storedUser);
                    console.log('Found legacy user data in localStorage');
                } catch (e) {
                    console.error('Error parsing legacy user data:', e);
                }
            }
            
            // Get the user from Supabase using the client directly
            let user = null;
            try {
                const client = supabaseClient.getClient();
                if (client && client.auth) {
                    const { data, error } = await client.auth.getUser();
                    if (error) {
                        console.error('Error getting user from Supabase:', error.message);
                    } else if (data && data.user) {
                        user = data.user;
                    }
                }
            } catch (error) {
                console.error('Error accessing Supabase auth:', error.message);
            }
            
            if (user) {
                // We have a Supabase user, use that
                this.currentUser = {
                    id: user.id,
                    email: user.email,
                    username: user.user_metadata?.username || user.email?.split('@')[0] || 'Gebruiker',
                    restaurantName: user.user_metadata?.restaurantName || 'Mijn Restaurant',
                    role: user.user_metadata?.role || 'user',
                    supabaseUser: user
                };
                
                // Save to localStorage for compatibility
                localStorage.setItem('brasseriebot_user', JSON.stringify(this.currentUser));
                localStorage.setItem('brasseriebot_auth_time', Date.now().toString());
                
                console.log('User authenticated:', this.currentUser.email);
                return this.currentUser;
            } else if (legacyUser) {
                // Fallback to legacy user if no Supabase user
                console.log('Using legacy user data');
                this.currentUser = legacyUser;
                return legacyUser;
            }
            
            // No user found
            this.currentUser = null;
            return null;
        } catch (error) {
            console.error('Error refreshing user:', error);
            return null;
        }
    },
    
    /**
     * Check if user is authenticated and redirect if not
     * @param {string} redirectUrl URL to redirect to if not authenticated
     * @returns {Promise<Object|null>} User object or null
     */
    async checkAuth(redirectUrl = 'login.html') {
        await this.refreshUser();
        
        if (!this.currentUser) {
            console.log('User not authenticated, redirecting to', redirectUrl);
            window.location.href = redirectUrl;
            return null;
        }
        
        return this.currentUser;
    },
    
    /**
     * Get user information
     * @returns {Object|null} User object or null
     */
    getUserInfo() {
        return this.currentUser;
    },
    
    /**
     * Sign in with email and password
     * @param {string} email User email
     * @param {string} password User password
     * @returns {Promise<Object>} Auth result
     */
    async signIn(email, password) {
        try {
            if (!email || !password) {
                throw new Error('Email en wachtwoord zijn verplicht');
            }
            
            const client = supabaseClient.getClient();
            if (!client || !client.auth) {
                throw new Error('Supabase client niet beschikbaar');
            }
            
            const { data, error } = await client.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            
            if (data && data.user) {
                // Refresh user after successful sign in
                await this.refreshUser();
                return { success: true, user: this.currentUser };
            }
            
            return { success: false, error: 'Inloggen mislukt' };
        } catch (error) {
            console.error('Sign in error:', error);
            return { 
                success: false, 
                error: error.message || 'Inloggen mislukt. Controleer je gegevens en probeer opnieuw.'
            };
        }
    },
    
    /**
     * Sign up a new user
     * @param {string} email User email
     * @param {string} password User password
     * @param {string} restaurantName Restaurant name
     * @returns {Promise<Object>} Auth result
     */
    async signUp(email, password, restaurantName) {
        try {
            if (!email || !password) {
                throw new Error('Email en wachtwoord zijn verplicht');
            }
            
            // Extract username from email
            const username = email.split('@')[0];
            
            const client = supabaseClient.getClient();
            if (!client || !client.auth) {
                throw new Error('Supabase client niet beschikbaar');
            }
            
            const { data, error } = await client.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username,
                        restaurantName: restaurantName || 'Mijn Restaurant',
                        role: 'user'
                    }
                }
            });
            
            if (error) throw error;
            
            if (data && data.user) {
                // Some providers confirm immediately, others require confirmation
                if (data.user.identities && data.user.identities.length > 0) {
                    await this.refreshUser();
                    return { 
                        success: true, 
                        user: this.currentUser, 
                        message: 'Account aangemaakt en ingelogd'
                    };
                } else {
                    return { 
                        success: true, 
                        requiresConfirmation: true,
                        message: 'Bevestigingsmail verstuurd. Controleer je inbox om je account te activeren.'
                    };
                }
            }
            
            return { success: false, error: 'Registratie mislukt' };
        } catch (error) {
            console.error('Sign up error:', error);
            
            // Handle specific errors
            if (error.message && error.message.includes('already registered')) {
                return { 
                    success: false, 
                    error: 'Dit e-mailadres is al geregistreerd. Probeer in te loggen of klik op "Wachtwoord vergeten".'
                };
            }
            
            return { 
                success: false, 
                error: error.message || 'Registratie mislukt. Probeer opnieuw.'
            };
        }
    },
    
    /**
     * Sign out the current user
     * @returns {Promise<Object>} Result
     */
    async signOut() {
        try {
            // First remove from localStorage for legacy compatibility
            localStorage.removeItem('brasseriebot_user');
            localStorage.removeItem('brasseriebot_auth_time');
            
            // Then sign out from Supabase
            try {
                const client = supabaseClient.getClient();
                if (client && client.auth) {
                    await client.auth.signOut();
                }
            } catch (error) {
                console.error('Error signing out from Supabase:', error);
            }
            
            this.currentUser = null;
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        }
    },
    
    /**
     * Update UI based on user role and information
     * @param {Object} user User object
     */
    updateUIForUser(user) {
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
            userEmail.textContent = user.email || user.username + '@brasseriebot.com';
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
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // For backward compatibility, make methods available globally
    window.BrasserieBotAuth = BrasserieBotAuth;
    
    // Initialize the auth system
    BrasserieBotAuth.init()
        .then(() => {
            // Update UI if we have a user
            const user = BrasserieBotAuth.getUserInfo();
            if (user) {
                BrasserieBotAuth.updateUIForUser(user);
            }
        })
        .catch(err => {
            console.error('Error during auth initialization:', err);
        });
});