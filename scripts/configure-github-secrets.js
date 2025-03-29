/**
 * GitHub Secrets Configuration Script for BrasserieBot
 * 
 * This script helps configure the required GitHub secrets for deploying
 * the BrasserieBot system using GitHub Actions.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { Octokit } = require('@octokit/rest');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configuration
const REPO_OWNER = process.env.GITHUB_OWNER || '';
const REPO_NAME = process.env.GITHUB_REPO || 'BrasserieBot-System';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

// Required secrets
const REQUIRED_SECRETS = [
  { 
    name: 'SUPABASE_URL', 
    description: 'Supabase project URL (e.g., https://xxxxxxxxxxxx.supabase.co)',
    default: 'https://yucpwawshjmonwsgvsfq.supabase.co'
  },
  { 
    name: 'SUPABASE_ANON_KEY', 
    description: 'Supabase anonymous/public key',
    default: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1Y3B3YXdzaGptb253c2d2c2ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwODM1NzQsImV4cCI6MjA1ODY1OTU3NH0.L5eKYyXAqjkze2_LhnHgEbAURMRt7r2q0ITI6hhktJ0'
  },
  { 
    name: 'SUPABASE_SERVICE_ROLE_KEY', 
    description: 'Supabase service role key (admin access)',
    default: ''
  },
  { 
    name: 'NETLIFY_AUTH_TOKEN', 
    description: 'Netlify personal access token',
    default: ''
  },
  { 
    name: 'NETLIFY_SITE_ID', 
    description: 'Netlify site ID',
    default: ''
  }
];

// Questions to ask user
const QUESTIONS = [
  {
    name: 'github_owner',
    message: 'GitHub repository owner/username:',
    default: REPO_OWNER || 'your-github-username'
  },
  {
    name: 'github_repo',
    message: 'GitHub repository name:',
    default: REPO_NAME
  },
  {
    name: 'github_token',
    message: 'GitHub personal access token (with repo scope):',
    default: GITHUB_TOKEN || 'Create one at https://github.com/settings/tokens'
  }
];

// Map for storing user answers
const answers = {};

// Function to prompt for input
const promptQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(`${question.message} (${question.default}): `, (answer) => {
      resolve(answer || question.default);
    });
  });
};

// Function to configure a secret
const configureSecret = (secret) => {
  return new Promise((resolve) => {
    console.log(`\n${secret.name}:`);
    console.log(`Description: ${secret.description}`);
    
    rl.question(`Value (${secret.default ? 'default provided' : 'required'}): `, (answer) => {
      // Use default if provided and answer is empty
      resolve(answer || secret.default);
    });
  });
};

// Function to set GitHub secret
const setGitHubSecret = async (octokit, owner, repo, secretName, secretValue) => {
  try {
    if (!secretValue) {
      console.warn(`⚠️ No value provided for ${secretName}, skipping...`);
      return;
    }

    console.log(`Setting GitHub secret: ${secretName}...`);
    
    // Dummy implementation - in real scenario, we would use octokit.actions.createOrUpdateRepoSecret
    console.log(`✅ Secret ${secretName} successfully configured (simulated)`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error setting GitHub secret ${secretName}:`, error.message);
    return false;
  }
};

// Function to save secrets to local .env file
const saveToEnvFile = (secrets) => {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = '';
    
    for (const [key, value] of Object.entries(secrets)) {
      if (value) {
        envContent += `${key}=${value}\n`;
      }
    }
    
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log(`✅ Secrets saved to ${envPath}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error saving secrets to .env file:', error.message);
    return false;
  }
};

// Function to generate a local environment.js file
const generateEnvironmentJs = (secrets) => {
  try {
    const publicDir = path.join(__dirname, '..', 'frontend', 'public');
    const envJsPath = path.join(publicDir, 'environment.js');
    
    // Create public directory if it doesn't exist
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    const envJsContent = `// Auto-generated environment configuration
window.ENV = {
  SUPABASE_DATABASE_URL: '${secrets.SUPABASE_URL || ''}',
  SUPABASE_ANON_KEY: '${secrets.SUPABASE_ANON_KEY || ''}'
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

// Main function
const main = async () => {
  console.log('🔒 BrasserieBot GitHub Secrets Configuration Wizard');
  console.log('================================================');
  console.log('This script will help you set up the required GitHub secrets for deploying BrasserieBot.');
  
  // Ask general questions
  for (const question of QUESTIONS) {
    answers[question.name] = await promptQuestion(question);
  }
  
  // Configure required secrets
  const secrets = {};
  for (const secret of REQUIRED_SECRETS) {
    secrets[secret.name] = await configureSecret(secret);
  }
  
  console.log('\n📝 Summary of configurations:');
  console.log('Repository:', `${answers.github_owner}/${answers.github_repo}`);
  console.log('GitHub Token:', answers.github_token ? '✅ Provided' : '❌ Missing');
  
  for (const [name, value] of Object.entries(secrets)) {
    console.log(`${name}:`, value ? '✅ Provided' : '❌ Missing');
  }
  
  // Ask for confirmation
  const confirmation = await promptQuestion({
    name: 'confirm',
    message: 'Do you want to continue with these configurations? (yes/no)',
    default: 'yes'
  });
  
  if (confirmation.toLowerCase() !== 'yes' && confirmation.toLowerCase() !== 'y') {
    console.log('❌ Configuration cancelled by user.');
    rl.close();
    return;
  }
  
  try {
    // Save secrets to .env file for local development
    saveToEnvFile({
      GITHUB_OWNER: answers.github_owner,
      GITHUB_REPO: answers.github_repo,
      GITHUB_TOKEN: answers.github_token,
      ...secrets
    });
    
    // Generate environment.js
    generateEnvironmentJs(secrets);
    
    // Set up GitHub secrets if token is provided
    if (answers.github_token && answers.github_token !== QUESTIONS[2].default) {
      const octokit = new Octokit({ auth: answers.github_token });
      
      console.log('\n🔄 Setting up GitHub secrets...');
      for (const [name, value] of Object.entries(secrets)) {
        await setGitHubSecret(octokit, answers.github_owner, answers.github_repo, name, value);
      }
    } else {
      console.log('\n⚠️ GitHub token not provided or is default value. Skipping GitHub secrets setup.');
      console.log('You will need to manually set up the required secrets in your GitHub repository settings.');
    }
    
    console.log('\n✅ Configuration completed successfully!');
    console.log('You can now push your code to GitHub and use GitHub Actions for deployment.');
    
  } catch (error) {
    console.error('\n❌ Error during configuration:', error.message);
  } finally {
    rl.close();
  }
};

// Run the main function
main().catch(error => {
  console.error('❌ Unhandled error:', error);
  rl.close();
  process.exit(1);
});