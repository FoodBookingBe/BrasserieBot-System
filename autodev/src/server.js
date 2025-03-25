/**
 * server.js
 * Express server for the AutoDev agent
 */

import express from 'express';
import http from 'http';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Start the AutoDev server
 * @param {Object} options - Server options
 * @param {number} options.port - Port to run the server on
 * @param {Object} options.config - Configuration object
 * @param {Object} [options.agent] - AutoDevAgent instance
 * @returns {Promise<Object>} Server instance
 */
export async function startServer(options) {
  const { port, config, agent } = options;
  
  // Create Express app
  const app = express();
  const server = http.createServer(app);
  
  app.use(express.json());
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'brasserie-bot-autodev',
      version: process.env.npm_package_version || '0.1.0',
    });
  });
  
  // API routes
  app.get('/api/status', (req, res) => {
    res.json({
      status: 'running',
      version: '0.1.0',
      timestamp: new Date().toISOString()
    });
  });
  
  // Start server
  return new Promise((resolve, reject) => {
    try {
      server.listen(port, () => {
        console.log(`AutoDev server running on port ${port}`);
        resolve({ app, server });
      });
    } catch (error) {
      reject(error);
    }
  });
}