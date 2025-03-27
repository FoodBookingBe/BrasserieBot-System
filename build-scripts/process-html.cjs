const fs = require('fs');
const path = require('path');

/**
 * Process HTML files to replace environment variable placeholders
 * This script is used by Netlify during the build process
 */

// Define the directory to process
const directoryPath = path.join(__dirname, '..', 'frontend', 'public');

// Get environment variables from process.env
const supabaseUrl = process.env.SUPABASE_DATABASE_URL || 'https://yucpwawshjmonwsgvsfq.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'missing-anon-key';

console.log('Processing HTML files in:', directoryPath);
console.log('Environment variables:');
console.log(`- SUPABASE_DATABASE_URL: ${supabaseUrl.replace(/^https:\/\//, '').substring(0, 8)}...`); // Only show part for security
console.log(`- SUPABASE_ANON_KEY: ${supabaseAnonKey.substring(0, 5)}...`); // Only show part for security

// Process all HTML files in the directory
function processDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
            // Recursively process subdirectories
            processDirectory(filePath);
        } else if (file.endsWith('.html')) {
            // Process HTML files
            processHtmlFile(filePath);
        }
    });
}

// Replace placeholders in HTML file
function processHtmlFile(filePath) {
    console.log(`Processing file: ${filePath}`);
    
    try {
        // Read the file
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Replace placeholders
        content = content.replace(/{{SUPABASE_DATABASE_URL}}/g, supabaseUrl);
        content = content.replace(/{{SUPABASE_ANON_KEY}}/g, supabaseAnonKey);
        
        // Write the file back
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Successfully processed: ${path.basename(filePath)}`);
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error);
    }
}

// Start processing
processDirectory(directoryPath);
console.log('HTML processing complete!');