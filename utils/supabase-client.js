// Geoptimaliseerde Supabase Client met Error Handling
// Dit bestand integreert de error handler met de Supabase client

import { createClient } from '@supabase/supabase-js';
import { 
  handleSupabaseError, 
  SupabaseError, 
  ERROR_CODES 
} from './error-handler.js';

// Configuratie uit environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://yucpwawshjmonwsgvsfq.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1Y3B3YXdzaGptb253c2d2c2ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwODM1NzQsImV4cCI6MjA1ODY1OTU3NH0.L5eKYyXAqjkze2_LhnHgEbAURMRt7r2q0ITI6hhktJ0';

// Basis Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Veilige Supabase client wrapper met error handling
 */
class SafeSupabaseClient {
  constructor() {
    this.client = supabase;
    this.auth = this._wrapAuthMethods();
    this.from = this._wrapTableMethods();
    this.storage = this._wrapStorageMethods();
    this.rpc = this._wrapRpcMethod();
  }

  /**
   * Wrap auth methods met error handling
   */
  _wrapAuthMethods() {
    const originalAuth = this.client.auth;
    const wrappedAuth = {};

    // Wrap sign in method
    wrappedAuth.signIn = async ({ email, password }) => {
      try {
        const result = await originalAuth.signInWithPassword({ email, password });
        
        if (result.error) {
          throw handleSupabaseError(result.error, {
            context: 'Auth.signIn',
            showToast: true
          });
        }
        
        return result;
      } catch (error) {
        if (!(error instanceof SupabaseError)) {
          handleSupabaseError(error, { 
            context: 'Auth.signIn', 
            showToast: true 
          });
        }
        throw error;
      }
    };

    // Wrap sign up method
    wrappedAuth.signUp = async ({ email, password, options }) => {
      try {
        const result = await originalAuth.signUp({ 
          email, 
          password, 
          options 
        });
        
        if (result.error) {
          throw handleSupabaseError(result.error, {
            context: 'Auth.signUp',
            showToast: true
          });
        }
        
        return result;
      } catch (error) {
        if (!(error instanceof SupabaseError)) {
          handleSupabaseError(error, { 
            context: 'Auth.signUp', 
            showToast: true 
          });
        }
        throw error;
      }
    };

    // Wrap sign out method
    wrappedAuth.signOut = async () => {
      try {
        const result = await originalAuth.signOut();
        
        if (result.error) {
          throw handleSupabaseError(result.error, {
            context: 'Auth.signOut',
            showToast: true
          });
        }
        
        return result;
      } catch (error) {
        if (!(error instanceof SupabaseError)) {
          handleSupabaseError(error, { 
            context: 'Auth.signOut', 
            showToast: true 
          });
        }
        throw error;
      }
    };

    // Pass-through other auth methods
    Object.keys(originalAuth).forEach(key => {
      if (!wrappedAuth[key]) {
        wrappedAuth[key] = originalAuth[key];
      }
    });

    return wrappedAuth;
  }

  /**
   * Wrap table methods met error handling
   */
  _wrapTableMethods() {
    return (tableName) => {
      const originalFrom = this.client.from(tableName);
      const context = `Table.${tableName}`;
      
      // Wrap select method
      const wrappedSelect = async (...args) => {
        try {
          const result = await originalFrom.select(...args);
          
          if (result.error) {
            throw handleSupabaseError(result.error, {
              context: `${context}.select`,
              metadata: { args }
            });
          }
          
          return result;
        } catch (error) {
          if (!(error instanceof SupabaseError)) {
            handleSupabaseError(error, { 
              context: `${context}.select`, 
              metadata: { args } 
            });
          }
          throw error;
        }
      };

      // Wrap insert method
      const wrappedInsert = async (values, options) => {
        try {
          const result = await originalFrom.insert(values, options);
          
          if (result.error) {
            throw handleSupabaseError(result.error, {
              context: `${context}.insert`,
              metadata: { values }
            });
          }
          
          return result;
        } catch (error) {
          if (!(error instanceof SupabaseError)) {
            handleSupabaseError(error, { 
              context: `${context}.insert`, 
              metadata: { values } 
            });
          }
          throw error;
        }
      };

      // Wrap update method
      const wrappedUpdate = async (values, options) => {
        try {
          const result = await originalFrom.update(values, options);
          
          if (result.error) {
            throw handleSupabaseError(result.error, {
              context: `${context}.update`,
              metadata: { values }
            });
          }
          
          return result;
        } catch (error) {
          if (!(error instanceof SupabaseError)) {
            handleSupabaseError(error, { 
              context: `${context}.update`, 
              metadata: { values } 
            });
          }
          throw error;
        }
      };

      // Wrap delete method
      const wrappedDelete = async (options) => {
        try {
          const result = await originalFrom.delete(options);
          
          if (result.error) {
            throw handleSupabaseError(result.error, {
              context: `${context}.delete`
            });
          }
          
          return result;
        } catch (error) {
          if (!(error instanceof SupabaseError)) {
            handleSupabaseError(error, { 
              context: `${context}.delete`
            });
          }
          throw error;
        }
      };

      // Create table proxy that allows for both enhanced methods and chaining
      return new Proxy(originalFrom, {
        get(target, prop) {
          if (prop === 'select') return wrappedSelect;
          if (prop === 'insert') return wrappedInsert;
          if (prop === 'update') return wrappedUpdate;
          if (prop === 'delete') return wrappedDelete;
          
          // Allow chaining with original methods
          return target[prop];
        }
      });
    };
  }

  /**
   * Wrap storage methods met error handling
   */
  _wrapStorageMethods() {
    const originalStorage = this.client.storage;
    const context = 'Storage';
    
    // Create function to wrap a storage bucket
    const wrapBucket = (bucketName) => {
      const bucket = originalStorage.from(bucketName);
      const bucketContext = `${context}.${bucketName}`;
      
      // Wrap upload method
      const wrappedUpload = async (path, file, options) => {
        try {
          const result = await bucket.upload(path, file, options);
          
          if (result.error) {
            throw handleSupabaseError(result.error, {
              context: `${bucketContext}.upload`,
              metadata: { path }
            });
          }
          
          return result;
        } catch (error) {
          if (!(error instanceof SupabaseError)) {
            handleSupabaseError(error, { 
              context: `${bucketContext}.upload`, 
              metadata: { path } 
            });
          }
          throw error;
        }
      };

      // Wrap download method
      const wrappedDownload = async (path, options) => {
        try {
          const result = await bucket.download(path, options);
          
          if (result.error) {
            throw handleSupabaseError(result.error, {
              context: `${bucketContext}.download`,
              metadata: { path }
            });
          }
          
          return result;
        } catch (error) {
          if (!(error instanceof SupabaseError)) {
            handleSupabaseError(error, { 
              context: `${bucketContext}.download`, 
              metadata: { path } 
            });
          }
          throw error;
        }
      };

      // Create bucket proxy
      return new Proxy(bucket, {
        get(target, prop) {
          if (prop === 'upload') return wrappedUpload;
          if (prop === 'download') return wrappedDownload;
          
          // Pass through other methods
          return target[prop];
        }
      });
    };

    // Return storage object with wrapped 'from' method
    return {
      ...originalStorage,
      from: wrapBucket
    };
  }

  /**
   * Wrap RPC method met error handling
   */
  _wrapRpcMethod() {
    return async (procedureName, params) => {
      try {
        const result = await this.client.rpc(procedureName, params);
        
        if (result.error) {
          throw handleSupabaseError(result.error, {
            context: `RPC.${procedureName}`,
            metadata: { params }
          });
        }
        
        return result;
      } catch (error) {
        if (!(error instanceof SupabaseError)) {
          handleSupabaseError(error, { 
            context: `RPC.${procedureName}`, 
            metadata: { params } 
          });
        }
        throw error;
      }
    };
  }
}

// Exporteer de veilige Supabase client
export const safeSupabase = new SafeSupabaseClient();

// Exporteer ook de originele client voor geavanceerd gebruik
export const rawSupabase = supabase;

// Default export voor eenvoudig gebruik
export default safeSupabase;