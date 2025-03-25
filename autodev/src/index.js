#!/usr/bin/env node
/**
 * index.js
 * Entry point for the BrasserieBot AutoDev agent
 */

import { Command } from 'commander';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { AutoDevAgent } from './agent.js';
import { loadConfig } from './utils/config.js';
import { startDashboard } from './dashboard/server.js';
import { startServer } from './server.js';
import { Logger } from './utils/logger.js';

// Load environment variables
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(await import('fs').then(fs => 
  fs.promises.readFile(path.join(__dirname, '../package.json'), 'utf8')
));

// Initialize logger
const logger = new Logger({ level: process.env.LOG_LEVEL || 'info' });

// Create command line interface
const program = new Command();

program
  .name('autodev')
  .description('BrasserieBot AutoDev - Autonomous development agent')
  .version(pkg.version);

// Initialize command
program
  .command('init')
  .description('Initialize the AutoDev agent with configuration')
  .action(async () => {
    console.log(chalk.blue('Initializing BrasserieBot AutoDev agent...'));
    
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'claudeApiKey',
        message: 'Enter your Claude API key:',
        validate: input => input.trim() !== '' ? true : 'API key is required'
      },
      {
        type: 'input',
        name: 'projectRoot',
        message: 'Enter the path to your BrasserieBot project root:',
        default: path.resolve(process.cwd(), '../'),
      },
      {
        type: 'list',
        name: 'claudeModel',
        message: 'Select Claude model to use:',
        choices: [
          'claude-3-opus-20240229',
          'claude-3-sonnet-20240229',
          'claude-3-haiku-20240307'
        ],
        default: 'claude-3-opus-20240229'
      },
      {
        type: 'confirm',
        name: 'enableDashboard',
        message: 'Enable monitoring dashboard?',
        default: true
      },
      {
        type: 'input',
        name: 'dashboardPort',
        message: 'Dashboard port:',
        default: '3030',
        when: answers => answers.enableDashboard
      },
      {
        type: 'confirm',
        name: 'enableKnowledgeBase',
        message: 'Enable knowledge base for hospitality industry domain knowledge?',
        default: true
      },
      {
        type: 'input',
        name: 'pineconeApiKey',
        message: 'Enter your Pinecone API key (for vector database):',
        when: answers => answers.enableKnowledgeBase,
        validate: input => input.trim() !== '' ? true : 'Pinecone API key is required for knowledge base'
      },
      {
        type: 'input',
        name: 'pineconeEnvironment',
        message: 'Enter your Pinecone environment:',
        default: 'gcp-starter',
        when: answers => answers.enableKnowledgeBase
      },
      {
        type: 'input',
        name: 'openaiApiKey',
        message: 'Enter your OpenAI API key (for embeddings):',
        when: answers => answers.enableKnowledgeBase,
        validate: input => input.trim() !== '' ? true : 'OpenAI API key is required for embeddings'
      },
      {
        type: 'confirm',
        name: 'loadInitialDataset',
        message: 'Load initial hospitality industry dataset?',
        default: true,
        when: answers => answers.enableKnowledgeBase
      }
    ]);
    
    // Create config file
    const config = {
      projectRoot: answers.projectRoot,
      claude: {
        apiKey: answers.claudeApiKey,
        model: answers.claudeModel,
        systemPrompt: 'You are AutoDev, an autonomous development agent for the BrasserieBot platform. Your goal is to help build and maintain the codebase.'
      },
      dashboard: {
        enabled: answers.enableDashboard,
        port: answers.enableDashboard ? parseInt(answers.dashboardPort, 10) : 3030
      },
      logging: {
        level: 'info',
        file: path.join(__dirname, '../logs/autodev.log')
      }
    };
    
    // Add knowledge base configuration if enabled
    if (answers.enableKnowledgeBase) {
      config.knowledgeBase = {
        enabled: true,
        loadInitialDataset: answers.loadInitialDataset,
        pinecone: {
          apiKey: answers.pineconeApiKey,
          environment: answers.pineconeEnvironment,
          indexName: 'brasserie-bot-knowledge'
        },
        openai: {
          apiKey: answers.openaiApiKey,
          embeddingModel: 'text-embedding-3-small'
        },
        dataIngestion: {
          chunkSize: 1000,
          chunkOverlap: 200,
          batchSize: 100,
          sources: [
            {
              type: 'directory',
              path: './knowledge/restaurant_management',
              pattern: '**/*.{md,txt,json}',
              category: 'restaurant_management'
            },
            {
              type: 'directory',
              path: './knowledge/pos_integration',
              pattern: '**/*.{md,txt,json}',
              category: 'pos_integration'
            },
            {
              type: 'directory',
              path: './knowledge/reservation_systems',
              pattern: '**/*.{md,txt,json}',
              category: 'reservation_systems'
            },
            {
              type: 'directory',
              path: './knowledge/inventory_procurement',
              pattern: '**/*.{md,txt,json}',
              category: 'inventory_procurement'
            },
            {
              type: 'directory',
              path: './knowledge/payment_processing',
              pattern: '**/*.{md,txt,json}',
              category: 'payment_processing'
            },
            {
              type: 'directory',
              path: './knowledge/supplier_relations',
              pattern: '**/*.{md,txt,json}',
              category: 'supplier_relations'
            }
          ]
        }
      };
    }
    
    try {
      await import('fs').then(fs => 
        fs.promises.writeFile(
          path.join(__dirname, '../config/config.json'), 
          JSON.stringify(config, null, 2)
        )
      );
      
      console.log(chalk.green('✓ Configuration saved successfully'));
      console.log(chalk.blue('You can now run the agent with:'));
      console.log(chalk.yellow('  npm start'));
      
    } catch (error) {
      console.error(chalk.red('Error saving configuration:'), error.message);
      process.exit(1);
    }
  });

// Analyze command
program
  .command('analyze')
  .description('Analyze the BrasserieBot codebase')
  .action(async () => {
    try {
      const config = loadConfig();
      const agent = new AutoDevAgent({ config });
      
      console.log(chalk.blue('Analyzing BrasserieBot codebase...'));
      const analysis = await agent.analyzeCodebase();
      
      console.log(chalk.green('✓ Analysis complete'));
      console.log(chalk.gray('Summary:'));
      console.log(analysis.summary);
      
    } catch (error) {
      console.error(chalk.red('Error analyzing codebase:'), error.message);
      process.exit(1);
    }
  });

// Implement feature command
program
  .command('implement')
  .description('Implement a new feature')
  .argument('<description>', 'Natural language description of the feature')
  .action(async (description) => {
    try {
      const config = loadConfig();
      const agent = new AutoDevAgent({ config });
      
      console.log(chalk.blue(`Implementing feature: ${description}`));
      const result = await agent.implementFeature(description);
      
      if (result.success) {
        console.log(chalk.green('✓ Feature implemented successfully'));
      } else {
        console.log(chalk.red('✗ Feature implementation failed:'), result.error);
        process.exit(1);
      }
      
    } catch (error) {
      console.error(chalk.red('Error implementing feature:'), error.message);
      process.exit(1);
    }
  });

// Fix bug command
program
  .command('fix')
  .description('Fix a bug in the codebase')
  .argument('[description]', 'Description of the bug')
  .option('-l, --log <path>', 'Path to error log file')
  .action(async (description, options) => {
    try {
      const config = loadConfig();
      const agent = new AutoDevAgent({ config });
      
      let errorLog = null;
      if (options.log) {
        errorLog = await import('fs').then(fs => 
          fs.promises.readFile(options.log, 'utf8')
        );
      }
      
      console.log(chalk.blue(`Fixing bug: ${description || 'from error log'}`));
      const result = await agent.fixBug({ description, errorLog });
      
      if (result.success) {
        console.log(chalk.green('✓ Bug fixed successfully'));
      } else {
        console.log(chalk.red('✗ Bug fix failed:'), result.error);
        process.exit(1);
      }
      
    } catch (error) {
      console.error(chalk.red('Error fixing bug:'), error.message);
      process.exit(1);
    }
  });

// Test command
program
  .command('test')
  .description('Write and run tests')
  .option('-p, --path <path>', 'Path to test')
  .option('-t, --type <type>', 'Type of tests to run (unit, integration, e2e)')
  .action(async (options) => {
    try {
      const config = loadConfig();
      const agent = new AutoDevAgent({ config });
      
      console.log(chalk.blue(`Running tests: ${options.path || 'all'} (${options.type || 'all types'})`));
      const result = await agent.writeAndRunTests(options);
      
      if (result.success) {
        console.log(chalk.green('✓ Tests completed successfully'));
        console.log(chalk.gray('Summary:'));
        console.log(result.testResults.summary);
      } else {
        console.log(chalk.red('✗ Tests failed:'), result.error);
        process.exit(1);
      }
      
    } catch (error) {
      console.error(chalk.red('Error running tests:'), error.message);
      process.exit(1);
    }
  });

// Document command
program
  .command('document')
  .description('Generate or update documentation')
  .option('-t, --type <type>', 'Type of documentation (api, user, developer)')
  .option('-p, --path <path>', 'Path to document')
  .action(async (options) => {
    try {
      const config = loadConfig();
      const agent = new AutoDevAgent({ config });
      
      console.log(chalk.blue(`Generating documentation: ${options.type || 'all'} for ${options.path || 'project'}`));
      const result = await agent.generateDocumentation(options);
      
      if (result.success) {
        console.log(chalk.green('✓ Documentation generated successfully'));
      } else {
        console.log(chalk.red('✗ Documentation generation failed:'), result.error);
        process.exit(1);
      }
      
    } catch (error) {
      console.error(chalk.red('Error generating documentation:'), error.message);
      process.exit(1);
    }
  });

// Review command
program
  .command('review')
  .description('Perform a code review')
  .option('-p, --path <path>', 'Path to review')
  .option('-pr, --pull-request <number>', 'Pull request number to review')
  .action(async (options) => {
    try {
      const config = loadConfig();
      const agent = new AutoDevAgent({ config });
      
      console.log(chalk.blue(`Reviewing code: ${options.path || options.pullRequest || 'recent changes'}`));
      const result = await agent.reviewCode({
        path: options.path,
        pr: options.pullRequest
      });
      
      if (result.success) {
        console.log(chalk.green('✓ Code review completed'));
        console.log(chalk.gray('Summary:'));
        console.log(result.result.summary);
      } else {
        console.log(chalk.red('✗ Code review failed:'), result.error);
        process.exit(1);
      }
      
    } catch (error) {
      console.error(chalk.red('Error reviewing code:'), error.message);
      process.exit(1);
    }
  });

// Dashboard command
program
  .command('dashboard')
  .description('Start the monitoring dashboard')
  .option('-p, --port <port>', 'Port to run the dashboard on', '3030')
  .action(async (options) => {
    try {
      const config = loadConfig();
      const port = parseInt(options.port, 10);
      
      console.log(chalk.blue(`Starting dashboard on port ${port}...`));
      await startDashboard({ port, config });
      
    } catch (error) {
      console.error(chalk.red('Error starting dashboard:'), error.message);
      process.exit(1);
    }
  });

// Knowledge base command
program
  .command('kb')
  .description('Knowledge base operations')
  .option('-i, --init', 'Initialize the knowledge base')
  .option('-q, --query <text>', 'Query the knowledge base')
  .option('-c, --categories <categories>', 'Filter by categories (comma-separated)')
  .option('-l, --limit <number>', 'Maximum number of results', '5')
  .action(async (options) => {
    try {
      const config = loadConfig();
      const agent = new AutoDevAgent({ config });
      
      if (options.init) {
        console.log(chalk.blue('Initializing knowledge base...'));
        const result = await agent.initializeKnowledgeBase();
        
        if (result.success) {
          console.log(chalk.green('✓ Knowledge base initialized successfully'));
        } else {
          console.log(chalk.red('✗ Knowledge base initialization failed:'), result.error);
          process.exit(1);
        }
      } else if (options.query) {
        console.log(chalk.blue(`Querying knowledge base: ${options.query}`));
        
        const categories = options.categories ? options.categories.split(',') : [];
        const limit = parseInt(options.limit, 10);
        
        const results = await agent.queryKnowledgeBase({
          query: options.query,
          limit,
          categories,
        });
        
        console.log(chalk.green(`✓ Found ${results.length} results:`));
        
        results.forEach((result, index) => {
          console.log(chalk.yellow(`\n[Result ${index + 1}] Source: ${result.metadata.source || 'Unknown'}`));
          console.log(chalk.gray('Category:'), result.metadata.category || 'Unknown');
          console.log(chalk.white(result.content));
        });
      } else {
        console.log(chalk.yellow('Please specify an operation (--init or --query)'));
      }
      
    } catch (error) {
      console.error(chalk.red('Error with knowledge base operation:'), error.message);
      process.exit(1);
    }
  });

// Default command (start agent)
program
  .command('start', { isDefault: true })
  .description('Start the AutoDev agent')
  .action(async () => {
    try {
      const config = loadConfig();
      const agent = new AutoDevAgent({ config });
      
      console.log(chalk.blue('Starting BrasserieBot AutoDev agent...'));
      
      // Start API server
      const serverPort = process.env.PORT || 3001;
      console.log(chalk.blue(`Starting API server on port ${serverPort}...`));
      await startServer({
        port: serverPort,
        config,
        agent
      });
      
      // Start dashboard if enabled
      if (config.dashboard && config.dashboard.enabled) {
        console.log(chalk.blue(`Starting dashboard on port ${config.dashboard.port}...`));
        await startDashboard({
          port: config.dashboard.port,
          config,
          agent
        });
      }
      
      // Initialize knowledge base if configured
      if (config.knowledgeBase && config.knowledgeBase.enabled) {
        console.log(chalk.blue('Initializing knowledge base...'));
        const kbResult = await agent.initializeKnowledgeBase();
        
        if (kbResult.success) {
          console.log(chalk.green('✓ Knowledge base initialized successfully'));
        } else {
          console.log(chalk.yellow('⚠ Knowledge base initialization failed:'), kbResult.error);
          console.log(chalk.yellow('⚠ Continuing without knowledge base support'));
        }
      }
      
      // Perform initial analysis
      console.log(chalk.blue('Performing initial codebase analysis...'));
      await agent.analyzeCodebase();
      
      console.log(chalk.green('✓ AutoDev agent is running'));
      console.log(chalk.gray('Waiting for commands...'));
      
      // Keep process alive
      process.stdin.resume();
      
    } catch (error) {
      console.error(chalk.red('Error starting agent:'), error.message);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse(process.argv);