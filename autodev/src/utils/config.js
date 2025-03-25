/**
 * config.js
 * Configuration utilities for the AutoDev agent
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, '../../config/config.json');
const DEFAULT_CONFIG = {
  projectRoot: process.env.PROJECT_ROOT || path.resolve(__dirname, '../../../'),
  claude: {
    apiKey: process.env.CLAUDE_API_KEY || '',
    model: process.env.CLAUDE_MODEL || 'claude-3-opus-20240229',
    systemPrompt: 'You are AutoDev, an autonomous development agent for the BrasserieBot platform. Your goal is to help build and maintain the codebase.'
  },
  dashboard: {
    enabled: process.env.DASHBOARD_ENABLED === 'true' || true,
    port: parseInt(process.env.DASHBOARD_PORT || '3030', 10)
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || path.join(__dirname, '../../logs/autodev.log')
  }
};

/**
 * Load configuration from file or use defaults
 * @returns {Object} Configuration object
 */
export async function loadConfig() {
  try {
    // Check if config file exists
    await fs.access(CONFIG_PATH);
    
    // Read and parse config file
    const configData = await fs.readFile(CONFIG_PATH, 'utf8');
    const config = JSON.parse(configData);
    
    // Merge with environment variables (environment variables take precedence)
    return {
      ...config,
      projectRoot: process.env.PROJECT_ROOT || config.projectRoot,
      claude: {
        ...config.claude,
        apiKey: process.env.CLAUDE_API_KEY || config.claude.apiKey,
        model: process.env.CLAUDE_MODEL || config.claude.model
      },
      dashboard: {
        ...config.dashboard,
        enabled: process.env.DASHBOARD_ENABLED === 'true' || config.dashboard.enabled,
        port: parseInt(process.env.DASHBOARD_PORT || config.dashboard.port, 10)
      },
      logging: {
        ...config.logging,
        level: process.env.LOG_LEVEL || config.logging.level,
        file: process.env.LOG_FILE || config.logging.file
      }
    };
  } catch (error) {
    // If config file doesn't exist or can't be read, use default config
    console.warn('Config file not found or invalid, using default configuration');
    return DEFAULT_CONFIG;
  }
}

/**
 * Save configuration to file
 * @param {Object} config - Configuration object to save
 * @returns {Promise<void>}
 */
export async function saveConfig(config) {
  try {
    // Create config directory if it doesn't exist
    await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
    
    // Write config to file
    await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Error saving configuration:', error.message);
    throw error;
  }
}

/**
 * Validate configuration
 * @param {Object} config - Configuration object to validate
 * @returns {Object} Validation result with errors if any
 */
export function validateConfig(config) {
  const errors = [];
  
  // Check required fields
  if (!config.projectRoot) {
    errors.push('Project root path is required');
  }
  
  if (!config.claude || !config.claude.apiKey) {
    errors.push('Claude API key is required');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get project paths
 * @param {Object} config - Configuration object
 * @returns {Object} Object with project paths
 */
export function getProjectPaths(config) {
  const projectRoot = config.projectRoot;
  
  return {
    root: projectRoot,
    backend: path.join(projectRoot, 'backend'),
    frontend: path.join(projectRoot, 'frontend'),
    database: path.join(projectRoot, 'database'),
    backendSrc: path.join(projectRoot, 'backend/src'),
    frontendSrc: path.join(projectRoot, 'frontend/src'),
    tests: path.join(projectRoot, 'backend/test')
  };
}
