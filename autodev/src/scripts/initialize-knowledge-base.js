#!/usr/bin/env node
/**
 * initialize-knowledge-base.js
 * Script to initialize the knowledge base and load the initial dataset
 */

import path from 'path';
import { fileURLToPath } from 'url';
import ora from 'ora';
import chalk from 'chalk';
import { loadConfig } from '../utils/config.js';
import { Logger } from '../utils/logger.js';
import { EventEmitter } from '../utils/eventEmitter.js';
import { KnowledgeBase } from '../modules/knowledgeBase.js';
import { DataIngestion } from '../modules/dataIngestion.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Initialize the knowledge base
 */
async function initializeKnowledgeBase() {
  const spinner = ora('Loading configuration...').start();
  
  try {
    // Load configuration
    const config = await loadConfig();
    spinner.succeed('Configuration loaded');
    
    // Create logger and event emitter
    const logger = new Logger(config.logging);
    const events = new EventEmitter();
    
    // Register event listeners
    events.on('knowledge:initialized', () => {
      logger.info('Knowledge base initialized successfully');
    });
    
    events.on('knowledge:ingestion:start', (source) => {
      logger.info(`Starting data ingestion from source: ${source.type}`);
    });
    
    events.on('knowledge:ingestion:complete', (result) => {
      logger.info(`Completed data ingestion: ${result.documentsIngested} documents, ${result.chunksIngested} chunks`);
    });
    
    events.on('knowledge:ingestion:error', (error) => {
      logger.error(`Error in data ingestion: ${error.message}`);
    });
    
    // Initialize knowledge base
    spinner.text = 'Initializing knowledge base...';
    spinner.start();
    
    const knowledgeBase = new KnowledgeBase({
      config,
      logger,
      events,
    });
    
    await knowledgeBase.initialize();
    spinner.succeed('Knowledge base initialized');
    
    // Initialize data ingestion
    const dataIngestion = new DataIngestion({
      knowledgeBase,
      config,
      logger,
      events,
    });
    
    // Load initial dataset
    spinner.text = 'Loading initial dataset...';
    spinner.start();
    
    const result = await knowledgeBase.loadInitialDataset();
    
    if (result.alreadyLoaded) {
      spinner.info('Initial dataset already loaded, skipping...');
    } else {
      spinner.succeed(`Initial dataset loaded: ${result.documentsIngested} documents, ${result.chunksIngested} chunks`);
    }
    
    // Schedule data ingestion jobs
    spinner.text = 'Scheduling data ingestion jobs...';
    spinner.start();
    
    await dataIngestion.scheduleJobs();
    spinner.succeed('Data ingestion jobs scheduled');
    
    console.log(chalk.green.bold('\n✓ Knowledge base initialization complete'));
    console.log(chalk.cyan('The knowledge base is now ready to use with the AutoDev agent'));
    console.log(chalk.cyan('You can now run the AutoDev agent with:'));
    console.log(chalk.cyan('  npm run start'));
    
    process.exit(0);
  } catch (error) {
    spinner.fail(`Knowledge base initialization failed: ${error.message}`);
    console.error(chalk.red(error.stack));
    process.exit(1);
  }
}

// Run the initialization
initializeKnowledgeBase();