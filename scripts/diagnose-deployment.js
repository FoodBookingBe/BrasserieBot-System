/**
 * BrasserieBot Deployment Diagnostic Tool
 * 
 * This script checks the deployment configuration and identifies potential issues.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define paths
const ROOT_DIR = path.join(__dirname, '..');
const FRONTEND_DIR = path.join(ROOT_DIR, 'frontend');
const PUBLIC_DIR = path.join(FRONTEND_DIR, 'public');
const GITHUB_WORKFLOWS_DIR = path.join(ROOT_DIR, '.github', 'workflows');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  purple: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Log functions
const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}=== ${msg} ===${colors.reset}`),
};

// Helper functions
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    log.error(`Could not read file: ${filePath}`);
    return null;
  }
}

function executeCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8' });
  } catch (error) {
    return { error: error.message || 'Unknown error' };
  }
}

// Check package.json scripts
function checkPackageJsonScripts() {
  log.section('Checking package.json scripts');
  
  const packageJsonPath = path.join(ROOT_DIR, 'package.json');
  if (!fileExists(packageJsonPath)) {
    log.error('package.json not found in the root directory');
    return false;
  }
  
  const packageJson = JSON.parse(readFile(packageJsonPath));
  const scripts = packageJson.scripts || {};
  
  // Check for required scripts
  const requiredScripts = [
    'validate',
    'process-html',
    'optimize-db'
  ];
  
  let allScriptsFound = true;
  
  for (const script of requiredScripts) {
    if (scripts[script]) {
      log.success(`Found required script: ${script} => ${scripts[script]}`);
    } else {
      log.error(`Missing required script: ${script}`);
      allScriptsFound = false;
    }
  }
  
  return allScriptsFound;
}

// Check Supabase integration
function checkSupabaseIntegration() {
  log.section('Checking Supabase integration');
  
  const supabaseClientPath = path.join(PUBLIC_DIR, 'supabase-client.js');
  const environmentJsPath = path.join(PUBLIC_DIR, 'environment.js');
  
  if (!fileExists(supabaseClientPath)) {
    log.error('supabase-client.js not found');
    return false;
  }
  
  if (!fileExists(environmentJsPath)) {
    log.error('environment.js not found');
    return false;
  }
  
  // Check if environment.js contains proper structure
  const envJs = readFile(environmentJsPath);
  if (!envJs.includes('window.ENV')) {
    log.error('environment.js does not define window.ENV object');
    return false;
  }
  
  if (!envJs.includes('SUPABASE_DATABASE_URL') || !envJs.includes('SUPABASE_ANON_KEY')) {
    log.error('environment.js missing required Supabase credentials');
    return false;
  }
  
  // Check if actual credentials are in place (not placeholders)
  if (envJs.includes('{{SUPABASE_DATABASE_URL}}') || envJs.includes('{{SUPABASE_ANON_KEY}}')) {
    log.warning('environment.js contains placeholders instead of actual credentials');
  } else {
    log.success('environment.js contains Supabase credentials');
  }
  
  // Check for Supabase script inclusion in HTML files
  const htmlFiles = fs.readdirSync(PUBLIC_DIR).filter(file => file.endsWith('.html'));
  
  for (const htmlFile of htmlFiles) {
    const htmlContent = readFile(path.join(PUBLIC_DIR, htmlFile));
    
    if (!htmlContent.includes('supabase-client.js')) {
      log.error(`${htmlFile} does not include supabase-client.js`);
    } else if (!htmlContent.includes('environment.js')) {
      log.error(`${htmlFile} does not include environment.js`);
    } else {
      log.success(`${htmlFile} includes all required Supabase scripts`);
    }
  }
  
  return true;
}

// Check GitHub Actions workflow
function checkGitHubActions() {
  log.section('Checking GitHub Actions configuration');
  
  const workflowPath = path.join(GITHUB_WORKFLOWS_DIR, 'deploy.yml');
  
  if (!fileExists(workflowPath)) {
    log.error('GitHub Actions workflow file not found');
    return false;
  }
  
  const workflow = readFile(workflowPath);
  
  // Check if workflow has the required jobs
  const requiredJobs = ['validate', 'database', 'deploy-frontend'];
  let allJobsFound = true;
  
  for (const job of requiredJobs) {
    if (!workflow.includes(job + ':')) {
      log.error(`Workflow missing required job: ${job}`);
      allJobsFound = false;
    } else {
      log.success(`Workflow contains required job: ${job}`);
    }
  }
  
  // Check if secrets are referenced correctly
  const requiredSecrets = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NETLIFY_AUTH_TOKEN',
    'NETLIFY_SITE_ID'
  ];
  
  for (const secret of requiredSecrets) {
    if (!workflow.includes(`secrets.${secret}`)) {
      log.error(`Workflow not referencing required secret: ${secret}`);
    } else {
      log.success(`Workflow references required secret: ${secret}`);
    }
  }
  
  return allJobsFound;
}

// Check Netlify configuration
function checkNetlifyConfig() {
  log.section('Checking Netlify configuration');
  
  const rootNetlifyTomlPath = path.join(ROOT_DIR, 'netlify.toml');
  const frontendNetlifyTomlPath = path.join(FRONTEND_DIR, 'netlify.toml');
  
  if (!fileExists(rootNetlifyTomlPath)) {
    log.error('Root netlify.toml not found');
    return false;
  }
  
  const rootNetlifyToml = readFile(rootNetlifyTomlPath);
  
  // Check if netlify.toml has correct publish directory
  if (!rootNetlifyToml.includes('frontend/public')) {
    log.error('Root netlify.toml does not specify frontend/public as publish directory');
    return false;
  }
  
  // Check redirects
  if (!rootNetlifyToml.includes('[[redirects]]')) {
    log.warning('Root netlify.toml does not have redirects configuration');
  }
  
  log.success('Root netlify.toml configured correctly');
  
  // Check frontend netlify.toml if it exists
  if (fileExists(frontendNetlifyTomlPath)) {
    log.info('Frontend netlify.toml exists (will be overridden by root config)');
  }
  
  return true;
}

// Check for required HTML files
function checkRequiredHtmlFiles() {
  log.section('Checking required HTML files');
  
  const requiredFiles = [
    'index.html',
    'login.html',
    'dashboard-final.html'
  ];
  
  let allFilesExist = true;
  
  for (const file of requiredFiles) {
    const filePath = path.join(PUBLIC_DIR, file);
    if (fileExists(filePath)) {
      log.success(`Required file exists: ${file}`);
    } else {
      log.error(`Required file missing: ${file}`);
      allFilesExist = false;
    }
  }
  
  return allFilesExist;
}

// Check authentication implementation
function checkAuthImplementation() {
  log.section('Checking authentication implementation');
  
  const authJsPath = path.join(PUBLIC_DIR, 'auth.js');
  const improvedAuthJsPath = path.join(PUBLIC_DIR, 'improved-auth.js');
  
  if (!fileExists(authJsPath)) {
    log.error('auth.js not found');
    return false;
  }
  
  if (fileExists(improvedAuthJsPath)) {
    log.success('Found improved-auth.js');
    
    // Check if HTML files include improved-auth.js
    const htmlFiles = fs.readdirSync(PUBLIC_DIR).filter(file => file.endsWith('.html'));
    let anyFileUsesImprovedAuth = false;
    
    for (const htmlFile of htmlFiles) {
      const htmlContent = readFile(path.join(PUBLIC_DIR, htmlFile));
      
      if (htmlContent.includes('improved-auth.js')) {
        log.success(`${htmlFile} uses improved-auth.js`);
        anyFileUsesImprovedAuth = true;
      }
    }
    
    if (!anyFileUsesImprovedAuth) {
      log.warning('No HTML files include improved-auth.js - it is not being used');
    }
  } else {
    log.warning('improved-auth.js not found (using basic auth.js only)');
  }
  
  return true;
}

// Run all checks
function runAllChecks() {
  log.section('Starting BrasserieBot Deployment Diagnostic Tool');
  
  const results = [
    checkPackageJsonScripts(),
    checkSupabaseIntegration(),
    checkGitHubActions(),
    checkNetlifyConfig(),
    checkRequiredHtmlFiles(),
    checkAuthImplementation()
  ];
  
  const allPassed = results.every(result => result);
  
  log.section('Diagnostic Summary');
  if (allPassed) {
    log.success('All checks passed! Deployment configuration looks correct.');
  } else {
    log.error('Some checks failed. Review the logs above and fix the issues.');
  }
  
  log.info('\nRecommendations:');
  log.info('1. Ensure Supabase credentials are correctly set in all environments');
  log.info('2. Check that GitHub secrets are properly configured');
  log.info('3. Update all HTML files to use the improved authentication system');
  log.info('4. Test the frontend locally before deploying');
  log.info('5. Look at browser console logs for further debugging information');
}

// Execute the tool
runAllChecks();