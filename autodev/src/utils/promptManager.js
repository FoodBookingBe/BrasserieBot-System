/**
 * promptManager.js
 * Manages prompt templates for the AutoDev agent
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

/**
 * Manages prompt templates for different tasks
 */
export class PromptManager {
  /**
   * Create a new PromptManager instance
   * @param {Object} options - PromptManager options
   * @param {string} options.templatesDir - Directory containing prompt templates
   * @param {Object} options.config - Configuration object
   */
  constructor(options) {
    this.templatesDir = options.templatesDir;
    this.config = options.config;
    this.templates = {};
    this.loaded = false;
  }
  
  /**
   * Load all prompt templates from the templates directory
   * @returns {Promise<Object>} Loaded templates
   */
  async loadTemplates() {
    try {
      // Find all template files
      const templateFiles = await glob('**/*.{txt,md}', {
        cwd: this.templatesDir,
        absolute: false
      });
      
      // Load each template file
      for (const file of templateFiles) {
        const templateName = path.basename(file, path.extname(file));
        const templatePath = path.join(this.templatesDir, file);
        const templateContent = await fs.readFile(templatePath, 'utf8');
        
        // Store template
        this.templates[templateName] = templateContent;
      }
      
      this.loaded = true;
      return this.templates;
    } catch (error) {
      console.error('Error loading prompt templates:', error.message);
      throw error;
    }
  }
  
  /**
   * Get a prompt template by name
   * @param {string} name - Template name
   * @returns {Promise<string>} Template content
   */
  async getTemplate(name) {
    if (!this.loaded) {
      await this.loadTemplates();
    }
    
    if (!this.templates[name]) {
      throw new Error(`Template not found: ${name}`);
    }
    
    return this.templates[name];
  }
  
  /**
   * Render a prompt template with variables
   * @param {string} templateName - Template name
   * @param {Object} variables - Variables to replace in the template
   * @returns {Promise<string>} Rendered prompt
   */
  async renderTemplate(templateName, variables = {}) {
    const template = await this.getTemplate(templateName);
    
    // Replace variables in the template
    let renderedPrompt = template;
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      renderedPrompt = renderedPrompt.replace(new RegExp(placeholder, 'g'), value);
    }
    
    return renderedPrompt;
  }
  
  /**
   * Create a new prompt template
   * @param {string} name - Template name
   * @param {string} content - Template content
   * @returns {Promise<void>}
   */
  async createTemplate(name, content) {
    if (!name || !content) {
      throw new Error('Template name and content are required');
    }
    
    // Ensure templates directory exists
    await fs.mkdir(this.templatesDir, { recursive: true });
    
    // Write template file
    const templatePath = path.join(this.templatesDir, `${name}.txt`);
    await fs.writeFile(templatePath, content);
    
    // Update in-memory templates
    this.templates[name] = content;
  }
  
  /**
   * Update an existing prompt template
   * @param {string} name - Template name
   * @param {string} content - New template content
   * @returns {Promise<void>}
   */
  async updateTemplate(name, content) {
    if (!this.loaded) {
      await this.loadTemplates();
    }
    
    if (!this.templates[name]) {
      throw new Error(`Template not found: ${name}`);
    }
    
    // Find template file
    const templateFiles = await glob(`${name}.{txt,md}`, {
      cwd: this.templatesDir,
      absolute: false
    });
    
    if (templateFiles.length === 0) {
      throw new Error(`Template file not found: ${name}`);
    }
    
    // Update template file
    const templatePath = path.join(this.templatesDir, templateFiles[0]);
    await fs.writeFile(templatePath, content);
    
    // Update in-memory template
    this.templates[name] = content;
  }
  
  /**
   * Delete a prompt template
   * @param {string} name - Template name
   * @returns {Promise<void>}
   */
  async deleteTemplate(name) {
    if (!this.loaded) {
      await this.loadTemplates();
    }
    
    if (!this.templates[name]) {
      throw new Error(`Template not found: ${name}`);
    }
    
    // Find template file
    const templateFiles = await glob(`${name}.{txt,md}`, {
      cwd: this.templatesDir,
      absolute: false
    });
    
    if (templateFiles.length === 0) {
      throw new Error(`Template file not found: ${name}`);
    }
    
    // Delete template file
    const templatePath = path.join(this.templatesDir, templateFiles[0]);
    await fs.unlink(templatePath);
    
    // Remove from in-memory templates
    delete this.templates[name];
  }
  
  /**
   * Get all available template names
   * @returns {Promise<Array<string>>} Array of template names
   */
  async getTemplateNames() {
    if (!this.loaded) {
      await this.loadTemplates();
    }
    
    return Object.keys(this.templates);
  }
}