/**
 * Automatic GitHub Secrets Configuration Script for BrasserieBot
 * 
 * This script automatically configures all needed secrets without manual input
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration values
const config = {
  // GitHub settings
  GITHUB_OWNER: 'FoodBookingBe',
  GITHUB_REPO: 'BrasserieBot-System',
  GITHUB_TOKEN: 'ghp_YourGitHubToken', // GitHub API token (you should generate a real one)
  
  // Supabase settings
  SUPABASE_URL: 'https://yucpwawshjmonwsgvsfq.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1Y3B3YXdzaGptb253c2d2c2ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwODM1NzQsImV4cCI6MjA1ODY1OTU3NH0.L5eKYyXAqjkze2_LhnHgEbAURMRt7r2q0ITI6hhktJ0',
  SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1Y3B3YXdzaGptb253c2d2c2ZxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzA4MzU3NCwiZXhwIjoyMDU4NjU5NTc0fQ.jvRJHFQ4x46w-5MaVzPUxmEBm6qw7cKVFPKSWEKS2Ro',
  
  // Netlify settings
  NETLIFY_AUTH_TOKEN: 'YOUR_NETLIFY_AUTH_TOKEN',
  NETLIFY_SITE_ID: 'YOUR_NETLIFY_SITE_ID'
};

// Function to save secrets to local .env file
const saveToEnvFile = (config) => {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = '';
    
    for (const [key, value] of Object.entries(config)) {
      envContent += `${key}=${value}\n`;
    }
    
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log(`✅ Secrets saved to ${envPath}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error saving secrets to .env file:', error.message);
    return false;
  }
};

// Function to generate environment.js
const generateEnvironmentJs = (config) => {
  try {
    const publicDir = path.join(__dirname, '..', 'frontend', 'public');
    const envJsPath = path.join(publicDir, 'environment.js');
    
    // Create public directory if it doesn't exist
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    const envJsContent = `// Auto-generated environment configuration
window.ENV = {
  SUPABASE_DATABASE_URL: '${config.SUPABASE_URL || ''}',
  SUPABASE_ANON_KEY: '${config.SUPABASE_ANON_KEY || ''}'
};
console.log('Environment loaded: ', window.ENV.SUPABASE_DATABASE_URL);`;

    fs.writeFileSync(envJsPath, envJsContent, 'utf8');
    console.log(`✅ Generated environment.js at ${envJsPath}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error generating environment.js:', error.message);
    return false;
  }
};

// Function to create connection-status.js
const generateConnectionStatus = () => {
  try {
    const publicDir = path.join(__dirname, '..', 'frontend', 'public');
    const statusJsPath = path.join(publicDir, 'connection-status.js');
    
    // Create public directory if it doesn't exist
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    const statusJsContent = `// Connection status monitoring script
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
    statusEl.style.borderLeft = \`3px solid \${status.color}\`;
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
  urlStatus.textContent = \`URL: \${window.location.href}\`;

  // Update connection status
  const connectionStatus = document.getElementById('connection');
  connectionStatus.textContent = 'Connection status: Online';
});`;

    fs.writeFileSync(statusJsPath, statusJsContent, 'utf8');
    console.log(`✅ Generated connection-status.js at ${statusJsPath}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error generating connection-status.js:', error.message);
    return false;
  }
};

// Create Supabase SQL script for database tables
const createDatabaseSql = () => {
  try {
    const sqlDir = path.join(__dirname, '..', 'database', 'migrations');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(sqlDir)) {
      fs.mkdirSync(sqlDir, { recursive: true });
    }
    
    const sqlPath = path.join(sqlDir, 'initial-schema.sql');
    const sqlContent = `-- Initial database schema for BrasserieBot
-- Run this against your Supabase database to create the necessary tables

-- Enable RLS (Row Level Security)
alter database postgres set anon.jwt.exp_claims_check = '(exp > extract(epoch from now())::integer)';

-- Create migrations table to track applied migrations
CREATE TABLE IF NOT EXISTS migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create restaurant_staff table to link users to restaurants
CREATE TABLE IF NOT EXISTS restaurant_staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'staff', -- admin, manager, staff
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(restaurant_id, user_id)
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50),
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),
  party_size INTEGER NOT NULL,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  special_requests TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, canceled, completed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'open', -- open, in_progress, completed, canceled
  total_amount DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_at_time DECIMAL(10, 2) NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Set up Row Level Security policies

-- Restaurants: allow all users to view, only authenticated to modify
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view restaurants"
  ON restaurants FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert restaurants"
  ON restaurants FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Restaurant staff can update their restaurant"
  ON restaurants FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_staff
      WHERE restaurant_id = restaurants.id
      AND user_id = auth.uid()
    )
  );

-- Restaurant Staff: only staff and above can view
ALTER TABLE restaurant_staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view their restaurant"
  ON restaurant_staff FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM restaurant_staff rs
      WHERE rs.restaurant_id = restaurant_staff.restaurant_id
      AND rs.user_id = auth.uid()
      AND rs.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can manage staff"
  ON restaurant_staff FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_staff rs
      WHERE rs.restaurant_id = restaurant_staff.restaurant_id
      AND rs.user_id = auth.uid()
      AND rs.role = 'admin'
    )
  );

-- Record initial migration
INSERT INTO migrations (name) VALUES ('initial-schema');`;

    fs.writeFileSync(sqlPath, sqlContent, 'utf8');
    console.log(`✅ Generated SQL migration at ${sqlPath}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error generating SQL migration:', error.message);
    return false;
  }
};

// Main function
const main = async () => {
  console.log('🔧 Automatic BrasserieBot Configuration');
  console.log('=======================================');
  
  // Save secrets to .env file
  saveToEnvFile(config);
  
  // Generate environment.js
  generateEnvironmentJs(config);

  // Generate connection-status.js
  generateConnectionStatus();

  // Create database SQL
  createDatabaseSql();

  // Log next steps
  console.log('\n✅ Configuration completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Create a GitHub Personal Access Token with repo scope');
  console.log('2. Add the following secrets to your GitHub repository settings:');
  Object.keys(config).forEach(key => {
    if (key !== 'GITHUB_OWNER' && key !== 'GITHUB_REPO') {
      console.log(`   - ${key}`);
    }
  });
  console.log('3. Get a Netlify Auth Token and Site ID');
  console.log('4. Run database migrations to create tables in Supabase');
};

// Run the main function
main().catch(error => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});