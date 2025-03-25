/**
 * ragSystem.js
 * Retrieval-Augmented Generation (RAG) system for the AutoDev agent
 */

import { Logger } from '../utils/logger.js';

/**
 * Retrieval-Augmented Generation (RAG) system
 */
export class RAGSystem {
  /**
   * Create a new RAGSystem instance
   * @param {Object} options - RAGSystem options
   * @param {Object} options.knowledgeBase - KnowledgeBase instance
   * @param {Object} options.config - Configuration object
   * @param {Object} options.logger - Logger instance
   * @param {Object} options.events - Event emitter instance
   */
  constructor(options) {
    this.knowledgeBase = options.knowledgeBase;
    this.config = options.config;
    this.logger = options.logger || new Logger({ level: 'info' });
    this.events = options.events;
    this.ragConfig = this.config.knowledgeBase.rag;
  }

  /**
   * Enhance a prompt with relevant knowledge
   * @param {Object} options - Enhancement options
   * @param {string} options.prompt - Original prompt
   * @param {number} options.limit - Maximum number of knowledge items to include
   * @param {Array<string>} options.categories - Categories to filter by
   * @param {string} options.task - Task type (e.g., 'feature_implementation', 'bug_fixing')
   * @returns {Promise<string>} Enhanced prompt
   */
  async enhancePrompt(options) {
    const { 
      prompt, 
      limit = this.ragConfig.defaultLimit, 
      categories = [], 
      task 
    } = options;
    
    try {
      this.logger.info(`Enhancing prompt for task: ${task || 'general'}`);
      
      // Query knowledge base for relevant information
      const results = await this.knowledgeBase.query({
        query: prompt,
        limit,
        categories,
      });
      
      if (results.length === 0) {
        this.logger.info('No relevant knowledge found for prompt');
        return prompt;
      }
      
      this.logger.info(`Found ${results.length} relevant knowledge items`);
      
      // Format knowledge for inclusion in prompt
      const knowledgeSection = results.map((result, index) => {
        return `[Knowledge Item ${index + 1}] Source: ${result.metadata.source || 'Unknown'}\n${result.content}`;
      }).join('\n\n');
      
      // Use template from config or default template
      let template = this.ragConfig.promptTemplate;
      
      // Check if there's a task-specific template
      if (task && this.ragConfig.taskTemplates && this.ragConfig.taskTemplates[task]) {
        template = this.ragConfig.taskTemplates[task];
      }
      
      // Replace placeholders in template
      const enhancedPrompt = template
        .replace('{{knowledge}}', knowledgeSection)
        .replace('{{prompt}}', prompt);
      
      return enhancedPrompt;
    } catch (error) {
      this.logger.error(`Prompt enhancement failed: ${error.message}`, error);
      // Fall back to original prompt
      return prompt;
    }
  }

  /**
   * Enhance a system prompt with relevant knowledge
   * @param {Object} options - Enhancement options
   * @param {string} options.systemPrompt - Original system prompt
   * @param {string} options.userPrompt - User prompt for context
   * @param {number} options.limit - Maximum number of knowledge items to include
   * @param {Array<string>} options.categories - Categories to filter by
   * @returns {Promise<string>} Enhanced system prompt
   */
  async enhanceSystemPrompt(options) {
    const { 
      systemPrompt, 
      userPrompt,
      limit = this.ragConfig.defaultLimit, 
      categories = [] 
    } = options;
    
    try {
      this.logger.info('Enhancing system prompt');
      
      // Query knowledge base using both system and user prompts for context
      const combinedQuery = `${systemPrompt} ${userPrompt}`;
      
      const results = await this.knowledgeBase.query({
        query: combinedQuery,
        limit,
        categories,
      });
      
      if (results.length === 0) {
        this.logger.info('No relevant knowledge found for system prompt');
        return systemPrompt;
      }
      
      this.logger.info(`Found ${results.length} relevant knowledge items for system prompt`);
      
      // Format knowledge for inclusion in system prompt
      const knowledgeSection = results.map((result, index) => {
        return `[Knowledge Item ${index + 1}] Source: ${result.metadata.category || 'Unknown'}\n${result.content}`;
      }).join('\n\n');
      
      // Enhance system prompt with knowledge
      const enhancedSystemPrompt = `${systemPrompt}

You have access to the following domain-specific knowledge about the hospitality industry that may be relevant to this task:

${knowledgeSection}

Use this knowledge when appropriate to provide more accurate and domain-specific responses. Incorporate relevant hospitality industry terminology, best practices, and insights when applicable.`;
      
      return enhancedSystemPrompt;
    } catch (error) {
      this.logger.error(`System prompt enhancement failed: ${error.message}`, error);
      // Fall back to original system prompt
      return systemPrompt;
    }
  }

  /**
   * Process feedback to improve knowledge retrieval
   * @param {Object} options - Feedback options
   * @param {string} options.prompt - Original prompt
   * @param {Array<Object>} options.retrievedItems - Knowledge items that were retrieved
   * @param {Array<number>} options.relevanceScores - User-provided relevance scores (1-5)
   * @param {string} options.feedback - User feedback text
   * @returns {Promise<void>}
   */
  async processFeedback(options) {
    const { prompt, retrievedItems, relevanceScores, feedback } = options;
    
    try {
      this.logger.info('Processing feedback for knowledge retrieval');
      
      // Log feedback for future analysis
      // In a real implementation, this would update a feedback database
      // and potentially retrain or fine-tune the retrieval system
      
      this.logger.info(`Feedback: ${feedback}`);
      this.logger.info(`Relevance scores: ${JSON.stringify(relevanceScores)}`);
      
      // Emit feedback event
      this.events.emit('knowledge:feedback', {
        prompt,
        retrievedItems,
        relevanceScores,
        feedback,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      this.logger.error(`Feedback processing failed: ${error.message}`, error);
    }
  }

  /**
   * Learn from new information
   * @param {Object} options - Learning options
   * @param {string} options.content - New content to learn from
   * @param {string} options.category - Category for the content
   * @param {string} options.source - Source of the content
   * @returns {Promise<Object>} Learning results
   */
  async learnFromNewInformation(options) {
    const { content, category, source } = options;
    
    try {
      this.logger.info(`Learning from new information: ${source}`);
      
      // Create document
      const document = {
        text: content,
        metadata: {
          source,
          category,
          type: 'feedback',
          timestamp: new Date().toISOString(),
        },
      };
      
      // Ingest document
      const result = await this.knowledgeBase.ingestDocuments([document]);
      
      this.logger.info(`Learned from new information: ${result.chunksIngested} chunks`);
      
      return result;
    } catch (error) {
      this.logger.error(`Learning from new information failed: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Generate a response using Claude with RAG
   * @param {Object} options - Generation options
   * @param {string} options.prompt - User prompt
   * @param {string} options.systemPrompt - System prompt
   * @param {number} options.maxTokens - Maximum tokens to generate
   * @param {Array<string>} options.categories - Knowledge categories to include
   * @returns {Promise<string>} Claude's response
   */
  async generateWithRAG(options) {
    const { 
      prompt, 
      systemPrompt, 
      maxTokens = 1000, 
      categories = [] 
    } = options;
    
    try {
      // Enhance prompt with relevant knowledge
      const enhancedPrompt = await this.enhancePrompt({
        prompt,
        categories,
      });
      
      // Generate response using Claude
      const response = await this.knowledgeBase.agent.generateWithClaude({
        prompt: enhancedPrompt,
        system: systemPrompt,
        maxTokens,
      });
      
      return response;
    } catch (error) {
      this.logger.error(`RAG generation failed: ${error.message}`, error);
      
      // Fall back to regular generation without RAG
      this.logger.info('Falling back to regular generation without RAG');
      
      return await this.knowledgeBase.agent.generateWithClaude({
        prompt,
        system: systemPrompt,
        maxTokens,
      });
    }
  }
}