/**
 * Deploy Notification Script voor BrasserieBot
 * 
 * Dit script toont een notificatie na een succesvolle deploy via GitHub Actions naar Netlify.
 * Het is bedoeld om gebruikt te worden aan het einde van de CI/CD pipeline.
 */

const https = require('https');
const axios = require('axios');
const dotenv = require('dotenv');

// Laad environment variables
dotenv.config();

// Log banner
console.log("\n\n");
console.log("=============================================");
console.log("🚀 BRASSERIEBOT NETLIFY DEPLOYMENT COMPLETE 🚀");
console.log("=============================================");

// Netlify site ID
const NETLIFY_SITE_ID = process.env.NETLIFY_SITE_ID || 'brasseriebotapp';
const NETLIFY_AUTH_TOKEN = process.env.NETLIFY_AUTH_TOKEN;

/**
 * Haal de meest recente deployment op van Netlify
 */
async function getLatestDeployment() {
    if (!NETLIFY_AUTH_TOKEN) {
        console.log("⚠️  Geen Netlify auth token gevonden. Kan deployment status niet ophalen.");
        console.log("🔗 Bekijk de deployment op: https://app.netlify.com/sites/" + NETLIFY_SITE_ID);
        return null;
    }

    try {
        const response = await axios.get(`https://api.netlify.com/api/v1/sites/${NETLIFY_SITE_ID}/deploys`, {
            headers: {
                'Authorization': `Bearer ${NETLIFY_AUTH_TOKEN}`
            }
        });

        if (response.data && response.data.length > 0) {
            // Eerste item is de meest recente deployment
            return response.data[0];
        }
        
        return null;
    } catch (error) {
        console.error("Error bij ophalen deployment info:", error.message);
        return null;
    }
}

/**
 * Toon een uitgebreide deployment notificatie
 */
async function showDeploymentNotification() {
    console.log("🔍 Deployment informatie ophalen...");
    
    const deployment = await getLatestDeployment();
    
    if (deployment) {
        console.log("\n📊 DEPLOYMENT DETAILS:");
        console.log(`🆔 Deploy ID: ${deployment.id}`);
        console.log(`📅 Datum: ${new Date(deployment.created_at).toLocaleString()}`);
        console.log(`🚦 Status: ${deployment.state}`);
        console.log(`🔄 Branch: ${deployment.branch}`);
        console.log(`📝 Commit: ${deployment.commit_ref}`);
        console.log(`💬 Bericht: ${deployment.title || 'Geen commit bericht'}`);
        
        if (deployment.state === 'ready') {
            console.log(`\n✅ DEPLOYMENT SUCCESVOL!`);
            console.log(`🌐 Website URL: https://brasseriebotapp.netlify.app`);
            console.log(`🔗 Admin URL: ${deployment.admin_url}`);
        } else if (deployment.state === 'error') {
            console.log(`\n❌ DEPLOYMENT MISLUKT!`);
            console.log(`❓ Error: ${deployment.error_message || 'Onbekende fout'}`);
            console.log(`🔗 Log URL: ${deployment.deploy_url}`);
        } else {
            console.log(`\n⏳ DEPLOYMENT IN UITVOERING`);
            console.log(`🔄 Status: ${deployment.state}`);
        }
    } else {
        console.log("\n❓ Geen recente deployment informatie gevonden");
        console.log(`🌐 Website URL: https://brasseriebotapp.netlify.app`);
    }

    // Voeg instructies toe voor een handmatige deployment
    console.log("\n📋 HANDMATIGE DEPLOYMENT:");
    console.log("Als de automatische deployment niet werkt, voer dan de volgende stappen uit:");
    console.log("1. Ga naar https://app.netlify.com/sites/brasseriebotapp");
    console.log("2. Klik op 'Deploys' in de navigatiebalk");
    console.log("3. Klik op 'Trigger deploy' -> 'Deploy site'");
    
    console.log("\n🔧 TROUBLESHOOTING:");
    console.log("- Controleer of alle GitHub Secrets correct zijn ingesteld");
    console.log("- Controleer de GitHub Actions logs voor meer details");
    console.log("- Verifieer de Netlify site configuratie");
    
    console.log("\n=============================================\n");
}

// Start de notificatie
showDeploymentNotification().catch(error => {
    console.error("Error bij tonen deployment notificatie:", error);
});