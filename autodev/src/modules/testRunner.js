/**
 * testRunner.js
 * Generates and runs tests for the codebase
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { spawn } from 'child_process';
import { getProjectPaths } from '../utils/config.js';

/**
 * Generates and runs tests for the codebase
 */
export class TestRunner {
  /**
   * Create a new TestRunner instance
   * @param {Object} options - TestRunner options
   */
  constructor(options) {
    this.agent = options.agent;
    this.config = options.config;
    this.logger = options.logger;
    this.events = options.events;
    this.projectPaths = getProjectPaths(this.config);
  }
  
  /**
   * Generate tests for the codebase
   * @param {Object} options - Test generation options
   * @param {string} [options.path] - Path to generate tests for
   * @param {string} [options.type] - Type of tests to generate (unit, integration, e2e)
   * @returns {Promise<Object>} Generated tests
   */
  async generateTests(options = {}) {
    const { path: testPath, type = 'unit' } = options;
    
    this.logger.info('Generating tests', { path: testPath, type });
    this.events.emit('tests:generating', { path: testPath, type });
    
    try {
      const results = {
        generatedTests: [],
        success: true
      };
      
      // If path is specified, generate tests for that path
      if (testPath) {
        const fullPath = path.join(this.projectPaths.root, testPath);
        const isDirectory = (await fs.stat(fullPath)).isDirectory();
        
        if (isDirectory) {
          // Generate tests for all files in the directory
          const files = await glob('**/*.{ts,js}', {
            cwd: fullPath,
            ignore: ['**/*.{spec,test}.{ts,js}', '**/node_modules/**'],
            dot: false
          });
          
          for (const file of files) {
            const filePath = path.join(testPath, file);
            const testFile = await this.generateTestForFile(filePath, type);
            results.generatedTests.push(testFile);
          }
        } else {
          // Generate test for a single file
          const testFile = await this.generateTestForFile(testPath, type);
          results.generatedTests.push(testFile);
        }
      } else {
        // Generate tests for key components based on type
        if (type === 'unit' || type === 'all') {
          // Generate unit tests for services
          const serviceFiles = await glob('**/src/**/*.service.ts', {
            cwd: this.projectPaths.root,
            ignore: ['**/node_modules/**'],
            dot: false
          });
          
          for (const file of serviceFiles) {
            const testFile = await this.generateTestForFile(file, 'unit');
            results.generatedTests.push(testFile);
          }
        }
        
        if (type === 'integration' || type === 'all') {
          // Generate integration tests for controllers
          const controllerFiles = await glob('**/src/**/*.controller.ts', {
            cwd: this.projectPaths.root,
            ignore: ['**/node_modules/**'],
            dot: false
          });
          
          for (const file of controllerFiles) {
            const testFile = await this.generateTestForFile(file, 'integration');
            results.generatedTests.push(testFile);
          }
        }
        
        if (type === 'e2e' || type === 'all') {
          // Generate e2e tests for key endpoints
          const e2eTests = await this.generateE2ETests();
          results.generatedTests.push(...e2eTests);
        }
      }
      
      this.events.emit('tests:generated', results);
      return results;
    } catch (error) {
      this.logger.error('Error generating tests', error);
      this.events.emit('tests:generating:error', { path: testPath, type, error });
      throw error;
    }
  }
  
  /**
   * Generate a test file for a specific file
   * @param {string} filePath - Path to the file
   * @param {string} type - Type of test to generate
   * @returns {Promise<Object>} Generated test file
   */
  async generateTestForFile(filePath, type) {
    this.logger.info(`Generating ${type} test for: ${filePath}`);
    
    try {
      // Read the source file
      const fullPath = path.join(this.projectPaths.root, filePath);
      const content = await fs.readFile(fullPath, 'utf8');
      
      // Determine the test file path
      const ext = path.extname(filePath);
      const baseName = path.basename(filePath, ext);
      const dirName = path.dirname(filePath);
      
      let testFileName;
      if (type === 'unit' || type === 'integration') {
        testFileName = `${baseName}.spec${ext}`;
      } else if (type === 'e2e') {
        testFileName = `${baseName}.e2e-spec${ext}`;
      }
      
      const testFilePath = path.join(dirName, testFileName);
      const fullTestPath = path.join(this.projectPaths.root, testFilePath);
      
      // Check if test file already exists
      let existingTest = '';
      try {
        existingTest = await fs.readFile(fullTestPath, 'utf8');
      } catch (error) {
        // File doesn't exist, which is fine
      }
      
      // Use Claude to generate the test
      const prompt = `
You are an expert test engineer for the BrasserieBot platform.
You need to generate a ${type} test for the following file:

${filePath}:
\`\`\`
${content}
\`\`\`

${existingTest ? `Existing test file:\n\`\`\`\n${existingTest}\n\`\`\`` : ''}

Please generate a comprehensive ${type} test file that:
1. Tests all public methods and functionality
2. Includes appropriate mocks and test data
3. Follows best practices for ${type} testing
4. Uses Jest as the testing framework
5. Follows the existing test patterns in the codebase

Only output the test code, no explanations or markdown formatting.
`;
      
      const testContent = await this.agent.generateWithClaude({
        prompt,
        maxTokens: 4000
      });
      
      // Create directory if it doesn't exist
      await fs.mkdir(path.dirname(fullTestPath), { recursive: true });
      
      // Write the test file
      await fs.writeFile(fullTestPath, testContent);
      
      return {
        path: testFilePath,
        type,
        success: true
      };
    } catch (error) {
      this.logger.error(`Error generating test for: ${filePath}`, error);
      return {
        path: filePath,
        type,
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Generate end-to-end tests
   * @returns {Promise<Array<Object>>} Generated e2e tests
   */
  async generateE2ETests() {
    this.logger.info('Generating e2e tests');
    
    try {
      const results = [];
      
      // Find existing e2e test directory
      const e2eDir = path.join(this.projectPaths.tests);
      
      // Generate app.e2e-spec.ts if it doesn't exist or is empty
      const appE2EPath = path.join(e2eDir, 'app.e2e-spec.ts');
      let existingAppE2E = '';
      
      try {
        existingAppE2E = await fs.readFile(appE2EPath, 'utf8');
      } catch (error) {
        // File doesn't exist, which is fine
      }
      
      if (!existingAppE2E) {
        // Use Claude to generate the e2e test
        const prompt = `
You are an expert test engineer for the BrasserieBot platform.
You need to generate an end-to-end test suite for the application.

The test should:
1. Test key API endpoints
2. Verify authentication flows
3. Test critical business logic
4. Follow best practices for e2e testing
5. Use Jest and supertest for testing

Please generate a comprehensive e2e test file named app.e2e-spec.ts.
Only output the test code, no explanations or markdown formatting.
`;
        
        const testContent = await this.agent.generateWithClaude({
          prompt,
          maxTokens: 4000
        });
        
        // Create directory if it doesn't exist
        await fs.mkdir(e2eDir, { recursive: true });
        
        // Write the test file
        await fs.writeFile(appE2EPath, testContent);
        
        results.push({
          path: path.relative(this.projectPaths.root, appE2EPath),
          type: 'e2e',
          success: true
        });
      }
      
      return results;
    } catch (error) {
      this.logger.error('Error generating e2e tests', error);
      return [{
        path: 'e2e-tests',
        type: 'e2e',
        success: false,
        error: error.message
      }];
    }
  }
  
  /**
   * Run tests
   * @param {Object} options - Test options
   * @param {string} [options.path] - Path to test
   * @param {string} [options.type] - Type of tests to run (unit, integration, e2e)
   * @returns {Promise<Object>} Test results
   */
  async runTests(options = {}) {
    const { path: testPath, type } = options;
    
    this.logger.info('Running tests', { path: testPath, type });
    this.events.emit('tests:running', { path: testPath, type });
    
    try {
      let command = 'npm';
      let args = ['run', 'test'];
      
      // Determine the command based on the test type
      if (type === 'e2e') {
        args = ['run', 'test:e2e'];
      } else if (type === 'coverage') {
        args = ['run', 'test:cov'];
      }
      
      // Add path if specified
      if (testPath) {
        args.push('--', testPath);
      }
      
      // Run the tests
      const results = await this.executeCommand(command, args, this.projectPaths.backend);
      
      // Parse the test results
      const parsedResults = this.parseTestResults(results.stdout);
      
      this.events.emit('tests:completed', parsedResults);
      return parsedResults;
    } catch (error) {
      this.logger.error('Error running tests', error);
      this.events.emit('tests:running:error', { path: testPath, type, error });
      
      return {
        success: false,
        error: error.message,
        summary: 'Tests failed to run',
        details: error.stdout || ''
      };
    }
  }
  
  /**
   * Execute a command
   * @param {string} command - Command to execute
   * @param {Array<string>} args - Command arguments
   * @param {string} cwd - Working directory
   * @returns {Promise<Object>} Command results
   */
  executeCommand(command, args, cwd) {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, { cwd });
      
      let stdout = '';
      let stderr = '';
      
      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          const error = new Error(`Command failed with exit code ${code}`);
          error.stdout = stdout;
          error.stderr = stderr;
          reject(error);
        }
      });
      
      process.on('error', (error) => {
        reject(error);
      });
    });
  }
  
  /**
   * Parse test results
   * @param {string} output - Test output
   * @returns {Object} Parsed test results
   */
  parseTestResults(output) {
    // Simple parsing logic - in a real implementation, this would be more sophisticated
    const results = {
      success: !output.includes('failed'),
      summary: '',
      passed: 0,
      failed: 0,
      skipped: 0,
      details: output
    };
    
    // Extract test summary
    const summaryMatch = output.match(/Tests:\s+(\d+)\s+passed,\s+(\d+)\s+failed,\s+(\d+)\s+skipped/);
    if (summaryMatch) {
      results.passed = parseInt(summaryMatch[1], 10);
      results.failed = parseInt(summaryMatch[2], 10);
      results.skipped = parseInt(summaryMatch[3], 10);
      results.summary = summaryMatch[0];
    } else {
      // Alternative format
      const passedMatch = output.match(/(\d+)\s+passing/);
      const failedMatch = output.match(/(\d+)\s+failing/);
      const skippedMatch = output.match(/(\d+)\s+skipped/);
      
      if (passedMatch) results.passed = parseInt(passedMatch[1], 10);
      if (failedMatch) results.failed = parseInt(failedMatch[1], 10);
      if (skippedMatch) results.skipped = parseInt(skippedMatch[1], 10);
      
      results.summary = `Tests: ${results.passed} passed, ${results.failed} failed, ${results.skipped} skipped`;
    }
    
    return results;
  }
}