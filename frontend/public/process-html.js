/**
 * Netlify Build Script
 * Vervangt {{VARIABELE}} plaatshouders in HTML bestanden met waarden uit Netlify omgeving
 */

// Omdat dit een Node.js build script is, gebruiken we ES modules syntax
import * as fs from 'fs';
import * as path from 'path';

// Directory om te scannen voor HTML bestanden
const directoryPath = './frontend/public';

// Variabelen die vervangen moeten worden
const variables = {
    'SUPABASE_URL': process.env.SUPABASE_URL || '',
    'SUPABASE_ANON_KEY': process.env.SUPABASE_ANON_KEY || ''
};

// Functie om plaatshouders te vervangen in een bestand
function processFile(filePath) {
    try {
        console.log(`Verwerken van bestand: ${filePath}`);
        
        // Lees het bestand
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        
        // Vervang alle plaatshouders
        Object.keys(variables).forEach(key => {
            const placeholder = `{{${key}}}`;
            const value = variables[key];
            
            content = content.split(placeholder).join(value);
        });
        
        // Controleer of er iets is veranderd
        if (content !== originalContent) {
            // Schrijf het aangepaste bestand terug
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Plaatshouders vervangen in ${filePath}`);
        } else {
            console.log(`Geen plaatshouders gevonden in ${filePath}`);
        }
    } catch (error) {
        console.error(`Fout bij verwerken van ${filePath}:`, error);
    }
}

// Recursief doorlopen van de directory om HTML bestanden te vinden
function processDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            // Recursief doorlopen van subdirectories
            processDirectory(fullPath);
        } else if (stat.isFile() && path.extname(fullPath) === '.html') {
            // Alleen HTML bestanden verwerken
            processFile(fullPath);
        }
    }
}

// Log omgevingsvariabelen (zonder de waarden voor veiligheidsredenen)
console.log('Beschikbare omgevingsvariabelen:');
Object.keys(variables).forEach(key => {
    const value = variables[key];
    console.log(`- ${key}: ${value ? '[waarde ingesteld]' : '[niet ingesteld]'}`);
});

// Start de verwerking
console.log('Start verwerking van HTML bestanden...');
processDirectory(directoryPath);
console.log('Verwerking voltooid.');