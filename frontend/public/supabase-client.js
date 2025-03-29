/**
 * BrasserieBot Supabase Client
 * This file provides a unified interface for interacting with Supabase.
 */

// Supabase client singleton
class SupabaseClient {
  constructor() {
    this._client = null;
    this._initialized = false;
    this._url = '';
    this._key = '';
    this._initPromise = null;
  }

  /**
   * Initialize the Supabase client
   * @returns {Promise} Promise that resolves when initialization is complete
   */
  init() {
    if (this._initPromise) {
      return this._initPromise;
    }

    this._initPromise = new Promise((resolve, reject) => {
      try {
        // Get credentials from environment
        if (!window.ENV) {
          console.error('Environment variables not found. Please check if environment.js is loaded.');
          reject(new Error('Environment variables not found'));
          return;
        }

        this._url = window.ENV.SUPABASE_DATABASE_URL;
        this._key = window.ENV.SUPABASE_ANON_KEY;

        if (!this._url || !this._key) {
          console.error('Supabase credentials missing. Please check ENV values.');
          reject(new Error('Supabase credentials missing'));
          return;
        }

        if (this._url === '{{SUPABASE_DATABASE_URL}}' || this._key === '{{SUPABASE_ANON_KEY}}') {
          console.error('Supabase placeholders not replaced. Run process-html script.');
          reject(new Error('Supabase placeholders not replaced'));
          return;
        }

        console.log('Initializing Supabase client with URL:', this._url);

        // Create client
        this._client = supabase.createClient(this._url, this._key);
        this._initialized = true;
        console.log('Supabase client succesvol geïnitialiseerd');
        resolve(this._client);
      } catch (error) {
        console.error('Error initializing Supabase client:', error);
        reject(error);
      }
    });

    return this._initPromise;
  }

  /**
   * Get the Supabase client instance
   * @returns {Object} Supabase client
   */
  getClient() {
    if (!this._initialized) {
      console.warn('Supabase client not initialized. Call init() first.');
      return null;
    }
    return this._client;
  }

  /**
   * Check if Supabase client is available
   * @returns {Boolean} True if client is initialized
   */
  isAvailable() {
    return this._initialized;
  }

  /**
   * Get current authenticated user
   * @returns {Promise<Object>} User object or null
   */
  async getUser() {
    try {
      if (!this._initialized) {
        await this.init();
      }

      const { data: { user }, error } = await this._client.auth.getUser();
      
      if (error) {
        console.error('Fout bij ophalen gebruiker:', error);
        return null;
      }
      
      return user;
    } catch (error) {
      console.error('Fout bij ophalen gebruiker:', error);
      return null;
    }
  }

  /**
   * Sign in user with email and password
   * @param {String} email User email
   * @param {String} password User password
   * @returns {Promise<Object>} Auth response
   */
  async signIn(email, password) {
    try {
      if (!this._initialized) {
        await this.init();
      }
      
      const { data, error } = await this._client.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Fout bij inloggen:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Fout bij inloggen:', error);
      throw error;
    }
  }

  /**
   * Sign up a new user
   * @param {String} email User email
   * @param {String} password User password
   * @param {Object} metadata Additional user data
   * @returns {Promise<Object>} Auth response
   */
  async signUp(email, password, metadata = {}) {
    try {
      if (!this._initialized) {
        await this.init();
      }
      
      const { data, error } = await this._client.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      if (error) {
        console.error('Fout bij registreren:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Fout bij registreren:', error);
      throw error;
    }
  }

  /**
   * Sign out the current user
   * @returns {Promise<void>}
   */
  async signOut() {
    try {
      if (!this._initialized) {
        await this.init();
      }
      
      const { error } = await this._client.auth.signOut();
      
      if (error) {
        console.error('Fout bij uitloggen:', error);
        throw error;
      }
    } catch (error) {
      console.error('Fout bij uitloggen:', error);
      throw error;
    }
  }
}

// Create singleton instance
const supabaseClient = new SupabaseClient();

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  supabaseClient.init().catch(error => {
    console.error('Fout bij initialiseren Supabase client:', error);
  });
});