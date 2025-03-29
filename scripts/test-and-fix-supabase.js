// Test and Fix Supabase Connection
const fs = require('fs');
const path = require('path');

// Configuration
const SUPABASE_URL = 'https://yucpwawshjmonwsgvsfq.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1Y3B3YXdzaGptb253c2d2c2ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwODM1NzQsImV4cCI6MjA1ODY1OTU3NH0.L5eKYyXAqjkze2_LhnHgEbAURMRt7r2q0ITI6hhktJ0';

// Paths to update
const frontendDir = path.join(__dirname, '..', 'frontend');
const publicDir = path.join(frontendDir, 'public');
const supabaseClientPath = path.join(publicDir, 'supabase-client.js');

console.log('BrasserieBot Supabase Connection Fixer');
console.log('---------------------------------');
console.log(`Using Supabase URL: ${SUPABASE_URL}`);
console.log(`Using Supabase Key: ${SUPABASE_KEY.substring(0, 15)}...`);

// 1. Fix supabase-client.js
console.log('\n1. Fixing supabase-client.js...');
try {
  let content = fs.readFileSync(supabaseClientPath, 'utf8');
  
  // Replace placeholders with actual values
  content = content.replace(/const SUPABASE_DATABASE_URL = "{{SUPABASE_DATABASE_URL}}";/g, 
    `const SUPABASE_DATABASE_URL = "${SUPABASE_URL}";`);
    
  content = content.replace(/const SUPABASE_ANON_KEY = "{{SUPABASE_ANON_KEY}}";/g, 
    `const SUPABASE_ANON_KEY = "${SUPABASE_KEY}";`);
    
  fs.writeFileSync(supabaseClientPath, content, 'utf8');
  console.log('✅ supabase-client.js updated successfully');
} catch (error) {
  console.error('❌ Error updating supabase-client.js:', error);
}

// 2. Create environment.js file with window.ENV values
console.log('\n2. Creating environment.js file...');
try {
  const envJsPath = path.join(publicDir, 'environment.js');
  const envJsContent = `// Auto-generated environment configuration
window.ENV = {
  SUPABASE_DATABASE_URL: '${SUPABASE_URL}',
  SUPABASE_ANON_KEY: '${SUPABASE_KEY}'
};
console.log('Environment loaded: ', window.ENV.SUPABASE_DATABASE_URL);`;

  fs.writeFileSync(envJsPath, envJsContent, 'utf8');
  console.log('✅ environment.js created successfully');
} catch (error) {
  console.error('❌ Error creating environment.js:', error);
}

// 3. Update all HTML files to include environment.js
console.log('\n3. Updating HTML files to include environment.js...');
try {
  const htmlFiles = fs.readdirSync(publicDir).filter(file => file.endsWith('.html'));
  
  for (const htmlFile of htmlFiles) {
    const htmlPath = path.join(publicDir, htmlFile);
    let content = fs.readFileSync(htmlPath, 'utf8');
    
    // Check if environment.js is already included
    if (!content.includes('environment.js')) {
      // Add environment.js before the first script tag
      content = content.replace(/<script/, '<script src="environment.js"></script>\n    <script');
      fs.writeFileSync(htmlPath, content, 'utf8');
      console.log(`✅ Updated ${htmlFile}`);
    } else {
      console.log(`ℹ️ ${htmlFile} already includes environment.js`);
    }
  }
} catch (error) {
  console.error('❌ Error updating HTML files:', error);
}

console.log('\n---------------------------------');
console.log('✅ All fixes applied successfully!');
console.log('\nPlease open one of the HTML files in your browser to test the connection.');
console.log('You can also run "npm run process-html" to process all HTML files with the new environment variables.');