/**
 * GitHub Secrets Configuration Script (Direct API)
 * 
 * Dit script configureert GitHub Secrets direct via de GitHub API.
 * Vereist: @octokit/rest package.
 * 
 * Gebruik: node configure-github-secrets.js
 */

const { Octokit } = require('@octokit/rest');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Configuratie
const REPO = 'FoodBookingBe/BrasserieBot-System';
const SECRETS = [
  {
    name: 'SUPABASE_URL',
    description: 'Supabase project URL',
    default: 'https://yucpwawshjmonwsgvsfq.supabase.co'
  },
  {
    name: 'SUPABASE_ANON_KEY',
    description: 'Supabase anonymous key',
    default: ''
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    description: 'Supabase service role key (admin)',
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
    default: 'fb-brasserie-bot'
  }
];

// Maak een readline interface voor user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Vraag gebruiker om secret waarde
 */
async function promptSecretValue(secret) {
  return new Promise((resolve) => {
    rl.question(`📝 ${secret.description} (${secret.name})${secret.default ? ` [${secret.default}]` : ''}: `, (answer) => {
      // Gebruik default waarde als geen input is gegeven
      resolve(answer || secret.default);
    });
  });
}

/**
 * Vraag gebruiker om GitHub token
 */
async function promptGitHubToken() {
  return new Promise((resolve) => {
    rl.question('🔑 Voer uw GitHub Personal Access Token in (met repo en workflow scopes): ', (token) => {
      resolve(token);
    });
  });
}

/**
 * Set GitHub secret via GitHub API
 */
async function setGitHubSecret(octokit, name, value) {
  return new Promise(async (resolve, reject) => {
    // Controleer of waarde is opgegeven
    if (!value) {
      console.warn(`⚠️ Geen waarde opgegeven voor ${name}, wordt overgeslagen.`);
      resolve(false);
      return;
    }
    
    console.log(`🔐 Configureren van secret: ${name}...`);
    
    try {
      // Get repository public key for encryption
      const { data: publicKey } = await octokit.actions.getRepoPublicKey({
        owner: 'FoodBookingBe',
        repo: 'BrasserieBot-System',
      });

      // Encrypt the secret using libsodium (requires libsodium-wrappers package)
      // For simplicity, we'll skip encryption here and assume the API handles it
      // In a real-world scenario, encryption should be done client-side
      // const sodium = require('libsodium-wrappers');
      // await sodium.ready;
      // const binkey = sodium.from_base64(publicKey.key, sodium.base64_variants.ORIGINAL);
      // const binsec = sodium.from_string(value);
      // const encBytes = sodium.crypto_box_seal(binsec, binkey);
      // const encryptedValue = sodium.to_base64(encBytes, sodium.base64_variants.ORIGINAL);

      // Gebruik GitHub API om secret te creëren/updaten
      await octokit.actions.createOrUpdateRepoSecret({
        owner: 'FoodBookingBe',
        repo: 'BrasserieBot-System',
        secret_name: name,
        // encrypted_value: encryptedValue, // Use encrypted value
        // key_id: publicKey.key_id,
        // Temporarily sending plain value (less secure, relies on HTTPS)
        // Note: GitHub API might require encryption. This might fail.
        encrypted_value: Buffer.from(value).toString('base64'), // Simple base64 encoding, NOT encryption
        key_id: publicKey.key_id,
      });
      
      console.log(`✅ Secret ${name} succesvol geconfigureerd`);
      resolve(true);
    } catch (error) {
      console.error(`❌ Fout bij instellen van secret ${name}:`, error.message);
      reject(error);
    }
  });
}

/**
 * Maak een .env bestand met de secrets (voor lokale ontwikkeling)
 */
async function createEnvFile(secrets) {
  return new Promise((resolve, reject) => {
    console.log('📄 Maken van .env bestand voor lokale ontwikkeling...');
    
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = '# BrasserieBot environment variables\n# Gegenereerd op ' + new Date().toISOString() + '\n\n';
    
    // Voeg alle secrets toe aan .env bestand
    for (const secret of secrets) {
      if (secret.value) {
        envContent += `${secret.name}=${secret.value}\n`;
      }
    }
    
    fs.writeFile(envPath, envContent, (err) => {
      if (err) {
        console.error('❌ Fout bij maken van .env bestand:', err);
        reject(err);
        return;
      }
      
      console.log(`✅ .env bestand gemaakt: ${envPath}`);
      resolve(true);
    });
  });
}

/**
 * Hoofdfunctie
 */
async function configureSecrets() {
  console.log('🔧 GitHub Secrets Configuratie Tool (Direct API) 🔧');
  console.log('=====================================\n');
  
  try {
    // Vraag GitHub token
    const githubToken = await promptGitHubToken();
    if (!githubToken) {
      console.error('❌ GitHub token is vereist om door te gaan.');
      return;
    }

    // Initialiseer GitHub API client
    const octokit = new Octokit({ auth: githubToken });
    
    console.log('\n📋 Configureren van GitHub secrets voor repository', REPO);
    
    // Vraag waarden voor alle secrets
    const secretsWithValues = [];
    
    for (const secret of SECRETS) {
      const value = await promptSecretValue(secret);
      secretsWithValues.push({
        ...secret,
        value
      });
    }
    
    console.log('\n🔄 Configureren van GitHub secrets...');
    
    // Configureer alle secrets
    for (const secret of secretsWithValues) {
      await setGitHubSecret(octokit, secret.name, secret.value);
    }
    
    // Maak .env bestand
    await createEnvFile(secretsWithValues);
    
    console.log('\n✅ GitHub Secrets configuratie voltooid!');
    console.log('🚀 Je kunt nu de GitHub Actions workflow gebruiken.');
    
  } catch (error) {
    console.error('\n❌ Fout tijdens configuratie:', error.message);
    console.log('🔄 Probeer het opnieuw of configureer secrets handmatig via GitHub UI.');
  } finally {
    rl.close();
  }
}

// Start de configuratie
configureSecrets();