// Connection status monitoring script
document.addEventListener('DOMContentLoaded', function() {
  // Create status container if it doesn't exist
  let statusContainer = document.getElementById('connection-status');
  if (!statusContainer) {
    statusContainer = document.createElement('div');
    statusContainer.id = 'connection-status';
    statusContainer.style.position = 'fixed';
    statusContainer.style.bottom = '10px';
    statusContainer.style.right = '10px';
    statusContainer.style.padding = '5px';
    statusContainer.style.background = 'rgba(0, 0, 0, 0.7)';
    statusContainer.style.borderRadius = '5px';
    statusContainer.style.color = 'white';
    statusContainer.style.fontSize = '12px';
    statusContainer.style.zIndex = '9999';
    document.body.appendChild(statusContainer);
  }

  // Add status indicators
  const statuses = [
    { id: 'connection', text: 'Running connection checks...', color: '#3498db' },
    { id: 'environment', text: 'Environment: Checking...', color: '#f39c12' },
    { id: 'supabase', text: 'Supabase Connection: Checking...', color: '#e74c3c' },
    { id: 'url', text: 'URL: ...', color: '#2ecc71' }
  ];

  statuses.forEach(status => {
    const statusEl = document.createElement('div');
    statusEl.id = status.id;
    statusEl.textContent = status.text;
    statusEl.style.margin = '2px 0';
    statusEl.style.padding = '2px 5px';
    statusEl.style.borderLeft = `3px solid ${status.color}`;
    statusContainer.appendChild(statusEl);
  });

  // Update environment status
  setTimeout(() => {
    const envStatus = document.getElementById('environment');
    if (window.ENV && window.ENV.SUPABASE_DATABASE_URL) {
      envStatus.textContent = 'Environment: Configured';
      envStatus.style.borderLeft = '3px solid #2ecc71';
    } else {
      envStatus.textContent = 'Environment: Not configured';
      envStatus.style.borderLeft = '3px solid #e74c3c';
    }
  }, 500);

  // Update Supabase connection status
  setTimeout(() => {
    const supabaseStatus = document.getElementById('supabase');
    if (window.supabaseClient && supabaseClient.isAvailable()) {
      supabaseStatus.textContent = 'Supabase Connection: Active';
      supabaseStatus.style.borderLeft = '3px solid #2ecc71';
    } else {
      supabaseStatus.textContent = 'Supabase Connection: Inactive';
      supabaseStatus.style.borderLeft = '3px solid #e74c3c';
    }
  }, 1000);

  // Update URL status
  const urlStatus = document.getElementById('url');
  urlStatus.textContent = `URL: ${window.location.href}`;

  // Update connection status
  const connectionStatus = document.getElementById('connection');
  connectionStatus.textContent = 'Connection status: Online';
});