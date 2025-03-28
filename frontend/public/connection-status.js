/**
 * BrasserieBot Connection Status
 * This script verifies and displays the connection status for all systems.
 */

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Create status element if it doesn't exist
    if (!document.getElementById('connection-status')) {
        const statusContainer = document.createElement('div');
        statusContainer.id = 'connection-status';
        statusContainer.style.position = 'fixed';
        statusContainer.style.bottom = '10px';
        statusContainer.style.right = '10px';
        statusContainer.style.backgroundColor = 'rgba(0,0,0,0.7)';
        statusContainer.style.color = 'white';
        statusContainer.style.padding = '8px 12px';
        statusContainer.style.borderRadius = '4px';
        statusContainer.style.fontSize = '12px';
        statusContainer.style.fontFamily = 'monospace';
        statusContainer.style.zIndex = '9999';
        statusContainer.style.maxWidth = '300px';
        statusContainer.style.overflow = 'hidden';
        document.body.appendChild(statusContainer);
    }

    // Update the status display
    const displayStatus = function(message, isError = false) {
        const statusContainer = document.getElementById('connection-status');
        if (statusContainer) {
            const statusItem = document.createElement('div');
            statusItem.textContent = message;
            statusItem.style.margin = '4px 0';
            statusItem.style.color = isError ? '#ff6b6b' : '#63e6be';
            
            statusContainer.appendChild(statusItem);
            
            // Auto-remove after 10 seconds
            setTimeout(() => {
                statusContainer.removeChild(statusItem);
            }, 10000);
        }
    };

    // Check Supabase Connection
    const checkSupabase = async function() {
        try {
            if (typeof supabaseClient === 'undefined') {
                displayStatus('❌ Supabase Client not loaded', true);
                return false;
            }

            if (!supabaseClient.isAvailable()) {
                displayStatus('❌ Supabase not initialized', true);
                return false;
            }

            displayStatus('✅ Supabase Connection: Active');
            
            // Get client
            const client = supabaseClient.getClient();
            if (!client) {
                displayStatus('❌ Supabase Client error', true);
                return false;
            }
            
            // Check URL
            const url = window.ENV.SUPABASE_DATABASE_URL || 'unknown';
            displayStatus(`ℹ️ URL: ${url.replace(/^https:\/\//, '').substring(0, 8)}...`);
            
            return true;
        } catch (error) {
            displayStatus(`❌ Supabase error: ${error.message}`, true);
            return false;
        }
    };

    // Check environment variables
    const checkEnvironment = function() {
        try {
            if (typeof window.ENV === 'undefined') {
                displayStatus('❌ Environment not loaded', true);
                return false;
            }
            
            if (!window.ENV.SUPABASE_DATABASE_URL || 
                window.ENV.SUPABASE_DATABASE_URL === '{{SUPABASE_DATABASE_URL}}') {
                displayStatus('❌ SUPABASE_DATABASE_URL not set', true);
                return false;
            }
            
            if (!window.ENV.SUPABASE_ANON_KEY || 
                window.ENV.SUPABASE_ANON_KEY === '{{SUPABASE_ANON_KEY}}') {
                displayStatus('❌ SUPABASE_ANON_KEY not set', true);
                return false;
            }
            
            displayStatus('✅ Environment: Configured');
            return true;
        } catch (error) {
            displayStatus(`❌ Environment error: ${error.message}`, true);
            return false;
        }
    };

    // Run the checks
    const runAllChecks = async function() {
        displayStatus('🔍 Running connection checks...');
        checkEnvironment();
        await checkSupabase();
    };

    // Run checks immediately and then every 30 seconds
    runAllChecks();
    setInterval(runAllChecks, 30000);
});