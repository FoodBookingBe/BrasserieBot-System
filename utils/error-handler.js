// Gestandaardiseerd Error Handling Systeem voor BrasserieBot
// Dit systeem biedt consistente foutafhandeling voor Supabase interacties

/**
 * Aangepaste Supabase error klasse voor gestructureerde foutafhandeling
 */
export class SupabaseError extends Error {
  /**
   * Creëert een nieuwe SupabaseError
   * @param {string} message - Foutmelding
   * @param {string} code - Foutcode (bv. 'auth/invalid-email')
   * @param {Object} originalError - Originele error object van Supabase
   * @param {Object} metadata - Aanvullende context over de fout
   */
  constructor(message, code, originalError, metadata = {}) {
    super(message);
    this.name = 'SupabaseError';
    this.code = code;
    this.originalError = originalError;
    this.metadata = metadata;
    this.timestamp = new Date().toISOString();
  }
  
  /**
   * Creëert een SupabaseError vanuit een Supabase error response
   * @param {Object} error - Supabase error object
   * @param {Object} metadata - Aanvullende contextinformatie
   * @returns {SupabaseError} - Gestructureerde error
   */
  static fromSupabaseError(error, metadata = {}) {
    // Extraheer code uit Supabase error object
    const code = error.code || 
                 (error.details && error.details.code) || 
                 'UNKNOWN';
                 
    // Extraheer bericht uit Supabase error object
    const message = error.message || 
                    (error.details && error.details.message) || 
                    'Onbekende Supabase fout';
    
    return new SupabaseError(message, code, error, metadata);
  }
  
  /**
   * Genereert een gedetailleerd foutrapport voor logging
   * @returns {Object} - Gestructureerd foutrapport
   */
  toErrorReport() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      timestamp: this.timestamp,
      metadata: this.metadata,
      stack: this.stack,
      originalError: this.originalError ? {
        message: this.originalError.message,
        details: this.originalError.details,
        code: this.originalError.code,
        hint: this.originalError.hint
      } : null
    };
  }
}

/**
 * Error codes voor verschillende soorten Supabase fouten
 */
export const ERROR_CODES = {
  // Auth gerelateerde fouten
  AUTH_INVALID_EMAIL: 'auth/invalid-email',
  AUTH_WRONG_PASSWORD: 'auth/wrong-password',
  AUTH_USER_NOT_FOUND: 'auth/user-not-found',
  AUTH_EMAIL_IN_USE: 'auth/email-already-in-use',
  AUTH_WEAK_PASSWORD: 'auth/weak-password',
  AUTH_EXPIRED_TOKEN: 'auth/expired-token',
  
  // Database gerelateerde fouten
  DB_ROW_NOT_FOUND: 'db/row-not-found',
  DB_FOREIGN_KEY_VIOLATION: 'db/foreign-key-violation',
  DB_UNIQUE_VIOLATION: 'db/unique-violation',
  DB_CHECK_VIOLATION: 'db/check-violation',
  
  // API gerelateerde fouten
  API_RATE_LIMIT: 'api/rate-limit',
  API_TIMEOUT: 'api/timeout',
  API_NETWORK_ERROR: 'api/network-error',
  
  // RLS gerelateerde fouten
  RLS_PERMISSION_DENIED: 'rls/permission-denied',
  
  // Algemene fouten
  UNKNOWN: 'unknown',
  INVALID_PARAMS: 'invalid-params',
  INTERNAL_ERROR: 'internal-error'
};

/**
 * Vertaal Supabase foutcodes naar onze interne codes
 * @param {Object} error - Supabase error object
 * @returns {string} - Interne error code
 */
export const mapSupabaseErrorCode = (error) => {
  // Supabase PGRST error codes
  if (error.code === '23503') return ERROR_CODES.DB_FOREIGN_KEY_VIOLATION;
  if (error.code === '23505') return ERROR_CODES.DB_UNIQUE_VIOLATION;
  if (error.code === '23514') return ERROR_CODES.DB_CHECK_VIOLATION;
  
  // Supabase auth error codes
  if (error.message && error.message.includes('invalid email')) 
    return ERROR_CODES.AUTH_INVALID_EMAIL;
  if (error.message && error.message.includes('incorrect password')) 
    return ERROR_CODES.AUTH_WRONG_PASSWORD;
  if (error.message && error.message.includes('user not found')) 
    return ERROR_CODES.AUTH_USER_NOT_FOUND;
  if (error.message && error.message.includes('already in use')) 
    return ERROR_CODES.AUTH_EMAIL_IN_USE;
  if (error.message && error.message.includes('JWT expired')) 
    return ERROR_CODES.AUTH_EXPIRED_TOKEN;
  
  // Supabase RLS errors
  if (error.message && error.message.includes('permission denied')) 
    return ERROR_CODES.RLS_PERMISSION_DENIED;
  
  // Fallback
  return ERROR_CODES.UNKNOWN;
};

/**
 * Vertaal error codes naar gebruikersvriendelijke berichten
 * @param {SupabaseError|Object} error - Error object
 * @returns {string} - Gebruikersvriendelijke foutmelding
 */
export const getUserFriendlyErrorMessage = (error) => {
  const code = error.code || mapSupabaseErrorCode(error);
  
  // Vertaal technische foutmeldingen naar gebruikersvriendelijke berichten
  const errorMessages = {
    [ERROR_CODES.AUTH_INVALID_EMAIL]: 'Het opgegeven e-mailadres is ongeldig.',
    [ERROR_CODES.AUTH_WRONG_PASSWORD]: 'Onjuist wachtwoord. Probeer het opnieuw.',
    [ERROR_CODES.AUTH_USER_NOT_FOUND]: 'Geen account gevonden met dit e-mailadres.',
    [ERROR_CODES.AUTH_EMAIL_IN_USE]: 'Dit e-mailadres is al in gebruik. Probeer in te loggen.',
    [ERROR_CODES.AUTH_WEAK_PASSWORD]: 'Het wachtwoord is te zwak. Gebruik minstens 8 tekens met cijfers en letters.',
    [ERROR_CODES.AUTH_EXPIRED_TOKEN]: 'Uw sessie is verlopen. Log opnieuw in.',
    
    [ERROR_CODES.DB_ROW_NOT_FOUND]: 'De opgevraagde gegevens zijn niet gevonden.',
    [ERROR_CODES.DB_FOREIGN_KEY_VIOLATION]: 'De bewerking kon niet worden uitgevoerd vanwege een referentiebeperking.',
    [ERROR_CODES.DB_UNIQUE_VIOLATION]: 'Er bestaat al een item met deze gegevens.',
    [ERROR_CODES.DB_CHECK_VIOLATION]: 'De ingevoerde gegevens voldoen niet aan de validatieregels.',
    
    [ERROR_CODES.API_RATE_LIMIT]: 'Te veel verzoeken. Probeer het over enkele minuten opnieuw.',
    [ERROR_CODES.API_TIMEOUT]: 'De server reageert traag. Probeer het later opnieuw.',
    [ERROR_CODES.API_NETWORK_ERROR]: 'Netwerkfout. Controleer uw internetverbinding.',
    
    [ERROR_CODES.RLS_PERMISSION_DENIED]: 'U heeft geen toegang tot deze functionaliteit.',
    
    [ERROR_CODES.INVALID_PARAMS]: 'Ongeldige parameters opgegeven.',
    [ERROR_CODES.INTERNAL_ERROR]: 'Er is een interne fout opgetreden.'
  };
  
  return errorMessages[code] || 'Er is een fout opgetreden. Probeer het later opnieuw.';
};

/**
 * Log error naar console en optioneel naar externe monitoring service
 * @param {Error|SupabaseError} error - Error object
 * @param {string} context - Waar de fout optrad
 */
export const logErrorToMonitoring = (error, context = '') => {
  // Console logging
  console.error(`[${context}] ${error.message}`, error);
  
  // Hier zou je de error kunnen doorsturen naar een monitoring service
  // zoals Sentry, LogRocket, etc.
  if (typeof window !== 'undefined' && window.errorMonitoringService) {
    window.errorMonitoringService.captureException(error, {
      tags: { context },
      extra: error instanceof SupabaseError ? error.toErrorReport() : error
    });
  }
};

/**
 * Toon een error toast/notificatie voor de gebruiker
 * @param {string} message - Gebruikersvriendelijke foutmelding
 * @param {string} type - Type notificatie (error, warning, etc.)
 */
export const showErrorToast = (message, type = 'error') => {
  // Check of we browser UI notificaties kunnen tonen
  if (typeof window !== 'undefined') {
    if (window.toastService) {
      // Gebruik de toast service als beschikbaar
      window.toastService.show(message, { type });
    } else {
      // Fallback naar alert als geen toast service beschikbaar is
      console.error(`[UI Error] ${message}`);
      // alert(message); // Uncomment als fallback alert gewenst is
    }
  }
};

/**
 * Hoofd error handler functie voor Supabase errors
 * @param {Error|Object} error - Error object van Supabase
 * @param {Object} options - Opties voor error handling
 * @param {Function} options.fallbackAction - Actie om uit te voeren na error
 * @param {string} options.context - Context waarin de fout optrad
 * @param {boolean} options.showToast - Of een notificatie getoond moet worden
 * @param {boolean} options.rethrow - Of de error opnieuw gegooid moet worden
 * @returns {SupabaseError} - Geformatteerde error voor verder gebruik
 */
export const handleSupabaseError = (error, {
  fallbackAction = null,
  context = 'Supabase',
  showToast = true,
  rethrow = false
} = {}) => {
  // Converteer naar SupabaseError als dat nog niet gebeurd is
  const formattedError = error instanceof SupabaseError 
    ? error 
    : SupabaseError.fromSupabaseError(error, { context });
  
  // Log de fout
  logErrorToMonitoring(formattedError, context);
  
  // Toon gebruikersvriendelijke foutmelding indien gewenst
  if (showToast) {
    const userMessage = getUserFriendlyErrorMessage(formattedError);
    showErrorToast(userMessage);
  }
  
  // Voer fallback actie uit indien nodig
  if (fallbackAction && typeof fallbackAction === 'function') {
    fallbackAction(formattedError);
  }
  
  // Gooi de error opnieuw als dat gewenst is
  if (rethrow) {
    throw formattedError;
  }
  
  return formattedError;
};

export default {
  SupabaseError,
  ERROR_CODES,
  handleSupabaseError,
  getUserFriendlyErrorMessage,
  logErrorToMonitoring,
  showErrorToast,
  mapSupabaseErrorCode
};