// Netlify Function voor API health check
// Deze functie test of de backend API beschikbaar is

const axios = require('axios');

exports.handler = async function(event, context) {
  // CORS headers voor lokale ontwikkeling en productie
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  };

  // Handle OPTIONS/preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Preflight call successful' })
    };
  }

  // Haal API URL uit environment variables
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://brasserie-bot-api.onrender.com';

  try {
    // Probeer een eenvoudige GET request naar de API te maken
    const response = await axios.get(`${apiUrl}/health`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'healthy',
        apiResponse: response.data,
        message: 'API is beschikbaar en reageert normaal',
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.log('API Health Check Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        status: 'unhealthy',
        error: error.message,
        message: 'API reageert niet of is onbeschikbaar',
        timestamp: new Date().toISOString()
      })
    };
  }
};