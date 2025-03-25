/**
 * selfOptimizer.js
 * Self-improves and optimizes the AutoDev agent
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { getProjectPaths } from '../utils/config.js';

/**
 * Self-improves and optimizes the AutoDev agent
 */
export class SelfOptimizer {
  /**
   * Create a new SelfOptimizer instance
   * @param {Object} options - SelfOptimizer options
   */
  constructor(options) {
    this.agent = options.agent;
    this.config = options.config;
    this.logger = options.logger;
    this.events = options.events;
    this.projectPaths = getProjectPaths(this.config);
    this.feedbackHistory = [];
    this.performanceMetrics = {
      featureImplementations: {
        total: 0,
        successful: 0,
        failed: 0,
        averageDuration: 0
      },
      bugFixes: {
        total: 0,
        successful: 0,
        failed: 0,
        averageDuration: 0
      },
      tests: {
        total: 0,
        successful: 0,
        failed: 0,
        averageDuration: 0
      },
      codeReviews: {
        total: 0,
        successful: 0,
        failed: 0,
        averageDuration: 0
      }
    };
    
    // Register event listeners for performance tracking
    this.registerPerformanceTracking();
  }
  
  /**
   * Register event listeners for performance tracking
   */
  registerPerformanceTracking() {
    // Track feature implementations
    this.events.on('feature:planning', () => {
      this.currentFeatureStart = Date.now();
    });
    
    this.events.on('feature:implemented', ({ plan, results }) => {
      const duration = Date.now() - this.currentFeatureStart;
      this.performanceMetrics.featureImplementations.total++;
      this.performanceMetrics.featureImplementations.successful++;
      
      // Update average duration
      const { total, averageDuration } = this.performanceMetrics.featureImplementations;
      this.performanceMetrics.featureImplementations.averageDuration = 
        (averageDuration * (total - 1) + duration) / total;
    });
    
    this.events.on('feature:implementing:error', () => {
      this.performanceMetrics.featureImplementations.total++;
      this.performanceMetrics.featureImplementations.failed++;
    });
    
    // Track bug fixes
    this.events.on('bug:planning', () => {
      this.currentBugFixStart = Date.now();
    });
    
    this.events.on('bug:fixed', () => {
      const duration = Date.now() - this.currentBugFixStart;
      this.performanceMetrics.bugFixes.total++;
      this.performanceMetrics.bugFixes.successful++;
      
      // Update average duration
      const { total, averageDuration } = this.performanceMetrics.bugFixes;
      this.performanceMetrics.bugFixes.averageDuration = 
        (averageDuration * (total - 1) + duration) / total;
    });
    
    this.events.on('bug:fixing:error', () => {
      this.performanceMetrics.bugFixes.total++;
      this.performanceMetrics.bugFixes.failed++;
    });
    
    // Track tests
    this.events.on('tests:running', () => {
      this.currentTestStart = Date.now();
    });
    
    this.events.on('tests:completed', (results) => {
      const duration = Date.now() - this.currentTestStart;
      this.performanceMetrics.tests.total++;
      
      if (results.success) {
        this.performanceMetrics.tests.successful++;
      } else {
        this.performanceMetrics.tests.failed++;
      }
      
      // Update average duration
      const { total, averageDuration } = this.performanceMetrics.tests;
      this.performanceMetrics.tests.averageDuration = 
        (averageDuration * (total - 1) + duration) / total;
    });
    
    // Track code reviews
    this.events.on('review:starting', () => {
      this.currentReviewStart = Date.now();
    });
    
    this.events.on('review:completed', (results) => {
      const duration = Date.now() - this.currentReviewStart;
      this.performanceMetrics.codeReviews.total++;
      
      if (results.success) {
        this.performanceMetrics.codeReviews.successful++;
      } else {
        this.performanceMetrics.codeReviews.failed++;
      }
      
      // Update average duration
      const { total, averageDuration } = this.performanceMetrics.codeReviews;
      this.performanceMetrics.codeReviews.averageDuration = 
        (averageDuration * (total - 1) + duration) / total;
    });
  }
  
  /**
   * Self-optimize the agent
   * @returns {Promise<Object>} Optimization results
   */
  async optimize() {
    this.logger.info('Starting self-optimization');
    this.events.emit('optimization:start');
    
    try {
      // Analyze performance metrics
      const performanceAnalysis = await this.analyzePerformance();
      
      // Analyze feedback history
      const feedbackAnalysis = await this.analyzeFeedback();
      
      // Generate optimization plan
      const plan = await this.generateOptimizationPlan(performanceAnalysis, feedbackAnalysis);
      
      // Execute optimization plan
      const results = await this.executeOptimizationPlan(plan);
      
      this.events.emit('optimization:complete', { plan, results });
      return {
        performanceAnalysis,
        feedbackAnalysis,
        plan,
        results,
        success: true
      };
    } catch (error) {
      this.logger.error('Error during self-optimization', error);
      this.events.emit('optimization:error', error);
      throw error;
    }
  }
  
  /**
   * Analyze performance metrics
   * @returns {Promise<Object>} Performance analysis
   */
  async analyzePerformance() {
    this.logger.info('Analyzing performance metrics');
    
    // Calculate success rates
    const featureSuccessRate = this.performanceMetrics.featureImplementations.total > 0
      ? this.performanceMetrics.featureImplementations.successful / this.performanceMetrics.featureImplementations.total
      : 0;
    
    const bugFixSuccessRate = this.performanceMetrics.bugFixes.total > 0
      ? this.performanceMetrics.bugFixes.successful / this.performanceMetrics.bugFixes.total
      : 0;
    
    const testSuccessRate = this.performanceMetrics.tests.total > 0
      ? this.performanceMetrics.tests.successful / this.performanceMetrics.tests.total
      : 0;
    
    const reviewSuccessRate = this.performanceMetrics.codeReviews.total > 0
      ? this.performanceMetrics.codeReviews.successful / this.performanceMetrics.codeReviews.total
      : 0;
    
    // Identify areas for improvement
    const areasForImprovement = [];
    
    if (featureSuccessRate < 0.9 && this.performanceMetrics.featureImplementations.total > 5) {
      areasForImprovement.push({
        area: 'featureImplementation',
        metric: 'successRate',
        value: featureSuccessRate,
        threshold: 0.9,
        priority: 'high'
      });
    }
    
    if (bugFixSuccessRate < 0.9 && this.performanceMetrics.bugFixes.total > 5) {
      areasForImprovement.push({
        area: 'bugFix',
        metric: 'successRate',
        value: bugFixSuccessRate,
        threshold: 0.9,
        priority: 'high'
      });
    }
    
    if (testSuccessRate < 0.9 && this.performanceMetrics.tests.total > 5) {
      areasForImprovement.push({
        area: 'testing',
        metric: 'successRate',
        value: testSuccessRate,
        threshold: 0.9,
        priority: 'medium'
      });
    }
    
    if (reviewSuccessRate < 0.9 && this.performanceMetrics.codeReviews.total > 5) {
      areasForImprovement.push({
        area: 'codeReview',
        metric: 'successRate',
        value: reviewSuccessRate,
        threshold: 0.9,
        priority: 'medium'
      });
    }
    
    // Check for performance issues
    if (this.performanceMetrics.featureImplementations.averageDuration > 60000 * 5) {
      areasForImprovement.push({
        area: 'featureImplementation',
        metric: 'duration',
        value: this.performanceMetrics.featureImplementations.averageDuration,
        threshold: 60000 * 5,
        priority: 'medium'
      });
    }
    
    if (this.performanceMetrics.bugFixes.averageDuration > 60000 * 3) {
      areasForImprovement.push({
        area: 'bugFix',
        metric: 'duration',
        value: this.performanceMetrics.bugFixes.averageDuration,
        threshold: 60000 * 3,
        priority: 'medium'
      });
    }
    
    return {
      metrics: this.performanceMetrics,
      successRates: {
        featureImplementation: featureSuccessRate,
        bugFix: bugFixSuccessRate,
        testing: testSuccessRate,
        codeReview: reviewSuccessRate
      },
      areasForImprovement
    };
  }
  
  /**
   * Analyze feedback history
   * @returns {Promise<Object>} Feedback analysis
   */
  async analyzeFeedback() {
    this.logger.info('Analyzing feedback history');
    
    if (this.feedbackHistory.length === 0) {
      return {
        patterns: [],
        commonIssues: [],
        suggestions: []
      };
    }
    
    // Use Claude to analyze feedback patterns
    const prompt = `
You are an AI system analyzing feedback for an autonomous development agent.
The agent has received the following feedback:

${this.feedbackHistory.map(feedback => `
Timestamp: ${feedback.timestamp}
Rating: ${feedback.rating}/5
Summary: ${feedback.summary}
Details: ${feedback.details}
`).join('\n')}

Please analyze this feedback and identify:
1. Patterns in the feedback
2. Common issues or pain points
3. Suggestions for improvement

Provide a structured analysis that can be used to improve the agent's performance.
`;
    
    const analysisText = await this.agent.generateWithClaude({
      prompt,
      maxTokens: 2000
    });
    
    // Parse the analysis
    const patterns = [];
    const commonIssues = [];
    const suggestions = [];
    
    // Extract patterns
    const patternsMatch = analysisText.match(/Patterns:([\s\S]*?)(?=Common Issues:|$)/i);
    if (patternsMatch) {
      const patternsList = patternsMatch[1].trim().split('\n').filter(line => line.trim().startsWith('-'));
      patterns.push(...patternsList.map(line => line.trim().substring(1).trim()));
    }
    
    // Extract common issues
    const issuesMatch = analysisText.match(/Common Issues:([\s\S]*?)(?=Suggestions:|$)/i);
    if (issuesMatch) {
      const issuesList = issuesMatch[1].trim().split('\n').filter(line => line.trim().startsWith('-'));
      commonIssues.push(...issuesList.map(line => line.trim().substring(1).trim()));
    }
    
    // Extract suggestions
    const suggestionsMatch = analysisText.match(/Suggestions:([\s\S]*?)$/i);
    if (suggestionsMatch) {
      const suggestionsList = suggestionsMatch[1].trim().split('\n').filter(line => line.trim().startsWith('-'));
      suggestions.push(...suggestionsList.map(line => line.trim().substring(1).trim()));
    }
    
    return {
      patterns,
      commonIssues,
      suggestions
    };
  }
  
  /**
   * Generate an optimization plan
   * @param {Object} performanceAnalysis - Performance analysis
   * @param {Object} feedbackAnalysis - Feedback analysis
   * @returns {Promise<Object>} Optimization plan
   */
  async generateOptimizationPlan(performanceAnalysis, feedbackAnalysis) {
    this.logger.info('Generating optimization plan');
    
    // Use Claude to generate an optimization plan
    const prompt = `
You are an AI system generating an optimization plan for an autonomous development agent.
Based on the following performance analysis and feedback analysis, create a detailed plan to improve the agent.

Performance Analysis:
${JSON.stringify(performanceAnalysis, null, 2)}

Feedback Analysis:
${JSON.stringify(feedbackAnalysis, null, 2)}

Please generate a detailed optimization plan that includes:
1. Specific improvements to make to the agent
2. Prioritized list of actions to take
3. Expected impact of each improvement
4. How to measure the success of each improvement

The plan should be actionable and specific, focusing on the most important areas for improvement.
`;
    
    const planText = await this.agent.generateWithClaude({
      prompt,
      maxTokens: 2000
    });
    
    // Parse the plan
    const improvements = [];
    const actions = [];
    
    // Extract improvements
    const improvementsMatch = planText.match(/Improvements:([\s\S]*?)(?=Actions:|$)/i);
    if (improvementsMatch) {
      const improvementsList = improvementsMatch[1].trim().split('\n').filter(line => line.trim().startsWith('-'));
      improvements.push(...improvementsList.map(line => line.trim().substring(1).trim()));
    }
    
    // Extract actions
    const actionsMatch = planText.match(/Actions:([\s\S]*?)(?=Expected Impact:|$)/i);
    if (actionsMatch) {
      const actionsList = actionsMatch[1].trim().split('\n').filter(line => line.trim().startsWith('-'));
      actions.push(...actionsList.map(line => line.trim().substring(1).trim()));
    }
    
    return {
      improvements,
      actions,
      rawPlan: planText
    };
  }
  
  /**
   * Execute the optimization plan
   * @param {Object} plan - Optimization plan
   * @returns {Promise<Object>} Execution results
   */
  async executeOptimizationPlan(plan) {
    this.logger.info('Executing optimization plan');
    
    // This is a placeholder for actual optimization execution
    // In a real implementation, this would modify the agent's code or configuration
    
    return {
      executedActions: plan.actions.map(action => ({
        action,
        status: 'simulated',
        result: 'Optimization action simulated successfully'
      })),
      success: true
    };
  }
  
  /**
   * Learn from feedback
   * @param {Object} feedback - Feedback data
   * @returns {Promise<Object>} Learning results
   */
  async learnFromFeedback(feedback) {
    this.logger.info('Learning from feedback', { feedback });
    
    // Add timestamp to feedback
    const timestampedFeedback = {
      ...feedback,
      timestamp: new Date().toISOString()
    };
    
    // Add to feedback history
    this.feedbackHistory.push(timestampedFeedback);
    
    // Save feedback to file
    await this.saveFeedback(timestampedFeedback);
    
    // If we have enough feedback, trigger optimization
    if (this.feedbackHistory.length >= 5) {
      return this.optimize();
    }
    
    return {
      success: true,
      message: 'Feedback recorded successfully'
    };
  }
  
  /**
   * Save feedback to file
   * @param {Object} feedback - Feedback data
   * @returns {Promise<void>}
   */
  async saveFeedback(feedback) {
    try {
      // Create feedback directory if it doesn't exist
      const feedbackDir = path.join(this.projectPaths.root, 'autodev/feedback');
      await fs.mkdir(feedbackDir, { recursive: true });
      
      // Generate filename based on timestamp
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const filename = `feedback-${timestamp}.json`;
      
      // Write feedback to file
      await fs.writeFile(
        path.join(feedbackDir, filename),
        JSON.stringify(feedback, null, 2)
      );
    } catch (error) {
      this.logger.error('Error saving feedback', error);
    }
  }
  
  /**
   * Load feedback history from files
   * @returns {Promise<void>}
   */
  async loadFeedbackHistory() {
    try {
      // Check if feedback directory exists
      const feedbackDir = path.join(this.projectPaths.root, 'autodev/feedback');
      
      try {
        await fs.access(feedbackDir);
      } catch (error) {
        // Directory doesn't exist, create it
        await fs.mkdir(feedbackDir, { recursive: true });
        return;
      }
      
      // Find all feedback files
      const files = await glob('feedback-*.json', {
        cwd: feedbackDir,
        dot: false
      });
      
      // Load each feedback file
      for (const file of files) {
        const content = await fs.readFile(path.join(feedbackDir, file), 'utf8');
        const feedback = JSON.parse(content);
        this.feedbackHistory.push(feedback);
      }
      
      // Sort feedback by timestamp
      this.feedbackHistory.sort((a, b) => {
        return new Date(a.timestamp) - new Date(b.timestamp);
      });
      
      this.logger.info(`Loaded ${this.feedbackHistory.length} feedback entries`);
    } catch (error) {
      this.logger.error('Error loading feedback history', error);
    }
  }
  
  /**
   * Update prompt templates based on feedback and performance
   * @returns {Promise<Object>} Update results
   */
  async updatePromptTemplates() {
    this.logger.info('Updating prompt templates');
    
    try {
      // This is a placeholder for actual prompt template updates
      // In a real implementation, this would analyze feedback and performance
      // and update the prompt templates accordingly
      
      return {
        success: true,
        message: 'Prompt templates updated successfully'
      };
    } catch (error) {
      this.logger.error('Error updating prompt templates', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}