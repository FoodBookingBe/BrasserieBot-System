/**
 * HTML Processing Script voor BrasserieBot
 * 
 * Dit script vervangt placeholders in HTML-bestanden met echte waarden uit omgevingsvariabelen
 * voorafgaand aan implementatie op Netlify.
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Laad environment variables
dotenv.config();

// Directory met HTML-bestanden
const publicDir = path.join(__dirname, '..', 'frontend', 'public');

// Omgevingsvariabelen die we willen injecteren
const environmentVars = {
  'SUPABASE_DATABASE_URL': process.env.SUPABASE_DATABASE_URL || '',
  'SUPABASE_ANON_KEY': process.env.SUPABASE_ANON_KEY || ''
};

// Doorloop alle HTML-bestanden in de public directory
const processFiles = (directory) => {
  const files = fs.readdirSync(directory);
  
  files.forEach(file => {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recursief verwerken van submappen
      processFiles(filePath);
    } else if (file.endsWith('.html') || file.endsWith('.js')) {
      console.log(`Verwerken van bestand: ${filePath}`);
      
      // Lees bestandsinhoud
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Vervang placeholders
      Object.keys(environmentVars).forEach(key => {
        const placeholder = `{{${key}}}`;
        const value = environmentVars[key];
        
        // Vervang alle voorkomens van de placeholder
        content = content.split(placeholder).join(value);
      });
      
      // Schrijf aangepaste inhoud terug naar bestand
      fs.writeFileSync(filePath, content, 'utf8');
    }
  });
};

// Start processing
console.log('Start verwerking van HTML-bestanden voor deployment...');
processFiles(publicDir);
console.log('HTML-processing voltooid!');