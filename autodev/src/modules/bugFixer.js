/**
 * bugFixer.js
 * Identifies and fixes bugs in the codebase
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { getProjectPaths } from '../utils/config.js';

/**
 * Identifies and fixes bugs in the codebase
 */
export class BugFixer {
  /**
   * Create a new BugFixer instance
   * @param {Object} options - BugFixer options
   */
  constructor(options) {
    this.agent = options.agent;
    this.config = options.config;
    this.logger = options.logger;
    this.events = options.events;
    this.projectPaths = getProjectPaths(this.config);
  }
  
  /**
   * Analyze a bug
   * @param {Object} options - Bug analysis options
   * @param {string} [options.description] - Description of the bug
   * @param {string} [options.errorLog] - Error log to analyze
   * @returns {Promise<Object>} Bug analysis
   */
  async analyzeBug(options) {
    const { description, errorLog } = options;
    
    this.logger.info('Analyzing bug', { description });
    this.events.emit('bug:analyzing', { description, errorLog });
    
    try {
      // Use Claude to analyze the bug
      const prompt = `
You are an expert software debugger for the BrasserieBot platform.
You need to analyze the following bug:

${description || 'Unspecified bug'}

${errorLog ? `Error log:\n${errorLog}` : ''}

Based on the information provided, please analyze the bug and provide:
1. A clear description of the bug
2. Potential causes
3. Files and code areas that might be affected
4. Recommended approach to fix the bug

Be specific and detailed in your analysis.
`;
      
      const analysisText = await this.agent.generateWithClaude({
        prompt,
        maxTokens: 1500
      });
      
      // Parse the analysis into a structured format
      const analysis = this.parseAnalysis(analysisText);
      
      this.events.emit('bug:analyzed', { description, analysis });
      return analysis;
    } catch (error) {
      this.logger.error('Error analyzing bug', error);
      this.events.emit('bug:analyzing:error', { description, error });
      throw error;
    }
  }
  
  /**
   * Parse the bug analysis text into a structured format
   * @param {string} analysisText - Bug analysis text
   * @returns {Object} Structured bug analysis
   */
  parseAnalysis(analysisText) {
    // Simple parsing logic - in a real implementation, this would be more sophisticated
    const sections = analysisText.split(/\n#+\s+/);
    
    const analysis = {
      description: '',
      causes: [],
      affectedFiles: [],
      approach: ''
    };
    
    // Extract bug description
    const descriptionMatch = analysisText.match(/Bug Description:([\s\S]*?)(?=\n#+\s+|$)/i);
    if (descriptionMatch) {
      analysis.description = descriptionMatch[1].trim();
    } else {
      analysis.description = sections[0].trim();
    }
    
    // Extract potential causes
    const causesMatch = analysisText.match(/Potential Causes:([\s\S]*?)(?=\n#+\s+|$)/i);
    if (causesMatch) {
      const causes = causesMatch[1].trim().split('\n').filter(line => line.trim().startsWith('-'));
      analysis.causes = causes.map(line => line.trim().substring(1).trim());
    }
    
    // Extract affected files
    const filesMatch = analysisText.match(/Affected Files:([\s\S]*?)(?=\n#+\s+|$)/i);
    if (filesMatch) {
      const files = filesMatch[1].trim().split('\n').filter(line => line.trim().startsWith('-'));
      analysis.affectedFiles = files.map(line => {
        const filePath = line.trim().substring(1).trim();
        const pathMatch = filePath.match(/([a-zA-Z0-9_\-/.]+\.[a-zA-Z0-9]+)/);
        return pathMatch ? pathMatch[1] : filePath;
      });
    }
    
    // Extract recommended approach
    const approachMatch = analysisText.match(/Recommended Approach:([\s\S]*?)(?=\n#+\s+|$)/i);
    if (approachMatch) {
      analysis.approach = approachMatch[1].trim();
    }
    
    return analysis;
  }
  
  /**
   * Create a fix plan for a bug
   * @param {Object} analysis - Bug analysis
   * @returns {Promise<Object>} Fix plan
   */
  async createFixPlan(analysis) {
    this.logger.info('Creating fix plan', { analysis });
    this.events.emit('bug:planning', { analysis });
    
    try {
      // Get content of affected files
      const fileContents = {};
      for (const filePath of analysis.affectedFiles) {
        try {
          const fullPath = path.join(this.projectPaths.root, filePath);
          fileContents[filePath] = await fs.readFile(fullPath, 'utf8');
        } catch (error) {
          this.logger.warn(`Could not read file: ${filePath}`, error);
        }
      }
      
      // Use Claude to create a fix plan
      const prompt = `
You are an expert software debugger for the BrasserieBot platform.
You need to create a detailed fix plan for the following bug:

Bug Description:
${analysis.description}

Potential Causes:
${analysis.causes.map(cause => `- ${cause}`).join('\n')}

Affected Files:
${Object.entries(fileContents).map(([filePath, content]) => `
${filePath}:
\`\`\`
${content}
\`\`\`
`).join('\n')}

Based on the analysis and file contents, create a detailed fix plan that includes:
1. Specific changes to be made to each file
2. Explanation of how each change addresses the bug
3. Any additional files that need to be modified or created
4. Testing steps to verify the fix

Be specific and detailed in your plan.
`;
      
      const planText = await this.agent.generateWithClaude({
        prompt,
        maxTokens: 2000
      });
      
      // Parse the plan into a structured format
      const plan = this.parsePlan(planText, analysis.affectedFiles);
      
      this.events.emit('bug:planned', { analysis, plan });
      return plan;
    } catch (error) {
      this.logger.error('Error creating fix plan', error);
      this.events.emit('bug:planning:error', { analysis, error });
      throw error;
    }
  }
  
  /**
   * Parse the fix plan text into a structured format
   * @param {string} planText - Fix plan text
   * @param {Array<string>} affectedFiles - Affected files
   * @returns {Object} Structured fix plan
   */
  parsePlan(planText, affectedFiles) {
    const plan = {
      fileChanges: {},
      newFiles: [],
      testingSteps: []
    };
    
    // Extract file changes
    for (const filePath of affectedFiles) {
      const fileRegex = new RegExp(`${filePath.replace(/\./g, '\\.')}[\\s\\S]*?\\\`\\\`\\\`([\\s\\S]*?)\\\`\\\`\\\``, 'i');
      const match = planText.match(fileRegex);
      
      if (match) {
        plan.fileChanges[filePath] = match[1].trim();
      }
    }
    
    // Extract new files
    const newFilesMatch = planText.match(/New Files:([\s\S]*?)(?=\n#+\s+|$)/i);
    if (newFilesMatch) {
      const newFilesSection = newFilesMatch[1].trim();
      const fileBlocks = newFilesSection.split(/\n+(?=\S+\.(?:ts|js|tsx|jsx|json|prisma))/);
      
      for (const block of fileBlocks) {
        const filePathMatch = block.match(/^(\S+\.(?:ts|js|tsx|jsx|json|prisma))/);
        if (filePathMatch) {
          const filePath = filePathMatch[1];
          const contentMatch = block.match(/\\\`\\\`\\\`(?:typescript|javascript|json|prisma)?\s*([\s\S]*?)\\\`\\\`\\\`/);
          
          if (contentMatch) {
            plan.newFiles.push({
              path: filePath,
              content: contentMatch[1].trim()
            });
          }
        }
      }
    }
    
    // Extract testing steps
    const testingMatch = planText.match(/Testing Steps:([\s\S]*?)(?=\n#+\s+|$)/i);
    if (testingMatch) {
      const steps = testingMatch[1].trim().split('\n').filter(line => line.trim().startsWith('-') || line.trim().match(/^\d+\./));
      plan.testingSteps = steps.map(step => step.replace(/^-|\d+\.\s*/, '').trim());
    }
    
    return plan;
  }
  
  /**
   * Execute the fix plan
   * @param {Object} plan - Fix plan
   * @returns {Promise<Object>} Fix results
   */
  async executeFixPlan(plan) {
    this.logger.info('Executing fix plan');
    this.events.emit('bug:fixing', { plan });
    
    try {
      const results = {
        modifiedFiles: [],
        createdFiles: [],
        success: true
      };
      
      // Apply file changes
      for (const [filePath, newContent] of Object.entries(plan.fileChanges)) {
        try {
          const fullPath = path.join(this.projectPaths.root, filePath);
          await fs.writeFile(fullPath, newContent);
          results.modifiedFiles.push(filePath);
        } catch (error) {
          this.logger.error(`Error modifying file: ${filePath}`, error);
          results.success = false;
        }
      }
      
      // Create new files
      for (const newFile of plan.newFiles) {
        try {
          const fullPath = path.join(this.projectPaths.root, newFile.path);
          await fs.mkdir(path.dirname(fullPath), { recursive: true });
          await fs.writeFile(fullPath, newFile.content);
          results.createdFiles.push(newFile.path);
        } catch (error) {
          this.logger.error(`Error creating file: ${newFile.path}`, error);
          results.success = false;
        }
      }
      
      this.events.emit('bug:fixed', { plan, results });
      return results;
    } catch (error) {
      this.logger.error('Error executing fix plan', error);
      this.events.emit('bug:fixing:error', { plan, error });
      throw error;
    }
  }
  
  /**
   * Fix a specific file
   * @param {string} filePath - Path to the file
   * @param {string} bugDescription - Description of the bug
   * @returns {Promise<boolean>} Whether the fix was successful
   */
  async fixFile(filePath, bugDescription) {
    this.logger.info(`Fixing file: ${filePath}`);
    
    try {
      // Read the file content
      const fullPath = path.join(this.projectPaths.root, filePath);
      const content = await fs.readFile(fullPath, 'utf8');
      
      // Use Claude to fix the file
      const prompt = `
You are an expert software debugger for the BrasserieBot platform.
You need to fix a bug in the following file:

${filePath}:
\`\`\`
${content}
\`\`\`

Bug Description:
${bugDescription}

Please provide the complete fixed file content.
Only output the code, no explanations or markdown formatting.
`;
      
      const fixedContent = await this.agent.generateWithClaude({
        prompt,
        maxTokens: 4000
      });
      
      // Write the fixed content to the file
      await fs.writeFile(fullPath, fixedContent);
      
      this.logger.info(`Successfully fixed file: ${filePath}`);
      return true;
    } catch (error) {
      this.logger.error(`Error fixing file: ${filePath}`, error);
      return false;
    }
  }
}