/**
 * documentationGenerator.js
 * Generates and updates documentation for the codebase
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { getProjectPaths } from '../utils/config.js';

/**
 * Generates and updates documentation for the codebase
 */
export class DocumentationGenerator {
  /**
   * Create a new DocumentationGenerator instance
   * @param {Object} options - DocumentationGenerator options
   */
  constructor(options) {
    this.agent = options.agent;
    this.config = options.config;
    this.logger = options.logger;
    this.events = options.events;
    this.projectPaths = getProjectPaths(this.config);
  }
  
  /**
   * Generate documentation
   * @param {Object} options - Documentation options
   * @param {string} [options.type] - Type of documentation (api, user, developer)
   * @param {string} [options.path] - Path to document
   * @returns {Promise<Object>} Documentation results
   */
  async generate(options = {}) {
    const { type = 'all', path: docPath } = options;
    
    this.logger.info('Generating documentation', { type, path: docPath });
    this.events.emit('docs:generating', { type, path: docPath });
    
    try {
      const results = {
        generatedDocs: [],
        success: true
      };
      
      // Create docs directory if it doesn't exist
      const docsDir = path.join(this.projectPaths.root, 'docs');
      await fs.mkdir(docsDir, { recursive: true });
      
      // Generate documentation based on type
      if (type === 'api' || type === 'all') {
        const apiDocs = await this.generateApiDocs(docPath);
        results.generatedDocs.push(...apiDocs);
      }
      
      if (type === 'user' || type === 'all') {
        const userDocs = await this.generateUserDocs(docPath);
        results.generatedDocs.push(...userDocs);
      }
      
      if (type === 'developer' || type === 'all') {
        const devDocs = await this.generateDeveloperDocs(docPath);
        results.generatedDocs.push(...devDocs);
      }
      
      // Generate README if requested
      if (type === 'readme' || type === 'all') {
        const readmeDocs = await this.generateReadme();
        results.generatedDocs.push(...readmeDocs);
      }
      
      this.events.emit('docs:generated', results);
      return results;
    } catch (error) {
      this.logger.error('Error generating documentation', error);
      this.events.emit('docs:generating:error', { type, path: docPath, error });
      throw error;
    }
  }
  
  /**
   * Generate API documentation
   * @param {string} [docPath] - Path to document
   * @returns {Promise<Array<Object>>} Generated API documentation
   */
  async generateApiDocs(docPath) {
    this.logger.info('Generating API documentation');
    
    try {
      const results = [];
      
      // Create API docs directory
      const apiDocsDir = path.join(this.projectPaths.root, 'docs/api');
      await fs.mkdir(apiDocsDir, { recursive: true });
      
      // Find controller files to document
      const controllerPattern = docPath 
        ? path.join(docPath, '**/*.controller.ts')
        : '**/src/**/*.controller.ts';
      
      const controllerFiles = await glob(controllerPattern, {
        cwd: this.projectPaths.root,
        ignore: ['**/node_modules/**'],
        dot: false
      });
      
      // Generate documentation for each controller
      for (const filePath of controllerFiles) {
        const content = await fs.readFile(path.join(this.projectPaths.root, filePath), 'utf8');
        const controllerName = path.basename(filePath, '.controller.ts');
        
        // Use Claude to generate API documentation
        const prompt = `
You are an expert technical writer for the BrasserieBot platform.
You need to generate API documentation for the following controller:

${filePath}:
\`\`\`
${content}
\`\`\`

Please generate comprehensive API documentation in Markdown format that includes:
1. An overview of the controller's purpose
2. Detailed documentation for each endpoint, including:
   - HTTP method and path
   - Request parameters and body schema
   - Response schema and status codes
   - Authentication requirements
   - Example requests and responses

Format the documentation as a well-structured Markdown file.
`;
        
        const docContent = await this.agent.generateWithClaude({
          prompt,
          maxTokens: 3000
        });
        
        // Write the documentation file
        const docFileName = `${controllerName}.md`;
        const docFilePath = path.join(apiDocsDir, docFileName);
        await fs.writeFile(docFilePath, docContent);
        
        results.push({
          path: path.relative(this.projectPaths.root, docFilePath),
          type: 'api',
          success: true
        });
      }
      
      // Generate API index file
      if (results.length > 0) {
        const indexPath = path.join(apiDocsDir, 'index.md');
        const indexContent = await this.generateApiIndex(results);
        await fs.writeFile(indexPath, indexContent);
        
        results.push({
          path: path.relative(this.projectPaths.root, indexPath),
          type: 'api-index',
          success: true
        });
      }
      
      return results;
    } catch (error) {
      this.logger.error('Error generating API documentation', error);
      return [{
        path: 'docs/api',
        type: 'api',
        success: false,
        error: error.message
      }];
    }
  }
  
  /**
   * Generate API documentation index
   * @param {Array<Object>} apiDocs - Generated API documentation
   * @returns {Promise<string>} API index content
   */
  async generateApiIndex(apiDocs) {
    const apiDocFiles = apiDocs.map(doc => doc.path);
    
    // Use Claude to generate the API index
    const prompt = `
You are an expert technical writer for the BrasserieBot platform.
You need to generate an index page for the API documentation.

The following API documentation files have been generated:
${apiDocFiles.join('\n')}

Please generate a comprehensive API documentation index in Markdown format that:
1. Provides an overview of the API
2. Lists and categorizes all the available endpoints
3. Includes links to the individual API documentation files
4. Explains authentication and common request/response patterns

Format the documentation as a well-structured Markdown file.
`;
    
    const indexContent = await this.agent.generateWithClaude({
      prompt,
      maxTokens: 2000
    });
    
    return indexContent;
  }
  
  /**
   * Generate user documentation
   * @param {string} [docPath] - Path to document
   * @returns {Promise<Array<Object>>} Generated user documentation
   */
  async generateUserDocs(docPath) {
    this.logger.info('Generating user documentation');
    
    try {
      const results = [];
      
      // Create user docs directory
      const userDocsDir = path.join(this.projectPaths.root, 'docs/user');
      await fs.mkdir(userDocsDir, { recursive: true });
      
      // Define user documentation sections
      const sections = [
        {
          title: 'Getting Started',
          filename: 'getting-started.md',
          description: 'Guide for new users to get started with BrasserieBot'
        },
        {
          title: 'Dashboard Guide',
          filename: 'dashboard-guide.md',
          description: 'Comprehensive guide to using the BrasserieBot dashboard'
        },
        {
          title: 'AI Business Advisor',
          filename: 'ai-business-advisor.md',
          description: 'How to use the AI Business Advisor feature'
        },
        {
          title: 'Integration Guide',
          filename: 'integration-guide.md',
          description: 'Guide to integrating BrasserieBot with other systems'
        },
        {
          title: 'Supplier Payment System',
          filename: 'supplier-payment-system.md',
          description: 'How to use the Supplier Payment System'
        }
      ];
      
      // Generate documentation for each section
      for (const section of sections) {
        // Use Claude to generate user documentation
        const prompt = `
You are an expert technical writer for the BrasserieBot platform, an AI-driven hospitality operating system.
You need to generate user documentation for the "${section.title}" section.

This documentation should:
1. Be written for restaurant owners and staff who will use the platform
2. Explain the feature in clear, non-technical language
3. Include step-by-step instructions with examples
4. Cover common use cases and troubleshooting
5. Include tips for getting the most out of the feature

The documentation is about: ${section.description}

Format the documentation as a well-structured Markdown file with appropriate headings, lists, and emphasis.
`;
        
        const docContent = await this.agent.generateWithClaude({
          prompt,
          maxTokens: 3000
        });
        
        // Write the documentation file
        const docFilePath = path.join(userDocsDir, section.filename);
        await fs.writeFile(docFilePath, docContent);
        
        results.push({
          path: path.relative(this.projectPaths.root, docFilePath),
          type: 'user',
          success: true
        });
      }
      
      // Generate user documentation index
      const indexPath = path.join(userDocsDir, 'index.md');
      const indexContent = await this.generateUserIndex(sections);
      await fs.writeFile(indexPath, indexContent);
      
      results.push({
        path: path.relative(this.projectPaths.root, indexPath),
        type: 'user-index',
        success: true
      });
      
      return results;
    } catch (error) {
      this.logger.error('Error generating user documentation', error);
      return [{
        path: 'docs/user',
        type: 'user',
        success: false,
        error: error.message
      }];
    }
  }
  
  /**
   * Generate user documentation index
   * @param {Array<Object>} sections - Documentation sections
   * @returns {Promise<string>} User index content
   */
  async generateUserIndex(sections) {
    // Use Claude to generate the user documentation index
    const prompt = `
You are an expert technical writer for the BrasserieBot platform.
You need to generate an index page for the user documentation.

The following user documentation sections have been generated:
${sections.map(section => `- ${section.title}: ${section.description} (${section.filename})`).join('\n')}

Please generate a comprehensive user documentation index in Markdown format that:
1. Provides an overview of the BrasserieBot platform
2. Explains who the documentation is for and how to use it
3. Lists and briefly describes each documentation section with links
4. Includes a "Quick Start" section for new users

Format the documentation as a well-structured Markdown file.
`;
    
    const indexContent = await this.agent.generateWithClaude({
      prompt,
      maxTokens: 2000
    });
    
    return indexContent;
  }
  
  /**
   * Generate developer documentation
   * @param {string} [docPath] - Path to document
   * @returns {Promise<Array<Object>>} Generated developer documentation
   */
  async generateDeveloperDocs(docPath) {
    this.logger.info('Generating developer documentation');
    
    try {
      const results = [];
      
      // Create developer docs directory
      const devDocsDir = path.join(this.projectPaths.root, 'docs/developer');
      await fs.mkdir(devDocsDir, { recursive: true });
      
      // Define developer documentation sections
      const sections = [
        {
          title: 'Architecture Overview',
          filename: 'architecture.md',
          description: 'Overview of the BrasserieBot architecture'
        },
        {
          title: 'Backend Development Guide',
          filename: 'backend-guide.md',
          description: 'Guide to developing the BrasserieBot backend'
        },
        {
          title: 'Frontend Development Guide',
          filename: 'frontend-guide.md',
          description: 'Guide to developing the BrasserieBot frontend'
        },
        {
          title: 'Database Schema',
          filename: 'database-schema.md',
          description: 'Documentation of the BrasserieBot database schema'
        },
        {
          title: 'Testing Guide',
          filename: 'testing-guide.md',
          description: 'Guide to testing the BrasserieBot platform'
        },
        {
          title: 'Deployment Guide',
          filename: 'deployment-guide.md',
          description: 'Guide to deploying the BrasserieBot platform'
        }
      ];
      
      // Generate documentation for each section
      for (const section of sections) {
        // Use Claude to generate developer documentation
        const prompt = `
You are an expert technical writer for the BrasserieBot platform, an AI-driven hospitality operating system.
You need to generate developer documentation for the "${section.title}" section.

This documentation should:
1. Be written for developers who will work on the platform
2. Explain the technical aspects in clear, precise language
3. Include code examples and configuration snippets where appropriate
4. Cover best practices and conventions
5. Reference relevant files and components in the codebase

The documentation is about: ${section.description}

Format the documentation as a well-structured Markdown file with appropriate headings, code blocks, and diagrams described in text.
`;
        
        const docContent = await this.agent.generateWithClaude({
          prompt,
          maxTokens: 3000
        });
        
        // Write the documentation file
        const docFilePath = path.join(devDocsDir, section.filename);
        await fs.writeFile(docFilePath, docContent);
        
        results.push({
          path: path.relative(this.projectPaths.root, docFilePath),
          type: 'developer',
          success: true
        });
      }
      
      // Generate developer documentation index
      const indexPath = path.join(devDocsDir, 'index.md');
      const indexContent = await this.generateDeveloperIndex(sections);
      await fs.writeFile(indexPath, indexContent);
      
      results.push({
        path: path.relative(this.projectPaths.root, indexPath),
        type: 'developer-index',
        success: true
      });
      
      return results;
    } catch (error) {
      this.logger.error('Error generating developer documentation', error);
      return [{
        path: 'docs/developer',
        type: 'developer',
        success: false,
        error: error.message
      }];
    }
  }
  
  /**
   * Generate developer documentation index
   * @param {Array<Object>} sections - Documentation sections
   * @returns {Promise<string>} Developer index content
   */
  async generateDeveloperIndex(sections) {
    // Use Claude to generate the developer documentation index
    const prompt = `
You are an expert technical writer for the BrasserieBot platform.
You need to generate an index page for the developer documentation.

The following developer documentation sections have been generated:
${sections.map(section => `- ${section.title}: ${section.description} (${section.filename})`).join('\n')}

Please generate a comprehensive developer documentation index in Markdown format that:
1. Provides an overview of the BrasserieBot platform architecture
2. Explains the development workflow and environment setup
3. Lists and briefly describes each documentation section with links
4. Includes a "Getting Started for Developers" section

Format the documentation as a well-structured Markdown file.
`;
    
    const indexContent = await this.agent.generateWithClaude({
      prompt,
      maxTokens: 2000
    });
    
    return indexContent;
  }
  
  /**
   * Generate README file
   * @returns {Promise<Array<Object>>} Generated README
   */
  async generateReadme() {
    this.logger.info('Generating README');
    
    try {
      // Use Claude to generate the README
      const prompt = `
You are an expert technical writer for the BrasserieBot platform, an AI-driven hospitality operating system.
You need to generate a comprehensive README.md file for the project.

The README should:
1. Provide a clear overview of the BrasserieBot platform
2. Highlight key features and benefits
3. Include installation and setup instructions
4. Explain the technology stack
5. Provide information on how to contribute
6. Include license information

Format the documentation as a well-structured Markdown file with appropriate headings, lists, and emphasis.
`;
      
      const readmeContent = await this.agent.generateWithClaude({
        prompt,
        maxTokens: 3000
      });
      
      // Write the README file
      const readmePath = path.join(this.projectPaths.root, 'README.md');
      await fs.writeFile(readmePath, readmeContent);
      
      return [{
        path: 'README.md',
        type: 'readme',
        success: true
      }];
    } catch (error) {
      this.logger.error('Error generating README', error);
      return [{
        path: 'README.md',
        type: 'readme',
        success: false,
        error: error.message
      }];
    }
  }
  
  /**
   * Update documentation based on changes
   * @param {Object} options - Update options
   * @param {string} [options.feature] - Feature description
   * @param {Object} [options.implementation] - Implementation results
   * @param {Object} [options.testResults] - Test results
   * @returns {Promise<Object>} Update results
   */
  async updateDocumentation(options = {}) {
    const { feature, implementation, testResults } = options;
    
    this.logger.info('Updating documentation', { feature });
    this.events.emit('docs:updating', { feature });
    
    try {
      const results = {
        updatedDocs: [],
        success: true
      };
      
      // Update API documentation if needed
      if (implementation && implementation.modifiedFiles) {
        const controllerFiles = implementation.modifiedFiles.filter(file => file.includes('.controller.'));
        
        if (controllerFiles.length > 0) {
          const apiDocs = await this.generateApiDocs();
          results.updatedDocs.push(...apiDocs);
        }
      }
      
      // Update README if it's a significant feature
      if (feature && feature.length > 50) {
        const readmeDocs = await this.generateReadme();
        results.updatedDocs.push(...readmeDocs);
      }
      
      this.events.emit('docs:updated', results);
      return results;
    } catch (error) {
      this.logger.error('Error updating documentation', error);
      this.events.emit('docs:updating:error', { feature, error });
      throw error;
    }
  }
}