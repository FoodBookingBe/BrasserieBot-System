/**
 * codeAnalyzer.js
 * Analyzes the codebase to build a comprehensive understanding
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { getProjectPaths } from '../utils/config.js';

/**
 * Analyzes the codebase to build a comprehensive understanding
 */
export class CodeAnalyzer {
  /**
   * Create a new CodeAnalyzer instance
   * @param {Object} options - CodeAnalyzer options
   */
  constructor(options) {
    this.agent = options.agent;
    this.config = options.config;
    this.logger = options.logger;
    this.events = options.events;
    this.projectPaths = getProjectPaths(this.config);
    this.fileCache = new Map();
  }
  
  /**
   * Analyze the codebase
   * @returns {Promise<Object>} Analysis results
   */
  async analyze() {
    this.logger.info('Starting codebase analysis');
    this.events.emit('analysis:start');
    
    try {
      // Analyze project structure
      const structure = await this.analyzeProjectStructure();
      
      // Analyze backend
      const backend = await this.analyzeBackend();
      
      // Analyze frontend
      const frontend = await this.analyzeFrontend();
      
      // Analyze database
      const database = await this.analyzeDatabase();
      
      // Generate dependency graph
      const dependencies = await this.analyzeDependencies();
      
      // Generate summary
      const summary = await this.generateSummary({
        structure,
        backend,
        frontend,
        database,
        dependencies
      });
      
      const analysis = {
        timestamp: new Date().toISOString(),
        structure,
        backend,
        frontend,
        database,
        dependencies,
        summary
      };
      
      this.events.emit('analysis:complete', analysis);
      return analysis;
    } catch (error) {
      this.logger.error('Error analyzing codebase', error);
      this.events.emit('analysis:error', error);
      throw error;
    }
  }
  
  /**
   * Analyze project structure
   * @returns {Promise<Object>} Project structure analysis
   */
  async analyzeProjectStructure() {
    this.logger.info('Analyzing project structure');
    
    try {
      const structure = {
        directories: {},
        fileTypes: {},
        fileCount: 0
      };
      
      // Get all files in the project
      const files = await glob('**/*', {
        cwd: this.projectPaths.root,
        ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**'],
        dot: false,
        nodir: true
      });
      
      structure.fileCount = files.length;
      
      // Analyze file types and directory structure
      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        
        // Count file types
        if (ext) {
          structure.fileTypes[ext] = (structure.fileTypes[ext] || 0) + 1;
        }
        
        // Analyze directory structure
        const dir = path.dirname(file);
        if (dir !== '.') {
          if (!structure.directories[dir]) {
            structure.directories[dir] = { fileCount: 0 };
          }
          structure.directories[dir].fileCount++;
        }
      }
      
      return structure;
    } catch (error) {
      this.logger.error('Error analyzing project structure', error);
      throw error;
    }
  }
  
  /**
   * Analyze backend codebase
   * @returns {Promise<Object>} Backend analysis
   */
  async analyzeBackend() {
    this.logger.info('Analyzing backend codebase');
    
    try {
      const backend = {
        modules: {},
        controllers: {},
        services: {},
        entities: {},
        middleware: {},
        utils: {},
        tests: {}
      };
      
      // Get all TypeScript files in the backend
      const files = await glob('**/*.ts', {
        cwd: this.projectPaths.backendSrc,
        ignore: ['**/*.spec.ts', '**/*.test.ts', '**/*.d.ts'],
        dot: false
      });
      
      // Analyze each file
      for (const file of files) {
        const filePath = path.join(this.projectPaths.backendSrc, file);
        const content = await this.readFile(filePath);
        
        // Identify file type based on naming conventions
        if (file.includes('.module.ts')) {
          const moduleName = path.basename(file, '.module.ts');
          backend.modules[moduleName] = {
            path: file,
            imports: this.extractImports(content)
          };
        } else if (file.includes('.controller.ts')) {
          const controllerName = path.basename(file, '.controller.ts');
          backend.controllers[controllerName] = {
            path: file,
            endpoints: this.extractEndpoints(content)
          };
        } else if (file.includes('.service.ts')) {
          const serviceName = path.basename(file, '.service.ts');
          backend.services[serviceName] = {
            path: file,
            methods: this.extractMethods(content)
          };
        }
      }
      
      return backend;
    } catch (error) {
      this.logger.error('Error analyzing backend codebase', error);
      throw error;
    }
  }
  
  /**
   * Analyze frontend codebase
   * @returns {Promise<Object>} Frontend analysis
   */
  async analyzeFrontend() {
    this.logger.info('Analyzing frontend codebase');
    
    try {
      const frontend = {
        components: {},
        pages: {},
        hooks: {},
        utils: {}
      };
      
      // Check if frontend directory exists
      try {
        await fs.access(this.projectPaths.frontendSrc);
      } catch (error) {
        this.logger.warn('Frontend directory not found, skipping frontend analysis');
        return frontend;
      }
      
      // Get all TypeScript/JavaScript/JSX/TSX files in the frontend
      const files = await glob('**/*.{ts,tsx,js,jsx}', {
        cwd: this.projectPaths.frontendSrc,
        ignore: ['**/*.spec.ts', '**/*.test.ts', '**/*.d.ts', '**/node_modules/**'],
        dot: false
      });
      
      // Analyze each file based on directory structure
      for (const file of files) {
        const filePath = path.join(this.projectPaths.frontendSrc, file);
        const content = await this.readFile(filePath);
        
        if (file.includes('/components/') || file.includes('/Components/')) {
          const componentName = path.basename(file, path.extname(file));
          frontend.components[componentName] = {
            path: file,
            imports: this.extractImports(content)
          };
        } else if (file.includes('/pages/') || file.includes('/Pages/')) {
          const pageName = path.basename(file, path.extname(file));
          frontend.pages[pageName] = {
            path: file,
            imports: this.extractImports(content)
          };
        }
      }
      
      return frontend;
    } catch (error) {
      this.logger.error('Error analyzing frontend codebase', error);
      throw error;
    }
  }
  
  /**
   * Analyze database schema
   * @returns {Promise<Object>} Database analysis
   */
  async analyzeDatabase() {
    this.logger.info('Analyzing database schema');
    
    try {
      const database = {
        models: {},
        relationships: [],
        enums: {}
      };
      
      // Find schema file
      const schemaFiles = await glob('**/schema.prisma', {
        cwd: this.projectPaths.root,
        dot: false
      });
      
      if (schemaFiles.length === 0) {
        this.logger.warn('No schema file found, skipping database analysis');
        return database;
      }
      
      const schemaPath = path.join(this.projectPaths.root, schemaFiles[0]);
      const schemaContent = await this.readFile(schemaPath);
      
      // Extract models
      const modelRegex = /model\s+(\w+)\s+{([^}]*)}/g;
      let modelMatch;
      
      while ((modelMatch = modelRegex.exec(schemaContent)) !== null) {
        const modelName = modelMatch[1];
        const modelBody = modelMatch[2];
        
        database.models[modelName] = {
          fields: {}
        };
        
        // Extract fields
        const fieldLines = modelBody.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('//'));
        
        for (const line of fieldLines) {
          const fieldMatch = line.match(/(\w+)\s+(\w+)(\??)(\[\])?/);
          if (fieldMatch) {
            const [, fieldName, fieldType] = fieldMatch;
            database.models[modelName].fields[fieldName] = { type: fieldType };
          }
        }
      }
      
      // Extract enums
      const enumRegex = /enum\s+(\w+)\s+{([^}]*)}/g;
      let enumMatch;
      
      while ((enumMatch = enumRegex.exec(schemaContent)) !== null) {
        const enumName = enumMatch[1];
        const enumBody = enumMatch[2];
        
        database.enums[enumName] = {
          values: enumBody.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('//'))
        };
      }
      
      return database;
    } catch (error) {
      this.logger.error('Error analyzing database schema', error);
      throw error;
    }
  }
  
  /**
   * Analyze dependencies between modules
   * @returns {Promise<Object>} Dependency analysis
   */
  async analyzeDependencies() {
    this.logger.info('Analyzing dependencies');
    
    try {
      const dependencies = {
        modules: {},
        services: {}
      };
      
      // Analyze backend module dependencies
      const moduleFiles = await glob('**/*.module.ts', {
        cwd: this.projectPaths.backendSrc,
        dot: false
      });
      
      for (const file of moduleFiles) {
        const filePath = path.join(this.projectPaths.backendSrc, file);
        const content = await this.readFile(filePath);
        
        const moduleName = path.basename(file, '.module.ts');
        const imports = this.extractImports(content);
        
        dependencies.modules[moduleName] = {
          imports: imports.filter(imp => imp.endsWith('Module')).map(imp => imp.replace('Module', '')),
          path: file
        };
      }
      
      return dependencies;
    } catch (error) {
      this.logger.error('Error analyzing dependencies', error);
      throw error;
    }
  }
  
  /**
   * Generate a summary of the codebase analysis
   * @param {Object} analysis - Analysis results
   * @returns {Promise<string>} Summary
   */
  async generateSummary(analysis) {
    this.logger.info('Generating analysis summary');
    
    try {
      // Use Claude to generate a summary
      const prompt = `
You are analyzing a codebase for the BrasserieBot platform, an AI-driven hospitality operating system.
Based on the following analysis data, provide a concise summary of the codebase architecture, key components, and relationships.

Project Structure:
- Total files: ${analysis.structure.fileCount}
- File types: ${JSON.stringify(analysis.structure.fileTypes)}

Backend:
- Modules: ${Object.keys(analysis.backend.modules).join(', ')}
- Controllers: ${Object.keys(analysis.backend.controllers).join(', ')}
- Services: ${Object.keys(analysis.backend.services).join(', ')}

Frontend:
- Components: ${Object.keys(analysis.frontend.components).join(', ')}
- Pages: ${Object.keys(analysis.frontend.pages).join(', ')}

Database:
- Models: ${Object.keys(analysis.database.models).join(', ')}
- Enums: ${Object.keys(analysis.database.enums).join(', ')}

Provide a concise summary (maximum 300 words) that would help a developer understand the overall architecture and organization of the codebase.
`;
      
      const summary = await this.agent.generateWithClaude({
        prompt,
        maxTokens: 500
      });
      
      return summary;
    } catch (error) {
      this.logger.error('Error generating analysis summary', error);
      return 'Error generating summary. Please check the logs for details.';
    }
  }
  
  /**
   * Read a file and cache its content
   * @param {string} filePath - Path to the file
   * @returns {Promise<string>} File content
   */
  async readFile(filePath) {
    if (this.fileCache.has(filePath)) {
      return this.fileCache.get(filePath);
    }
    
    try {
      const content = await fs.readFile(filePath, 'utf8');
      this.fileCache.set(filePath, content);
      return content;
    } catch (error) {
      this.logger.error(`Error reading file: ${filePath}`, error);
      throw error;
    }
  }
  
  /**
   * Extract imports from file content
   * @param {string} content - File content
   * @returns {Array<string>} Extracted imports
   */
  extractImports(content) {
    const imports = [];
    const importRegex = /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importedItems = match[1].split(',').map(item => item.trim());
      imports.push(...importedItems);
    }
    
    return imports;
  }
  
  /**
   * Extract endpoints from controller file content
   * @param {string} content - File content
   * @returns {Array<Object>} Extracted endpoints
   */
  extractEndpoints(content) {
    const endpoints = [];
    const methodRegex = /@(Get|Post|Put|Delete|Patch)\(['"](.*?)['"]\)/g;
    let match;
    
    while ((match = methodRegex.exec(content)) !== null) {
      const method = match[1];
      const path = match[2];
      endpoints.push({ method, path });
    }
    
    return endpoints;
  }
  
  /**
   * Extract methods from service file content
   * @param {string} content - File content
   * @returns {Array<Object>} Extracted methods
   */
  extractMethods(content) {
    const methods = [];
    const methodRegex = /async\s+(\w+)\s*\(([^)]*)\)/g;
    let match;
    
    while ((match = methodRegex.exec(content)) !== null) {
      const methodName = match[1];
      methods.push({ name: methodName });
    }
    
    return methods;
  }
}
