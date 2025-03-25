/**
 * codeReviewer.js
 * Performs code reviews on the codebase
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { getProjectPaths } from '../utils/config.js';

/**
 * Performs code reviews on the codebase
 */
export class CodeReviewer {
  /**
   * Create a new CodeReviewer instance
   * @param {Object} options - CodeReviewer options
   */
  constructor(options) {
    this.agent = options.agent;
    this.config = options.config;
    this.logger = options.logger;
    this.events = options.events;
    this.projectPaths = getProjectPaths(this.config);
  }
  
  /**
   * Review code
   * @param {Object} options - Code review options
   * @param {string} [options.path] - Path to review
   * @param {string} [options.pr] - Pull request number to review
   * @returns {Promise<Object>} Code review results
   */
  async review(options = {}) {
    const { path: reviewPath, pr } = options;
    
    this.logger.info('Reviewing code', { path: reviewPath, pr });
    this.events.emit('review:starting', { path: reviewPath, pr });
    
    try {
      let results;
      
      if (pr) {
        // Review a pull request
        results = await this.reviewPullRequest(pr);
      } else if (reviewPath) {
        // Review a specific path
        results = await this.reviewPath(reviewPath);
      } else {
        // Review recent changes
        results = await this.reviewRecentChanges();
      }
      
      this.events.emit('review:completed', results);
      return results;
    } catch (error) {
      this.logger.error('Error reviewing code', error);
      this.events.emit('review:error', { path: reviewPath, pr, error });
      throw error;
    }
  }
  
  /**
   * Review a specific path
   * @param {string} reviewPath - Path to review
   * @returns {Promise<Object>} Review results
   */
  async reviewPath(reviewPath) {
    this.logger.info(`Reviewing path: ${reviewPath}`);
    
    try {
      const fullPath = path.join(this.projectPaths.root, reviewPath);
      const stats = await fs.stat(fullPath);
      
      if (stats.isDirectory()) {
        // Review a directory
        return this.reviewDirectory(reviewPath);
      } else {
        // Review a single file
        return this.reviewFile(reviewPath);
      }
    } catch (error) {
      this.logger.error(`Error reviewing path: ${reviewPath}`, error);
      throw error;
    }
  }
  
  /**
   * Review a directory
   * @param {string} dirPath - Directory path to review
   * @returns {Promise<Object>} Review results
   */
  async reviewDirectory(dirPath) {
    this.logger.info(`Reviewing directory: ${dirPath}`);
    
    try {
      // Find all code files in the directory
      const files = await glob('**/*.{ts,js,tsx,jsx,json,prisma}', {
        cwd: path.join(this.projectPaths.root, dirPath),
        ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
        dot: false
      });
      
      if (files.length === 0) {
        return {
          path: dirPath,
          issues: [],
          summary: 'No reviewable files found in directory',
          success: true
        };
      }
      
      // Review each file
      const fileReviews = [];
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const review = await this.reviewFile(filePath);
        fileReviews.push(review);
      }
      
      // Generate a summary of all file reviews
      const summary = await this.generateDirectorySummary(dirPath, fileReviews);
      
      return {
        path: dirPath,
        fileReviews,
        summary,
        success: true
      };
    } catch (error) {
      this.logger.error(`Error reviewing directory: ${dirPath}`, error);
      return {
        path: dirPath,
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Review a single file
   * @param {string} filePath - File path to review
   * @returns {Promise<Object>} Review results
   */
  async reviewFile(filePath) {
    this.logger.info(`Reviewing file: ${filePath}`);
    
    try {
      // Read the file content
      const fullPath = path.join(this.projectPaths.root, filePath);
      const content = await fs.readFile(fullPath, 'utf8');
      
      // Use Claude to review the file
      const prompt = `
You are an expert code reviewer for the BrasserieBot platform.
You need to review the following file:

${filePath}:
\`\`\`
${content}
\`\`\`

Please provide a thorough code review that includes:
1. Code quality issues (readability, maintainability, etc.)
2. Potential bugs or edge cases
3. Performance concerns
4. Security vulnerabilities
5. Adherence to best practices
6. Suggestions for improvement

For each issue, provide:
- The line number(s) where the issue occurs
- A description of the issue
- A suggested fix or improvement

Also provide an overall assessment of the file and a summary of the key issues.
`;
      
      const reviewText = await this.agent.generateWithClaude({
        prompt,
        maxTokens: 3000
      });
      
      // Parse the review into a structured format
      const review = this.parseReview(reviewText, filePath);
      
      return {
        path: filePath,
        ...review,
        success: true
      };
    } catch (error) {
      this.logger.error(`Error reviewing file: ${filePath}`, error);
      return {
        path: filePath,
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Review a pull request
   * @param {string} prNumber - Pull request number
   * @returns {Promise<Object>} Review results
   */
  async reviewPullRequest(prNumber) {
    this.logger.info(`Reviewing pull request: ${prNumber}`);
    
    // This is a placeholder for PR review functionality
    // In a real implementation, this would use GitHub API to get PR details
    return {
      pr: prNumber,
      summary: 'Pull request review not implemented yet',
      success: false,
      error: 'Pull request review functionality is not implemented'
    };
  }
  
  /**
   * Review recent changes
   * @returns {Promise<Object>} Review results
   */
  async reviewRecentChanges() {
    this.logger.info('Reviewing recent changes');
    
    // This is a placeholder for recent changes review functionality
    // In a real implementation, this would use git to get recent changes
    return {
      summary: 'Recent changes review not implemented yet',
      success: false,
      error: 'Recent changes review functionality is not implemented'
    };
  }
  
  /**
   * Parse a review into a structured format
   * @param {string} reviewText - Review text
   * @param {string} filePath - File path
   * @returns {Object} Structured review
   */
  parseReview(reviewText, filePath) {
    const review = {
      issues: [],
      summary: '',
      overallAssessment: ''
    };
    
    // Extract issues
    const issueRegex = /(?:Line|Lines)\s+(\d+(?:-\d+)?):?\s+([\s\S]*?)(?=(?:Line|Lines)\s+\d+|Overall Assessment|Summary|$)/gi;
    let match;
    
    while ((match = issueRegex.exec(reviewText)) !== null) {
      const [, lineNumbers, issueText] = match;
      
      // Parse line numbers
      let lines = [];
      if (lineNumbers.includes('-')) {
        const [start, end] = lineNumbers.split('-').map(n => parseInt(n, 10));
        lines = Array.from({ length: end - start + 1 }, (_, i) => start + i);
      } else {
        lines = [parseInt(lineNumbers, 10)];
      }
      
      // Extract issue description and suggestion
      const descriptionMatch = issueText.match(/([\s\S]*?)(?:Suggestion:|Fix:|Improvement:|$)([\s\S]*)/i);
      let description = issueText.trim();
      let suggestion = '';
      
      if (descriptionMatch) {
        description = descriptionMatch[1].trim();
        suggestion = descriptionMatch[2].trim();
      }
      
      // Determine issue severity
      let severity = 'info';
      if (issueText.toLowerCase().includes('critical') || 
          issueText.toLowerCase().includes('security vulnerability') ||
          issueText.toLowerCase().includes('severe')) {
        severity = 'critical';
      } else if (issueText.toLowerCase().includes('bug') || 
                issueText.toLowerCase().includes('error') ||
                issueText.toLowerCase().includes('vulnerability')) {
        severity = 'error';
      } else if (issueText.toLowerCase().includes('warning') || 
                issueText.toLowerCase().includes('potential problem') ||
                issueText.toLowerCase().includes('concern')) {
        severity = 'warning';
      }
      
      review.issues.push({
        lines,
        description,
        suggestion,
        severity
      });
    }
    
    // Extract overall assessment
    const assessmentMatch = reviewText.match(/Overall Assessment:?\s*([\s\S]*?)(?=Summary:|$)/i);
    if (assessmentMatch) {
      review.overallAssessment = assessmentMatch[1].trim();
    }
    
    // Extract summary
    const summaryMatch = reviewText.match(/Summary:?\s*([\s\S]*?)$/i);
    if (summaryMatch) {
      review.summary = summaryMatch[1].trim();
    } else if (review.overallAssessment) {
      review.summary = review.overallAssessment;
    } else {
      review.summary = `Review of ${path.basename(filePath)} found ${review.issues.length} issues.`;
    }
    
    return review;
  }
  
  /**
   * Generate a summary of directory reviews
   * @param {string} dirPath - Directory path
   * @param {Array<Object>} fileReviews - File reviews
   * @returns {Promise<string>} Directory summary
   */
  async generateDirectorySummary(dirPath, fileReviews) {
    // Count issues by severity
    const issueCounts = {
      critical: 0,
      error: 0,
      warning: 0,
      info: 0
    };
    
    let totalIssues = 0;
    
    for (const review of fileReviews) {
      if (review.issues) {
        for (const issue of review.issues) {
          issueCounts[issue.severity]++;
          totalIssues++;
        }
      }
    }
    
    // Use Claude to generate a summary
    const prompt = `
You are an expert code reviewer for the BrasserieBot platform.
You need to generate a summary of a directory code review.

Directory: ${dirPath}
Files reviewed: ${fileReviews.length}
Total issues: ${totalIssues}
Critical issues: ${issueCounts.critical}
Errors: ${issueCounts.error}
Warnings: ${issueCounts.warning}
Info: ${issueCounts.info}

File summaries:
${fileReviews.map(review => `- ${review.path}: ${review.summary}`).join('\n')}

Please generate a concise summary (maximum 300 words) of the code review that:
1. Highlights the most important issues
2. Identifies patterns or recurring problems
3. Provides overall recommendations
4. Prioritizes what should be addressed first

Keep the summary focused on actionable insights and key findings.
`;
    
    const summary = await this.agent.generateWithClaude({
      prompt,
      maxTokens: 1000
    });
    
    return summary;
  }
  
  /**
   * Generate a code review report
   * @param {Object} review - Code review results
   * @returns {Promise<string>} Review report
   */
  async generateReport(review) {
    this.logger.info('Generating code review report');
    
    try {
      let reportContent = `# Code Review Report\n\n`;
      
      if (review.path) {
        reportContent += `## ${review.path}\n\n`;
      }
      
      if (review.summary) {
        reportContent += `### Summary\n\n${review.summary}\n\n`;
      }
      
      if (review.overallAssessment) {
        reportContent += `### Overall Assessment\n\n${review.overallAssessment}\n\n`;
      }
      
      if (review.issues && review.issues.length > 0) {
        reportContent += `### Issues\n\n`;
        
        // Group issues by severity
        const criticalIssues = review.issues.filter(issue => issue.severity === 'critical');
        const errorIssues = review.issues.filter(issue => issue.severity === 'error');
        const warningIssues = review.issues.filter(issue => issue.severity === 'warning');
        const infoIssues = review.issues.filter(issue => issue.severity === 'info');
        
        if (criticalIssues.length > 0) {
          reportContent += `#### Critical Issues\n\n`;
          for (const issue of criticalIssues) {
            reportContent += this.formatIssue(issue);
          }
        }
        
        if (errorIssues.length > 0) {
          reportContent += `#### Errors\n\n`;
          for (const issue of errorIssues) {
            reportContent += this.formatIssue(issue);
          }
        }
        
        if (warningIssues.length > 0) {
          reportContent += `#### Warnings\n\n`;
          for (const issue of warningIssues) {
            reportContent += this.formatIssue(issue);
          }
        }
        
        if (infoIssues.length > 0) {
          reportContent += `#### Information\n\n`;
          for (const issue of infoIssues) {
            reportContent += this.formatIssue(issue);
          }
        }
      }
      
      if (review.fileReviews && review.fileReviews.length > 0) {
        reportContent += `## File Reviews\n\n`;
        
        for (const fileReview of review.fileReviews) {
          reportContent += `### ${fileReview.path}\n\n`;
          
          if (fileReview.summary) {
            reportContent += `${fileReview.summary}\n\n`;
          }
          
          if (fileReview.issues && fileReview.issues.length > 0) {
            reportContent += `#### Issues\n\n`;
            
            for (const issue of fileReview.issues) {
              reportContent += this.formatIssue(issue);
            }
          }
        }
      }
      
      return reportContent;
    } catch (error) {
      this.logger.error('Error generating code review report', error);
      return `# Code Review Report\n\nError generating report: ${error.message}`;
    }
  }
  
  /**
   * Format an issue for the report
   * @param {Object} issue - Issue to format
   * @returns {string} Formatted issue
   */
  formatIssue(issue) {
    const lines = issue.lines.length > 1 
      ? `Lines ${issue.lines[0]}-${issue.lines[issue.lines.length - 1]}`
      : `Line ${issue.lines[0]}`;
    
    let issueText = `##### ${lines}\n\n${issue.description}\n\n`;
    
    if (issue.suggestion) {
      issueText += `**Suggestion:** ${issue.suggestion}\n\n`;
    }
    
    return issueText;
  }
}