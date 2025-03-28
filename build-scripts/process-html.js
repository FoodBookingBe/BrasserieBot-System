// process-html.js - verbeterde versie
const fs = require('fs');
const path = require('path');

// Configuratie
const CONFIG = {
  directories: [
    path.join(__dirname, '..', 'frontend', 'public'),
    path.join(__dirname, '..', 'build-scripts')
  ],
  placeholders: {
    'SUPABASE_DATABASE_URL': {
      envVar: 'SUPABASE_DATABASE_URL',
      fallback: 'https://yucpwawshjmonwsgvsfq.supabase.co',
      mask: true
    },
    'SUPABASE_ANON_KEY': {
      envVar: 'SUPABASE_ANON_KEY',
      fallback: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1Y3B3YXdzaGptb253c2d2c2ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwODM1NzQsImV4cCI6MjA1ODY1OTU3NH0.L5eKYyXAqjkze2_LhnHgEbAURMRt7r2q0ITI6hhktJ0',
      mask: true
    }
  },
  fileExtensions: ['.html', '.js', '.css']
};

// Log configuratie
console.log('HTML Processing Configuration:') ;
console.log(`- Directories: ${CONFIG.directories.length}`);
console.log(`- Placeholders: ${Object.keys(CONFIG.placeholders).join(', ')}`);
console.log(`- File extensions: ${CONFIG.fileExtensions.join(', ')}`);

// Haal environment variabelen op
const getEnvValues = () => {
  const values = {};
  
  for (const [placeholder, config] of Object.entries(CONFIG.placeholders)) {
    const value = process.env[config.envVar] || config.fallback;
    values[placeholder] = value;
    
    // Log met masking voor gevoelige waarden
    if (config.mask) {
      const maskedValue = value.substring(0, 5) + '...' + value.substring(value.length - 3);
      console.log(`- ${config.envVar}: ${maskedValue}`);
    } else {
      console.log(`- ${config.envVar}: ${value}`);
    }
  }
  
  return values;
};

// Verwerk alle bestanden in de opgegeven directories
const processDirectories = (envValues) => {
  for (const directory of CONFIG.directories) {
    console.log(`\nProcessing directory: ${directory}`);
    processDirectory(directory, envValues);
  }
};

// Verwerk een directory recursief
function processDirectory(dirPath, envValues) {
  try {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        // Recursief verwerken van subdirectories
        processDirectory(filePath, envValues);
      } else if (CONFIG.fileExtensions.some(ext => file.endsWith(ext))) {
        // Verwerk bestanden met de juiste extensie
        processFile(filePath, envValues);
      }
    });
  } catch (error) {
    console.error(`❌ Error reading directory ${dirPath}:`, error);
  }
}

// Vervang placeholders in een bestand
function processFile(filePath, envValues) {
  console.log(`Processing file: ${filePath}`);
  
  try {
    // Lees het bestand
    let content = fs.readFileSync(filePath, 'utf8');
    let replacementsMade = false;
    
    // Vervang alle placeholders
    for (const [placeholder, config] of Object.entries(CONFIG.placeholders)) {
      const regex = new RegExp(`{{${placeholder}}}`, 'g');
      if (regex.test(content)) {
        const value = envValues[placeholder];
        content = content.replace(regex, value);
        replacementsMade = true;
        
        // Log replacement (masked if sensitive)
        if (config.mask) {
          const maskedValue = value.substring(0, 5) + '...' + value.substring(value.length - 3);
          console.log(`  - Replaced {{${placeholder}}} with ${maskedValue}`);
        } else {
          console.log(`  - Replaced {{${placeholder}}} with ${value}`);
        }
      }
    }
    
    // Schrijf het bestand alleen terug als er wijzigingen zijn
    if (replacementsMade) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Successfully processed: ${path.basename(filePath)}`);
    } else {
      console.log(`ℹ️ No replacements needed: ${path.basename(filePath)}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
  }
}

// Start de verwerking
const envValues = getEnvValues();
processDirectories(envValues);
console.log('\nHTML processing complete!');

// Export functionaliteit voor gebruik in andere scripts
module.exports = {
  processFile,
  processDirectory,
  getEnvValues
};