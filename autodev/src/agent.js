/**
 * agent.js
 * Core implementation of the autonomous development agent for BrasserieBot
 */

import { Anthropic } from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';
import chalk from 'chalk';
import ora from 'ora';
import { loadConfig } from './utils/config.js';
import { CodeAnalyzer } from './modules/codeAnalyzer.js';
import { FeatureImplementer } from './modules/featureImplementer.js';
import { BugFixer } from './modules/bugFixer.js';
import { TestRunner } from './modules/testRunner.js';
import { DocumentationGenerator } from './modules/documentationGenerator.js';
import { CodeReviewer } from './modules/codeReviewer.js';
import { SelfOptimizer } from './modules/selfOptimizer.js';
import { KnowledgeBase } from './modules/knowledgeBase.js';
import { DataIngestion } from './modules/dataIngestion.js';
import { RAGSystem } from './modules/ragSystem.js';
import { PromptManager } from './utils/promptManager.js';
import { Logger } from './utils/logger.js';
import { EventEmitter } from './utils/eventEmitter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class AutoDevAgent {
  constructor(options = {}) {
    this.config = options.config || loadConfig();
    this.logger = new Logger(this.config.logging);
    this.events = new EventEmitter();
    this.anthropic = new Anthropic({
      apiKey: this.config.claude.apiKey,
    });
    
    this.promptManager = new PromptManager({
      templatesDir: path.join(__dirname, '../templates'),
      config: this.config,
    });
    
    // Initialize knowledge base components
    this.knowledgeBase = new KnowledgeBase({
      agent: this,
      config: this.config,
      logger: this.logger,
      events: this.events,
    });
    
    this.dataIngestion = new DataIngestion({
      knowledgeBase: this.knowledgeBase,
      config: this.config,
      logger: this.logger,
      events: this.events,
    });
    
    this.ragSystem = new RAGSystem({
      knowledgeBase: this.knowledgeBase,
      config: this.config,
      logger: this.logger,
      events: this.events,
    });
    
    // Initialize core modules
    this.codeAnalyzer = new CodeAnalyzer({
      agent: this,
      config: this.config,
      logger: this.logger,
      events: this.events,
    });
    
    this.featureImplementer = new FeatureImplementer({
      agent: this,
      config: this.config,
      logger: this.logger,
      events: this.events,
    });
    
    this.bugFixer = new BugFixer({
      agent: this,
      config: this.config,
      logger: this.logger,
      events: this.events,
    });
    
    this.testRunner = new TestRunner({
      agent: this,
      config: this.config,
      logger: this.logger,
      events: this.events,
    });
    
    this.documentationGenerator = new DocumentationGenerator({
      agent: this,
      config: this.config,
      logger: this.logger,
      events: this.events,
    });
    
    this.codeReviewer = new CodeReviewer({
      agent: this,
      config: this.config,
      logger: this.logger,
      events: this.events,
    });
    
    this.selfOptimizer = new SelfOptimizer({
      agent: this,
      config: this.config,
      logger: this.logger,
      events: this.events,
    });
    
    // Register event listeners
    this.registerEventListeners();
    
    this.logger.info('AutoDevAgent initialized successfully');
  }
  
  /**
   * Register event listeners for various agent events
   */
  registerEventListeners() {
    this.events.on('task:start', (task) => {
      this.logger.info(`Starting task: ${task.name}`);
    });
    
    this.events.on('task:complete', (task) => {
      this.logger.info(`Completed task: ${task.name}`);
    });
    
    this.events.on('task:error', (task, error) => {
      this.logger.error(`Error in task ${task.name}: ${error.message}`);
    });
    
    this.events.on('feedback:received', (feedback) => {
      this.logger.info(`Received feedback: ${feedback.summary}`);
      this.selfOptimizer.learnFromFeedback(feedback);
    });
    
    // Knowledge base events
    this.events.on('knowledge:initialized', () => {
      this.logger.info('Knowledge base initialized successfully');
    });
    
    this.events.on('knowledge:ingestion:start', (source) => {
      this.logger.info(`Starting data ingestion from source: ${source.type}`);
    });
    
    this.events.on('knowledge:ingestion:complete', (result) => {
      this.logger.info(`Completed data ingestion: ${result.documentsIngested} documents, ${result.chunksIngested} chunks`);
    });
    
    this.events.on('knowledge:ingestion:error', (error) => {
      this.logger.error(`Error in data ingestion: ${error.message}`);
    });
    
    this.events.on('knowledge:query', (query) => {
      this.logger.info(`Querying knowledge base: ${query.substring(0, 100)}...`);
    });
    
    this.events.on('knowledge:feedback', (feedback) => {
      this.logger.info(`Received knowledge feedback: ${feedback.feedback.substring(0, 100)}...`);
    });
  }
  
  /**
   * Analyze the codebase to build a comprehensive understanding
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeCodebase() {
    const spinner = ora('Analyzing codebase...').start();
    try {
      const analysis = await this.codeAnalyzer.analyze();
      spinner.succeed('Codebase analysis complete');
      return analysis;
    } catch (error) {
      spinner.fail(`Codebase analysis failed: ${error.message}`);
      this.logger.error('Codebase analysis error', error);
      throw error;
    }
  }
  
  /**
   * Implement a new feature based on natural language description
   * @param {string} description - Natural language description of the feature
   * @returns {Promise<Object>} Implementation results
   */
  async implementFeature(description) {
    this.logger.info(`Implementing feature: ${description.substring(0, 100)}...`);
    this.events.emit('task:start', { name: 'implementFeature', description });
    
    try {
      // First analyze the codebase to understand the context
      const analysis = await this.analyzeCodebase();
      
      // Generate implementation plan
      const plan = await this.featureImplementer.createImplementationPlan(description, analysis);
      this.logger.info('Implementation plan created', { plan });
      
      // Execute the implementation plan
      const result = await this.featureImplementer.executeImplementationPlan(plan);
      
      // Run tests to verify the implementation
      const testResults = await this.testRunner.runTests();
      
      // Update documentation
      await this.documentationGenerator.updateDocumentation({
        feature: description,
        implementation: result,
        testResults,
      });
      
      this.events.emit('task:complete', { 
        name: 'implementFeature', 
        description,
        result,
        testResults,
      });
      
      return {
        success: true,
        plan,
        result,
        testResults,
      };
    } catch (error) {
      this.events.emit('task:error', { name: 'implementFeature', description }, error);
      this.logger.error(`Feature implementation failed: ${error.message}`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
  
  /**
   * Identify and fix bugs in the codebase
   * @param {Object} options - Bug fixing options
   * @param {string} [options.description] - Description of the bug
   * @param {string} [options.errorLog] - Error log to analyze
   * @returns {Promise<Object>} Bug fixing results
   */
  async fixBug(options = {}) {
    const description = options.description || 'Unspecified bug';
    this.logger.info(`Fixing bug: ${description.substring(0, 100)}...`);
    this.events.emit('task:start', { name: 'fixBug', description });
    
    try {
      // Analyze the bug
      const analysis = await this.bugFixer.analyzeBug(options);
      
      // Generate fix plan
      const plan = await this.bugFixer.createFixPlan(analysis);
      
      // Execute the fix plan
      const result = await this.bugFixer.executeFixPlan(plan);
      
      // Run tests to verify the fix
      const testResults = await this.testRunner.runTests();
      
      this.events.emit('task:complete', { 
        name: 'fixBug', 
        description,
        result,
        testResults,
      });
      
      return {
        success: true,
        analysis,
        plan,
        result,
        testResults,
      };
    } catch (error) {
      this.events.emit('task:error', { name: 'fixBug', description }, error);
      this.logger.error(`Bug fixing failed: ${error.message}`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
  
  /**
   * Write and run tests for the codebase
   * @param {Object} options - Test options
   * @param {string} [options.path] - Path to test
   * @param {string} [options.type] - Type of tests to run (unit, integration, e2e)
   * @returns {Promise<Object>} Test results
   */
  async writeAndRunTests(options = {}) {
    const description = `Writing and running tests: ${options.path || 'all'} (${options.type || 'all types'})`;
    this.logger.info(description);
    this.events.emit('task:start', { name: 'writeAndRunTests', description });
    
    try {
      // Generate tests
      const generatedTests = await this.testRunner.generateTests(options);
      
      // Run tests
      const testResults = await this.testRunner.runTests(options);
      
      this.events.emit('task:complete', { 
        name: 'writeAndRunTests', 
        description,
        generatedTests,
        testResults,
      });
      
      return {
        success: true,
        generatedTests,
        testResults,
      };
    } catch (error) {
      this.events.emit('task:error', { name: 'writeAndRunTests', description }, error);
      this.logger.error(`Test writing/running failed: ${error.message}`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
  
  /**
   * Generate or update documentation
   * @param {Object} options - Documentation options
   * @param {string} [options.type] - Type of documentation (api, user, developer)
   * @param {string} [options.path] - Path to document
   * @returns {Promise<Object>} Documentation results
   */
  async generateDocumentation(options = {}) {
    const type = options.type || 'all';
    const description = `Generating ${type} documentation for ${options.path || 'project'}`;
    this.logger.info(description);
    this.events.emit('task:start', { name: 'generateDocumentation', description });
    
    try {
      const result = await this.documentationGenerator.generate(options);
      
      this.events.emit('task:complete', { 
        name: 'generateDocumentation', 
        description,
        result,
      });
      
      return {
        success: true,
        result,
      };
    } catch (error) {
      this.events.emit('task:error', { name: 'generateDocumentation', description }, error);
      this.logger.error(`Documentation generation failed: ${error.message}`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
  
  /**
   * Perform a code review
   * @param {Object} options - Code review options
   * @param {string} [options.path] - Path to review
   * @param {string} [options.pr] - Pull request number to review
   * @returns {Promise<Object>} Code review results
   */
  async reviewCode(options = {}) {
    const description = `Reviewing code: ${options.path || options.pr || 'recent changes'}`;
    this.logger.info(description);
    this.events.emit('task:start', { name: 'reviewCode', description });
    
    try {
      const result = await this.codeReviewer.review(options);
      
      this.events.emit('task:complete', { 
        name: 'reviewCode', 
        description,
        result,
      });
      
      return {
        success: true,
        result,
      };
    } catch (error) {
      this.events.emit('task:error', { name: 'reviewCode', description }, error);
      this.logger.error(`Code review failed: ${error.message}`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
  
  /**
   * Self-optimize the agent based on feedback and performance
   * @returns {Promise<Object>} Optimization results
   */
  async selfOptimize() {
    this.logger.info('Starting self-optimization');
    this.events.emit('task:start', { name: 'selfOptimize' });
    
    try {
      const result = await this.selfOptimizer.optimize();
      
      this.events.emit('task:complete', { 
        name: 'selfOptimize',
        result,
      });
      
      return {
        success: true,
        result,
      };
    } catch (error) {
      this.events.emit('task:error', { name: 'selfOptimize' }, error);
      this.logger.error(`Self-optimization failed: ${error.message}`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
  
  /**
   * Process feedback from a human developer
   * @param {Object} feedback - Feedback data
   * @returns {Promise<Object>} Feedback processing results
   */
  async processFeedback(feedback) {
    this.logger.info(`Processing feedback: ${feedback.summary || 'No summary provided'}`);
    this.events.emit('feedback:received', feedback);
    
    try {
      const result = await this.selfOptimizer.learnFromFeedback(feedback);
      
      return {
        success: true,
        result,
      };
    } catch (error) {
      this.logger.error(`Feedback processing failed: ${error.message}`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
  
  /**
   * Initialize the knowledge base
   * @returns {Promise<Object>} Initialization results
   */
  async initializeKnowledgeBase() {
    this.logger.info('Initializing knowledge base...');
    
    try {
      // Initialize the knowledge base
      await this.knowledgeBase.initialize();
      
      // Load initial dataset if configured
      if (this.config.knowledgeBase && this.config.knowledgeBase.loadInitialDataset) {
        await this.knowledgeBase.loadInitialDataset();
      }
      
      // Schedule data ingestion jobs
      await this.dataIngestion.scheduleJobs();
      
      this.events.emit('knowledge:initialized');
      
      return {
        success: true,
        message: 'Knowledge base initialized successfully',
      };
    } catch (error) {
      this.logger.error(`Knowledge base initialization failed: ${error.message}`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
  
  /**
   * Ingest data into the knowledge base
   * @param {Object} options - Ingestion options
   * @param {Array<Object>} [options.sources] - Sources to ingest
   * @param {boolean} [options.force] - Force re-ingestion of all sources
   * @returns {Promise<Object>} Ingestion results
   */
  async ingestData(options = {}) {
    this.logger.info('Starting data ingestion...');
    
    try {
      const result = await this.dataIngestion.run(options);
      return {
        success: true,
        ...result,
      };
    } catch (error) {
      this.logger.error(`Data ingestion failed: ${error.message}`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
  
  /**
   * Query the knowledge base
   * @param {Object} options - Query options
   * @param {string} options.query - Query text
   * @param {number} [options.limit] - Maximum number of results
   * @param {Array<string>} [options.categories] - Categories to filter by
   * @returns {Promise<Array<Object>>} Query results
   */
  async queryKnowledgeBase(options) {
    this.logger.info(`Querying knowledge base: ${options.query.substring(0, 100)}...`);
    this.events.emit('knowledge:query', options.query);
    
    try {
      return await this.knowledgeBase.query(options);
    } catch (error) {
      this.logger.error(`Knowledge base query failed: ${error.message}`, error);
      throw error;
    }
  }
  
  /**
   * Enhance a prompt with relevant knowledge
   * @param {Object} options - Enhancement options
   * @param {string} options.prompt - Original prompt
   * @param {number} [options.limit] - Maximum number of knowledge items to include
   * @param {Array<string>} [options.categories] - Categories to filter by
   * @param {string} [options.task] - Task type (e.g., 'feature_implementation', 'bug_fixing')
   * @returns {Promise<string>} Enhanced prompt
   */
  async enhancePromptWithKnowledge(options) {
    this.logger.info(`Enhancing prompt with knowledge: ${options.prompt.substring(0, 100)}...`);
    
    try {
      return await this.ragSystem.enhancePrompt(options);
    } catch (error) {
      this.logger.error(`Prompt enhancement failed: ${error.message}`, error);
      // Fall back to original prompt
      return options.prompt;
    }
  }
  
  /**
   * Generate a response using Claude with RAG
   * @param {Object} options - Generation options
   * @param {string} options.prompt - User prompt
   * @param {string} [options.systemPrompt] - System prompt
   * @param {number} [options.maxTokens] - Maximum tokens to generate
   * @param {Array<string>} [options.categories] - Knowledge categories to include
   * @returns {Promise<string>} Claude's response
   */
  async generateWithRAG(options) {
    this.logger.info(`Generating response with RAG: ${options.prompt.substring(0, 100)}...`);
    
    try {
      return await this.ragSystem.generateWithRAG(options);
    } catch (error) {
      this.logger.error(`RAG generation failed: ${error.message}`, error);
      
      // Fall back to regular generation without RAG
      this.logger.info('Falling back to regular generation without RAG');
      return await this.generateWithClaude({
        prompt: options.prompt,
        system: options.systemPrompt,
        maxTokens: options.maxTokens,
      });
    }
  }
  
  /**
   * Generate a response using Claude API
   * @param {Object} options - Claude API options
   * @param {string} options.prompt - Prompt to send to Claude
   * @param {string} [options.system] - System prompt
   * @param {number} [options.maxTokens] - Maximum tokens to generate
   * @returns {Promise<string>} Claude's response
   */
  async generateWithClaude(options) {
    const { prompt, system, maxTokens = 1000 } = options;
    
    try {
      const response = await this.anthropic.messages.create({
        model: this.config.claude.model || 'claude-3-opus-20240229',
        max_tokens: maxTokens,
        system: system || this.config.claude.systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });
      
      return response.content[0].text;
    } catch (error) {
      this.logger.error(`Claude API error: ${error.message}`, error);
      throw new Error(`Failed to generate with Claude: ${error.message}`);
    }
  }
}

export { AutoDevAgent };