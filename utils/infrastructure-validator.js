// Infrastructure Validation Script
// Dit script valideert en corrigeert de volledige infrastructuur:
// - Supabase database & MCP integratie
// - GitHub repository koppeling
// - Netlify deployment configuratie

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { exec, execSync } = require('child_process');
const { Octokit } = require('@octokit/rest');

// Configuratie
const CONFIG = {
  supabase: {
    url: 'https://yucpwawshjmonwsgvsfq.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1Y3B3YXdzaGptb253c2d2c2ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwODM1NzQsImV4cCI6MjA1ODY1OTU3NH0.L5eKYyXAqjkze2_LhnHgEbAURMRt7r2q0ITI6hhktJ0',
    sqlPath: path.join(__dirname, '..', 'database', 'migrations', 'complete-sql-script.sql')
  },
  github: {
    // Token wordt nu gelezen uit environment variable of gevraagd
    token: process.env.GITHUB_TOKEN, 
    owner: 'FoodBookingBe',
    repo: 'BrasserieBot-System'
  },
  netlify: {
    siteId: process.env.NETLIFY_SITE_ID || 'fb-brasserie-bot',
    token: process.env.NETLIFY_AUTH_TOKEN, // Lees uit environment variable
    configPath: path.join(__dirname, '..', 'netlify.toml')
  },
  mcp: {
    configPath: path.join(process.env.APPDATA || process.env.HOME, 'Code', 'User', 'globalStorage', 'rooveterinaryinc.roo-cline', 'settings', 'mcp_settings.json')
  }
};

// Aanmaken van clients
const supabase = createClient(CONFIG.supabase.url, CONFIG.supabase.key);
let github; // Initialiseer later na token check

// Status tracking
let status = {
  supabase: { status: 'pending', issues: [], fixes: [] },
  github: { status: 'pending', issues: [], fixes: [] },
  netlify: { status: 'pending', issues: [], fixes: [] },
  mcp: { status: 'pending', issues: [], fixes: [] }
};

/**
 * Valideert en corrigeert de Supabase database 
 */
async function validateSupabase() {
  console.log('=== SUPABASE VALIDATIE ===');
  
  try {
    // 1. Test de verbinding
    console.log('Valideren Supabase verbinding...');
    const { data: versionData, error: versionError } = await supabase
      .from('pg_tables')
      .select('*')
      .limit(1);
      
    if (versionError) {
      status.supabase.issues.push('Verbindingsfout: ' + versionError.message);
      status.supabase.status = 'error';
    } else {
      console.log('✅ Supabase verbinding ok');
    }

    // 2. Controleer tabellen
    console.log('Valideren database tabellen...');
    const requiredTables = ['reservations', 'orders', 'menu_items', 'restaurants', 'migrations', 'restaurant_staff'];
    
    for (const table of requiredTables) {
      const { data, error } = await supabase
        .from('pg_tables')
        .select('*')
        .eq('tablename', table)
        .eq('schemaname', 'public');
      
      if (error || !data || data.length === 0) {
        status.supabase.issues.push(`Tabel ontbreekt: ${table}`);
      } else {
        console.log(`✅ Tabel ${table} gevonden`);
      }
    }

    // 3. Controleer RLS policies
    console.log('Valideren RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('schemaname', 'public');
      
    if (policiesError) {
      status.supabase.issues.push('Fout bij ophalen RLS policies: ' + policiesError.message);
    } else if (!policies || policies.length === 0) {
      status.supabase.issues.push('Geen RLS policies gevonden');
    } else {
      console.log(`✅ ${policies.length} RLS policies gevonden`);
    }

    // 4. Controleer indexen
    console.log('Valideren indexen...');
    const { data: indexes, error: indexesError } = await supabase
      .from('pg_indexes')
      .select('*')
      .eq('schemaname', 'public');
      
    if (indexesError) {
      status.supabase.issues.push('Fout bij ophalen indexen: ' + indexesError.message);
    } else if (!indexes || indexes.length === 0) {
      status.supabase.issues.push('Geen indexen gevonden');
    } else {
      console.log(`✅ ${indexes.length} indexen gevonden`);
      
      // Controleer specifieke indexen
      const requiredIndexes = [
        'reservations_restaurant_date_idx',
        'orders_restaurant_status_idx',
        'orders_restaurant_created_idx'
      ];
      
      const missingIndexes = requiredIndexes.filter(
        idx => !indexes.some(i => i.indexname === idx)
      );
      
      if (missingIndexes.length > 0) {
        status.supabase.issues.push(`Ontbrekende indexen: ${missingIndexes.join(', ')}`);
      }
    }

    // 5. Voer het complete script uit als er issues zijn
    if (status.supabase.issues.length > 0) {
      console.log(`❌ ${status.supabase.issues.length} problemen gevonden, SQL script uitvoeren...`);
      
      // Lees het SQL script
      const sqlScript = fs.readFileSync(CONFIG.supabase.sqlPath, 'utf8');
      
      // Voer het SQL script uit via REST API
      try {
        const response = await axios.post(
          `${CONFIG.supabase.url}/rest/v1/sql`,
          { query: sqlScript },
          { 
            headers: {
              'Content-Type': 'application/json',
              'apikey': CONFIG.supabase.key,
              'Authorization': `Bearer ${CONFIG.supabase.key}`
            }
          }
        );
        
        status.supabase.fixes.push('SQL script succesvol uitgevoerd');
        console.log('✅ SQL script uitgevoerd');
      } catch (err) {
        status.supabase.issues.push('Fout bij uitvoeren SQL script: ' + err.message);
        console.error('❌ Fout bij uitvoeren SQL script:', err.message);
      }
    }

    // Finale status
    status.supabase.status = status.supabase.issues.length > 0 ? 
      (status.supabase.fixes.length > 0 ? 'fixed' : 'error') : 
      'ok';
  } catch (error) {
    status.supabase.issues.push('Onverwachte fout: ' + error.message);
    status.supabase.status = 'error';
    console.error('❌ Onverwachte fout bij Supabase validatie:', error);
  }
}

/**
 * Valideert de GitHub integratie
 */
async function validateGitHub() {
  console.log('\n=== GITHUB VALIDATIE ===');
  
  try {
    // 1. Check GitHub token
    if (!CONFIG.github.token) {
      status.github.issues.push('GitHub token niet gevonden (GITHUB_TOKEN environment variable)');
      status.github.status = 'error';
      console.error('❌ GitHub token niet geconfigureerd');
      return;
    }
    
    // Initialiseer GitHub client
    github = new Octokit({ auth: CONFIG.github.token });

    // 2. Test de verbinding
    console.log('Valideren GitHub verbinding...');
    
    try {
      const { data: user } = await github.users.getAuthenticated();
      console.log(`✅ GitHub verbinding ok (${user.login})`);
    } catch (error) {
      status.github.issues.push('Verbindingsfout: ' + error.message);
      status.github.status = 'error';
      console.error('❌ GitHub authenticatie mislukt:', error.message);
      return;
    }

    // 3. Controleer repository
    console.log('Valideren repository...');
    
    try {
      const { data: repo } = await github.repos.get({
        owner: CONFIG.github.owner,
        repo: CONFIG.github.repo
      });
      
      console.log(`✅ Repository gevonden: ${repo.full_name}`);
    } catch (error) {
      status.github.issues.push(`Repository niet gevonden: ${CONFIG.github.owner}/${CONFIG.github.repo}`);
      status.github.status = 'error';
      console.error('❌ Repository niet gevonden:', error.message);
      return;
    }

    // 4. Controleer workflow files
    console.log('Valideren GitHub Actions...');
    
    try {
      const { data: workflowFiles } = await github.repos.getContent({
        owner: CONFIG.github.owner,
        repo: CONFIG.github.repo,
        path: '.github/workflows'
      });
      
      if (workflowFiles && workflowFiles.length > 0) {
        console.log(`✅ ${workflowFiles.length} workflow files gevonden`);
      } else {
        status.github.issues.push('Geen GitHub Actions workflow files gevonden');
      }
    } catch (error) {
      status.github.issues.push('Geen .github/workflows directory gevonden');
      console.log('❌ Geen GitHub Actions workflows gevonden');
    }

    // Finale status
    status.github.status = status.github.issues.length > 0 ? 'error' : 'ok';
  } catch (error) {
    status.github.issues.push('Onverwachte fout: ' + error.message);
    status.github.status = 'error';
    console.error('❌ Onverwachte fout bij GitHub validatie:', error);
  }
}

/**
 * Valideert de Netlify integratie
 */
async function validateNetlify() {
  console.log('\n=== NETLIFY VALIDATIE ===');
  
  try {
    // 1. Check netlify.toml bestand
    console.log('Valideren netlify.toml configuratie...');
    
    if (fs.existsSync(CONFIG.netlify.configPath)) {
      const netlifyConfig = fs.readFileSync(CONFIG.netlify.configPath, 'utf8');
      console.log('✅ netlify.toml gevonden');
      
      // Basic controles
      if (!netlifyConfig.includes('[build]')) {
        status.netlify.issues.push('netlify.toml mist [build] sectie');
      }
      
      if (!netlifyConfig.includes('[build.environment]')) {
        status.netlify.issues.push('netlify.toml mist [build.environment] sectie');
      }
    } else {
      status.netlify.issues.push('netlify.toml bestand niet gevonden');
      console.log('❌ netlify.toml niet gevonden');
    }

    // 2. Check Netlify API integratie
    if (CONFIG.netlify.token) {
      console.log('Valideren Netlify API verbinding...');
      
      try {
        const response = await axios.get(
          `https://api.netlify.com/api/v1/sites/${CONFIG.netlify.siteId}`,
          {
            headers: {
              'Authorization': `Bearer ${CONFIG.netlify.token}`
            }
          }
        );
        
        console.log(`✅ Netlify site gevonden: ${response.data.name}`);
      } catch (error) {
        status.netlify.issues.push('Netlify API fout: ' + error.message);
        console.error('❌ Netlify API fout:', error.message);
      }
    } else {
      status.netlify.issues.push('Netlify API token niet geconfigureerd (NETLIFY_AUTH_TOKEN environment variable)');
      console.log('❌ Netlify API token niet geconfigureerd');
    }

    // Finale status
    status.netlify.status = status.netlify.issues.length > 0 ? 'error' : 'ok';
  } catch (error) {
    status.netlify.issues.push('Onverwachte fout: ' + error.message);
    status.netlify.status = 'error';
    console.error('❌ Onverwachte fout bij Netlify validatie:', error);
  }
}

/**
 * Valideert de MCP configuratie
 */
async function validateMCP() {
  console.log('\n=== MCP VALIDATIE ===');
  
  try {
    // Check MCP configuratie bestand
    console.log('Valideren MCP configuratie...');
    
    if (fs.existsSync(CONFIG.mcp.configPath)) {
      let mcpConfig;
      try {
        mcpConfig = JSON.parse(fs.readFileSync(CONFIG.mcp.configPath, 'utf8'));
        console.log('✅ MCP configuratie gevonden');
      } catch (err) {
        status.mcp.issues.push('Ongeldig MCP configuratie bestand: ' + err.message);
        console.error('❌ Ongeldig MCP configuratie bestand:', err.message);
        status.mcp.status = 'error';
        return;
      }
      
      // Controleer servers
      if (!mcpConfig.mcpServers) {
        status.mcp.issues.push('MCP configuratie mist mcpServers');
        console.log('❌ MCP configuratie mist mcpServers sectie');
      } else {
        const serverCount = Object.keys(mcpConfig.mcpServers).length;
        console.log(`✅ ${serverCount} MCP servers gevonden`);
        
        // Controleer specifieke servers
        const requiredServers = ['github-server', 'supabase-server'];
        
        for (const server of requiredServers) {
          if (!mcpConfig.mcpServers[server]) {
            status.mcp.issues.push(`MCP server ontbreekt: ${server}`);
            console.log(`❌ MCP server ontbreekt: ${server}`);
          } else {
            console.log(`✅ MCP server gevonden: ${server}`);
            
            // Check disabled status
            if (mcpConfig.mcpServers[server].disabled) {
              status.mcp.issues.push(`MCP server uitgeschakeld: ${server}`);
              console.log(`⚠️ MCP server uitgeschakeld: ${server}`);
              
              // Fix: enable server
              mcpConfig.mcpServers[server].disabled = false;
              status.mcp.fixes.push(`MCP server ingeschakeld: ${server}`);
            }
          }
        }
        
        // Fix: schrijf bijgewerkte configuratie als er fixes zijn
        if (status.mcp.fixes.length > 0) {
          fs.writeFileSync(CONFIG.mcp.configPath, JSON.stringify(mcpConfig, null, 2), 'utf8');
          console.log('✅ MCP configuratie bijgewerkt');
        }
      }
    } else {
      status.mcp.issues.push('MCP configuratie bestand niet gevonden');
      console.log('❌ MCP configuratie bestand niet gevonden');
    }

    // Finale status
    status.mcp.status = status.mcp.issues.length > 0 ? 
      (status.mcp.fixes.length > 0 ? 'fixed' : 'error') : 
      'ok';
  } catch (error) {
    status.mcp.issues.push('Onverwachte fout: ' + error.message);
    status.mcp.status = 'error';
    console.error('❌ Onverwachte fout bij MCP validatie:', error);
  }
}

/**
 * Genereert een statusrapport
 */
function generateReport() {
  console.log('\n\n==================================');
  console.log('INFRASTRUCTUUR VALIDATIE RAPPORT');
  console.log('==================================\n');
  
  const components = ['supabase', 'github', 'netlify', 'mcp'];
  
  for (const component of components) {
    const componentStatus = status[component];
    
    console.log(`${component.toUpperCase()} STATUS: ${componentStatus.status.toUpperCase()}`);
    
    if (componentStatus.issues.length > 0) {
      console.log('  Problemen:');
      componentStatus.issues.forEach(issue => console.log(`  - ${issue}`));
    }
    
    if (componentStatus.fixes.length > 0) {
      console.log('  Opgeloste problemen:');
      componentStatus.fixes.forEach(fix => console.log(`  - ${fix}`));
    }
    
    if (componentStatus.issues.length === 0) {
      console.log('  Geen problemen gevonden.');
    }
    
    console.log('');
  }
  
  // Algemene conclusie
  const allOk = components.every(c => status[c].status === 'ok' || status[c].status === 'fixed');
  
  if (allOk) {
    console.log('CONCLUSIE: Alle systemen functioneren correct.');
  } else {
    console.log('CONCLUSIE: Er zijn onopgeloste problemen gevonden.');
    console.log('          Bekijk de details hierboven voor meer informatie.');
  }
  
  return {
    timestamp: new Date().toISOString(),
    overall: allOk ? 'ok' : 'issues',
    components: status
  };
}

/**
 * Hoofdfunctie
 */
async function validateInfrastructure() {
  console.log('Starten infrastructuur validatie...\n');
  
  try {
    // Voer alle validaties uit
    await validateSupabase();
    await validateGitHub();
    await validateNetlify();
    await validateMCP();
    
    // Genereer rapport
    const report = generateReport();
    
    // Schrijf rapport naar bestand
    const reportPath = path.join(__dirname, '..', 'infrastructure-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`\nRapport opgeslagen: ${reportPath}`);
    
    return report;
  } catch (error) {
    console.error('Kritieke fout tijdens infrastructuur validatie:', error);
    return {
      timestamp: new Date().toISOString(),
      overall: 'critical_error',
      error: error.message
    };
  }
}

// Start het validatieproces
if (require.main === module) {
  validateInfrastructure().catch(console.error);
}

module.exports = { validateInfrastructure };