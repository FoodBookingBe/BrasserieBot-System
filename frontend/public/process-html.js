// Disable ESLint for this file as it's only used in the build process
/* eslint-disable */

// Use CommonJS require which works in all Node.js environments
const fs = require('fs');
const path = require('path');

/**
 * Process HTML files to replace environment variable placeholders
 * This script is used by Netlify during the build process
 */

// Define the directory to process (current directory)
const directoryPath = __dirname;

// Get environment variables from process.env
const supabaseUrl = process.env.SUPABASE_DATABASE_URL || 'https://yucpwawshjmonwsgvsfq.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'missing-anon-key';

console.log('Processing HTML files in:', directoryPath);
console.log('Environment variables:');
console.log(`- SUPABASE_DATABASE_URL: ${supabaseUrl.replace(/^https:\/\//, '').substring(0, 8)}...`);
console.log(`- SUPABASE_ANON_KEY: ${supabaseAnonKey.substring(0, 5)}...`);

// Process all HTML files in the directory
function processDirectory(dirPath) {
    try {
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
            } else if (file === 'supabase-client.js') {
                // Also process the supabase-client.js file
                processHtmlFile(filePath);
            }
        });
    } catch (error) {
        console.error(`Error processing directory ${dirPath}:`, error);
    }
}

// Replace placeholders in HTML or JS file
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