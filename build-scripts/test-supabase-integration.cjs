const fs = require('fs');
const path = require('path');

/**
 * Test script to verify Supabase integration setup
 * This script checks if placeholder replacement works correctly
 */

console.log('Supabase Integration Test Script');
console.log('--------------------------------');

// Define paths
const publicDir = path.join(__dirname, '..', 'frontend', 'public');
const supabaseHtmlPath = path.join(publicDir, 'supabase-test.html');
const supabaseClientPath = path.join(publicDir, 'supabase-client.js');

// Test values for replacement
const TEST_SUPABASE_URL = 'https://test-supabase-url.supabase.co';
const TEST_SUPABASE_KEY = 'test-supabase-key-for-verification';

// Check if files exist
console.log('Checking required files:');
console.log(`- supabase-test.html: ${fs.existsSync(supabaseHtmlPath) ? 'Found ✓' : 'Missing ✗'}`);
console.log(`- supabase-client.js: ${fs.existsSync(supabaseClientPath) ? 'Found ✓' : 'Missing ✗'}`);

// Check the content of HTML file
if (fs.existsSync(supabaseHtmlPath)) {
    const htmlContent = fs.readFileSync(supabaseHtmlPath, 'utf8');
    console.log('\nChecking supabase-test.html:');
    
    // Check for placeholders
    const hasUrlPlaceholder = htmlContent.includes('{{SUPABASE_DATABASE_URL}}');
    const hasKeyPlaceholder = htmlContent.includes('{{SUPABASE_ANON_KEY}}');
    
    console.log(`- URL placeholder: ${hasUrlPlaceholder ? 'Found ✓' : 'Missing ✗'}`);
    console.log(`- Key placeholder: ${hasKeyPlaceholder ? 'Found ✓' : 'Missing ✗'}`);
    
    // Create a test copy with replacements
    const tempHtmlPath = path.join(__dirname, 'test-supabase.html');
    let processedHtml = htmlContent;
    processedHtml = processedHtml.replace(/{{SUPABASE_DATABASE_URL}}/g, TEST_SUPABASE_URL);
    processedHtml = processedHtml.replace(/{{SUPABASE_ANON_KEY}}/g, TEST_SUPABASE_KEY);
    
    fs.writeFileSync(tempHtmlPath, processedHtml, 'utf8');
    console.log(`- Created test file: ${tempHtmlPath}`);
    
    // Verify replacement
    const testHtmlContent = fs.readFileSync(tempHtmlPath, 'utf8');
    const hasTestUrl = testHtmlContent.includes(TEST_SUPABASE_URL);
    const hasTestKey = testHtmlContent.includes(TEST_SUPABASE_KEY);
    
    console.log(`- URL replacement: ${hasTestUrl ? 'Success ✓' : 'Failed ✗'}`);
    console.log(`- Key replacement: ${hasTestKey ? 'Success ✓' : 'Failed ✗'}`);
}

// Check the content of client JS file
if (fs.existsSync(supabaseClientPath)) {
    const jsContent = fs.readFileSync(supabaseClientPath, 'utf8');
    console.log('\nChecking supabase-client.js:');
    
    // Check for placeholders
    const hasUrlPlaceholder = jsContent.includes('{{SUPABASE_DATABASE_URL}}');
    const hasKeyPlaceholder = jsContent.includes('{{SUPABASE_ANON_KEY}}');
    
    console.log(`- URL placeholder: ${hasUrlPlaceholder ? 'Found ✓' : 'Missing ✗'}`);
    console.log(`- Key placeholder: ${hasKeyPlaceholder ? 'Found ✓' : 'Missing ✗'}`);
    
    // Create a test copy with replacements
    const tempJsPath = path.join(__dirname, 'test-supabase-client.js');
    let processedJs = jsContent;
    processedJs = processedJs.replace(/{{SUPABASE_DATABASE_URL}}/g, TEST_SUPABASE_URL);
    processedJs = processedJs.replace(/{{SUPABASE_ANON_KEY}}/g, TEST_SUPABASE_KEY);
    
    fs.writeFileSync(tempJsPath, processedJs, 'utf8');
    console.log(`- Created test file: ${tempJsPath}`);
    
    // Verify replacement
    const testJsContent = fs.readFileSync(tempJsPath, 'utf8');
    const hasTestUrl = testJsContent.includes(TEST_SUPABASE_URL);
    const hasTestKey = testJsContent.includes(TEST_SUPABASE_KEY);
    
    console.log(`- URL replacement: ${hasTestUrl ? 'Success ✓' : 'Failed ✗'}`);
    console.log(`- Key replacement: ${hasTestKey ? 'Success ✓' : 'Failed ✗'}`);
}

// Test whether netlify.toml is properly configured
const netlifyTomlPath = path.join(__dirname, '..', 'netlify.toml');
if (fs.existsSync(netlifyTomlPath)) {
    const tomlContent = fs.readFileSync(netlifyTomlPath, 'utf8');
    console.log('\nChecking netlify.toml:');
    
    // Check if the build command points to our script
    const hasBuildCommand = tomlContent.includes('node build-scripts/process-html.cjs');
    const hasSupabaseEnv = tomlContent.includes('SUPABASE_DATABASE_URL') && tomlContent.includes('SUPABASE_ANON_KEY');
    
    console.log(`- Build command: ${hasBuildCommand ? 'Correct ✓' : 'Incorrect ✗'}`);
    console.log(`- Supabase env vars: ${hasSupabaseEnv ? 'Found ✓' : 'Missing ✗'}`);
}

console.log('\nTest completed. If all checks passed, your Supabase integration should work correctly on Netlify.');