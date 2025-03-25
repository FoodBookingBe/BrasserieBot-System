/**
 * featureImplementer.js
 * Implements new features based on natural language descriptions
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { getProjectPaths } from '../utils/config.js';

/**
 * Implements new features based on natural language descriptions
 */
export class FeatureImplementer {
  /**
   * Create a new FeatureImplementer instance
   * @param {Object} options - FeatureImplementer options
   */
  constructor(options) {
    this.agent = options.agent;
    this.config = options.config;
    this.logger = options.logger;
    this.events = options.events;
    this.projectPaths = getProjectPaths(this.config);
  }
  
  /**
   * Create an implementation plan for a new feature
   * @param {string} description - Natural language description of the feature
   * @param {Object} analysis - Codebase analysis results
   * @returns {Promise<Object>} Implementation plan
   */
  async createImplementationPlan(description, analysis) {
    this.logger.info('Creating implementation plan', { description });
    this.events.emit('feature:planning', { description });
    
    try {
      // Use Claude to generate an implementation plan
      const prompt = `
You are an expert software architect for the BrasserieBot platform, an AI-driven hospitality operating system.
You need to create a detailed implementation plan for the following feature:

${description}

Based on the codebase analysis below, create a detailed implementation plan that includes:
1. A high-level overview of the feature and its components
2. Required changes to existing files
3. New files that need to be created
4. Database schema changes (if any)
5. API endpoints to be added or modified
6. Frontend components to be added or modified
7. Testing strategy

Codebase Analysis:
- Backend Modules: ${Object.keys(analysis.backend.modules).join(', ')}
- Controllers: ${Object.keys(analysis.backend.controllers).join(', ')}
- Services: ${Object.keys(analysis.backend.services).join(', ')}
- Frontend Components: ${Object.keys(analysis.frontend.components).join(', ')}
- Database Models: ${Object.keys(analysis.database.models).join(', ')}

Your implementation plan should be detailed, specific, and actionable. Include file paths, function names, and code structure where appropriate.
`;
      
      const planText = await this.agent.generateWithClaude({
        prompt,
        maxTokens: 2000
      });
      
      // Parse the plan into a structured format
      const plan = this.parsePlan(planText);
      
      this.events.emit('feature:planned', { description, plan });
      return plan;
    } catch (error) {
      this.logger.error('Error creating implementation plan', error);
      this.events.emit('feature:planning:error', { description, error });
      throw error;
    }
  }
  
  /**
   * Parse the implementation plan text into a structured format
   * @param {string} planText - Implementation plan text
   * @returns {Object} Structured implementation plan
   */
  parsePlan(planText) {
    // Simple parsing logic - in a real implementation, this would be more sophisticated
    const sections = planText.split(/\n#+\s+/);
    
    const plan = {
      overview: sections[0],
      fileChanges: [],
      newFiles: [],
      databaseChanges: [],
      apiChanges: [],
      frontendChanges: [],
      testingStrategy: ''
    };
    
    // Extract file changes
    const fileChangesMatch = planText.match(/Required changes to existing files:([\s\S]*?)(?=\n#+\s+|$)/);
    if (fileChangesMatch) {
      const fileChanges = fileChangesMatch[1].trim().split('\n').filter(line => line.trim().startsWith('-'));
      plan.fileChanges = fileChanges.map(line => line.trim().substring(1).trim());
    }
    
    // Extract new files
    const newFilesMatch = planText.match(/New files that need to be created:([\s\S]*?)(?=\n#+\s+|$)/);
    if (newFilesMatch) {
      const newFiles = newFilesMatch[1].trim().split('\n').filter(line => line.trim().startsWith('-'));
      plan.newFiles = newFiles.map(line => line.trim().substring(1).trim());
    }
    
    // Extract database changes
    const dbChangesMatch = planText.match(/Database schema changes:([\s\S]*?)(?=\n#+\s+|$)/);
    if (dbChangesMatch) {
      const dbChanges = dbChangesMatch[1].trim().split('\n').filter(line => line.trim().startsWith('-'));
      plan.databaseChanges = dbChanges.map(line => line.trim().substring(1).trim());
    }
    
    // Extract API changes
    const apiChangesMatch = planText.match(/API endpoints to be added or modified:([\s\S]*?)(?=\n#+\s+|$)/);
    if (apiChangesMatch) {
      const apiChanges = apiChangesMatch[1].trim().split('\n').filter(line => line.trim().startsWith('-'));
      plan.apiChanges = apiChanges.map(line => line.trim().substring(1).trim());
    }
    
    // Extract frontend changes
    const frontendChangesMatch = planText.match(/Frontend components to be added or modified:([\s\S]*?)(?=\n#+\s+|$)/);
    if (frontendChangesMatch) {
      const frontendChanges = frontendChangesMatch[1].trim().split('\n').filter(line => line.trim().startsWith('-'));
      plan.frontendChanges = frontendChanges.map(line => line.trim().substring(1).trim());
    }
    
    // Extract testing strategy
    const testingStrategyMatch = planText.match(/Testing strategy:([\s\S]*?)(?=\n#+\s+|$)/);
    if (testingStrategyMatch) {
      plan.testingStrategy = testingStrategyMatch[1].trim();
    }
    
    return plan;
  }
  
  /**
   * Execute the implementation plan
   * @param {Object} plan - Implementation plan
   * @returns {Promise<Object>} Implementation results
   */
  async executeImplementationPlan(plan) {
    this.logger.info('Executing implementation plan');
    this.events.emit('feature:implementing', { plan });
    
    try {
      const results = {
        modifiedFiles: [],
        createdFiles: [],
        databaseChanges: [],
        success: true
      };
      
      // Implement database changes
      if (plan.databaseChanges.length > 0) {
        await this.implementDatabaseChanges(plan.databaseChanges);
        results.databaseChanges = plan.databaseChanges;
      }
      
      // Implement file changes
      for (const fileChange of plan.fileChanges) {
        const filePath = this.extractFilePath(fileChange);
        if (filePath) {
          await this.modifyExistingFile(filePath, fileChange);
          results.modifiedFiles.push(filePath);
        }
      }
      
      // Create new files
      for (const newFile of plan.newFiles) {
        const filePath = this.extractFilePath(newFile);
        if (filePath) {
          await this.createNewFile(filePath, newFile);
          results.createdFiles.push(filePath);
        }
      }
      
      this.events.emit('feature:implemented', { plan, results });
      return results;
    } catch (error) {
      this.logger.error('Error executing implementation plan', error);
      this.events.emit('feature:implementing:error', { plan, error });
      throw error;
    }
  }
  
  /**
   * Extract file path from a file change description
   * @param {string} fileChange - File change description
   * @returns {string|null} Extracted file path or null if not found
   */
  extractFilePath(fileChange) {
    // Look for patterns like `path/to/file.ts` or `Create a new file at path/to/file.ts`
    const pathMatch = fileChange.match(/(?:^|\s)([a-zA-Z0-9_\-/.]+\.[a-zA-Z0-9]+)(?:\s|$)/);
    if (pathMatch) {
      return pathMatch[1];
    }
    
    return null;
  }
  
  /**
   * Modify an existing file
   * @param {string} filePath - Path to the file
   * @param {string} changeDescription - Description of the changes
   * @returns {Promise<void>}
   */
  async modifyExistingFile(filePath, changeDescription) {
    this.logger.info(`Modifying file: ${filePath}`);
    
    try {
      // Check if file exists
      const fullPath = path.join(this.projectPaths.root, filePath);
      let content;
      
      try {
        content = await fs.readFile(fullPath, 'utf8');
      } catch (error) {
        this.logger.error(`File not found: ${filePath}`, error);
        throw new Error(`File not found: ${filePath}`);
      }
      
      // Use Claude to generate the modified file content
      const prompt = `
You are an expert software developer for the BrasserieBot platform.
You need to modify the following file:

${filePath}

Current content:
\`\`\`
${content}
\`\`\`

Change description:
${changeDescription}

Please provide the complete updated file content with the changes implemented.
Only output the code, no explanations or markdown formatting.
`;
      
      const updatedContent = await this.agent.generateWithClaude({
        prompt,
        maxTokens: 4000
      });
      
      // Write the updated content to the file
      await fs.writeFile(fullPath, updatedContent);
      
      this.logger.info(`Successfully modified file: ${filePath}`);
    } catch (error) {
      this.logger.error(`Error modifying file: ${filePath}`, error);
      throw error;
    }
  }
  
  /**
   * Create a new file
   * @param {string} filePath - Path to the file
   * @param {string} fileDescription - Description of the file
   * @returns {Promise<void>}
   */
  async createNewFile(filePath, fileDescription) {
    this.logger.info(`Creating file: ${filePath}`);
    
    try {
      // Create directory if it doesn't exist
      const fullPath = path.join(this.projectPaths.root, filePath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      
      // Use Claude to generate the file content
      const prompt = `
You are an expert software developer for the BrasserieBot platform.
You need to create a new file:

${filePath}

File description:
${fileDescription}

Please provide the complete file content.
Only output the code, no explanations or markdown formatting.
`;
      
      const fileContent = await this.agent.generateWithClaude({
        prompt,
        maxTokens: 4000
      });
      
      // Write the content to the file
      await fs.writeFile(fullPath, fileContent);
      
      this.logger.info(`Successfully created file: ${filePath}`);
    } catch (error) {
      this.logger.error(`Error creating file: ${filePath}`, error);
      throw error;
    }
  }
  
  /**
   * Implement database changes
   * @param {Array<string>} databaseChanges - Database changes to implement
   * @returns {Promise<void>}
   */
  async implementDatabaseChanges(databaseChanges) {
    this.logger.info('Implementing database changes');
    
    try {
      // Find schema file
      const schemaFiles = await glob('**/schema.prisma', {
        cwd: this.projectPaths.root,
        dot: false
      });
      
      if (schemaFiles.length === 0) {
        this.logger.error('No schema file found');
        throw new Error('No schema file found');
      }
      
      const schemaPath = path.join(this.projectPaths.root, schemaFiles[0]);
      const schemaContent = await fs.readFile(schemaPath, 'utf8');
      
      // Use Claude to generate the updated schema
      const prompt = `
You are an expert database architect for the BrasserieBot platform.
You need to update the Prisma schema with the following changes:

${databaseChanges.join('\n')}

Current schema:
\`\`\`prisma
${schemaContent}
\`\`\`

Please provide the complete updated schema with the changes implemented.
Only output the schema, no explanations or markdown formatting.
`;
      
      const updatedSchema = await this.agent.generateWithClaude({
        prompt,
        maxTokens: 4000
      });
      
      // Write the updated schema to the file
      await fs.writeFile(schemaPath, updatedSchema);
      
      this.logger.info('Successfully implemented database changes');
    } catch (error) {
      this.logger.error('Error implementing database changes', error);
      throw error;
    }
  }
}