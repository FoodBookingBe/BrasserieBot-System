/**
 * server.js
 * Dashboard server for the AutoDev agent
 */

import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Start the dashboard server
 * @param {Object} options - Dashboard options
 * @param {number} options.port - Port to run the dashboard on
 * @param {Object} options.config - Configuration object
 * @param {Object} [options.agent] - AutoDevAgent instance
 * @returns {Promise<Object>} Server instance
 */
export async function startDashboard(options) {
  const { port, config, agent } = options;
  
  // Create Express app
  const app = express();
  const server = http.createServer(app);
  const io = new SocketIOServer(server);
  
  // Serve static files
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.json());
  
  // Create dashboard data directory if it doesn't exist
  const dashboardDataDir = path.join(__dirname, 'data');
  await fs.mkdir(dashboardDataDir, { recursive: true });
  
  // API routes
  app.get('/api/status', (req, res) => {
    res.json({
      status: 'running',
      version: '0.1.0',
      timestamp: new Date().toISOString()
    });
  });
  
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'brasserie-bot-autodev-dashboard',
      version: process.env.npm_package_version || '0.1.0',
    });
  });
  
  app.get('/api/config', (req, res) => {
    // Return a sanitized version of the config (without API keys)
    const sanitizedConfig = { ...config };
    if (sanitizedConfig.claude && sanitizedConfig.claude.apiKey) {
      sanitizedConfig.claude.apiKey = '********';
    }
    res.json(sanitizedConfig);
  });
  
  app.get('/api/events', async (req, res) => {
    try {
      if (agent && agent.events) {
        const events = agent.events.getHistory();
        res.json(events);
      } else {
        // If no agent is provided, return empty events
        res.json({});
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get('/api/metrics', async (req, res) => {
    try {
      if (agent && agent.selfOptimizer) {
        const metrics = agent.selfOptimizer.performanceMetrics;
        res.json(metrics);
      } else {
        // If no agent is provided, return empty metrics
        res.json({});
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post('/api/feedback', async (req, res) => {
    try {
      const feedback = req.body;
      
      if (!feedback.rating || !feedback.summary) {
        return res.status(400).json({ error: 'Rating and summary are required' });
      }
      
      if (agent && agent.selfOptimizer) {
        const result = await agent.selfOptimizer.learnFromFeedback(feedback);
        res.json(result);
      } else {
        // If no agent is provided, just save the feedback
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const filename = `feedback-${timestamp}.json`;
        await fs.writeFile(
          path.join(dashboardDataDir, filename),
          JSON.stringify({ ...feedback, timestamp: new Date().toISOString() }, null, 2)
        );
        res.json({ success: true, message: 'Feedback saved successfully' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post('/api/tasks', async (req, res) => {
    try {
      const { task, type } = req.body;
      
      if (!task || !type) {
        return res.status(400).json({ error: 'Task and type are required' });
      }
      
      if (!agent) {
        return res.status(503).json({ error: 'Agent not available' });
      }
      
      let result;
      
      switch (type) {
        case 'feature':
          result = await agent.implementFeature(task);
          break;
        case 'bug':
          result = await agent.fixBug({ description: task });
          break;
        case 'test':
          result = await agent.writeAndRunTests({ path: task });
          break;
        case 'docs':
          result = await agent.generateDocumentation({ type: task });
          break;
        case 'review':
          result = await agent.reviewCode({ path: task });
          break;
        default:
          return res.status(400).json({ error: 'Invalid task type' });
      }
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Socket.IO events
  io.on('connection', (socket) => {
    console.log('Client connected');
    
    // Send initial data
    if (agent && agent.events) {
      socket.emit('events', agent.events.getHistory());
    }
    
    if (agent && agent.selfOptimizer) {
      socket.emit('metrics', agent.selfOptimizer.performanceMetrics);
    }
    
    // Register event handlers if agent is available
    if (agent && agent.events) {
      // Forward all agent events to the dashboard
      const forwardEvent = (eventName, data) => {
        socket.emit('event', { name: eventName, data, timestamp: new Date().toISOString() });
      };
      
      // Register for all events
      const eventNames = [
        'task:start', 'task:complete', 'task:error',
        'feature:planning', 'feature:planned', 'feature:implementing', 'feature:implemented', 'feature:implementing:error',
        'bug:analyzing', 'bug:analyzed', 'bug:planning', 'bug:planned', 'bug:fixing', 'bug:fixed', 'bug:fixing:error',
        'tests:generating', 'tests:generated', 'tests:running', 'tests:completed', 'tests:running:error',
        'docs:generating', 'docs:generated', 'docs:updating', 'docs:updated', 'docs:generating:error', 'docs:updating:error',
        'review:starting', 'review:completed', 'review:error',
        'analysis:start', 'analysis:complete', 'analysis:error',
        'optimization:start', 'optimization:complete', 'optimization:error',
        'feedback:received'
      ];
      
      const listeners = {};
      
      for (const eventName of eventNames) {
        listeners[eventName] = (data) => forwardEvent(eventName, data);
        agent.events.on(eventName, listeners[eventName]);
      }
      
      // Clean up event listeners on disconnect
      socket.on('disconnect', () => {
        console.log('Client disconnected');
        for (const eventName of eventNames) {
          agent.events.off(eventName, listeners[eventName]);
        }
      });
    }
    
    // Handle client events
    socket.on('feedback', async (feedback) => {
      try {
        if (agent && agent.selfOptimizer) {
          await agent.selfOptimizer.learnFromFeedback(feedback);
        } else {
          // If no agent is provided, just save the feedback
          const timestamp = new Date().toISOString().replace(/:/g, '-');
          const filename = `feedback-${timestamp}.json`;
          await fs.writeFile(
            path.join(dashboardDataDir, filename),
            JSON.stringify({ ...feedback, timestamp: new Date().toISOString() }, null, 2)
          );
        }
      } catch (error) {
        console.error('Error processing feedback:', error);
      }
    });
  });
  
  // Start server
  return new Promise((resolve, reject) => {
    try {
      server.listen(port, () => {
        console.log(`Dashboard server running on port ${port}`);
        resolve({ app, server, io });
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Initialize the dashboard
 * @returns {Promise<void>}
 */
export async function initDashboard() {
  try {
    // Create public directory if it doesn't exist
    const publicDir = path.join(__dirname, 'public');
    await fs.mkdir(publicDir, { recursive: true });
    
    // Copy the client HTML file to the public directory
    const clientHtmlPath = path.join(__dirname, 'client', 'index.html');
    const publicHtmlPath = path.join(publicDir, 'index.html');
    
    try {
      await fs.copyFile(clientHtmlPath, publicHtmlPath);
    } catch (error) {
      // If the client HTML file doesn't exist, create a basic one
      const basicHtml = `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BrasserieBot AutoDev Dashboard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">
</head>
<body class="bg-gray-100">
  <div id="dashboard-root"></div>
  
  <script src="/socket.io/socket.io.js"></script>
  <script src="/bundle.js"></script>
</body>
</html>`;
      await fs.writeFile(publicHtmlPath, basicHtml);
    }
    
    // Copy the client CSS file to the public directory
    const clientCssPath = path.join(__dirname, 'client', 'styles.css');
    const publicCssPath = path.join(publicDir, 'styles.css');
    
    try {
      await fs.copyFile(clientCssPath, publicCssPath);
    } catch (error) {
      console.warn('CSS file not found, will be generated by webpack');
    }
    
    console.log('Dashboard initialized successfully');
  } catch (error) {
    console.error('Error initializing dashboard:', error);
    throw error;
  }
}

// Initialize dashboard when this module is imported
initDashboard().catch(console.error);

// Start the dashboard server when this file is run directly
const port = process.env.PORT || 3030;
console.log(`Starting dashboard server on port ${port}...`);
startDashboard({ port, config: {} })
  .then(() => {
    console.log(`Dashboard server running on http://localhost:${port}`);
  })
  .catch(error => {
    console.error('Error starting dashboard server:', error);
    process.exit(1);
  });